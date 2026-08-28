import { NativeModules } from 'react-native';
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
  private isInitialized: boolean = false;

  private constructor() {
    this.initFromDisk();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Reads state from permanent local disk
   */
  public async initFromDisk(): Promise<void> {
    if (this.isInitialized) return;
    try {
      if (NativeModules.LocalStorageModule) {
        const savedData = await NativeModules.LocalStorageModule.loadData('botiquin_permanent_backup');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (parsed.preferences) this.preferences = { ...this.preferences, ...parsed.preferences };
          if (Array.isArray(parsed.memories)) this.memories = parsed.memories;
          if (Array.isArray(parsed.futureGoals)) this.futureGoals = parsed.futureGoals;
          if (Array.isArray(parsed.timeCapsules)) this.timeCapsules = parsed.timeCapsules;
        }
      }
    } catch (e) {
      console.warn('[Storage] initFromDisk notice:', e);
    } finally {
      this.isInitialized = true;
    }
  }

  /**
   * Persists entire state to permanent local disk immediately
   */
  private async persistToDisk(): Promise<void> {
    try {
      if (NativeModules.LocalStorageModule) {
        const json = JSON.stringify({
          preferences: this.preferences,
          memories: this.memories,
          futureGoals: this.futureGoals,
          timeCapsules: this.timeCapsules,
        });
        await NativeModules.LocalStorageModule.saveData('botiquin_permanent_backup', json);
      }
    } catch (e) {
      console.warn('[Storage] persistToDisk notice:', e);
    }
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
    this.persistToDisk();
    return memory;
  }

  public toggleFavorite(id: string): boolean {
    const item = this.memories.find((m) => m.id === id);
    if (item) {
      item.isFavorite = !item.isFavorite;
      this.persistToDisk();
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
      this.persistToDisk();
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
      this.persistToDisk();
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
    this.persistToDisk();
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
    this.persistToDisk();
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

  // --- BACKUP & RESTORE ---
  public exportDataJSON(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      preferences: this.preferences,
      memories: this.memories,
      futureGoals: this.futureGoals,
      timeCapsules: this.timeCapsules,
    };
    return JSON.stringify(backup, null, 2);
  }

  public importDataJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.preferences) this.preferences = { ...this.preferences, ...data.preferences };
      if (Array.isArray(data.memories)) this.memories = data.memories;
      if (Array.isArray(data.futureGoals)) this.futureGoals = data.futureGoals;
      if (Array.isArray(data.timeCapsules)) this.timeCapsules = data.timeCapsules;
      this.persistToDisk();
      return true;
    } catch (e) {
      console.warn('[Storage] Import failed:', e);
      return false;
    }
  }

  // --- SCHEDULE STATUS (NON-INVASIVE ROUTINE) ---
  public getCurrentRoutineStatus(): { status: string; subtext: string; icon: string } {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 7) {
      return {
        status: 'Durmiendo o descansando',
        subtext: 'Probablemente esté durmiendo soñando contigo. En cuanto despierte te leerá ❤️',
        icon: '🌙',
      };
    } else if (hour >= 7 && hour < 9) {
      return {
        status: 'Despertando y alistándose',
        subtext: 'Tomando desayuno o en camino a sus actividades diarias.',
        icon: '☕',
      };
    } else if (hour >= 9 && hour < 13) {
      return {
        status: 'En horario de trabajo / clases matutinas',
        subtext: 'Concentrado/a en sus pendientes laborales o de estudio.',
        icon: '💻',
      };
    } else if (hour >= 13 && hour < 15) {
      return {
        status: 'Hora de almuerzo',
        subtext: 'Comiendo algo rico y tomándose un respiro.',
        icon: '🥗',
      };
    } else if (hour >= 15 && hour < 19) {
      return {
        status: 'Actividades de la tarde',
        subtext: 'Terminando pendientes del día o en camino a casa.',
        icon: '🚗',
      };
    } else {
      return {
        status: 'Tiempo libre / Cena y descanso',
        subtext: 'Relajándose en casa después de una larga jornada.',
        icon: '🛋️',
      };
    }
  }
}

export const storageService = StorageService.getInstance();
