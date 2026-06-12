export const CURRENT_SEASON = 'summer';

export const seasonDefinitions = {
  summer: {
    moodScoreBias: {},
    environmentEventWeights: {
      seaBreeze: 1.12,
    },
    fishShadow: {
      intervalMultiplier: 0.86,
      nightIntervalMultiplier: 0.86,
    },
  },
  autumn: {
    moodScoreBias: {
      nostalgic: 0.14,
    },
    environmentEventWeights: {
      treeRustle: 1.14,
    },
    fishShadow: {
      intervalMultiplier: 1.16,
      nightIntervalMultiplier: 1.16,
    },
  },
  night_breeze: {
    moodScoreBias: {
      sleepy: 0.14,
    },
    environmentEventWeights: {
      nightStillness: 1.12,
      shootingStar: 1.08,
    },
    fishShadow: {
      intervalMultiplier: 1.08,
      nightIntervalMultiplier: 0.86,
    },
  },
};

// A single lookup point keeps later month, weather, or real-time rules separate.
export const getSeasonEffects = (season = CURRENT_SEASON) => (
  seasonDefinitions[season] || seasonDefinitions.summer
);
