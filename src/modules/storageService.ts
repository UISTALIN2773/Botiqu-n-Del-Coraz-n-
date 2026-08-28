import {
  EmotionalItem,
  INITIAL_MEMORIES,
  UserPreferences,
  DEFAULT_PREFERENCES,
} from '../config/database';

/**
 * Local in-memory and state persistence manager with fast JSON sync
 */
class StorageService {
  private static instance: StorageService;
  private memories: EmotionalItem[] = [...INITIAL_MEMORIES];
  private preferences: UserPreferences = { ...DEFAULT_PREFERENCES };
  private capsuleUnlockedToday: boolean = false;
  private lastCapsuleDate: string = '';

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // --- MEMORIES MANAGEMENT ---
  public getMemories(): EmotionalItem[] {
    return this.memories;
  }

  public getMemoriesByMood(mood: string): EmotionalItem[] {
    if (mood === 'sorprendeme') {
      return this.memories;
    }
    return this.memories.filter((m) => m.mood === mood);
  }

  public getFavoriteMemories(): EmotionalItem[] {
    return this.memories.filter((m) => m.isFavorite);
  }

  public addCustomMemory(newItem: Omit<EmotionalItem, 'id'>): EmotionalItem {
    const memory: EmotionalItem = {
      ...newItem,
      id: `custom-${Date.now()}`,
    };
    this.memories = [memory, ...this.memories];
    return memory;
  }

  public toggleFavorite(id: string): boolean {
    const item = this.memories.find((m) => m.id === id);
    if (item) {
      item.isFavorite = !item.isFavorite;
      return item.isFavorite;
    }
    return false;
  }

  public deleteMemory(id: string): boolean {
    const prevCount = this.memories.length;
    this.memories = this.memories.filter((m) => m.id !== id);
    return this.memories.length < prevCount;
  }

  // --- PREFERENCES MANAGEMENT ---
  public getPreferences(): UserPreferences {
    return this.preferences;
  }

  public updatePreferences(newPrefs: Partial<UserPreferences>): UserPreferences {
    this.preferences = {
      ...this.preferences,
      ...newPrefs,
    };
    return this.preferences;
  }

  // --- ANNIVERSARY COUNTER ---
  public getDaysTogether(): number {
    try {
      const anniversary = new Date(this.preferences.anniversaryDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - anniversary.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return isNaN(diffDays) ? 1 : diffDays;
    } catch {
      return 1;
    }
  }

  // --- DAILY CAPSULE ---
  public isCapsuleUnlocked(): boolean {
    const today = new Date().toISOString().split('T')[0];
    return this.lastCapsuleDate === today && this.capsuleUnlockedToday;
  }

  public unlockCapsule(): void {
    this.lastCapsuleDate = new Date().toISOString().split('T')[0];
    this.capsuleUnlockedToday = true;
  }
}

export const storageService = StorageService.getInstance();
