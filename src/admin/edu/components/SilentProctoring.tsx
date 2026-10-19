import React, { useState, useEffect, useRef } from 'react';
import type { ExamProctoringConfig } from '../types';

interface SilentProctoringProps {
  config?: ExamProctoringConfig;
  runnerMode: 'exam' | 'practice';
  isSubmitted: boolean;
  onViolationLog?: (log: SilentProctoringLogItem) => void;
  onBlockAccess?: (reason: string) => void;
  onAutoSubmitExam?: (banReason: string) => void;
}

export interface SilentProctoringLogItem {
  timestamp: string;
  type: 'SCREEN_FULLSCREEN_EXIT' | 'TAB_SWITCH' | 'CAMERA_CAPTURE' | 'AUDIO_ANALYSIS' | 'NO_CAMERA' | 'EXAM_BANNED';
  detail: string;
  severity: 'low' | 'medium' | 'high';
  aiAnalysis?: any;
}

export const SilentProctoring: React.FC<SilentProctoringProps> = ({
  config,
  runnerMode,
  isSubmitted,
  onViolationLog,
  onBlockAccess,
  onAutoSubmitExam,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const snapshotTimerRef = useRef<any>(null);
  const currentFacingRef = useRef<'user' | 'environment'>('user');

  // Fullscreen exit warning & ban states
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const maxExits = config?.maxFullscreenExits && config.maxFullscreenExits > 0 ? config.maxFullscreenExits : 3;

  // Check if current mode requires proctoring
  const isProctoringActive = Boolean(
    config?.enabled &&
      !isSubmitted &&
      (config.appliedModes === 'both' ||
        (config.appliedModes === 'exam_only' && runnerMode === 'exam') ||
        (config.appliedModes === 'practice_only' && runnerMode === 'practice'))
  );

  const addLog = (
    type: SilentProctoringLogItem['type'],
    detail: string,
    severity: SilentProctoringLogItem['severity'] = 'low',
    aiAnalysis?: any
  ) => {
    const item: SilentProctoringLogItem = {
      timestamp: new Date().toLocaleTimeString('vi-VN'),
      type,
      detail,
      severity,
      aiAnalysis,
    };
    if (onViolationLog) onViolationLog(item);
  };

  // Re-request fullscreen
  const reEnterFullscreen = () => {
    setShowWarningModal(false);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  // 1. Enforce Fullscreen & Tab Switch Detection with automatic warnings & bans
  useEffect(() => {
    if (!isProctoringActive) return;

    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      if (!active && !isSubmitted && config?.recordScreenLog) {
        setFullscreenExitCount((prev) => {
          const newCount = prev + 1;
          addLog(
            'SCREEN_FULLSCREEN_EXIT',
            `Thí sinh thoát khỏi chế độ toàn màn hình (Lần ${newCount}/${maxExits}).`,
            'high'
          );

          if (newCount >= maxExits) {
            // Exceeded allowed exits -> Ban exam immediately
            const banDurationMin = config?.fullscreenBanDuration;
            const durationText = banDurationMin === 0
              ? 'VĨNH VIỄN'
              : banDurationMin && banDurationMin > 0
              ? `${banDurationMin} phút`
              : 'vĩnh viễn';

            const reason = `Bạn đã bị ĐÌNH CHỈ THI do thoát toàn màn hình ${newCount}/${maxExits} lần! Thời hạn cấm thi: ${durationText}.`;
            addLog('EXAM_BANNED', reason, 'high');
            if (onAutoSubmitExam) onAutoSubmitExam(reason);
          } else {
            // Show warning modal and force returning to fullscreen
            setWarningMessage(
              `CẢNH BÁO QUY CHẾ THI: Bạn vừa thoát toàn màn hình (Vi phạm lần ${newCount}/${maxExits}). Nếu vi phạm quá ${maxExits} lần, bài làm của bạn sẽ bị hủy và bị CẤM THI lập tức!`
            );
            setShowWarningModal(true);
          }

          return newCount;
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitted && config?.recordScreenLog) {
        addLog(
          'TAB_SWITCH',
          'Thí sinh đã chuyển sang tab trình duyệt hoặc ứng dụng khác.',
          'high'
        );
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Request fullscreen immediately
    if (config?.recordScreenLog && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isProctoringActive, isSubmitted, config?.recordScreenLog, maxExits]);

  // 2. Camera & Microphone Setup (Always on silently, no PIP)
  useEffect(() => {
    if (!isProctoringActive) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      return;
    }

    let isMounted = true;

    const initDevices = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Trình duyệt không hỗ trợ Camera/Microphone.');
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInput = devices.some((d) => d.kind === 'videoinput');

        if (!videoInput) {
          const msg = 'Thiết bị không có Camera. Không được phép truy cập chế độ kiểm tra!';
          addLog('NO_CAMERA', msg, 'high');
          if (config?.requireCamera && onBlockAccess) {
            onBlockAccess(msg);
          }
          return;
        }

        // Constraints: Keep camera and mic always active without notifications
        const constraints: MediaStreamConstraints = {
          video: { facingMode: currentFacingRef.current },
          audio: Boolean(config?.recordAudio),
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }

        // Setup Continuous Audio Recording silently
        if (config?.recordAudio) {
          try {
            const audioStream = new MediaStream(stream.getAudioTracks());
            const recorder = new MediaRecorder(audioStream);
            audioRecorderRef.current = recorder;

            recorder.ondataavailable = (e) => {
              if (e.data.size > 0) {
                audioChunksRef.current.push(e.data);
              }
            };

            recorder.onstop = () => {
              audioChunksRef.current = [];
              addLog('AUDIO_ANALYSIS', 'Âm thanh phòng thi được ghi nhận và phân tích ngầm.', 'low');
            };

            recorder.start();
            // Cycle every 25 seconds
            const audioInterval = setInterval(() => {
              if (recorder.state === 'recording') {
                recorder.stop();
                setTimeout(() => {
                  if (mediaStreamRef.current && recorder.state === 'inactive') {
                    recorder.start();
                  }
                }, 400);
              }
            }, 25000);

            return () => clearInterval(audioInterval);
          } catch (audioErr) {
            console.warn('Silent audio recording setup:', audioErr);
          }
        }
      } catch (err: any) {
        const errMsg = err?.message || 'Không có quyền truy cập camera/micro.';
        addLog('NO_CAMERA', errMsg, 'high');
        if (config?.requireCamera && onBlockAccess) {
          onBlockAccess(errMsg);
        }
      }
    };

    initDevices();

    return () => {
      isMounted = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [isProctoringActive, config?.requireCamera, config?.recordAudio]);

  // 3. Random Snapshots & AI Analysis (Silent, switches front/back cam automatically if available)
  const triggerRandomSnapshot = async () => {
    if (!videoRef.current || !mediaStreamRef.current || isSubmitted) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const cameraBase64 = canvas.toDataURL('image/jpeg', 0.65);

        addLog(
          'CAMERA_CAPTURE',
          `Ảnh giám sát ngẫu nhiên camera (${currentFacingRef.current}) được ghi lại.`,
          'low'
        );

        // Gửi tới API AI riêng của giáo viên phân tích ngầm
        if (config?.customAiEndpoint && config?.customApiKey) {
          analyzeProctoringFrame(cameraBase64);
        }

        // Tự động luân phiên đổi camera trước/sau cho lần chụp kế tiếp nếu thiết bị có nhiều cam
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = devices.filter((d) => d.kind === 'videoinput');
          if (videoInputs.length > 1) {
            currentFacingRef.current =
              currentFacingRef.current === 'user' ? 'environment' : 'user';
            const newStream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: currentFacingRef.current },
              audio: false,
            });
            const oldTrack = mediaStreamRef.current?.getVideoTracks()[0];
            const newTrack = newStream.getVideoTracks()[0];
            if (oldTrack && newTrack && mediaStreamRef.current) {
              mediaStreamRef.current.removeTrack(oldTrack);
              oldTrack.stop();
              mediaStreamRef.current.addTrack(newTrack);
            }
          }
        } catch (_) {}
      }
    } catch (e) {
      console.warn('Snapshot error:', e);
    }
  };

  useEffect(() => {
    if (!isProctoringActive || !config?.randomSnapshots || isSubmitted) return;

    const scheduleNextSnapshot = () => {
      // Random interval between 20s and 50s
      const randomDelay = Math.floor(Math.random() * (50000 - 20000 + 1)) + 20000;
      snapshotTimerRef.current = setTimeout(async () => {
        await triggerRandomSnapshot();
        scheduleNextSnapshot();
      }, randomDelay);
    };

    scheduleNextSnapshot();

    return () => {
      if (snapshotTimerRef.current) clearTimeout(snapshotTimerRef.current);
    };
  }, [isProctoringActive, config?.randomSnapshots, isSubmitted]);

  // 4. Send to Teacher's Custom AI for Analysis
  const analyzeProctoringFrame = async (imageBase64: string) => {
    if (!config?.customAiEndpoint || !config?.customApiKey) return;

    try {
      const endpoint = config.customAiEndpoint.trim();
      const apiKey = config.customApiKey.trim();
      const prompt = config.customAiPrompt || 'Phân tích ảnh giám sát thí sinh.';

      let payload: any = {};
      let headers: any = { 'Content-Type': 'application/json' };

      if (endpoint.includes('googleapis.com')) {
        headers['x-goog-api-key'] = apiKey;
        payload = {
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
                  },
                },
              ],
            },
          ],
        };
      } else {
        headers['Authorization'] = `Bearer ${apiKey}`;
        payload = {
          model: config.customAiModel || 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: imageBase64 } },
              ],
            },
          ],
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) return;

      const data = await res.json();
      const textResponse =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        data?.choices?.[0]?.message?.content ||
        '';

      try {
        const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed.suspicious) {
          addLog(
            'CAMERA_CAPTURE',
            `Dấu hiệu nghi vấn (${parsed.incidentType}): ${parsed.explanation}`,
            parsed.severity?.toLowerCase() || 'high',
            parsed
          );
        }
      } catch {
        if (textResponse.toLowerCase().includes('vi phạm') || textResponse.toLowerCase().includes('bất thường')) {
          addLog('CAMERA_CAPTURE', `AI cảnh báo: ${textResponse.slice(0, 100)}...`, 'medium');
        }
      }
    } catch (_) {}
  };

  if (!isProctoringActive) return null;

  return (
    <>
      {/* Hidden video element for background camera captures */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <video ref={videoRef} autoPlay playsInline muted />
      </div>

      {/* Warning Modal when exiting fullscreen */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[100050] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border-2 border-rose-500 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center text-3xl font-black shadow-inner">
              ⚠️
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-black text-rose-700 uppercase tracking-wide">
                Cảnh Báo Vi Phạm Toàn Màn Hình
              </h3>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                {warningMessage}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 font-bold">
              Nhấn nút bên dưới để quay lại chế độ toàn màn hình và tiếp tục làm bài.
            </div>
            <button
              type="button"
              onClick={reEnterFullscreen}
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
            >
              Quay lại toàn màn hình ngay
            </button>
          </div>
        </div>
      )}
    </>
  );
};
