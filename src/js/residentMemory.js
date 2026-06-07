const defaultHistoryLimit = 10;
const areaMoodNames = ['calm', 'sleepy', 'lively', 'nostalgic'];
const areaMoodReasons = {
  calm: '木やベンチで静かに過ごす時間が増えた',
  sleepy: '夜のライトのそばで過ごす時間が増えた',
  lively: '特別な行動が重なった',
  nostalgic: 'dockで海を眺める時間が増えた',
};

export const initialAreaMood = {
  name: 'calm',
  scores: {
    calm: 0,
    sleepy: 0,
    lively: 0,
    nostalgic: 0,
  },
};

const spotSummaryText = {
  tree: '木の近くでよく過ごしていた',
  dock: 'dockで海を見ていた',
  light: 'ライトのそばで静かに過ごしていた',
  bench: 'ベンチでゆっくりしていた',
  sky: '空を見上げていた',
  crate: '木箱の近くを気にしていた',
  quiet: '島の静かな場所で過ごしていた',
  island: '島の中を歩いていた',
};

const normalizeLimit = (limit) => {
  if (!Number.isFinite(limit)) return defaultHistoryLimit;
  return Math.max(0, Math.floor(limit));
};

// Combines every resident's entries into one recent, time-ordered list.
const getRecentResidentEntries = (residentHistory, limit = 24) => (
  Object.values(residentHistory || {})
    .flat()
    .filter((entry) => entry && typeof entry === 'object')
    .sort((entryA, entryB) => (
      String(entryA.timestamp || '').localeCompare(String(entryB.timestamp || ''))
    ))
    .slice(-normalizeLimit(limit))
);

export const getResidentHistory = (
  residentHistory,
  residentId,
  limit = defaultHistoryLimit,
) => {
  if (!residentId || !residentHistory || typeof residentHistory !== 'object') {
    return [];
  }

  const history = residentHistory[residentId];
  if (!Array.isArray(history)) return [];

  const normalizedLimit = normalizeLimit(limit);
  if (normalizedLimit === 0) return [];

  return history
    .slice(-normalizedLimit)
    .map((entry) => ({ ...entry }));
};

export const createResidentMemorySummary = (history, maxSummaries = 3) => {
  if (!Array.isArray(history) || history.length === 0) return [];

  const validHistory = history.filter((entry) => (
    entry
    && typeof entry === 'object'
    && typeof entry.spot === 'string'
  ));
  if (validHistory.length === 0) return [];

  const stayHistory = validHistory.filter((entry) => entry.actionType === 'stay');
  const locationHistory = stayHistory.length > 0 ? stayHistory : validHistory;
  const spotCounts = locationHistory.reduce((counts, entry) => ({
    ...counts,
    [entry.spot]: (counts[entry.spot] || 0) + 1,
  }), {});
  const dominantSpot = Object.entries(spotCounts)
    .sort(([, countA], [, countB]) => countB - countA)[0]?.[0];

  const summaries = [];
  const addSummary = (summary) => {
    if (summary && !summaries.includes(summary)) summaries.push(summary);
  };

  addSummary(spotSummaryText[dominantSpot]);

  if (validHistory.some((entry) => (
    entry.spot === 'light'
    && entry.timeOfDay === 'night'
    && entry.actionType === 'stay'
  ))) {
    addSummary('夜はライトのそばにいた');
  }

  if (validHistory.some((entry) => (
    entry.spot === 'dock'
    && entry.actionType === 'stay'
  ))) {
    addSummary('dockで海を見ていた');
  }

  if (validHistory.some((entry) => entry.actionType === 'favorite')) {
    addSummary('お気に入りの場所に長くいた');
  }

  return summaries.slice(0, normalizeLimit(maxSummaries));
};

