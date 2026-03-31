import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const XP_THRESHOLDS = [
  { level: 1, name: "Newbie", minXP: 0 },
  { level: 2, name: "Apprentice", minXP: 100 },
  { level: 3, name: "Achiever", minXP: 250 },
  { level: 4, name: "Expert", minXP: 500 },
  { level: 5, name: "Master", minXP: 1000 },
];

export function getLevelFromXP(xp: number) {
  let currentLevel = XP_THRESHOLDS[0];
  for (const threshold of XP_THRESHOLDS) {
    if (xp >= threshold.minXP) {
      currentLevel = threshold;
    } else {
      break;
    }
  }
  return currentLevel;
}
