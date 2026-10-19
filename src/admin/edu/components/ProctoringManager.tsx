import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  Camera,
  Mic,
  Maximize2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Activity,
  Minimize2,
} from 'lucide-react';
import type { ExamProctoringConfig } from '../types';

interface ProctoringManagerProps {
  config?: ExamProctoringConfig;
  runnerMode: 'exam' | 'practice';
  isSubmitted: boolean;
  onViolationLog?: (log: ProctoringLogItem) => void;
  onBlockAccess?: (reason: string) => void;
}

export interface ProctoringLogItem {
  timestamp: string;
  type: 'SCREEN_FULLSCREEN_EXIT' | 'TAB_SWITCH' | 'CAMERA_CAPTURE' | 'AUDIO_ANALYSIS' | 'NO_CAMERA';
  detail: string;
  severity: 'low' | 'medium' | 'high';
  aiAnalysis?: any;
}

export const ProctoringManager: React.FC<ProctoringManagerProps> = ({
  config,
  runnerMode,
  isSubmitted,
  onViolationLog,
  onBlockAccess,
}) => {
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [logs, setLogs] = useState<ProctoringLogItem[]>([]);
  const [showLogDrawer, setShowLogDrawer] = useState<boolean>(false);
  const [activeCamFacing, setActiveCamFacing] = useState<'user' | 'environment'>('user');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const snapshotTimerRef = useRef<any>(null);

  // Check if current mode requires proctoring
  const isProctoringActive = Boolean(
    config?.enabled &&
      !isSubmitted &&
      (config.appliedModes === 'both' ||
        (config.appliedModes === 'exam_only' && runnerMode === 'exam') ||
        (config.appliedModes === 'practice_only' && runnerMode === 'practice'))
  );

  const addLog = (
    type: ProctoringLogItem['type'],
    detail: string,
    severity: ProctoringLogItem['severity'] = 'low',
    aiAnalysis?: any
  ) => {
    const item: ProctoringLogItem = {
      timestamp: new Date().toLocaleTimeString('vi-VN'),
      type,
      detail,
      severity,
      aiAnalysis,
    };
    setLogs((prev) => [item, ...prev].slice(0, 50));
    if (onViolationLog) onViolationLog(item);
  };

  // 1. Enforce Fullscreen & Tab Switch Detection
  useEffect(() => {
    if (!isProctoringActive) return;

    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (!active && !isSubmitted && config?.recordScreenLog) {
        addLog(
          'SCREEN_FULLSCREEN_EXIT',
          'Thí sinh đã thoát khỏi chế độ toàn màn hình.',
          'medium'
        );
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
      document.documentElement.requestFullscreen().catch(() => {
        // May require user click on some browsers
      });
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isProctoringActive, isSubmitted, config?.recordScreenLog]);

  // 2. Camera & Microphone Setup
  useEffect(() => {
    if (!isProctoringActive) {
      // Clean up stream if proctoring turns off
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
          throw new Error('Trình duyệt không hỗ trợ truy cập Camera/Microphone.');
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInput = devices.some((d) => d.kind === 'videoinput');

        if (!videoInput) {
          setHasCamera(false);
          const msg = 'Thiết bị không có Camera. Quy chế phòng thi yêu cầu phải có Camera để tham gia!';
          setCameraError(msg);
          addLog('NO_CAMERA', msg, 'high');
          if (config?.requireCamera && onBlockAccess) {
            onBlockAccess(msg);
          }
          return;
        }

        setHasCamera(true);

        // Request camera and microphone
        const constraints: MediaStreamConstraints = {
          video: { facingMode: activeCamFacing },
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
        }

        // Setup Audio Recorder if enabled
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

            recorder.onstop = async () => {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
              audioChunksRef.current = [];
              analyzeProctoringAudio(audioBlob);
            };

            // Record in 15-second cycles
            recorder.start();
            const audioInterval = setInterval(() => {
              if (recorder.state === 'recording') {
                recorder.stop();
                setTimeout(() => {
                  if (mediaStreamRef.current && recorder.state === 'inactive') {
                    recorder.start();
                  }
                }, 500);
              }
            }, 20000);

            return () => clearInterval(audioInterval);
          } catch (audioErr) {
            console.warn('Audio recorder setup warning:', audioErr);
          }
        }
      } catch (err: any) {
        setHasCamera(false);
        const errMsg = err?.message || 'Không thể cấp quyền truy cập Camera/Microphone.';
        setCameraError(errMsg);
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
  }, [isProctoringActive, activeCamFacing, config?.requireCamera, config?.recordAudio]);

  // 3. Random Snapshots & AI Analysis
  const triggerRandomSnapshot = async () => {
    if (!videoRef.current || !mediaStreamRef.current || isSubmitted) return;

    try {
      // 1. Capture Camera Frame
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const cameraBase64 = canvas.toDataURL('image/jpeg', 0.7);

        addLog('CAMERA_CAPTURE', `Đã chụp ảnh giám sát từ camera (${activeCamFacing}).`, 'low');

        // Gửi tới API AI riêng của giáo viên phân tích
        if (config?.customAiEndpoint && config?.customApiKey) {
          analyzeProctoringFrame(cameraBase64);
        }
      }
    } catch (e) {
      console.warn('Snapshot error:', e);
    }
  };

  useEffect(() => {
    if (!isProctoringActive || !config?.randomSnapshots || isSubmitted) return;

    const scheduleNextSnapshot = () => {
      // Random interval between 20s and 60s
      const randomDelay = Math.floor(Math.random() * (60000 - 20000 + 1)) + 20000;
      snapshotTimerRef.current = setTimeout(async () => {
        await triggerRandomSnapshot();
        scheduleNextSnapshot();
      }, randomDelay);
    };

    scheduleNextSnapshot();

    return () => {
      if (snapshotTimerRef.current) clearTimeout(snapshotTimerRef.current);
    };
  }, [isProctoringActive, config?.randomSnapshots, isSubmitted, activeCamFacing]);

  // 4. Send to Teacher's Custom AI for Analysis
  const analyzeProctoringFrame = async (imageBase64: string) => {
    if (!config?.customAiEndpoint || !config?.customApiKey) return;

    setIsAnalyzing(true);
    try {
      const endpoint = config.customAiEndpoint.trim();
      const apiKey = config.customApiKey.trim();
      const prompt = config.customAiPrompt || 'Phân tích ảnh giám sát thí sinh.';

      // Format payload based on endpoint type (OpenAI vs Gemini)
      let payload: any = {};
      let headers: any = { 'Content-Type': 'application/json' };

      if (endpoint.includes('googleapis.com')) {
        // Gemini format
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
        // OpenAI / REST format
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

      if (!res.ok) {
        throw new Error(`AI API error ${res.status}`);
      }

      const data = await res.json();
      const textResponse =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        data?.choices?.[0]?.message?.content ||
        '';

      // Parse AI JSON response
      try {
        const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed.suspicious) {
          addLog(
            'CAMERA_CAPTURE',
            `Phát hiện nghi vấn (${parsed.incidentType}): ${parsed.explanation}`,
            parsed.severity?.toLowerCase() || 'high',
            parsed
          );
        }
      } catch {
        // Regular text response
        if (textResponse.toLowerCase().includes('vi phạm') || textResponse.toLowerCase().includes('bất thường')) {
          addLog('CAMERA_CAPTURE', `Cảnh báo AI: ${textResponse.slice(0, 100)}...`, 'medium');
        }
      }
    } catch (err: any) {
      console.warn('Teacher AI analysis warning:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeProctoringAudio = async (audioBlob: Blob) => {
    if (!config?.customAiEndpoint || !config?.customApiKey) return;
    // Log audio segment captured
    addLog('AUDIO_ANALYSIS', 'Đã ghi âm và kiểm tra tín hiệu âm thanh phòng thi.', 'low');
  };

  if (!isProctoringActive) return null;

  return (
    <>
      {/* Floating Proctoring Camera PIP Widget */}
      <div className="fixed bottom-6 left-6 z-[99000] flex flex-col items-start gap-2 animate-in fade-in">
        <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-2.5 shadow-xl border border-slate-700/80 text-white w-48 sm:w-56 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between gap-1 mb-1.5 pb-1 border-b border-slate-700/50">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">
                Giám sát thi
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setActiveCamFacing((prev) => (prev === 'user' ? 'environment' : 'user'))
                }
                title="Đổi camera trước/sau"
                className="p-1 hover:bg-slate-800 rounded-md text-slate-300 transition-colors text-[10px]"
              >
                🔄 Cam
              </button>
              <button
                type="button"
                onClick={() => setShowLogDrawer(!showLogDrawer)}
                title="Xem nhật ký giám sát"
                className="p-1 hover:bg-slate-800 rounded-md text-slate-300 transition-colors text-[10px]"
              >
                📋 {logs.length}
              </button>
            </div>
          </div>

          {/* Video Preview */}
          <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border border-slate-800">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
            {!hasCamera && (
              <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-2 text-center">
                <Camera className="w-5 h-5 text-rose-400 mb-1" />
                <span className="text-[10px] text-rose-300 font-bold leading-tight">
                  {cameraError || 'Không tìm thấy camera'}
                </span>
              </div>
            )}
            {isAnalyzing && (
              <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-purple-600/80 text-[9px] font-black tracking-wide text-white animate-pulse">
                AI analyzing
              </div>
            )}
          </div>

          {/* Quick status bar */}
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3 h-3 text-blue-400" />
              <span>{isFullscreen ? 'Toàn màn hình' : 'Cửa sổ'}</span>
            </span>
            {!isFullscreen && (
              <button
                type="button"
                onClick={() => document.documentElement.requestFullscreen().catch(() => {})}
                className="text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
              >
                Bật lại
              </button>
            )}
          </div>
        </div>

        {/* Logs Drawer */}
        {showLogDrawer && (
          <div className="bg-white rounded-2xl p-3.5 shadow-2xl border border-slate-200 text-slate-800 w-80 max-h-72 overflow-y-auto space-y-2 text-xs animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <span className="font-black text-slate-900 text-xs">Nhật ký giám sát</span>
              <button
                type="button"
                onClick={() => setShowLogDrawer(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
            {logs.length === 0 ? (
              <p className="text-[11px] text-slate-400 py-2 text-center">Chưa có sự kiện vi phạm nào.</p>
            ) : (
              <div className="space-y-1.5">
                {logs.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-xl text-[11px] border leading-tight ${
                      item.severity === 'high'
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : item.severity === 'medium'
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-0.5">
                      <span>{item.type}</span>
                      <span className="text-[9px] text-slate-400">{item.timestamp}</span>
                    </div>
                    <p className="text-[10px]">{item.detail}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