export const createAreaMoodSnapshot = (
  residentHistory,
  previousMood = initialAreaMood,
) => {
  const history = getRecentResidentEntries(residentHistory);
  if (history.length === 0) return previousMood;

  const observedScores = {
    calm: history.filter((entry) => (
      entry.actionType === 'stay'
      && (entry.spot === 'tree' || entry.spot === 'bench')
    )).length,
    sleepy: history.filter((entry) => (
      entry.actionType === 'stay'
      && entry.spot === 'light'
      && entry.timeOfDay === 'night'
    )).length,
    lively: history.filter((entry) => entry.actionType === 'special').length,
    nostalgic: history.filter((entry) => (
      entry.spot === 'dock'
      && (entry.actionType === 'move' || entry.actionType === 'stay')
    )).length,
  };
  const scale = 10 / history.length;
  const scores = Object.fromEntries(areaMoodNames.map((moodName) => {
    const previousScore = previousMood.scores?.[moodName] || 0;
    const observedScore = observedScores[moodName] * scale;
    return [moodName, Number((previousScore * 0.65 + observedScore * 0.35).toFixed(2))];
  }));
  const candidateMood = areaMoodNames.reduce((strongestMood, moodName) => (
    scores[moodName] > scores[strongestMood] ? moodName : strongestMood
  ), previousMood.name || 'calm');
  const currentMoodName = areaMoodNames.includes(previousMood.name)
    ? previousMood.name
    : 'calm';
  const shouldChangeMood = candidateMood !== currentMoodName
    && scores[candidateMood] >= scores[currentMoodName] + 0.4;

  return {
    name: shouldChangeMood ? candidateMood : currentMoodName,
    scores,
  };
};

export const createAreaMoodHistoryEntry = (
  previousMood,
  nextMood,
  timestamp = new Date().toISOString(),
) => {
  if (!nextMood || previousMood?.name === nextMood.name) return null;

  return {
    mood: nextMood.name,
    score: nextMood.scores?.[nextMood.name] || 0,
    scores: { ...nextMood.scores },
    timestamp,
    reason: areaMoodReasons[nextMood.name] || '最近の住人の行動で空気が変化した',
  };
};

export const getAreaMoodHistory = (
  areaMoodHistory,
  limit = defaultHistoryLimit,
) => {
  if (!Array.isArray(areaMoodHistory)) return [];

  const normalizedLimit = normalizeLimit(limit);
  if (normalizedLimit === 0) return [];

  return areaMoodHistory
    .slice(-normalizedLimit)
    .map((entry) => ({
      ...entry,
      score: Number(entry.score) || 0,
      scores: { ...entry.scores },
    }));
};

export const createAreaMemorySummary = (
  residentHistory,
  areaMoodHistory,
  maxSummaries = 3,
) => {
  const recentResidentHistory = getRecentResidentEntries(residentHistory);
  const recentMoodHistory = getAreaMoodHistory(areaMoodHistory, 10);
  const summaries = [];
  const addSummary = (summary) => {
    if (summary && !summaries.includes(summary)) summaries.push(summary);
  };

  const quietNatureStays = recentResidentHistory.filter((entry) => (
    entry.actionType === 'stay'
    && (entry.spot === 'tree' || entry.spot === 'bench')
  )).length;
  const dockMoments = recentResidentHistory.filter((entry) => (
    entry.spot === 'dock'
    && (entry.actionType === 'move' || entry.actionType === 'stay')
  )).length;
  const sleepyNightMoments = recentResidentHistory.filter((entry) => (
    entry.spot === 'light'
    && entry.timeOfDay === 'night'
    && entry.actionType === 'stay'
  )).length;
  const specialMoments = recentResidentHistory.filter(
    (entry) => entry.actionType === 'special',
  ).length;
  const latestMood = recentMoodHistory[recentMoodHistory.length - 1];

  if (quietNatureStays >= 2) {
    addSummary('今日は木の近くで静かな時間が多かった');
  }
  if (dockMoments >= 2) {
    addSummary('dockで海を眺める時間が増えた');
  }
  if (sleepyNightMoments >= 1) {
    addSummary('夜はライトのそばで眠たそうな空気だった');
  }
  if (specialMoments >= 2) {
    addSummary('今日は島に小さな動きがいくつも生まれていた');
  }

  if (latestMood?.mood === 'nostalgic') {
    addSummary('SUN AREAには少し懐かしい空気が残っていた');
  } else if (latestMood?.mood === 'calm') {
    addSummary('SUN AREAには穏やかな空気が流れていた');
  } else if (latestMood?.mood === 'sleepy') {
    addSummary('SUN AREAは少し眠たそうな静けさに包まれていた');
  } else if (latestMood?.mood === 'lively') {
    addSummary('SUN AREAにはいつもより少し明るい気配があった');
  }

  if (summaries.length === 0 && recentResidentHistory.length > 0) {
    addSummary('今日もSUN AREAでは静かな時間が流れていた');
  }

  return summaries.slice(0, normalizeLimit(maxSummaries));
};
