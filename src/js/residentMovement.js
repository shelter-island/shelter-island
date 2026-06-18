import { areaMoodEffects } from './residentConfig.js';

// Keeps autonomous and manual movement inside the island ellipse.
export const clampResidentPosition = (x, y) => {
  const centerX = 50;
  const centerY = 54;
  const radiusX = 34;
  const radiusY = 27;
  const offsetX = x - centerX;
  const offsetY = y - centerY;
  const distanceFromCenter = Math.hypot(offsetX / radiusX, offsetY / radiusY);

  if (distanceFromCenter <= 1) {
    return { x, y };
  }

  return {
    x: centerX + offsetX / distanceFromCenter,
    y: centerY + offsetY / distanceFromCenter,
  };
};

export const chooseWeightedSpot = (spots) => {
  const totalWeight = spots.reduce((total, spot) => total + spot.weight, 0);
  let choice = Math.random() * totalWeight;

  for (const spot of spots) {
    choice -= spot.weight;
    if (choice <= 0) return spot;
  }

  return spots[spots.length - 1];
};

export const applyPersonalityToSpot = (
  spot,
  personality,
  isNight,
  favoriteSpot,
  areaMoodName,
  affinitySummary,
) => {
  const period = isNight ? 'night' : 'day';
  const destinationMultiplier = personality.destinationWeights[period][spot.kind] || 1;
  const pauseBonus = personality.pauseBonuses[spot.kind] || 0;
  const favoriteModifiers = personality.favoriteSpotModifiers || {};
  const moodEffects = areaMoodEffects[areaMoodName] || areaMoodEffects.calm;
  const moodDestinationMultiplier = spot.kind === 'dock'
    ? moodEffects.dockWeightMultiplier
    : 1;
  const isFavorite = spot.kind === favoriteSpot;
  const affectionScore = Number(affinitySummary?.score) || 0;
  const isAffectionSpot = spot.kind === affinitySummary?.spot;
  const affectionMultiplier = isAffectionSpot
    ? 1.2 + Math.min(0.08, Math.max(0, affectionScore - 0.28) * 0.2)
    : 1;

  return {
    ...spot,
    weight: spot.weight
      * destinationMultiplier
      * moodDestinationMultiplier
      * (isFavorite ? favoriteModifiers.weightMultiplier || 1 : 1)
      * affectionMultiplier,
    pauseBonus: spot.pauseBonus
      + pauseBonus
      + (isFavorite ? favoriteModifiers.pauseBonus || 0 : 0),
    presenceChance: Math.min(
      0.9,
      spot.presenceChance + (isFavorite
        ? favoriteModifiers.presenceChanceBonus || 0
        : 0),
    ),
    isFavorite,
    isAffectionSpot,
    affectionScore,
    affectionSource: isAffectionSpot ? affinitySummary?.source || '' : '',
  };
};
