import { create } from "zustand"
import { persist } from "zustand/middleware"
import { v4 as uuidv4 } from "uuid"
import { Quest, LegendaryQuest, CompletedQuest } from "@/types/quest"

type QuestStore = {
  quests: Quest[]
  legendaryQuests: LegendaryQuest[]
  completedQuests: CompletedQuest[]
  addQuest: (title: string, questGiver: string, goalDays: number) => void
  addLegendaryQuest: (title: string, questGiver: string, goalDays: number, requirement?: string) => void
  incrementQuest: (id: string) => void
  decrementQuest: (id: string) => void
  resetQuest: (id: string) => void
  incrementLegendary: (id: string) => void
  decrementLegendary: (id: string) => void
  resetLegendary: (id: string) => void
  startLegendaryQuest: (id: string) => void
  completeQuest: (id: string) => void
  completeLegendaryQuest: (id: string) => void
}

const defaultQuests: Quest[] = [
  { id: uuidv4(), title: "Take a shower AND brush teeth X days in a row", questGiver: "Chelsea", goalDays: 20, currentStreak: 1, isComplete: false },
  { id: uuidv4(), title: "Walk 3,500 steps X days in a row", questGiver: "Emily", goalDays: 7, currentStreak: 2, isComplete: false },
  { id: uuidv4(), title: "Sleep 6+ hours a night X nights in a row", questGiver: "Cyn", goalDays: 7, currentStreak: 3, isComplete: false },
]

const defaultLegendary: LegendaryQuest[] = [
  {
    id: uuidv4(),
    title: "Stay under 400lbs for 7 consecutive days",
    questGiver: "Kacey Samiee",
    questGiverTitle: "Legendary Quest Giver",
    goalDays: 7,
    currentStreak: 0,
    requirement: "Reach 399lbs to begin this quest",
    isStarted: false,
    isComplete: false,
  }
]

const defaultCompleted: CompletedQuest[] = [
  { id: uuidv4(), title: "Take a shower 10 days in a row", questGiver: "Chelsea", goalDays: 10, completedAt: new Date().toISOString(), isLegendary: false },
  { id: uuidv4(), title: "Fast for 16 hours X days in a row", questGiver: "Hannah", goalDays: 3, completedAt: new Date().toISOString(), isLegendary: false },
]

export const useQuestStore = create<QuestStore>()(
  persist(
    (set, get) => ({
      quests: defaultQuests,
      legendaryQuests: defaultLegendary,
      completedQuests: defaultCompleted,

      addQuest: (title, questGiver, goalDays) => set((s) => ({
        quests: [...s.quests, { id: uuidv4(), title, questGiver, goalDays, currentStreak: 0, isComplete: false }]
      })),

      addLegendaryQuest: (title, questGiver, goalDays, requirement) => set((s) => ({
        legendaryQuests: [...s.legendaryQuests, {
          id: uuidv4(), title, questGiver, goalDays, currentStreak: 0,
          requirement, isStarted: false, isComplete: false
        }]
      })),

      incrementQuest: (id) => set((s) => ({
        quests: s.quests.map((q) => q.id === id
          ? { ...q, currentStreak: Math.min(q.currentStreak + 1, q.goalDays) }
          : q)
      })),

      decrementQuest: (id) => set((s) => ({
        quests: s.quests.map((q) => q.id === id
          ? { ...q, currentStreak: Math.max(q.currentStreak - 1, 0) }
          : q)
      })),

      resetQuest: (id) => set((s) => ({
        quests: s.quests.map((q) => q.id === id ? { ...q, currentStreak: 0 } : q)
      })),

      incrementLegendary: (id) => set((s) => ({
        legendaryQuests: s.legendaryQuests.map((q) => q.id === id
          ? { ...q, currentStreak: Math.min(q.currentStreak + 1, q.goalDays) }
          : q)
      })),

      decrementLegendary: (id) => set((s) => ({
        legendaryQuests: s.legendaryQuests.map((q) => q.id === id
          ? { ...q, currentStreak: Math.max(q.currentStreak - 1, 0) }
          : q)
      })),

      resetLegendary: (id) => set((s) => ({
        legendaryQuests: s.legendaryQuests.map((q) => q.id === id ? { ...q, currentStreak: 0 } : q)
      })),

      startLegendaryQuest: (id) => set((s) => ({
        legendaryQuests: s.legendaryQuests.map((q) => q.id === id ? { ...q, isStarted: true } : q)
      })),

      completeQuest: (id) => {
        const quest = get().quests.find((q) => q.id === id)
        if (!quest) return
        set((s) => ({
          quests: s.quests.filter((q) => q.id !== id),
          completedQuests: [...s.completedQuests, {
            id: uuidv4(), title: quest.title, questGiver: quest.questGiver,
            goalDays: quest.goalDays, completedAt: new Date().toISOString(), isLegendary: false
          }]
        }))
      },

      completeLegendaryQuest: (id) => {
        const quest = get().legendaryQuests.find((q) => q.id === id)
        if (!quest) return
        set((s) => ({
          legendaryQuests: s.legendaryQuests.filter((q) => q.id !== id),
          completedQuests: [...s.completedQuests, {
            id: uuidv4(), title: quest.title, questGiver: quest.questGiver,
            goalDays: quest.goalDays, completedAt: new Date().toISOString(), isLegendary: true
          }]
        }))
      },
    }),
    { name: "rpg-me-quests" }
  )
)
