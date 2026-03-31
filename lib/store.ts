import { create } from 'zustand';

import { getLevelFromXP } from "./utils";

// --- Types matching Supabase Schema ---
export interface Subtask {
  title: string;
  completed: boolean;
}

export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  notes: string;
  priority: Priority;
  category: string;
  tags: string[];
  subtasks: Subtask[];
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  streak: number;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  goal_days: number;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  log_date: string; // YYYY-MM-DD format
  status: boolean;
}

export interface LevelUpDetails {
  prevLevel: number;
  newLevel: number;
  newTitle: string;
}

// --- Zustand Store ---

interface GlobalState {
  // Navigation
  isSidebarOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;

  // Profile data
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
  addXp: (amount: number) => void;
  levelUpDetails: LevelUpDetails | null;
  clearLevelUpToast: () => void;

  // Tasks Data
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // UI Modal State
  isTaskModalOpen: boolean;
  editingTask: Task | null;
  openTaskModal: (task?: Task) => void;
  closeTaskModal: () => void;

  // Habits Data
  habits: Habit[];
  habitLogs: HabitLog[];
  setHabits: (habits: Habit[]) => void;
  setHabitLogs: (logs: HabitLog[]) => void;
  addHabit: (habit: Habit) => void;
  updateHabitLog: (habitId: string, date: string, status: boolean, logId?: string) => void;

  // Study Mode
  isStudyModeOpen: boolean;
  openStudyMode: () => void;
  closeStudyMode: () => void;

  // Pomodoro
  pomodoroStatus: 'idle' | 'focus' | 'break';
  pomodoroTimeLeft: number; // in seconds
  focusDuration: number; // in minutes
  breakDuration: number; // in minutes
  setPomodoroStatus: (status: 'idle' | 'focus' | 'break') => void;
  setPomodoroTimeLeft: (time: number) => void;
  setPomodoroDurations: (focus: number, breakDur: number) => void;
}

export const useStore = create<GlobalState>((set) => ({
  // Navigation
  isSidebarOpen: false,
  setIsOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  // Profile
  profile: null,
  setProfile: (profile) => set({ profile }),
  levelUpDetails: null,
  clearLevelUpToast: () => set({ levelUpDetails: null }),
  addXp: (amount) => set((state) => {
    if (!state.profile) return { profile: null };
    const newXp = state.profile.xp + amount;
    const prevLevelInfo = getLevelFromXP(state.profile.xp);
    const newLevelInfo = getLevelFromXP(newXp);
    
    return { 
      profile: { ...state.profile, xp: newXp },
      levelUpDetails: newLevelInfo.level > prevLevelInfo.level 
        ? { prevLevel: prevLevelInfo.level, newLevel: newLevelInfo.level, newTitle: newLevelInfo.name }
        : state.levelUpDetails
    };
  }),

  // Tasks
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
  })),
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== id)
  })),

  // UI Modal
  isTaskModalOpen: false,
  editingTask: null,
  openTaskModal: (task) => set({ isTaskModalOpen: true, editingTask: task || null }),
  closeTaskModal: () => set({ isTaskModalOpen: false, editingTask: null }),

  // Habits
  habits: [],
  habitLogs: [],
  setHabits: (habits) => set({ habits }),
  setHabitLogs: (logs) => set({ habitLogs: logs }),
  addHabit: (habit) => set((state) => ({ habits: [...state.habits, habit] })),
  updateHabitLog: (habitId, date, status, logId) => set((state) => {
    const existingIndex = state.habitLogs.findIndex(l => l.habit_id === habitId && l.log_date === date);
    if (existingIndex >= 0) {
      const newLogs = [...state.habitLogs];
      newLogs[existingIndex] = { ...newLogs[existingIndex], status };
      return { habitLogs: newLogs };
    } else {
      return { 
        habitLogs: [...state.habitLogs, { 
          id: logId || crypto.randomUUID(), 
          habit_id: habitId, 
          user_id: state.profile?.id || '', 
          log_date: date, 
          status 
        }]
      };
    }
  }),

  // Study Mode
  isStudyModeOpen: false,
  openStudyMode: () => set({ isStudyModeOpen: true }),
  closeStudyMode: () => set({ isStudyModeOpen: false }),

  // Pomodoro
  pomodoroStatus: 'idle',
  pomodoroTimeLeft: 25 * 60,
  focusDuration: 25,
  breakDuration: 5,
  setPomodoroStatus: (status) => set({ pomodoroStatus: status }),
  setPomodoroTimeLeft: (time) => set({ pomodoroTimeLeft: time }),
  setPomodoroDurations: (focus, breakDur) => set({ focusDuration: focus, breakDuration: breakDur }),
}));
