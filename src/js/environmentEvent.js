export const environmentEventHistoryLimit = 5;

const eventDefinitions = {
  seaBreeze: {
    label: '海風',
    duration: 7800,
    position: { x: 73, y: 67 },
    baseWeight: 1.1,
    moodWeights: { nostalgic: 1.8, calm: 1.2 },
  },
  treeRustle: {
    label: '木揺れ',
    duration: 7200,
    position: { x: 43, y: 48 },
    baseWeight: 0.9,
    moodWeights: { calm: 1.9, lively: 1.2 },
  },
  nightStillness: {
    label: '夜の静けさ',
    duration: 9000,
    position: { x: 53, y: 36 },
    baseWeight: 0.8,
    moodWeights: { sleepy: 2.1, calm: 1.2 },
    nightOnly: true,
  },
  lightReflection: {
    label: '光の反射',
    duration: 6200,
    position: { x: 61, y: 57 },
    baseWeight: 0.75,
    moodWeights: { lively: 1.7, nostalgic: 1.15 },
  },
  shootingStar: {
    label: '小さな流れ星',
    duration: 5200,
    position: { x: 72, y: 20 },
    baseWeight: 0.32,
    moodWeights: { sleepy: 1.7, nostalgic: 1.25 },
    nightOnly: true,
  },
};

const chooseWeightedEvent = (events) => {
  const totalWeight = events.reduce((total, event) => total + event.weight, 0);
  let cursor = Math.random() * totalWeight;

  return events.find((event) => {
    cursor -= event.weight;
    return cursor <= 0;
  }) || events[events.length - 1];
};

export const getEnvironmentEventDelay = (isFirstEvent = false) => {
  const minimum = isFirstEvent ? 24000 : 52000;
  const range = isFirstEvent ? 18000 : 38000;
  return minimum + Math.round(Math.random() * range);
};

export const createEnvironmentEvent = ({
  areaMoodName = 'calm',
  isNight = false,
  hasTrees = false,
  hasLights = false,
  sequence = 0,
  timestamp = new Date().toISOString(),
}) => {
  const candidates = Object.entries(eventDefinitions)
    .filter(([, definition]) => !definition.nightOnly || isNight)
    .filter(([type]) => type !== 'treeRustle' || hasTrees)
    .filter(([type]) => type !== 'lightReflection' || hasLights || !isNight)
    .map(([type, definition]) => ({
      type,
      ...definition,
      weight: definition.baseWeight * (definition.moodWeights[areaMoodName] || 1),
    }));
  const selected = chooseWeightedEvent(candidates);
  const positionDrift = () => (Math.random() - 0.5) * 6;

  return {
    id: `environment_${sequence}`,
    type: selected.type,
    label: selected.label,
    mood: areaMoodName,
    timestamp,
    duration: selected.duration + Math.round(Math.random() * 1400),
    x: selected.position.x + positionDrift(),
    y: selected.position.y + positionDrift(),
  };
};

export const addEnvironmentEventHistory = (
  history,
  event,
  limit = environmentEventHistoryLimit,
) => [
  ...(Array.isArray(history) ? history : []),
  {
    id: event.id,
    type: event.type,
    label: event.label,
    mood: event.mood,
    timestamp: event.timestamp,
  },
].slice(-limit);

export const getEnvironmentEventHistory = (
  history,
  limit = environmentEventHistoryLimit,
) => (
  Array.isArray(history)
    ? history.slice(-Math.max(0, Math.floor(limit))).map((event) => ({ ...event }))
    : []
);
