import { fetchWithAuth } from "./auth";

export interface BadgeLevel {
  name: string;
  minPoints: number;
}

export const BADGE_LEVELS: BadgeLevel[] = [
  { name: "Newbie", minPoints: 20 },
  { name: "Explorer", minPoints: 40 },
  { name: "Achiever", minPoints: 60 },
  { name: "Specialist", minPoints: 80 },
  { name: "Expert", minPoints: 100 },
  { name: "Master", minPoints: 120 },
];

interface LessonStatResponse {
  user: number | string;
  total_points: number | string;
}

interface PointsHistoryResponse {
  user: number | string;
  points: number | string;
}

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function getBadgeForPoints(points: number): BadgeLevel | null {
  const normalizedPoints = Math.max(0, points);

  for (let index = BADGE_LEVELS.length - 1; index >= 0; index -= 1) {
    const level = BADGE_LEVELS[index];
    if (normalizedPoints >= level.minPoints) {
      return level;
    }
  }

  return null;
}

export function getNextBadge(points: number): BadgeLevel | null {
  const normalizedPoints = Math.max(0, points);
  return BADGE_LEVELS.find((level) => normalizedPoints < level.minPoints) ?? null;
}

export async function fetchUserTotalPoints(userId: number): Promise<number> {
  const [lessonStatsRes, pointsHistoryRes] = await Promise.all([
    fetchWithAuth("/lesson-stats/"),
    fetchWithAuth("/points-history/"),
  ]);

  let totalPointsFromStats = 0;

  if (lessonStatsRes.ok) {
    const lessonStats = (await lessonStatsRes.json()) as LessonStatResponse[];
    const userStat = Array.isArray(lessonStats)
      ? lessonStats.find((stat) => toNumber(stat.user) === userId)
      : undefined;

    totalPointsFromStats = toNumber(userStat?.total_points);
  }

  if (totalPointsFromStats > 0) {
    return totalPointsFromStats;
  }

  if (pointsHistoryRes.ok) {
    const pointsHistory = (await pointsHistoryRes.json()) as PointsHistoryResponse[];

    if (Array.isArray(pointsHistory)) {
      return pointsHistory
        .filter((entry) => toNumber(entry.user) === userId)
        .reduce((sum, entry) => sum + toNumber(entry.points), 0);
    }
  }

  return 0;
}
