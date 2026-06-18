import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/style.css';
import {
  createAreaMemorySummary,
  createAreaMoodHistoryEntry,
  createAreaMoodSnapshot,
  createResidentAffinitySummary,
  createResidentMemorySummary,
  getAreaMoodHistory,
  getResidentHistory,
  initialAreaMood,
} from './residentMemory.js';
import {
  areaMoodEffects,
  areaMoodHistoryLimit,
  createInitialResidentHistory,
  createInitialResidents,
  createResidentDefinitions,
  residentHistoryLimit,
  residentPersonalities,
  residentTraceLimit,
  SHOW_AREA_MEMORY_CARD,
  SHOW_RESIDENT_DEBUG,
} from './residentConfig.js';
import {
  applyPersonalityToSpot,
  chooseWeightedSpot,
  clampResidentPosition,
} from './residentMovement.js';
import { createResidentTrace } from './residentTrace.js';
import {
  addEnvironmentEventHistory,
  createEnvironmentEvent,
  getEnvironmentEventDelay,
  getEnvironmentEventHistory,
} from './environmentEvent.js';
import {
  createSunExplorationIndex,
  createSunExplorationSpots,
  sunExplorationRootIds,
} from './sunExploration.js';
import { CURRENT_SEASON } from './seasonConfig.js';
import {
  createFishEscapeReaction,
  createFishShadow,
  getFishShadowDelay,
} from './fishShadow.js';

const assetPath = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;

const buildParts = [
  {
    id: 'tree',
    name: 'TREE',
    icon: 'tree',
    mark: '🌳',
    label: '木',
    limit: 6,
    warmth: 1,
    presence: 0,
  },
  {
    id: 'bench',
    name: 'BENCH',
    icon: 'bench',
    mark: '🪑',
    label: 'ベンチ',
    limit: 4,
    warmth: 1,
    presence: 1,
  },
  {
    id: 'light',
    name: 'LIGHT',
    icon: 'light',
    mark: '💡',
    label: 'ライト',
    limit: 5,
    warmth: 1,
    presence: 1,
  },
  {
    id: 'crate',
    name: 'CRATE',
    icon: 'crate',
    mark: '📦',
    label: '木箱',
    limit: 6,
    warmth: 0,
    presence: 1,
  },
];

const buildStorageKey = 'no_limit_crew_island_sun_build';
const buildMemoryStorageKey = 'no_limit_crew_island_sun_build_memories';
const buildSaveStorageKey = 'no_limit_crew_island_sun_build_save';
const defaultPlacedParts = [];

const partById = Object.fromEntries(buildParts.map((part) => [part.id, part]));

const residentDefinitions = createResidentDefinitions(assetPath);

const residentAffectionIcons = {
  calm: [
    { icon: '🌿', weight: 4 },
    { icon: '😊', weight: 2 },
    { icon: '🎵', weight: 1 },
    { icon: '✨', weight: 1 },
  ],
  sleepy: [
    { icon: '😴', weight: 5 },
    { icon: '🌿', weight: 2 },
    { icon: '😊', weight: 1 },
  ],
  nostalgic: [
    { icon: '🌿', weight: 2 },
    { icon: '🎵', weight: 2 },
    { icon: '😊', weight: 1 },
    { icon: '✨', weight: 1 },
  ],
  lively: [
    { icon: '✨', weight: 4 },
    { icon: '🎵', weight: 2 },
    { icon: '😊', weight: 2 },
    { icon: '🌿', weight: 1 },
  ],
};

const getResidentAffectionDelay = () => 60000 + Math.round(Math.random() * 60000);

const chooseResidentAffectionIcon = (areaMoodName) => (
  chooseWeightedSpot(residentAffectionIcons[areaMoodName] || residentAffectionIcons.calm).icon
);

const loadBuildSave = () => {
  try {
    const savedBuild = JSON.parse(window.localStorage.getItem(buildSaveStorageKey) || '{}');
    return savedBuild && typeof savedBuild === 'object' ? savedBuild : {};
  } catch {
    return {};
  }
};

const partReactionLines = {
  tree: 'A quiet breeze moved through the trees.',
  bench: 'Someone stopped by the dock.',
  light: 'The light made the island feel warmer.',
  crate: 'The dock feels a little more alive.',
};

const firstPartMemoryLines = {
  tree: 'First TREE placed.',
  bench: 'First BENCH placed.',
  light: 'First LIGHT placed.',
  crate: 'First CRATE placed.',
};

const areas = [
  {
    id: 'the_sun_area',
    label: 'THE SUN',
    x: '29%',
    y: '16%',
    tone: 'sun',
    note: 'Tree house town above the sea.',
  },
  {
    id: 'grow',
    label: 'GROW',
    x: '54%',
    y: '16%',
    tone: 'grow',
    note: 'Green gate is almost ready.',
  },
  {
    id: 'peace',
    label: 'PEACE',
    x: '81%',
    y: '50%',
    tone: 'peace',
    note: 'Blue harbor is calling.',
  },
  {
    id: 'coming_soon',
    label: 'COMING SOON',
    x: '50%',
    y: '70%',
    tone: 'soon',
    note: 'More routes are under construction.',
  },
];

const starterCards = [
  {
    id: 'the_sun',
    title: 'THE SUN',
    kind: 'AREA CARD',
    image: assetPath('images/characters/the_sun_character.webp'),
    description: 'THE SUNエリアに入ると最初に記録される太陽のカード。',
  },
  {
    id: 'sun_passport',
    title: 'SUN PASSPORT',
    kind: 'KEY ITEM',
    image: assetPath('images/areas/sun_passport.webp'),
    description: 'THE SUNで見つけたカードを記録するための小さなパスポート。',
  },
];

const routeCards = [
  {
    id: 'sea_breeze_mug',
    title: 'SEA BREEZE MUG',
    kind: 'CAFE CARD',
    image: assetPath('images/the_sun_route/sea_breeze_mug.webp'),
    description: 'SUN CAFEの窓辺で見つけた、海風のしるしが入ったマグカップ。',
  },
  {
    id: 'tree_flag',
    title: 'TREE FLAG',
    kind: 'TREE HOUSE CARD',
    image: assetPath('images/the_sun_route/tree_flag.webp'),
    description: 'TREE HOUSEの屋根裏にしまわれていた、小さな冒険旗。',
  },
  {
    id: 'secret_crystal',
    title: 'SECRET CRYSTAL',
    kind: 'SECRET CARD',
    image: assetPath('images/the_sun_route/secret_crystal.png'),
    description: 'SECRET TREEの奥でうっすら光っていた、秘密の結晶。',
  },
  {
    id: 'lucky_shell',
    title: 'LUCKY SHELL',
    kind: 'FINAL CARD',
    image: assetPath('images/the_sun_route/lucky_shell.webp'),
    description: 'SUN MARKETで見つけた、THE SUN AREA最初の探索ルートをしめくくる幸運の貝殻。',
  },
  {
    id: 'sun_voyager_pass',
    title: 'SUN VOYAGER PASS',
    kind: 'VOYAGER CARD',
    image: assetPath('images/the_sun_route/sun_dock.webp'),
    description: 'SUN DOCKから海へ出る準備が整ったことを示す、特別な航海パス。',
  },
  {
    id: 'craft_hammer',
    title: 'CRAFT HAMMER',
    kind: 'WORKSHOP CARD',
    image: assetPath('images/areas/bike_setting_file.webp'),
    description: 'CRAFT WORKSHOPで見つけた、ものづくりの始まりを知らせる小さなハンマー。',
  },
  {
    id: 'chill_badge',
    title: 'CHILL BADGE',
    kind: 'HANGOUT CARD',
    image: assetPath('images/characters/iphone_720x1280/chill_kitty_relaxer_card_iphone.webp'),
    description: 'HANGOUT SPOTで見つけた、ゆるく過ごす仲間のしるし。',
  },
  {
    id: 'sunset_compass',
    title: 'SUNSET COMPASS',
    kind: 'SUNSET CARD',
    image: assetPath('images/areas/the_sun_profile.webp'),
    description: 'SUNSET DECKで見つけた、夕日の方角を指す小さなコンパス。',
  },
];

const sunExplorationSpots = createSunExplorationSpots(assetPath);
const sunExplorationById = createSunExplorationIndex(sunExplorationSpots);
const sunSpots = sunExplorationRootIds.map((spotId) => sunExplorationById[spotId]);
const allCards = [...starterCards, ...routeCards];
const zukanStorageKey = 'no_limit_crew_island_zukan_cards';
const explorationStorageKey = 'no_limit_crew_island_sun_exploration';

