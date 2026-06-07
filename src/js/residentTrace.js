import { areaMoodEffects } from './residentConfig.js';
import { clampResidentPosition } from './residentMovement.js';

const residentTraceMarks = {
  tree: ['🌿', '· ·'],
  dock: ['· ·', '…'],
  light: ['…', '☀️'],
  sky: ['☀️', '…'],
  bench: ['…'],
  quiet: ['· ·', '…'],
  island: ['· ·'],
};

// Creates trace data only; React owns display limits and removal timers.
export const createResidentTrace = ({
  residentId,
  spot,
  reason,
  sequence,
  areaMoodName,
}) => {
  const marks = residentTraceMarks[spot.kind] || ['· ·', '…'];
  const moodEffects = areaMoodEffects[areaMoodName] || areaMoodEffects.calm;
  const duration = Math.round(
    (8000 + Math.random() * 5000) * moodEffects.traceDurationMultiplier,
  );
  const position = clampResidentPosition(
    spot.x + (Math.random() - 0.5) * 4,
    spot.y + 2 + Math.random() * 2,
  );

  return {
    id: `${residentId}_${sequence}`,
    residentId,
    reason,
    spot: spot.kind,
    mark: marks[Math.floor(Math.random() * marks.length)],
    duration,
    ...position,
  };
};
