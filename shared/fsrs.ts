import { SRSData, SRSState } from './types';

export type Rating = 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy

export interface ReviewLog {
  rating: Rating;
  reviewedAt: string; // ISO timestamp
  elapsedDays: number;
}

// Default FSRS v4 Parameters
const DEFAULT_WEIGHTS = [
  0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61
];
const DESIRED_RETENTION = 0.9; // 90% target retention rate

/**
 * Creates initial SRS state for a newly added word
 */
export function createInitialSRSData(): SRSData {
  const now = new Date();
  return {
    stability: 0,
    difficulty: 0,
    elapsedDays: 0,
    scheduledDays: 0,
    repetitions: 0,
    lapses: 0,
    state: 'new',
    nextReviewDate: now.toISOString(),
    retrievability: 1.0,
  };
}

/**
 * Calculates Retrievability R(t, S)
 * t: elapsed days since last review
 * S: current memory stability in days
 */
export function calculateRetrievability(elapsedDays: number, stability: number): number {
  if (stability <= 0) return 0;
  const factor = 19 / 81; // FSRS constant factor
  const decay = -0.5;    // FSRS constant decay
  return Math.pow(1 + (factor * elapsedDays) / stability, decay);
}

/**
 * Initial Stability S_0 based on first rating
 */
function initStability(rating: Rating): number {
  switch (rating) {
    case 1: return Math.max(0.1, DEFAULT_WEIGHTS[0]);
    case 2: return Math.max(0.1, DEFAULT_WEIGHTS[1]);
    case 3: return Math.max(0.1, DEFAULT_WEIGHTS[2]);
    case 4: return Math.max(0.1, DEFAULT_WEIGHTS[3]);
  }
}

/**
 * Initial Difficulty D_0 based on first rating
 */
function initDifficulty(rating: Rating): number {
  const d0 = DEFAULT_WEIGHTS[4] - (rating - 3) * DEFAULT_WEIGHTS[5];
  return Math.min(Math.max(d0, 1), 10);
}

/**
 * Next Difficulty update D'
 */
function nextDifficulty(currentD: number, rating: Rating): number {
  const deltaD = -DEFAULT_WEIGHTS[6] * (rating - 3);
  const meanReversion = DEFAULT_WEIGHTS[7] * (initDifficulty(3) - currentD);
  const nextD = currentD + deltaD + meanReversion;
  return Math.min(Math.max(nextD, 1), 10);
}

/**
 * Recall Stability update S_recall
 */
function nextRecallStability(d: number, s: number, r: number, rating: Rating): number {
  const hardPenalty = rating === 2 ? DEFAULT_WEIGHTS[15] : 1;
  const easyBonus = rating === 4 ? DEFAULT_WEIGHTS[16] : 1;
  const newS = s * (1 + Math.exp(DEFAULT_WEIGHTS[8]) *
    (11 - d) *
    Math.pow(s, -DEFAULT_WEIGHTS[9]) *
    (Math.exp((1 - r) * DEFAULT_WEIGHTS[10]) - 1) *
    hardPenalty *
    easyBonus);
  return Math.max(newS, 0.1);
}

/**
 * Forget Stability update S_forget
 */
function nextForgetStability(d: number, s: number, r: number): number {
  const newS = DEFAULT_WEIGHTS[11] *
    Math.pow(d, -DEFAULT_WEIGHTS[12]) *
    (Math.pow(s + 1, DEFAULT_WEIGHTS[13]) - 1) *
    Math.exp((1 - r) * DEFAULT_WEIGHTS[14]);
  return Math.min(Math.max(newS, 0.1), s);
}

/**
 * Main FSRS step function: takes current SRS data + user rating (1-4)
 * and returns updated SRS data with calculated nextReviewDate.
 */
export function scheduleReview(currentSRS: SRSData, rating: Rating, reviewDate: Date = new Date()): SRSData {
  let { stability, difficulty, repetitions, lapses, state } = currentSRS;
  const lastReviewTime = currentSRS.nextReviewDate ? new Date(currentSRS.nextReviewDate).getTime() : reviewDate.getTime();
  const elapsedDays = Math.max(0, Math.round((reviewDate.getTime() - lastReviewTime) / (1000 * 60 * 60 * 24)));

  let newStability: number;
  let newDifficulty: number;
  let newState: SRSState = state;

  if (state === 'new') {
    newStability = initStability(rating);
    newDifficulty = initDifficulty(rating);
    newState = rating === 1 ? 'relearning' : 'review';
    repetitions = rating > 1 ? 1 : 0;
    lapses = rating === 1 ? 1 : 0;
  } else {
    const retrievability = calculateRetrievability(elapsedDays, stability);
    newDifficulty = nextDifficulty(difficulty, rating);

    if (rating === 1) { // Forgotten
      newStability = nextForgetStability(newDifficulty, stability, retrievability);
      newState = 'relearning';
      lapses += 1;
    } else { // Recalled (Hard, Good, Easy)
      newStability = nextRecallStability(newDifficulty, stability, retrievability, rating);
      newState = 'review';
      repetitions += 1;
    }
  }

  // Calculate interval I = (S / 0.23) * (0.9^(-1/-0.5) - 1) = S * ( (1/0.9^2) - 1 ) * factor ~ S
  // Standard FSRS formula for next interval in days:
  const intervalInDays = Math.max(1, Math.round(newStability * 9 * (Math.pow(DESIRED_RETENTION, -1 / 0.5) - 1)));
  const nextDate = new Date(reviewDate.getTime() + intervalInDays * 24 * 60 * 60 * 1000);

  return {
    stability: Number(newStability.toFixed(2)),
    difficulty: Number(newDifficulty.toFixed(2)),
    elapsedDays,
    scheduledDays: intervalInDays,
    repetitions,
    lapses,
    state: newState,
    nextReviewDate: nextDate.toISOString(),
    retrievability: Number(calculateRetrievability(0, newStability).toFixed(2)),
  };
}