function App() {
  const savedBuildState = useMemo(() => loadBuildSave(), []);
  const [screen, setScreen] = useState('island');
  const [selectedArea, setSelectedArea] = useState(areas[0]);
  const [selectedSpot, setSelectedSpot] = useState(sunSpots[0]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [discoveredCard, setDiscoveredCard] = useState(routeCards[0]);
  const [isZukanOpen, setIsZukanOpen] = useState(false);
  const [cardNotice, setCardNotice] = useState('');
  const [visitedSpotIds, setVisitedSpotIds] = useState(() => {
    try {
      const savedSpots = JSON.parse(window.localStorage.getItem(explorationStorageKey) || '[]');
      return Array.isArray(savedSpots)
        ? savedSpots.filter((spotId) => Boolean(sunExplorationById[spotId]))
        : [];
    } catch {
      return [];
    }
  });
  const [residents, setResidents] = useState(() => (
    createInitialResidents(residentDefinitions)
  ));
  const [residentCycles, setResidentCycles] = useState({});
  const [residentTraces, setResidentTraces] = useState([]);
  const [environmentEvent, setEnvironmentEvent] = useState(null);
  const [fishShadow, setFishShadow] = useState(null);
  const [fishShadowCount, setFishShadowCount] = useState(0);
  const [lastFishShadow, setLastFishShadow] = useState(null);
  const [escapedFishCount, setEscapedFishCount] = useState(0);
  const [lastFishReaction, setLastFishReaction] = useState(null);
  const [areaMood, setAreaMood] = useState(initialAreaMood);
  const [, setResidentDebugVersion] = useState(0);
  const [selectedPartId, setSelectedPartId] = useState('tree');
  const [isNight, setIsNight] = useState(() => Boolean(savedBuildState.isNight));
  const [isWaveOn, setIsWaveOn] = useState(false);
  const [customIslandName, setCustomIslandName] = useState(() => savedBuildState.customIslandName || '');
  const [buildEvents, setBuildEvents] = useState(['The island is listening.']);
  const [partMemories, setPartMemories] = useState(() => {
    try {
      if (Array.isArray(savedBuildState.memories)) return savedBuildState.memories;
      const savedMemories = JSON.parse(window.localStorage.getItem(buildMemoryStorageKey) || '[]');
      return Array.isArray(savedMemories) ? savedMemories : [];
    } catch {
      return [];
    }
  });
  const [placedParts, setPlacedParts] = useState(() => {
    try {
      if (Array.isArray(savedBuildState.placedParts)) {
        return savedBuildState.placedParts;
      }
      const savedBuild = JSON.parse(window.localStorage.getItem(buildStorageKey) || '[]');
      return Array.isArray(savedBuild) && savedBuild.length > 0 ? savedBuild : defaultPlacedParts;
    } catch {
      return defaultPlacedParts;
    }
  });
  const [foundCards, setFoundCards] = useState(() => {
    try {
      const savedCards = JSON.parse(window.localStorage.getItem(zukanStorageKey) || '[]');
      return Array.isArray(savedCards) ? savedCards : [];
    } catch {
      return [];
    }
  });

  const foundCardItems = useMemo(
    () => allCards.filter((card) => foundCards.includes(card.id)),
    [foundCards],
  );
  const selectedSpotChildren = selectedSpot.children
    .map((childId) => sunExplorationById[childId])
    .filter(Boolean);
  const explorationProgress = {
    visited: visitedSpotIds.length,
    total: sunExplorationSpots.length,
  };
  const buildStageRef = useRef(null);
  const audioRef = useRef(null);
  const residentManualTimersRef = useRef(new Map());
  const residentTraceTimersRef = useRef(new Map());
  const residentTraceSequenceRef = useRef(0);
  const environmentEventSequenceRef = useRef(0);
  const environmentEventHistoryRef = useRef([]);
  const fishShadowSequenceRef = useRef(0);
  const fishShadowElementRef = useRef(null);
  const fishEscapeTimerRef = useRef(null);
  const fishRemovalTimerRef = useRef(null);
  const fishTapConsumedRef = useRef(false);
  const fishTapResetTimerRef = useRef(null);
  const areaMoodSampleCountRef = useRef(0);
  const areaMoodHistoryRef = useRef([]);
  const residentHistoryRef = useRef(
    createInitialResidentHistory(residentDefinitions),
  );
  const recordResidentHistory = (residentId, entry) => {
    const currentHistory = residentHistoryRef.current[residentId] || [];
    residentHistoryRef.current[residentId] = [
      ...currentHistory,
      {
        residentId,
        ...entry,
        timestamp: new Date().toISOString(),
      },
    ].slice(-residentHistoryLimit);
    areaMoodSampleCountRef.current += 1;
    if (areaMoodSampleCountRef.current >= 10) {
      areaMoodSampleCountRef.current = 0;
      setAreaMood((currentMood) => {
        const nextMood = createAreaMoodSnapshot(
          residentHistoryRef.current,
          currentMood,
          CURRENT_SEASON,
        );
        const historyEntry = createAreaMoodHistoryEntry(currentMood, nextMood);

        if (historyEntry) {
          areaMoodHistoryRef.current = [
            ...areaMoodHistoryRef.current,
            historyEntry,
          ].slice(-areaMoodHistoryLimit);
        }

        return nextMood;
      });
    }
    if (SHOW_RESIDENT_DEBUG || SHOW_AREA_MEMORY_CARD) {
      setResidentDebugVersion((currentVersion) => currentVersion + 1);
    }
  };
  const leaveResidentTrace = (residentId, spot, reason) => {
    const trace = createResidentTrace({
      residentId,
      spot,
      reason,
      sequence: residentTraceSequenceRef.current,
      areaMoodName: areaMood.name,
    });
    residentTraceSequenceRef.current += 1;

    setResidentTraces((currentTraces) => [
      ...currentTraces,
      trace,
    ].slice(-residentTraceLimit));

    const traceTimer = window.setTimeout(() => {
      setResidentTraces((currentTraces) => (
        currentTraces.filter((currentTrace) => currentTrace.id !== trace.id)
      ));
      residentTraceTimersRef.current.delete(trace.id);
    }, trace.duration);
    residentTraceTimersRef.current.set(trace.id, traceTimer);
  };
  const residentDebugEntries = SHOW_RESIDENT_DEBUG
    ? residents.map((resident) => ({
      residentId: resident.id,
      favoriteSpot: resident.favoriteSpot,
      affinity: createResidentAffinitySummary(
        getResidentHistory(
          residentHistoryRef.current,
          resident.id,
          residentHistoryLimit,
        ),
      ),
      currentAffectionSource: resident.affectionSource || '',
      history: getResidentHistory(residentHistoryRef.current, resident.id, 5),
      summaries: createResidentMemorySummary(
        getResidentHistory(
          residentHistoryRef.current,
          resident.id,
          residentHistoryLimit,
        ),
      ),
      traceCount: residentTraces.filter((trace) => trace.residentId === resident.id).length,
    }))
    : [];
  const areaMoodDebugHistory = SHOW_RESIDENT_DEBUG
    ? getAreaMoodHistory(areaMoodHistoryRef.current, 3)
    : [];
  const environmentEventDebugHistory = SHOW_RESIDENT_DEBUG
    ? getEnvironmentEventHistory(environmentEventHistoryRef.current)
    : [];
  const areaMemorySummary = SHOW_RESIDENT_DEBUG || SHOW_AREA_MEMORY_CARD
    ? createAreaMemorySummary(
      residentHistoryRef.current,
      areaMoodHistoryRef.current,
      3,
    )
    : [];
  const triggerFishEscape = (reason, expectedFishId = null) => {
    setFishShadow((currentShadow) => {
      if (
        !currentShadow
        || currentShadow.escaped
        || (expectedFishId && currentShadow.id !== expectedFishId)
      ) {
        return currentShadow;
      }

      const escapedShadow = createFishEscapeReaction(currentShadow, reason);
      window.clearTimeout(fishRemovalTimerRef.current);
      fishRemovalTimerRef.current = window.setTimeout(() => {
        setFishShadow((visibleShadow) => (
          visibleShadow?.id === escapedShadow.id ? null : visibleShadow
        ));
      }, 1550);
      setEscapedFishCount((currentCount) => currentCount + 1);
      setLastFishReaction({
        fishId: escapedShadow.id,
        ...escapedShadow.reaction,
      });
      return escapedShadow;
    });
  };
  const handleFishShadowPointerDown = (event) => {
    if (selectedSpot.id !== 'sun_dock' || !fishShadow || fishShadow.escaped) return;

    const fishElement = fishShadowElementRef.current;
    if (!fishElement) return;

    const fishBounds = fishElement.getBoundingClientRect();
    const fishCenterX = fishBounds.left + fishBounds.width / 2;
    const fishCenterY = fishBounds.top + fishBounds.height / 2;
    const distance = Math.hypot(
      event.clientX - fishCenterX,
      event.clientY - fishCenterY,
    );

    if (distance <= 56) {
      fishTapConsumedRef.current = true;
      window.clearTimeout(fishTapResetTimerRef.current);
      fishTapResetTimerRef.current = window.setTimeout(() => {
        fishTapConsumedRef.current = false;
      }, 500);
      triggerFishEscape('nearby_tap', fishShadow.id);
    }
  };
  const handleSunDockDiscoveryClick = () => {
    if (fishTapConsumedRef.current) {
      fishTapConsumedRef.current = false;
      return;
    }
    if (selectedSpotChildren[0]) visitSpot(selectedSpotChildren[0]);
  };
  const inventory = useMemo(
    () => buildParts.map((part) => ({
      ...part,
      remaining: Math.max(0, part.limit - placedParts.filter((placedPart) => placedPart.partId === part.id).length),
    })),
    [placedParts],
  );
  const sunAreaStats = useMemo(() => {
    const totals = placedParts.reduce(
      (currentStats, placedPart) => {
        const part = partById[placedPart.partId];
        if (!part) return currentStats;
        return {
          warmth: currentStats.warmth + part.warmth,
          presence: currentStats.presence + part.presence,
          trees: currentStats.trees + (part.id === 'tree' ? 1 : 0),
          benches: currentStats.benches + (part.id === 'bench' ? 1 : 0),
          lights: currentStats.lights + (part.id === 'light' ? 1 : 0),
          crates: currentStats.crates + (part.id === 'crate' ? 1 : 0),
        };
      },
      { warmth: 0, presence: 0, trees: 0, benches: 0, lights: 0, crates: 0 },
    );
    const partCount = placedParts.length;
    const memoryCount = partMemories.length;
    const islandName =
      partCount === 0
        ? 'Silent Shore'
        : totals.lights > 0 && partCount < 3
          ? 'First Light Island'
          : totals.presence < 3
            ? 'Small Dock'
            : totals.warmth < 6
              ? 'Warm Dock'
              : 'Living Sun Area';
    const airStage =
      partCount === 0
        ? 'Quiet'
        : memoryCount < 2
          ? 'Waiting'
          : totals.warmth < 4
            ? 'Soft'
            : partCount < 7
              ? 'Warm'
              : 'Alive';
    const mood =
      partCount === 0
        ? 'A quiet island waiting for your first touch.'
        : memoryCount < 2
          ? 'The island remembers your first few pieces.'
          : memoryCount < 4
            ? 'The island is starting to feel like it knows you.'
            : partCount < 7
              ? 'Small signs of daily life are gathering around your choices.'
              : 'Your SUN AREA feels alive and personal.';
    const warmthText = totals.warmth === 0 ? 'Still cool and empty' : totals.warmth < 4 ? 'A little warmer' : 'Warm and welcoming';
    const peopleText = totals.presence === 0 ? 'No one has a reason to stop yet' : totals.presence < 4 ? 'Someone might sit for a while' : 'People would naturally gather here';
    const natureText = totals.trees === 0 ? 'The island needs green shade' : totals.trees < 3 ? 'Green shade is growing' : 'Nature is taking root';
    const workText = totals.crates === 0 ? 'No harbor work signs yet' : totals.crates < 3 ? 'A small work corner appears' : 'The dock feels busy and useful';
    const lightText = totals.lights === 0 ? 'Nights are still dark' : totals.lights < 3 ? 'A few lights guide the night' : 'Night has a gentle glow';

    return {
      ...totals,
      partCount,
      memoryCount,
      islandName,
      airStage,
      mood,
      warmthText,
      peopleText,
      natureText,
      workText,
      lightText,
      level: Math.min(4, Math.floor(partCount / 3)),
    };
  }, [partMemories, placedParts]);

  useEffect(() => {
    window.localStorage.setItem(zukanStorageKey, JSON.stringify(foundCards));
  }, [foundCards]);

  useEffect(() => {
    window.localStorage.setItem(explorationStorageKey, JSON.stringify(visitedSpotIds));
  }, [visitedSpotIds]);

  useEffect(() => {
    window.localStorage.setItem(buildStorageKey, JSON.stringify(placedParts));
  }, [placedParts]);

  useEffect(() => {
    window.localStorage.setItem(buildMemoryStorageKey, JSON.stringify(partMemories));
  }, [partMemories]);

  useEffect(() => {
    window.localStorage.setItem(buildSaveStorageKey, JSON.stringify({
      placedParts,
      isNight,
      memories: partMemories,
      stats: {
        warmth: sunAreaStats.warmth,
        people: sunAreaStats.presence,
        parts: sunAreaStats.partCount,
      },
      customIslandName,
      islandName: sunAreaStats.islandName,
      airStage: sunAreaStats.airStage,
      savedAt: new Date().toISOString(),
    }));
  }, [customIslandName, isNight, partMemories, placedParts, sunAreaStats]);

  useEffect(() => {
    if (!cardNotice) return undefined;

    const noticeTimer = window.setTimeout(() => setCardNotice(''), 1500);
    return () => window.clearTimeout(noticeTimer);
  }, [cardNotice]);

  useEffect(() => {
    const closePanels = (event) => {
      if (event.key === 'Escape') {
        setIsZukanOpen(false);
        setSelectedCard(null);
      }
    };

    window.addEventListener('keydown', closePanels);
    return () => window.removeEventListener('keydown', closePanels);
  }, []);

  useEffect(() => () => {
    if (audioRef.current) {
      audioRef.current.source.stop();
      audioRef.current.context.close();
    }
    residentManualTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    residentManualTimersRef.current.clear();
    residentTraceTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    residentTraceTimersRef.current.clear();
  }, []);

  useEffect(() => {
    if (screen !== 'build') return undefined;

    let eventTimer;
    let removalTimer;
    let isFirstEvent = true;

    const scheduleNextEvent = () => {
      eventTimer = window.setTimeout(() => {
        const event = createEnvironmentEvent({
          areaMoodName: areaMood.name,
          isNight,
          hasTrees: placedParts.some((part) => part.partId === 'tree'),
          hasLights: placedParts.some((part) => part.partId === 'light'),
          season: CURRENT_SEASON,
          sequence: environmentEventSequenceRef.current,
        });
        environmentEventSequenceRef.current += 1;
        environmentEventHistoryRef.current = addEnvironmentEventHistory(
          environmentEventHistoryRef.current,
          event,
        );
        setEnvironmentEvent(event);

        removalTimer = window.setTimeout(() => {
          setEnvironmentEvent((currentEvent) => (
            currentEvent?.id === event.id ? null : currentEvent
          ));
        }, event.duration);

        isFirstEvent = false;
        scheduleNextEvent();
      }, getEnvironmentEventDelay(isFirstEvent));
    };

    scheduleNextEvent();

    return () => {
      window.clearTimeout(eventTimer);
      window.clearTimeout(removalTimer);
      setEnvironmentEvent(null);
    };
  }, [areaMood.name, isNight, placedParts, screen]);

  useEffect(() => {
    if (screen !== 'spot' || selectedSpot.id !== 'sun_dock') {
      setFishShadow(null);
      return undefined;
    }

    let shadowTimer;
    let isFirstShadow = true;

    const scheduleNextShadow = () => {
      shadowTimer = window.setTimeout(() => {
        const nextFishShadow = createFishShadow({
          sequence: fishShadowSequenceRef.current,
          season: CURRENT_SEASON,
          isNight,
          areaMoodName: areaMood.name,
        });
        fishShadowSequenceRef.current += 1;
        setFishShadow(nextFishShadow);
        setFishShadowCount((currentCount) => currentCount + 1);
        setLastFishShadow(nextFishShadow);

        if (nextFishShadow.willEscapeNaturally) {
          fishEscapeTimerRef.current = window.setTimeout(() => {
            triggerFishEscape('natural', nextFishShadow.id);
          }, nextFishShadow.naturalEscapeDelay);
        }

        fishRemovalTimerRef.current = window.setTimeout(() => {
          setFishShadow((currentShadow) => (
            currentShadow?.id === nextFishShadow.id ? null : currentShadow
          ));
        }, nextFishShadow.duration);

        isFirstShadow = false;
        scheduleNextShadow();
      }, getFishShadowDelay({
        season: CURRENT_SEASON,
        isNight,
        areaMoodName: areaMood.name,
        isFirstShadow,
        isDebug: SHOW_RESIDENT_DEBUG,
      }));
    };

    scheduleNextShadow();

    return () => {
      window.clearTimeout(shadowTimer);
      window.clearTimeout(fishRemovalTimerRef.current);
      fishRemovalTimerRef.current = null;
      window.clearTimeout(fishEscapeTimerRef.current);
      fishEscapeTimerRef.current = null;
      window.clearTimeout(fishTapResetTimerRef.current);
      fishTapResetTimerRef.current = null;
      fishTapConsumedRef.current = false;
      setFishShadow(null);
    };
  }, [areaMood.name, isNight, screen, selectedSpot.id]);

  useEffect(() => {
    if (screen !== 'build') return undefined;

    const chooseResidentSpot = (resident) => {
      const personality = residentPersonalities[resident.personality] || residentPersonalities.relaxed;
      const affinitySummary = createResidentAffinitySummary(
        getResidentHistory(
          residentHistoryRef.current,
          resident.id,
          residentHistoryLimit,
        ),
      );
      const trees = placedParts.filter((placedPart) => placedPart.partId === 'tree');
      const benches = placedParts.filter((placedPart) => placedPart.partId === 'bench');
      const lights = placedParts.filter((placedPart) => placedPart.partId === 'light');
      const crates = placedParts.filter((placedPart) => placedPart.partId === 'crate');
      const routineSpots = [];
      const specialSpots = [
        {
          ...clampResidentPosition(52, 43),
          presence: isNight ? '…' : '☀️',
          presenceChance: 0.72,
          presenceDuration: 3000,
          pauseBonus: 7200,
          pose: 'watch',
          kind: 'sky',
          specialAction: 'sky',
          travelTime: 5200,
          weight: 3,
        },
        {
          ...clampResidentPosition(64, 68),
          presence: '🌊',
          presenceChance: 0.46,
          presenceDuration: 3000,
          pauseBonus: 6800,
          pose: 'watch',
          kind: 'dock',
          facing: 'right',
          specialAction: 'dock',
          travelTime: 5600,
          weight: isNight ? 1 : 3,
        },
      ];

      if (trees.length > 0) {
        const tree = trees[Math.floor(Math.random() * trees.length)];
        const orbitSide = Math.random() < 0.5 ? -1 : 1;
        specialSpots.push({
          ...clampResidentPosition(tree.x + orbitSide * 7, tree.y + 5),
          presence: '🌿',
          presenceChance: 0.52,
          presenceDuration: 2800,
          pauseBonus: 5600,
          pose: 'idle',
          kind: 'tree',
          specialAction: 'tree-circle',
          travelTime: 5800,
          weight: isNight ? 1 : 3,
        });
      }

      if (isNight && lights.length > 0) {
        const light = lights[Math.floor(Math.random() * lights.length)];
        specialSpots.push({
          ...clampResidentPosition(light.x - 3, light.y + 9),
          presence: '💡',
          presenceChance: 0.78,
          presenceDuration: 3200,
          pauseBonus: 9200,
          pose: 'watch',
          kind: 'light',
          specialAction: 'light-pause',
          travelTime: 7200,
          weight: 4,
        });
      }

      const favoriteSpecialAvailable = specialSpots.some(
        (spot) => spot.kind === resident.favoriteSpot,
      );
      const moodEffects = areaMoodEffects[areaMood.name] || areaMoodEffects.calm;
      const specialActionChance = ((isNight ? 0.07 : 0.06)
        + (favoriteSpecialAvailable
          ? personality.favoriteSpotModifiers?.specialActionChanceBonus || 0
          : 0))
        * moodEffects.specialActionMultiplier;

      if (Math.random() < specialActionChance) {
        return chooseWeightedSpot(
          specialSpots.map((spot) => (
            applyPersonalityToSpot(
              spot,
              personality,
              isNight,
              resident.favoriteSpot,
              areaMood.name,
              affinitySummary,
            )
          )),
        );
      }

      if (trees.length > 0) {
        const tree = trees[Math.floor(Math.random() * trees.length)];
        routineSpots.push({
          ...clampResidentPosition(tree.x + 8, tree.y + 4),
          presence: '🌿',
          presenceChance: isNight ? 0.16 : 0.42,
          pauseBonus: isNight ? 1600 : 2800,
          pose: 'idle',
          kind: 'tree',
          specialAction: '',
          travelTime: 4600,
          weight: isNight ? 1 : 5,
        });
      }

      if (benches.length > 0) {
        const bench = benches[Math.floor(Math.random() * benches.length)];
        routineSpots.push({
          ...clampResidentPosition(bench.x, bench.y + 5),
          presence: '…',
          presenceChance: isNight ? 0.48 : 0.28,
          pauseBonus: isNight ? 5600 : 2800,
          pose: 'sit',
          kind: 'bench',
          specialAction: '',
          travelTime: 4600,
          weight: isNight ? 6 : 3,
        });
      }

      if (isNight && lights.length > 0) {
        const light = lights[Math.floor(Math.random() * lights.length)];
        routineSpots.push({
          ...clampResidentPosition(light.x - 7, light.y + 8),
          presence: '💡',
          presenceChance: 0.44,
          pauseBonus: 5200,
          pose: 'watch',
          kind: 'light',
          specialAction: '',
          travelTime: 4600,
          weight: 6,
        });
      }

      routineSpots.push({
        ...clampResidentPosition(64, 68),
        presence: '🌊',
        presenceChance: isNight ? 0.1 : 0.16,
        pauseBonus: isNight ? 3000 : 2400,
        pose: 'watch',
        kind: 'dock',
        facing: 'right',
        specialAction: '',
        travelTime: 4600,
        weight: isNight ? 1 : 5,
      });

      if (crates.length > 0) {
        const crate = crates[Math.floor(Math.random() * crates.length)];
        routineSpots.push({
          ...clampResidentPosition(crate.x - 6, crate.y + 5),
          presence: '…',
          presenceChance: isNight ? 0.2 : 0.16,
          pauseBonus: 800,
          pose: 'watch',
          kind: 'crate',
          specialAction: '',
          travelTime: 4600,
          weight: 1,
        });
      }

      routineSpots.push({
        ...clampResidentPosition(isNight ? 58 : 35, isNight ? 45 : 72),
        presence: isNight ? '…' : '☀️',
        presenceChance: 0.18,
        pauseBonus: 0,
        pose: 'idle',
        kind: 'quiet',
        specialAction: '',
        travelTime: 4600,
        weight: isNight ? 2 : 2,
      });

      return chooseWeightedSpot(
        routineSpots.map((spot) => (
          applyPersonalityToSpot(
            spot,
            personality,
            isNight,
            resident.favoriteSpot,
            areaMood.name,
            affinitySummary,
          )
        )),
      );
    };

    const timers = new Set();
    const schedule = (callback, delay) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        callback();
      }, delay);
      timers.add(timer);
    };

    const updateResident = (residentId, update) => {
      setResidents((currentResidents) => currentResidents.map((resident) => {
        if (resident.id !== residentId) return resident;
        return typeof update === 'function' ? update(resident) : { ...resident, ...update };
      }));
    };

    const beginResidentMove = (residentId) => {
      const resident = residents.find((currentResident) => currentResident.id === residentId);
      if (!resident) return;

      const personality = residentPersonalities[resident.personality] || residentPersonalities.relaxed;
      const nextSpot = chooseResidentSpot(resident);
      const timeOfDay = isNight ? 'night' : 'day';

      recordResidentHistory(residentId, {
        spot: nextSpot.kind,
        timeOfDay,
        actionType: 'move',
      });

      updateResident(residentId, (currentResident) => ({
        ...currentResident,
        ...nextSpot,
        direction: nextSpot.facing || (nextSpot.x < currentResident.x ? 'left' : 'right'),
        presence: '',
        affectionIcon: '',
        isMoving: true,
      }));

      schedule(() => {
        const showPresence = Math.random() < nextSpot.presenceChance;
        recordResidentHistory(residentId, {
          spot: nextSpot.kind,
          timeOfDay,
          actionType: 'stay',
        });
        if (nextSpot.specialAction) {
          recordResidentHistory(residentId, {
            spot: nextSpot.kind,
            timeOfDay,
            actionType: 'special',
          });
        }
        if (nextSpot.isFavorite) {
          recordResidentHistory(residentId, {
            spot: nextSpot.kind,
            timeOfDay,
            actionType: 'favorite',
          });
        }
        updateResident(residentId, (currentResident) => ({
          ...currentResident,
          isMoving: false,
          presence: showPresence ? nextSpot.presence : '',
        }));

        if (showPresence) {
          schedule(() => {
            updateResident(residentId, (currentResident) => ({ ...currentResident, presence: '' }));
          }, nextSpot.presenceDuration || 2400);
        }

        const period = isNight ? 'night' : 'day';
        const basePause = (isNight ? 9000 : 5200)
          + personality.routinePauseBonus[period];
        const randomPause = Math.round(Math.random() * (isNight ? 4200 : 3200));
        const moodEffects = areaMoodEffects[areaMood.name] || areaMoodEffects.calm;
        const totalPause = Math.round(
          (basePause + nextSpot.pauseBonus + randomPause) * moodEffects.pauseMultiplier,
        );
        const traceReason = nextSpot.specialAction
          ? 'special'
          : nextSpot.isFavorite
            ? 'favorite'
            : totalPause >= 12000
              ? 'long-stay'
              : '';
        const traceChance = traceReason === 'special'
          ? 0.34
          : traceReason === 'favorite'
            ? 0.22
            : traceReason === 'long-stay'
              ? 0.1
              : 0;

        if (traceReason && Math.random() < traceChance) {
          schedule(
            () => leaveResidentTrace(residentId, nextSpot, traceReason),
            Math.max(1800, totalPause - 700),
          );
        }
        schedule(
          () => beginResidentMove(residentId),
          totalPause,
        );
      }, nextSpot.travelTime);
    };

    residents.forEach((resident, index) => {
      const cycle = residentCycles[resident.id] || 0;
      const initialPause = cycle > 0
        ? (isNight ? 15000 : 11000)
        : (isNight ? 3600 : 2200) + index * 900;
      schedule(() => beginResidentMove(resident.id), initialPause);
    });

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [areaMood.name, isNight, placedParts, residentCycles, residents.length, screen]);

  useEffect(() => {
    if (screen !== 'build') return undefined;

    const timers = new Set();
    const schedule = (callback, delay) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        callback();
      }, delay);
      timers.add(timer);
    };

    const showAffectionIcon = (residentId) => {
      const icon = chooseResidentAffectionIcon(areaMood.name);
      setResidents((currentResidents) => currentResidents.map((resident) => (
        resident.id === residentId
          ? {
            ...resident,
            affectionIcon: icon,
            affectionSource: `${areaMood.name} areaMood`,
          }
          : resident
      )));

      schedule(() => {
        setResidents((currentResidents) => currentResidents.map((resident) => (
          resident.id === residentId
            ? { ...resident, affectionIcon: '' }
            : resident
        )));
      }, 3000);

      schedule(() => showAffectionIcon(residentId), getResidentAffectionDelay());
    };

    residents.forEach((resident, index) => {
      schedule(
        () => showAffectionIcon(resident.id),
        getResidentAffectionDelay() + index * 5000,
      );
    });

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [areaMood.name, residents.length, screen]);

  const addFoundCard = (cardId) => {
    setFoundCards((currentCards) => {
      if (currentCards.includes(cardId)) {
        setCardNotice('CARD CHECKED');
        return currentCards;
      }

      setCardNotice('NEW CARD GET');
      return [...currentCards, cardId];
    });
  };

  const enterSunArea = () => {
    addFoundCard('the_sun');
    addFoundCard('sun_passport');
    setSelectedSpot(sunSpots[0]);
    setScreen('sun');
  };

  const chooseArea = (area) => {
    setSelectedArea(area);
  };

  const openArea = (area) => {
    setSelectedArea(area);
    if (area.id === 'the_sun_area') {
      addFoundCard('the_sun');
      setScreen('build');
    } else {
      setCardNotice('COMING SOON');
    }
  };

  const startWaveLoop = () => {
    if (audioRef.current) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      setCardNotice('AUDIO OFF');
      return;
    }

    const context = new AudioContext();
    const bufferSize = context.sampleRate * 2;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * 0.28;
    }

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    source.loop = true;
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    gain.gain.value = 0.08;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    source.start();
    audioRef.current = { context, source, gain };
    setIsWaveOn(true);
  };

  const toggleWaveLoop = () => {
    if (!audioRef.current) {
      startWaveLoop();
      return;
    }

    const nextWaveState = !isWaveOn;
    audioRef.current.gain.gain.value = nextWaveState ? 0.08 : 0;
    setIsWaveOn(nextWaveState);
  };

  const getBuildPoint = (event) => {
    const stage = buildStageRef.current;
    if (!stage) return null;

    const rect = stage.getBoundingClientRect();
    return {
      x: Math.max(8, Math.min(92, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(10, Math.min(86, ((event.clientY - rect.top) / rect.height) * 100)),
    };
  };

  const addBuildEvent = (message) => {
    if (!message) return;

    setBuildEvents((currentEvents) => [
      message,
      ...currentEvents.filter((eventLine) => eventLine !== message),
    ].slice(0, 4));
  };

  const placePart = (point) => {
    const selectedInventoryPart = inventory.find((part) => part.id === selectedPartId);
    if (!selectedInventoryPart || selectedInventoryPart.remaining <= 0) {
      setCardNotice('PARTS EMPTY');
      return;
    }

    const nextPartId = selectedPartId;
    const firstMemoryLine = firstPartMemoryLines[nextPartId];
    const isFirstPlacement = firstMemoryLine && !partMemories.includes(nextPartId);

    setPlacedParts((currentParts) => [
      ...currentParts,
      {
        id: `${nextPartId}_${Date.now()}`,
        partId: nextPartId,
        x: point.x,
        y: point.y,
      },
    ]);
    addBuildEvent(partReactionLines[nextPartId]);
    if (isFirstPlacement) {
      setPartMemories((currentMemories) => [...currentMemories, nextPartId]);
    }
    setCardNotice(`${selectedInventoryPart.name} PLACED`);
  };

  const handleBuildStageTap = (event) => {
    if (event.target.closest('button')) return;

    const point = getBuildPoint(event);
    if (!point) return;

    if (selectedPartId) {
      placePart(point);
      return;
    }

    const residentPosition = clampResidentPosition(point.x, point.y);
    const controlledResident = residents.find((resident) => resident.enabled);
    if (!controlledResident) return;

    recordResidentHistory(controlledResident.id, {
      spot: 'island',
      timeOfDay: isNight ? 'night' : 'day',
      actionType: 'move',
      source: 'manual',
      position: residentPosition,
    });

    const currentTimer = residentManualTimersRef.current.get(controlledResident.id);
    if (currentTimer) {
      window.clearTimeout(currentTimer);
    }
    setResidentCycles((currentCycles) => ({
      ...currentCycles,
      [controlledResident.id]: (currentCycles[controlledResident.id] || 0) + 1,
    }));
    setResidents((currentResidents) => currentResidents.map((resident) => (
      resident.id === controlledResident.id
        ? {
          ...resident,
          ...residentPosition,
          direction: residentPosition.x < resident.x ? 'left' : 'right',
          presence: '',
          pose: 'idle',
          isMoving: true,
          specialAction: '',
        }
        : resident
    )));
    const manualTimer = window.setTimeout(() => {
      recordResidentHistory(controlledResident.id, {
        spot: 'island',
        timeOfDay: isNight ? 'night' : 'day',
        actionType: 'stay',
        source: 'manual',
        position: residentPosition,
      });
      setResidents((currentResidents) => currentResidents.map((resident) => (
        resident.id === controlledResident.id
          ? { ...resident, isMoving: false }
          : resident
      )));
      residentManualTimersRef.current.delete(controlledResident.id);
    }, 4600);
    residentManualTimersRef.current.set(controlledResident.id, manualTimer);
  };

  const collectPlacedPart = (event, placedPartId) => {
    event.stopPropagation();
    setPlacedParts((currentParts) => currentParts.filter((placedPart) => placedPart.id !== placedPartId));
    setCardNotice('PART RETURNED');
  };

  const resetBuildArea = () => {
    residentManualTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    residentManualTimersRef.current.clear();
    residentTraceTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    residentTraceTimersRef.current.clear();
    residentHistoryRef.current = createInitialResidentHistory(residentDefinitions);
    environmentEventHistoryRef.current = [];
    environmentEventSequenceRef.current = 0;
    areaMoodSampleCountRef.current = 0;
    areaMoodHistoryRef.current = [];
    setResidentTraces([]);
    setEnvironmentEvent(null);
    setAreaMood(initialAreaMood);
    setPlacedParts(defaultPlacedParts);
    setPartMemories([]);
    setBuildEvents(['The island is listening.']);
    setCustomIslandName('');
    setIsNight(false);
    setResidents(createInitialResidents(residentDefinitions));
    setResidentCycles({});
    setCardNotice('ISLAND RESET');
  };

  const getBuildEventIcon = (eventLine) => {
    if (eventLine.includes('light')) return '💡';
    if (eventLine.includes('trees')) return '🌳';
    if (eventLine.includes('alive')) return '📦';
    if (eventLine.includes('dock')) return '🪑';
    return '✨';
  };

  const visitSpot = (spot) => {
    if (!spot?.unlocked) {
      setCardNotice('ROUTE LOCKED');
      return;
    }

    setSelectedSpot(spot);
    setVisitedSpotIds((currentSpotIds) => (
      currentSpotIds.includes(spot.id)
        ? currentSpotIds
        : [...currentSpotIds, spot.id]
    ));
    setScreen('spot');
  };

  const openCard = (card) => {
    addFoundCard(card.id);
    setSelectedCard(card);
  };

  const discoverSelectedSpotItem = () => {
    const finalCard = routeCards.find((card) => card.id === selectedSpot.item);
    if (!finalCard) return;

    setDiscoveredCard(finalCard);
    setScreen('cardFound');
  };

  const backFromSpot = () => {
    const parentSpot = selectedSpot.parent
      ? sunExplorationById[selectedSpot.parent]
      : null;
    if (parentSpot) {
      setSelectedSpot(parentSpot);
      return;
    }
    setScreen('sun');
  };

  const getDiscoveredCard = () => {
    addFoundCard(discoveredCard.id);
    setIsZukanOpen(true);
  };

  const backToIsland = () => {
    setScreen('island');
    setSelectedArea(areas[0]);
  };

  const backToSunArea = () => {
    setScreen('sun');
  };

  return (
    <main className="topPage" aria-label="NO LIMIT CREW ISLAND">
      {screen === 'island' && (
        <section className="topMapScreen" aria-label="NO LIMIT CREW ISLAND top map">
          <div className="topMapFrame">
            <img
              className="topMapImage"
              src={assetPath('images/no_limit_crew_island.webp')}
              alt="NO LIMIT CREW ISLAND"
              draggable="false"
              fetchPriority="high"
              decoding="async"
            />

            <button
              type="button"
              className="topSunHotspot"
              aria-label="THE SUN"
              onClick={() => openArea(areas[0])}
            />
          </div>
        </section>
      )}

      {screen === 'build' && (
        <section
          className={`buildPage ${isNight ? 'isNight' : 'isDay'} level${sunAreaStats.level}`}
          data-trees={sunAreaStats.trees}
          data-benches={sunAreaStats.benches}
          data-lights={sunAreaStats.lights}
          data-crates={sunAreaStats.crates}
          data-area-mood={areaMood.name}
          data-season={CURRENT_SEASON}
          aria-label="SUN AREA build prototype"
        >
          <header className="buildTopbar">
            <button type="button" className="backButton iconOnlyButton" onClick={backToIsland} aria-label="Back to island">←</button>
            <div>
              <p className="eyebrow">☀️ 🏝️</p>
              <h1 aria-label="Grow your SUN AREA">☀️🏝️</h1>
            </div>
            <div className="buildActions">
              <button type="button" className="buildMiniButton iconOnlyButton" onClick={() => setScreen('sun')} aria-label="Explore SUN AREA">🗺️</button>
              <button type="button" className="buildMiniButton iconOnlyButton" onClick={() => setIsNight((current) => !current)} aria-label={isNight ? 'Switch to day' : 'Switch to night'}>
                {isNight ? '☀️' : '🌙'}
              </button>
              <button type="button" className={`buildMiniButton iconOnlyButton ${isWaveOn ? 'isOn' : ''}`} onClick={toggleWaveLoop} aria-label={isWaveOn ? 'Stop waves' : 'Start waves'}>
                🌊
              </button>
            </div>
          </header>

          <div className="buildStageWrap">
            <div
              className="buildStage"
              ref={buildStageRef}
              onPointerDown={handleBuildStageTap}
              role="application"
              aria-label="SUN AREA sandbox map"
            >
              <div className="buildSea" aria-hidden="true" />
              <div className="buildIsland" aria-hidden="true" />
              <div className="lonelyMarkers" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <div className="natureGlow" aria-hidden="true" />
              <div className="peopleTrace" aria-hidden="true">
                <span />
                <span />
              </div>
              <div className="harborTrace" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <div className="nightGlowField" aria-hidden="true" />
              <div className="areaMoodOverlay" aria-hidden="true" />
              <div className="environmentEventLayer" aria-hidden="true">
                {environmentEvent && (
                  <span
                    key={environmentEvent.id}
                    className={`environmentEvent event-${environmentEvent.type}`}
                    style={{
                      left: `${environmentEvent.x}%`,
                      top: `${environmentEvent.y}%`,
                      animationDuration: `${environmentEvent.duration}ms`,
                    }}
                  >
                    <i />
                    <i />
                    <i />
                  </span>
                )}
              </div>
              <div className="buildDock" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <div className="buildEmptyPatch" aria-hidden="true" />
              <div className="natureReactionLayer" aria-hidden="true">
                {placedParts
                  .filter((placedPart) => placedPart.partId === 'tree')
                  .slice(0, 5)
                  .map((placedPart, index) => (
                    <span
                      key={`leaf_${placedPart.id}`}
                      className={`leafDrift leaf${index % 3}`}
                      style={{ left: `${placedPart.x}%`, top: `${Math.max(12, placedPart.y - 10)}%` }}
                    />
                  ))}
              </div>
              <div className="visitorReactionLayer" aria-hidden="true">
                {placedParts
                  .filter((placedPart) => placedPart.partId === 'bench')
                  .slice(0, 3)
                  .map((placedPart, index) => (
                    <span
                      key={`bench_visitor_${placedPart.id}`}
                      className="visitorDot benchVisitor"
                      style={{ left: `${Math.min(90, placedPart.x + 7)}%`, top: `${Math.max(14, placedPart.y - 5 + index)}%` }}
                    />
                  ))}
                {isNight && placedParts
                  .filter((placedPart) => placedPart.partId === 'light')
                  .slice(0, 4)
                  .map((placedPart, index) => (
                    <span
                      key={`light_visitor_${placedPart.id}`}
                      className="visitorDot lightVisitor"
                      style={{ left: `${Math.max(10, placedPart.x - 7)}%`, top: `${Math.min(84, placedPart.y + 7 + index)}%` }}
                    />
                  ))}
                {placedParts
                  .filter((placedPart) => placedPart.partId === 'crate')
                  .slice(0, 4)
                  .map((placedPart, index) => (
                    <span
                      key={`work_mark_${placedPart.id}`}
                      className={`workMark work${index % 2}`}
                      style={{ left: `${Math.min(91, placedPart.x + 6)}%`, top: `${Math.min(84, placedPart.y + 5)}%` }}
                    />
                  ))}
              </div>

              {placedParts.map((placedPart) => {
                const part = partById[placedPart.partId];
                if (!part) return null;
                return (
                  <button
                    key={placedPart.id}
                    type="button"
                    className={`buildPiece ${part.icon} ${isNight && part.id === 'light' ? 'isLit' : ''}`}
                    style={{ left: `${placedPart.x}%`, top: `${placedPart.y}%` }}
                    onPointerDown={(event) => collectPlacedPart(event, placedPart.id)}
                    aria-label={`Remove ${part.name}`}
                  >
                    <span>{part.mark}</span>
                  </button>
                );
              })}

              <div className="residentTraceLayer" aria-hidden="true">
                {residentTraces.map((trace) => (
                  <span
                    key={trace.id}
                    className={`residentTrace trace-${trace.spot}`}
                    data-resident-id={trace.residentId}
                    style={{
                      left: `${trace.x}%`,
                      top: `${trace.y}%`,
                      animationDuration: `${trace.duration}ms`,
                    }}
                  >
                    {trace.mark}
                  </span>
                ))}
              </div>

              {residents.map((resident) => (
                <div
                  key={resident.id}
                  className={`sunResident ${resident.pose} facing-${resident.direction} ${resident.isMoving ? 'isMoving' : 'isWaiting'} ${resident.specialAction ? `special-${resident.specialAction}` : ''}`}
                  style={{ left: `${resident.x}%`, top: `${resident.y}%` }}
                  aria-label={`${resident.name}, a quiet island resident`}
                >
                  <img src={resident.image} alt="" draggable="false" />
                  {resident.presence && (
                    <span className="residentPresence" aria-hidden="true">{resident.presence}</span>
                  )}
                  {resident.affectionIcon && (
                    <span className="residentAffectionIcon" aria-hidden="true">{resident.affectionIcon}</span>
                  )}
                </div>
              ))}

              {SHOW_AREA_MEMORY_CARD && (
                <aside className="areaMemoryCard" aria-label="今日のSUN AREA">
                  <strong>今日のSUN AREA</strong>
                  <div>
                    {areaMemorySummary.length > 0
                      ? areaMemorySummary.map((summary) => (
                        <p key={summary}>{summary}</p>
                      ))
                      : <p>今日の記憶を集めています</p>}
                  </div>
                </aside>
              )}
            </div>

            <aside className="buildStats" aria-live="polite">
              <p className="eyebrow">🏝️</p>
              <label className="customIslandName">
                <span aria-label="Island name">✏️</span>
                <input
                  type="text"
                  value={customIslandName}
                  maxLength="24"
                  placeholder="My Sun Area"
                  onChange={(event) => setCustomIslandName(event.target.value)}
                  aria-label="Custom island name"
                />
              </label>
              <div className="islandIdentity">
                <span>{sunAreaStats.islandName}</span>
                <b>{sunAreaStats.airStage}</b>
              </div>
              <h2 aria-label={`Level ${sunAreaStats.level}`}>✦ {sunAreaStats.level}</h2>
              <div className="moodLine visualMood" aria-label={sunAreaStats.mood}>
                <span className={sunAreaStats.partCount > 0 ? 'isAwake' : ''}>☀️</span>
                <span className={sunAreaStats.trees > 0 ? 'isAwake' : ''}>🌳</span>
                <span className={sunAreaStats.presence > 0 ? 'isAwake' : ''}>👥</span>
                <span className={isNight && sunAreaStats.lights > 0 ? 'isAwake' : ''}>💡</span>
              </div>
              <div className="statRows">
                <span aria-label={`Warmth ${sunAreaStats.warmth}`}>🔥 <b>{sunAreaStats.warmth}</b><em>{sunAreaStats.warmthText}</em></span>
                <span aria-label={`People ${sunAreaStats.presence}`}>👥 <b>{sunAreaStats.presence}</b><em>{sunAreaStats.peopleText}</em></span>
                <span aria-label={`Parts ${placedParts.length}`}>🧩 <b>{placedParts.length}</b><em>{placedParts.length === 0 ? 'A blank little place' : 'Your touch is visible'}</em></span>
              </div>
              <div className="feelNotes visualFeelNotes" aria-label="Island atmosphere">
                <p aria-label={sunAreaStats.natureText}>🌳 <b>{sunAreaStats.trees}</b></p>
                <p aria-label={sunAreaStats.peopleText}>👥 <b>{sunAreaStats.presence}</b></p>
                <p aria-label={sunAreaStats.lightText}>💡 <b>{sunAreaStats.lights}</b></p>
                <p aria-label={sunAreaStats.workText}>📦 <b>{sunAreaStats.crates}</b></p>
              </div>
              <div className="eventLog visualEventLog" aria-label="Island replies">
                <p className="eyebrow">✨</p>
                {buildEvents.map((eventLine) => (
                  <p className="eventLine" key={eventLine} aria-label={eventLine}>{getBuildEventIcon(eventLine)}</p>
                ))}
              </div>
              <div className="memoryLog visualMemoryLog" aria-label="Memories">
                <p className="eyebrow">💭</p>
                {partMemories.length === 0 ? (
                  <p className="memoryLine" aria-label="No first pieces yet">○</p>
                ) : (
                  partMemories.map((partId) => (
                    <p className="memoryLine" key={partId} aria-label={firstPartMemoryLines[partId]}>{partById[partId]?.mark || '✨'}</p>
                  ))
                )}
              </div>
              <p className="buildHint">
                {selectedPartId ? 'Tap the island to place a part. Tap a placed part to return it.' : 'Tap the island to walk.'}
              </p>
              <button type="button" className="enterButton iconOnlyButton resetIconButton" onClick={resetBuildArea} aria-label="Reset island">↺</button>
            </aside>
          </div>

          {SHOW_RESIDENT_DEBUG && (
            <aside className="residentDebugPanel" aria-label="Resident debug information">
              <b>RESIDENT DEBUG</b>
              <div className="residentDebugMood">
                season: {CURRENT_SEASON}
                {' · '}
                mood: {areaMood.name}
                {' · '}
                {Object.entries(areaMood.scores)
                  .map(([moodName, score]) => `${moodName} ${score.toFixed(2)}`)
                  .join(' / ')}
              </div>
              <div className="residentDebugMoodHistory">
                {areaMoodDebugHistory.length > 0
                  ? areaMoodDebugHistory.map((entry) => (
                    <span key={entry.timestamp}>
                      {entry.mood} · {entry.score.toFixed(2)}
                      {' · '}
                      {entry.reason}
                    </span>
                  ))
                  : <span>mood history pending</span>}
              </div>
              <div className="residentDebugAreaMemory">
                {areaMemorySummary.length > 0
                  ? areaMemorySummary.map((summary) => (
                    <span key={summary}>{summary}</span>
                  ))
                  : <span>area memory pending</span>}
              </div>
              <div className="residentDebugEnvironment">
                <strong>environment events</strong>
                {environmentEventDebugHistory.length > 0
                  ? environmentEventDebugHistory.map((event) => (
                    <span key={event.id}>
                      {event.label} · {event.mood}
                    </span>
                  ))
                  : <span>environment history pending</span>}
              </div>
              {residentDebugEntries.map(({
                residentId,
                favoriteSpot,
                affinity,
                currentAffectionSource,
                history,
                summaries,
                traceCount,
              }) => (
                <section key={residentId}>
                  <strong>{residentId} · traces {traceCount}</strong>
                  <div className="residentDebugAffection">
                    favorite {favoriteSpot || 'none'}
                    {' · '}
                    score {affinity.score.toFixed(2)}
                    {' · '}
                    source {currentAffectionSource || affinity.source}
                  </div>
                  <div className="residentDebugHistory">
                    {history.length > 0
                      ? history.map((entry, index) => (
                        <span key={`${entry.timestamp}_${entry.actionType}_${index}`}>
                          {entry.timeOfDay} · {entry.spot} · {entry.actionType}
                        </span>
                      ))
                      : <span>no history yet</span>}
                  </div>
                  <div className="residentDebugSummary">
                    {summaries.length > 0
                      ? summaries.map((summary) => <em key={summary}>{summary}</em>)
                      : <em>summary pending</em>}
                  </div>
                </section>
              ))}
            </aside>
          )}

          <section className="partsTray" aria-label="Owned parts">
            <button
              type="button"
              className={`partButton ${selectedPartId === null ? 'isSelected' : ''}`}
              onClick={() => setSelectedPartId(null)}
              aria-label="Move"
            >
              <span>👣</span>
              <b>·</b>
            </button>
            {inventory.map((part) => (
              <button
                key={part.id}
                type="button"
                className={`partButton ${selectedPartId === part.id ? 'isSelected' : ''}`}
                onClick={() => setSelectedPartId(part.id)}
                disabled={part.remaining <= 0}
                aria-label={part.name}
              >
                <span>{part.mark}</span>
                <b>{part.remaining}/{part.limit}</b>
              </button>
            ))}
          </section>
        </section>
      )}

      {screen === 'sun' && (
        <section className="sunPage" aria-label="THE SUN area">
          <header className="sunTopbar">
            <button type="button" className="backButton" onClick={backToIsland}>BACK</button>
            <div>
              <p className="eyebrow">AREA 01</p>
              <h1>THE SUN</h1>
            </div>
            <button
              type="button"
              className="zukanMiniButton"
              onClick={() => setIsZukanOpen(true)}
              aria-label={`Exploration ${explorationProgress.visited} of ${explorationProgress.total}. Open MY ZUKAN`}
            >
              {explorationProgress.visited}/{explorationProgress.total}
            </button>
          </header>

          <div className="sunExplore">
            <div className="sunMapPanel">
              <img src={assetPath('images/the_sun_route/the_sun_area.webp')} alt="THE SUN area map" loading="lazy" decoding="async" />
              {sunSpots.map((spot) => (
                <button
                  key={spot.id}
                  type="button"
                  className={`spotPin ${selectedSpot.id === spot.id ? 'isActive' : ''}`}
                  style={{ left: spot.x, top: spot.y }}
                  onClick={() => visitSpot(spot)}
                  aria-label={spot.name}
                >
                  <span>{spot.name} GO</span>
                </button>
              ))}
            </div>

            <aside className="spotPanel" aria-live="polite">
              <p className="eyebrow">{selectedSpot.kind}</p>
              <h2>{selectedSpot.name}</h2>
              <img src={selectedSpot.image} alt="" loading="lazy" decoding="async" />
              <p>{selectedSpot.description}</p>
              <button
                type="button"
                className="enterButton"
                onClick={() => visitSpot(selectedSpot)}
              >
                ENTER SPOT
              </button>
            </aside>
          </div>

          <section className="cardShelf" aria-label="THE SUN cards">
            {sunSpots.map((spot) => {
              const isFound = visitedSpotIds.includes(spot.id);
              return (
                <button
                  key={spot.id}
                  type="button"
                  className={`areaCard ${isFound ? 'isFound' : ''}`}
                  onClick={() => visitSpot(spot)}
                >
                  <img src={spot.image} alt="" loading="lazy" decoding="async" />
                  <span>{isFound ? 'VISITED' : 'TAP'}</span>
                  <b>{spot.name}</b>
                </button>
              );
            })}
          </section>
        </section>
      )}

      {screen === 'spot' && (
        <section
          className={`routePage ${isNight ? 'isNight' : 'isDay'}`}
          data-season={CURRENT_SEASON}
          aria-label={`${selectedSpot.name} spot page`}
        >
          <header className="sunTopbar">
            <button type="button" className="backButton" onClick={backFromSpot}>BACK</button>
            <div>
              <p className="eyebrow">{selectedSpot.kind}</p>
              <h1>{selectedSpot.name}</h1>
            </div>
            <button
              type="button"
              className="zukanMiniButton"
              onClick={() => setIsZukanOpen(true)}
              aria-label={`Exploration ${explorationProgress.visited} of ${explorationProgress.total}. Open MY ZUKAN`}
            >
              {explorationProgress.visited}/{explorationProgress.total}
            </button>
          </header>

          <div className="routeStage">
            <div className="routeVisual" onPointerDown={handleFishShadowPointerDown}>
              <img src={selectedSpot.image} alt={selectedSpot.name} loading="lazy" decoding="async" />
              {selectedSpot.item && (
                <button
                  type="button"
                  className={`routeTapArea ${selectedSpot.id === 'tree_flag' ? 'treeFlagDiscovery' : ''}`}
                  onClick={discoverSelectedSpotItem}
                  aria-label={`Discover ${selectedSpot.name}`}
                >
                  <span>{selectedSpot.name}</span>
                </button>
              )}
              {selectedSpot.id === 'rope_bridge' && (
                <button
                  type="button"
                  className="ropeBridgeDiscovery"
                  onClick={(event) => event.currentTarget.focus()}
                  aria-label="Notice ROPE BRIDGE"
                >
                  <i aria-hidden="true" />
                  <span>ROPE BRIDGE</span>
                </button>
              )}
              {selectedSpot.id === 'sun_dock' && selectedSpotChildren[0] && (
                <>
                  <div className="fishShadowLayer" aria-hidden="true">
                    {fishShadow && (
                      <span
                        key={fishShadow.id}
                        ref={fishShadowElementRef}
                        className={[
                          'fishShadow',
                          `is-${fishShadow.direction}`,
                          fishShadow.escaped ? 'isEscaping' : '',
                          fishShadow.escapeDirection ? `escapes-${fishShadow.escapeDirection}` : '',
                        ].filter(Boolean).join(' ')}
                        style={{
                          left: `${fishShadow.x}%`,
                          top: `${fishShadow.y}%`,
                          '--fish-travel': `${fishShadow.direction === 'right' ? fishShadow.travel : -fishShadow.travel}px`,
                          '--fish-escape-travel': `${fishShadow.escapeDirection === 'left' ? -fishShadow.escapeTravel : (fishShadow.escapeTravel || 0)}px`,
                          '--fish-reaction-start': `${fishShadow.reactionStartOffset || 0}px`,
                          '--fish-facing': fishShadow.escapeDirection === 'left' ? -1 : 1,
                          animationDuration: fishShadow.escaped
                            ? '0ms'
                            : `${fishShadow.shadowDuration}ms`,
                        }}
                      >
                        <i />
                        <em
                          style={{
                            animationDelay: fishShadow.escaped
                              ? '0ms'
                              : `${fishShadow.rippleDelay}ms`,
                            animationDuration: fishShadow.escaped
                              ? '1400ms'
                              : `${fishShadow.rippleDuration}ms`,
                          }}
                        />
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="sunDockDiscovery"
                    onClick={handleSunDockDiscoveryClick}
                    aria-label="Discover SUN DOCK route"
                  >
                    <i aria-hidden="true" />
                    <i aria-hidden="true" />
                    <span>SUN DOCK</span>
                  </button>
                </>
              )}
              {selectedSpot.id === 'sunset_deck'
                && sunExplorationById.light_house
                && (
                  <button
                    type="button"
                    className="lightHouseDiscovery"
                    onClick={() => visitSpot(sunExplorationById.light_house)}
                    aria-label="Discover LIGHT HOUSE"
                  >
                    <i aria-hidden="true" />
                    <span>LIGHT HOUSE</span>
                  </button>
                )}
            </div>

            <aside className="routePanel">
              <p className="eyebrow">
                {selectedSpotChildren.length > 0 ? 'CONNECTED ROUTES' : 'END OF ROUTE'}
              </p>
              <h2>{selectedSpot.name}</h2>
              <p>{selectedSpot.description}</p>

              {selectedSpotChildren.length > 0 && (
                <div className="explorationBranches">
                  {selectedSpotChildren.map((childSpot) => (
                    <button
                      key={childSpot.id}
                      type="button"
                      className="enterButton"
                      onClick={() => visitSpot(childSpot)}
                      disabled={!childSpot.unlocked}
                    >
                      {visitedSpotIds.includes(childSpot.id) ? '○' : '·'} {childSpot.name}
                    </button>
                  ))}
                </div>
              )}

              {selectedSpot.item && (
                <button type="button" className="enterButton" onClick={discoverSelectedSpotItem}>
                  FIND ITEM
                </button>
              )}

              {selectedSpotChildren.length === 0 && !selectedSpot.item && (
                <button type="button" className="enterButton" onClick={backFromSpot}>
                  RETURN
                </button>
              )}
            </aside>
          </div>

          {SHOW_RESIDENT_DEBUG && selectedSpot.id === 'sun_dock' && (
            <aside className="fishShadowDebug" aria-label="Fish shadow debug information">
              fish shadows: {fishShadowCount}
              {' · '}
              escaped: {escapedFishCount}
              <span>
                last: {lastFishShadow
                  ? `${lastFishShadow.timeOfDay} · ${lastFishShadow.mood} · ${lastFishShadow.timestamp}`
                  : 'pending'}
              </span>
              <span>
                reaction: {lastFishReaction
                  ? `${lastFishReaction.reason} · ${lastFishReaction.direction} · ${lastFishReaction.timestamp}`
                  : 'pending'}
              </span>
            </aside>
          )}
        </section>
      )}

      {screen === 'cardFound' && (
        <section className="foundPage" aria-label="Card found page">
          <header className="sunTopbar">
            <button type="button" className="backButton" onClick={backToSunArea}>BACK</button>
            <div>
              <p className="eyebrow">CARD FOUND</p>
              <h1>{discoveredCard.title}</h1>
            </div>
            <button type="button" className="zukanMiniButton" onClick={() => setIsZukanOpen(true)}>
              {foundCards.length}/{allCards.length}
            </button>
          </header>

          <article className="foundCard">
            <p className="eyebrow">{discoveredCard.kind}</p>
            <img src={discoveredCard.image} alt="" loading="lazy" decoding="async" />
            <h2>{discoveredCard.title}</h2>
            <p>{discoveredCard.description}</p>
            <button type="button" className="enterButton" onClick={getDiscoveredCard}>
              GET CARD
            </button>
          </article>
        </section>
      )}

      {isZukanOpen && (
        <div className="zukanOverlay" role="presentation" onClick={() => setIsZukanOpen(false)}>
          <section className="zukanPanel" role="dialog" aria-modal="true" aria-label="MY ZUKAN" onClick={(event) => event.stopPropagation()}>
            <div className="zukanHeader">
              <div>
                <p className="eyebrow">COLLECTION</p>
                <h2>MY ZUKAN</h2>
                <span>{foundCards.length} / {allCards.length} CARDS</span>
              </div>
              <button type="button" className="zukanClose" onClick={() => setIsZukanOpen(false)}>CLOSE</button>
            </div>

            <div className="zukanGrid">
              {allCards.map((card) => {
                const isFound = foundCards.includes(card.id);
                return (
                  <button
                    key={card.id}
                    type="button"
                    className={`zukanCard ${isFound ? 'isFound' : 'isLocked'}`}
                    onClick={() => isFound && setSelectedCard(card)}
                  >
                    <span>{isFound ? card.kind : 'LOCKED'}</span>
                    <div className="zukanThumb">
                      {isFound ? <img src={card.image} alt="" loading="lazy" decoding="async" /> : <b>?</b>}
                    </div>
                    <h3>{isFound ? card.title : '???'}</h3>
                    <p>{isFound ? 'OPEN CARD' : 'NOT FOUND'}</p>
                  </button>
                );
              })}
            </div>

            {foundCardItems.length > 0 && (
              <p className="zukanHint">Found cards can be opened by tapping them.</p>
            )}
          </section>
        </div>
      )}

      {selectedCard && (
        <div className="cardOverlay" role="presentation" onClick={() => setSelectedCard(null)}>
          <article className="cardDetail" role="dialog" aria-modal="true" aria-label={selectedCard.title} onClick={(event) => event.stopPropagation()}>
            <button type="button" className="zukanClose" onClick={() => setSelectedCard(null)}>CLOSE</button>
            <span>{selectedCard.kind}</span>
            <h2>{selectedCard.title}</h2>
            <img src={selectedCard.image} alt="" loading="lazy" decoding="async" />
            <p>{selectedCard.description}</p>
          </article>
        </div>
      )}

      <div className={`cardNotice ${cardNotice ? 'isVisible' : ''}`} role="status" aria-live="polite">
        {cardNotice}
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
