declare module 'react-native-sound' {
  class Sound {
    static MAIN_BUNDLE: any;
    static DOCUMENT: any;
    static LIBRARY: any;
    static CACHES: any;
    static setCategory(category: string, mixWithOthers?: boolean): void;
    static setMode(mode: string): void;
    static setActive(active: boolean): void;

    constructor(
      filename: string,
      basePath: any,
      onError?: (error: any) => void
    );

    play(onEnd?: (success: boolean) => void): void;
    pause(): void;
    stop(onStop?: () => void): void;
    release(): void;
    getDuration(): number;
    getNumberOfChannels(): number;
    setVolume(value: number): void;
    getVolume(): number;
    setPan(value: number): void;
    getNumberOfLoops(): number;
    setNumberOfLoops(value: number): void;
    getCurrentTime(callback: (seconds: number, isPlaying: boolean) => void): void;
    setCurrentTime(value: number): void;
    isLoaded(): boolean;
    isPlaying(): boolean;
  }
  export default Sound;
}

declare module 'react-native-haptic-feedback' {
  export interface HapticFeedbackOptions {
    enableVibrateFallback?: boolean;
    ignoreAndroidSystemSettings?: boolean;
  }
  export function trigger(
    type: string,
    options?: HapticFeedbackOptions
  ): void;
}
