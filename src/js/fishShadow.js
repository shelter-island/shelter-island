import { CURRENT_SEASON, getSeasonEffects } from './seasonConfig.js';

export const fishShadowDefinition = {
  fishType: 'shadow',
  catchable: false,
  rare: false,
  seasons: ['summer', 'autumn', 'night_breeze'],
  timeOfDay: ['day', 'night'],
};

const randomBetween = (minimum, maximum) => (
  minimum + Math.random() * (maximum - minimum)
);

export const getFishShadowDelay = ({
  season = CURRENT_SEASON,
  isNight = false,
  areaMoodName = 'calm',
  isFirstShadow = false,
  isDebug = false,
} = {}) => {
  if (isDebug) return Math.round(randomBetween(2500, 4500));

  const seasonEffects = getSeasonEffects(season);
  const baseMinimum = isFirstShadow ? 75000 : 105000;
  const baseMaximum = isFirstShadow ? 135000 : 195000;
  const seasonMultiplier = isNight
    ? seasonEffects.fishShadow.nightIntervalMultiplier
    : seasonEffects.fishShadow.intervalMultiplier;
  const moodMultiplier = areaMoodName === 'nostalgic' ? 0.88 : 1;

  return Math.max(
    45000,
    Math.round(randomBetween(baseMinimum, baseMaximum) * seasonMultiplier * moodMultiplier),
  );
};

export const createFishShadow = ({
  sequence = 0,
  season = CURRENT_SEASON,
  isNight = false,
  areaMoodName = 'calm',
  timestamp = new Date().toISOString(),
} = {}) => {
  const shadowDuration = Math.round(randomBetween(3400, 4300));
  const rippleDuration = Math.round(
    randomBetween(2100, 2800) * (areaMoodName === 'calm' ? 1.18 : 1),
  );
  const baseEscapeChance = {
    summer: 0.18,
    autumn: 0.08,
    night_breeze: 0.12,
  }[season] || 0.1;
  const escapeChance = baseEscapeChance
    * (areaMoodName === 'calm' ? 0.55 : 1);

  return {
    id: `fish_shadow_${sequence}`,
    ...fishShadowDefinition,
    season,
    timeOfDay: isNight ? 'night' : 'day',
    mood: areaMoodName,
    timestamp,
    direction: Math.random() > 0.5 ? 'right' : 'left',
    x: randomBetween(18, 55),
    y: randomBetween(57, 75),
    travel: Math.round(randomBetween(34, 58)),
    shadowDuration,
    rippleDuration,
    rippleDelay: Math.round(shadowDuration * 0.44),
    duration: Math.max(shadowDuration, Math.round(shadowDuration * 0.44) + rippleDuration),
    willEscapeNaturally: Math.random() < escapeChance,
    naturalEscapeDelay: Math.round(shadowDuration * randomBetween(0.4, 0.62)),
    escaped: false,
    reaction: null,
  };
};

export const createFishEscapeReaction = (
  fishShadow,
  reason = 'nearby_tap',
  timestamp = new Date().toISOString(),
) => {
  if (!fishShadow || fishShadow.escaped) return fishShadow;

  const elapsedValue = Date.parse(timestamp) - Date.parse(fishShadow.timestamp);
  const elapsed = Number.isFinite(elapsedValue) ? Math.max(0, elapsedValue) : 0;
  const progress = Math.min(1, elapsed / fishShadow.shadowDuration);
  const directionSign = fishShadow.direction === 'right' ? 1 : -1;
  const escapeDirection = fishShadow.mood === 'nostalgic'
    ? 'right'
    : fishShadow.direction;
  const baseTravel = fishShadow.season === 'summer' ? 56 : 48;
  const escapeTravel = Math.round(
    baseTravel * (fishShadow.mood === 'calm' ? 0.84 : 1),
  );

  return {
    ...fishShadow,
    escaped: true,
    reaction: {
      reason,
      timestamp,
      direction: escapeDirection,
    },
    escapeDirection,
    escapeTravel,
    reactionStartOffset: Math.round(fishShadow.travel * progress * directionSign),
  };
};
