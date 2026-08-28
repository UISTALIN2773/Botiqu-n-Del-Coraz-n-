import {
  EmotionalItem,
  INITIAL_MEMORIES,
  UserPreferences,
  DEFAULT_PREFERENCES,
  DoubtItem,
  DOUBT_ITEMS,
  TimeCapsuleItem,
  TIME_CAPSULES,
  FutureGoalItem,
  INITIAL_FUTURE_GOALS,
} from '../config/database';

class StorageService {
  private static instance: StorageService;
  private memories: EmotionalItem[] = [...INITIAL_MEMORIES];
  private preferences: UserPreferences = { ...DEFAULT_PREFERENCES };
  private doubtItems: DoubtItem[] = [...DOUBT_ITEMS];
  private timeCapsules: TimeCapsuleItem[] = [...TIME_CAPSULES];
  private futureGoals: FutureGoalItem[] = [...INITIAL_FUTURE_GOALS];
  private capsuleUnlockedToday: boolean = false;
  private lastCapsuleDate: string = '';

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // --- MEMORIES ---
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

  // --- DOUBTS & INSECURITIES ---
  public getDoubtItems(): DoubtItem[] {
    return this.doubtItems;
  }

  // --- TIME CAPSULES ---
  public getTimeCapsules(): TimeCapsuleItem[] {
    return this.timeCapsules;
  }

  public openTimeCapsule(id: string): TimeCapsuleItem | undefined {
    const cap = this.timeCapsules.find((c) => c.id === id);
    if (cap) {
      cap.isOpened = true;
    }
    return cap;
  }

  // --- FUTURE GOALS ---
  public getFutureGoals(): FutureGoalItem[] {
    return this.futureGoals;
  }

  public toggleGoal(id: string): boolean {
    const goal = this.futureGoals.find((g) => g.id === id);
    if (goal) {
      goal.isCompleted = !goal.isCompleted;
      goal.completedDate = goal.isCompleted ? '¡Cumplido juntos! ❤️' : undefined;
      return goal.isCompleted;
    }
    return false;
  }

  public addGoal(title: string, category: FutureGoalItem['category']): FutureGoalItem {
    const newGoal: FutureGoalItem = {
      id: `goal-${Date.now()}`,
      title,
      category,
      isCompleted: false,
    };
    this.futureGoals = [newGoal, ...this.futureGoals];
    return newGoal;
  }

  // --- PREFERENCES & DATES ---
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

  public getDaysUntilNextMeet(): number {
    try {
      const meet = new Date(this.preferences.nextDateMeet);
      const now = new Date();
      const diffTime = meet.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return isNaN(diffDays) || diffDays < 0 ? 0 : diffDays;
    } catch {
      return 0;
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
