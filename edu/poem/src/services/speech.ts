// Speech synthesis service using native Web Speech API (Free & Zero-dependency)

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private isSpeakingState = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public isSupported(): boolean {
    return this.synth !== null;
  }

  public speak(
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      onBoundary?: (event: SpeechSynthesisEvent) => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    }
  ) {
    if (!this.synth) return;

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = options?.rate ?? 0.85; // Slightly slower for poetic reading
    utterance.pitch = options?.pitch ?? 1.0;

    // Try finding Vietnamese voice if available
    const voices = this.synth.getVoices();
    const viVoice = voices.find((v) => v.lang.startsWith('vi') || v.lang.includes('VIE'));
    if (viVoice) {
      utterance.voice = viVoice;
    }

    utterance.onstart = () => {
      this.isSpeakingState = true;
    };

    utterance.onend = () => {
      this.isSpeakingState = false;
      options?.onEnd?.();
    };

    utterance.onerror = (err) => {
      this.isSpeakingState = false;
      options?.onError?.(err);
    };

    if (options?.onBoundary) {
      utterance.onboundary = options.onBoundary;
    }

    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeakingState = false;
    }
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState;
  }
}

export const speechService = new SpeechService();
