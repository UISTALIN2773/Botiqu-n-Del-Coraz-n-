import Sound from 'react-native-sound';

// Enable playback in silence mode
Sound.setCategory('Playback', true);

export class AudioEngine {
  private static instance: AudioEngine;
  private voiceSound: Sound | null = null;
  private ambientSound: Sound | null = null;
  private isPlayingVoice: boolean = false;
  private isPlayingAmbient: boolean = false;
  private playbackInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  /**
   * Starts dual audio playback: Background ambient loop + Voice message with audio ducking
   */
  public async playDualTrack(
    voiceFileName: string,
    ambientTrack: 'lofi' | 'rain' | 'piano',
    onProgress?: (currentSeconds: number, totalSeconds: number) => void,
    onComplete?: () => void
  ): Promise<void> {
    this.stopAll();

    // 1. Map ambient track to local raw resource or asset
    const cleanVoiceName = voiceFileName.replace(/\.(mp3|wav|m4a|ogg)$/i, '');
    const cleanAmbientName = `${ambientTrack}_loop`;

    return new Promise((resolve, reject) => {
      // Load Voice Sound
      this.voiceSound = new Sound(cleanVoiceName, Sound.MAIN_BUNDLE, (voiceError) => {
        if (voiceError) {
          console.warn(`[AudioEngine] Voice file ${voiceFileName} not found or error loading, falling back to simulated playback:`, voiceError);
          this.simulatePlayback(45, onProgress, onComplete);
          resolve();
          return;
        }

        // Voice loaded successfully -> Load Ambient Track
        this.ambientSound = new Sound(cleanAmbientName, Sound.MAIN_BUNDLE, (ambientError) => {
          if (ambientError) {
            console.warn(`[AudioEngine] Ambient track ${cleanAmbientName} not loaded:`, ambientError);
          } else if (this.ambientSound) {
            // Ambient track plays on loop with ducked volume (0.18)
            this.ambientSound.setNumberOfLoops(-1);
            this.ambientSound.setVolume(0.18);
            this.ambientSound.play();
            this.isPlayingAmbient = true;
          }

          // Play voice with full volume (1.0)
          if (this.voiceSound) {
            this.voiceSound.setVolume(1.0);
            this.isPlayingVoice = true;

            const duration = this.voiceSound.getDuration();

            // Track progress
            this.playbackInterval = setInterval(() => {
              if (this.voiceSound && this.isPlayingVoice) {
                this.voiceSound.getCurrentTime((seconds) => {
                  onProgress?.(Math.floor(seconds), Math.floor(duration));
                });
              }
            }, 500);

            this.voiceSound.play((success) => {
              this.isPlayingVoice = false;
              if (this.playbackInterval) {
                clearInterval(this.playbackInterval);
                this.playbackInterval = null;
              }

              // Fade out ambient track smoothly after voice completes
              this.fadeOutAmbient(1500);

              if (success) {
                onComplete?.();
              }
              resolve();
            });
          }
        });
      });
    });
  }

  /**
   * Gracefully pauses or resumes current voice and ambient tracks
   */
  public togglePause(isPaused: boolean) {
    if (this.voiceSound) {
      if (isPaused) {
        this.voiceSound.pause();
        this.ambientSound?.pause();
      } else {
        this.voiceSound.play();
        this.ambientSound?.play();
      }
    }
  }

  /**
   * Smoothly fades out the ambient track
   */
  private fadeOutAmbient(durationMs: number) {
    if (!this.ambientSound) return;
    const steps = 10;
    const stepTime = durationMs / steps;
    let currentVolume = 0.18;
    const volStep = currentVolume / steps;

    const fadeTimer = setInterval(() => {
      currentVolume = Math.max(0, currentVolume - volStep);
      if (this.ambientSound) {
        this.ambientSound.setVolume(currentVolume);
      }
      if (currentVolume <= 0) {
        clearInterval(fadeTimer);
        this.ambientSound?.stop();
        this.ambientSound?.release();
        this.ambientSound = null;
        this.isPlayingAmbient = false;
      }
    }, stepTime);
  }

  /**
   * Fallback timer simulation for preview environments or missing demo audio files
   */
  private simulatePlayback(
    duration: number,
    onProgress?: (current: number, total: number) => void,
    onComplete?: () => void
  ) {
    let current = 0;
    this.isPlayingVoice = true;
    this.playbackInterval = setInterval(() => {
      current += 1;
      onProgress?.(current, duration);
      if (current >= duration) {
        if (this.playbackInterval) clearInterval(this.playbackInterval);
        this.isPlayingVoice = false;
        onComplete?.();
      }
    }, 1000);
  }

  /**
   * Stops and cleans up all active audio players
   */
  public stopAll() {
    if (this.playbackInterval) {
      clearInterval(this.playbackInterval);
      this.playbackInterval = null;
    }
    if (this.voiceSound) {
      this.voiceSound.stop();
      this.voiceSound.release();
      this.voiceSound = null;
    }
    if (this.ambientSound) {
      this.ambientSound.stop();
      this.ambientSound.release();
      this.ambientSound = null;
    }
    this.isPlayingVoice = false;
    this.isPlayingAmbient = false;
  }
}

export const audioEngine = AudioEngine.getInstance();
