export type Quest = {
  id: string;
  title: string;
  questGiver: string;
  goalDays: number;
  currentStreak: number;
  isComplete: boolean;
  streakSaveToken: boolean;
};

export type LegendaryQuest = {
  id: string;
  title: string;
  questGiver: string;
  questGiverTitle?: string;
  goalDays: number;
  currentStreak: number;
  requirement?: string;
  isStarted: boolean;
  isComplete: boolean;
  streakSaveToken: boolean;
};

export type CompletedQuest = {
  id: string;
  title: string;
  questGiver: string;
  goalDays: number;
  completedAt: string;
  isLegendary: boolean;
};
