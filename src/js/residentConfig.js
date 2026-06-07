// Development-only views. Keep both false for production.
export const SHOW_RESIDENT_DEBUG = false;
export const SHOW_AREA_MEMORY_CARD = false;

export const residentHistoryLimit = 10;
export const residentTraceLimit = 4;
export const areaMoodHistoryLimit = 10;

export const residentPersonalities = {
  relaxed: {
    destinationWeights: {
      day: {
        tree: 1.22,
        dock: 1.18,
      },
      night: {
        light: 1.24,
      },
    },
    favoriteSpotCandidates: ['tree', 'dock', 'light'],
    favoriteSpotModifiers: {
      weightMultiplier: 1.18,
      pauseBonus: 1400,
      presenceChanceBonus: 0.08,
      specialActionChanceBonus: 0.02,
    },
    pauseBonuses: {
      bench: 1200,
    },
    routinePauseBonus: {
      day: 500,
      night: 900,
    },
  },
};

export const areaMoodEffects = {
  calm: {
    traceDurationMultiplier: 1.08,
    pauseMultiplier: 1,
    dockWeightMultiplier: 1,
    specialActionMultiplier: 1,
  },
  sleepy: {
    traceDurationMultiplier: 1,
    pauseMultiplier: 1.06,
    dockWeightMultiplier: 1,
    specialActionMultiplier: 1,
  },
  lively: {
    traceDurationMultiplier: 1,
    pauseMultiplier: 1,
    dockWeightMultiplier: 1,
    specialActionMultiplier: 1.04,
  },
  nostalgic: {
    traceDurationMultiplier: 1,
    pauseMultiplier: 1,
    dockWeightMultiplier: 1.06,
    specialActionMultiplier: 1,
  },
};

export const createResidentDefinitions = (assetPath) => [
  {
    id: 'sun_monkey',
    name: 'SUN',
    image: assetPath('images/characters/saru.png'),
    personality: 'relaxed',
    favoriteSpot: 'tree',
    position: { x: 54, y: 62 },
    enabled: true,
  },
  {
    id: 'sun_monkey_2',
    name: 'SUN Friend',
    image: assetPath('images/characters/saru.png'),
    personality: 'relaxed',
    favoriteSpot: 'dock',
    position: { x: 36, y: 48 },
    enabled: false,
  },
];

const chooseResidentFavoriteSpot = (resident, personality) => {
  const candidates = personality.favoriteSpotCandidates || [];
  if (!candidates.length) return '';
  if (candidates.includes(resident.favoriteSpot)) return resident.favoriteSpot;

  const idHash = [...resident.id].reduce((total, character) => (
    total + character.charCodeAt(0)
  ), 0);
  return candidates[idHash % candidates.length];
};

const createResidentState = (resident) => {
  const personality = residentPersonalities[resident.personality]
    || residentPersonalities.relaxed;

  return {
    ...resident,
    ...resident.position,
    favoriteSpot: chooseResidentFavoriteSpot(resident, personality),
    pose: 'idle',
    direction: 'right',
    presence: '',
    isMoving: false,
    specialAction: '',
  };
};

export const createInitialResidents = (residentDefinitions) => (
  residentDefinitions
    .filter((resident) => resident.enabled)
    .map(createResidentState)
);

export const createInitialResidentHistory = (residentDefinitions) => (
  Object.fromEntries(
    residentDefinitions
      .filter((resident) => resident.enabled)
      .map((resident) => [resident.id, []]),
  )
);
