const STORAGE_KEY = 'telugu-steps-progress';
const DEFAULT_PROGRESS = {
  completedLevels: [],
  bestScores: {},
};

export function loadProgress() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_PROGRESS;
    }

    const parsed = JSON.parse(raw);

    return {
      completedLevels: parsed.completedLevels || [],
      bestScores: parsed.bestScores || {},
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}
