import { GolfScore } from "@/types";

export const validateScore = (score: number): boolean => {
  return score >= 1 && score <= 45;
};

export const canAddScoreOnDate = (scores: GolfScore[], newDate: string): boolean => {
  return !scores.some(s => s.played_date === newDate);
};

export const addScore = (currentScores: GolfScore[], newScore: GolfScore): GolfScore[] => {
  // Add new score
  const updatedScores = [...currentScores, newScore];
  
  // Sort reverse chronological
  updatedScores.sort((a, b) => new Date(b.played_date).getTime() - new Date(a.played_date).getTime());
  
  // Retain only latest 5 scores
  return updatedScores.slice(0, 5);
};

export const deleteScore = (currentScores: GolfScore[], scoreId: string): GolfScore[] => {
  return currentScores.filter(s => s.id !== scoreId);
};

export const editScore = (currentScores: GolfScore[], updatedScore: GolfScore): GolfScore[] => {
  const updated = currentScores.map(s => s.id === updatedScore.id ? updatedScore : s);
  updated.sort((a, b) => new Date(b.played_date).getTime() - new Date(a.played_date).getTime());
  return updated;
};
