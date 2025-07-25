import { UserVocabProgress } from '../types';
// seededShuffle: random ổn định với seed
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = arr.slice();
  let m = a.length, t, i;
  let s = seed;
  while (m) {
    i = Math.floor(randomSeed(s) * m--);
    t = a[m];
    a[m] = a[i];
    a[i] = t;
    s++;
  }
  return a;
}
function randomSeed(seed: number) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// buildStudyQueue: tạo queue học theo logic Anki
export function buildStudyQueue(cards: UserVocabProgress[], queueSeed: number): UserVocabProgress[] {
  const now = new Date();
  const learningDue = cards.filter(card => card.srs?.state === 'learning' && card.srs.dueDate && new Date(card.srs.dueDate) <= now);
  const learningNotDue = cards.filter(card => card.srs?.state === 'learning' && (!card.srs.dueDate || new Date(card.srs.dueDate) > now));
  const newCards = cards.filter(card => card.srs?.state === 'new');
  const reviewCards = cards.filter(card => card.srs?.state === 'review' && card.srs.dueDate && new Date(card.srs.dueDate) <= now);
  let newQueue: UserVocabProgress[] = [];
  if (newCards.length > 0 || reviewCards.length > 0) {
    newQueue = [...seededShuffle(learningDue, queueSeed), ...newCards, ...reviewCards];
  } else {
    newQueue = [...seededShuffle(learningDue, queueSeed), ...learningNotDue];
  }
  return newQueue;
}

// getNextIntervalText: dự đoán khoảng cách lặp tiếp theo cho từng nút rating
export function getNextIntervalText(card: UserVocabProgress, grade: number): string {
  const LEARNING_STEPS = [1, 10]; // phút
  const EASY_INTERVALS = [3, 4, 5]; // ngày (random)
  let { srs } = card;
  let state = srs.state;
  let learningStepIndex = srs.learningStepIndex;
  if (state === 'new' || state === 'learning') {
    if (grade === 0 || grade === 1) {
      return '1 phút';
    }
    if (grade === 2) {
      return '2 phút';
    }
    if (grade === 3) {
      if (learningStepIndex < LEARNING_STEPS.length - 1) {
        return `${LEARNING_STEPS[learningStepIndex + 1]} phút`;
      } else {
        return '1 ngày';
      }
    }
    if (grade >= 4) {
      const rand = EASY_INTERVALS[Math.floor(Math.random() * EASY_INTERVALS.length)];
      return `${rand} ngày`;
    }
  } else if (state === 'review') {
    let ef = srs.easeFactor || 2.5;
    let rep = srs.repetitions || 0;
    let interval = srs.interval;
    if (grade < 3) {
      return '1 phút';
    } else {
      let nextInterval = 0;
      if (rep === 0) nextInterval = 1;
      else if (rep === 1) nextInterval = 6;
      else nextInterval = Math.round(interval * ef);
      if (grade >= 4) nextInterval = Math.max(nextInterval + 1, 4);
      if (nextInterval < 1) return '1 ngày';
      if (nextInterval < 7) return `${nextInterval} ngày`;
      if (nextInterval < 30) return `${Math.round(nextInterval/7)} tuần`;
      return `${Math.round(nextInterval/30)} tháng`;
    }
  } else if (state === 'lapsed') {
    if (srs.interval <= 1) return '1 phút';
    return `${srs.interval} ngày`;
  }
  return '';
} 