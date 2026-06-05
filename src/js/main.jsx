import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/style.css';

const assetPath = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;

const buildParts = [
  {
    id: 'tree',
    name: 'TREE',
    icon: 'tree',
    label: '木',
    limit: 6,
    warmth: 1,
    presence: 0,
  },
  {
    id: 'bench',
    name: 'BENCH',
    icon: 'bench',
    label: 'ベンチ',
    limit: 4,
    warmth: 1,
    presence: 1,
  },
  {
    id: 'light',
    name: 'LIGHT',
    icon: 'light',
    label: 'ライト',
    limit: 5,
    warmth: 1,
    presence: 1,
  },
  {
    id: 'crate',
    name: 'CRATE',
    icon: 'crate',
    label: '木箱',
    limit: 6,
    warmth: 0,
    presence: 1,
  },
];

const buildStorageKey = 'no_limit_crew_island_sun_build';
const buildMemoryStorageKey = 'no_limit_crew_island_sun_build_memories';
const buildSaveStorageKey = 'no_limit_crew_island_sun_build_save';
const initialPlayer = { x: 50, y: 58 };
const defaultPlacedParts = [];

const partById = Object.fromEntries(buildParts.map((part) => [part.id, part]));

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

const sunSpots = [
  {
    id: 'tree_house',
    title: 'TREE HOUSE',
    kind: 'HOME BASE',
    x: '50%',
    y: '15%',
    image: assetPath('images/the_sun_route/tree_house.webp'),
    description: 'THE SUNの中心にある、大きな木の上の集合場所。',
    routeReady: true,
  },
  {
    id: 'sun_cafe',
    title: 'SUN CAFE',
    kind: 'FOOD SPOT',
    x: '29%',
    y: '36%',
    image: assetPath('images/the_sun_route/sun_cafe.webp'),
    description: 'あったかいコーヒーと手作りスイーツで、旅の元気を回復する場所。',
    routeReady: true,
  },
  {
    id: 'sun_dock',
    title: 'SUN DOCK',
    kind: 'HARBOR',
    x: '78%',
    y: '68%',
    image: assetPath('images/the_sun_route/sun_dock.webp'),
    description: '船やいかだが出る港。次の島へ向かう風を待つ場所。',
    routeReady: true,
  },
  {
    id: 'sun_market',
    title: 'SUN MARKET',
    kind: 'ITEM SHOP',
    x: '38%',
    y: '58%',
    image: assetPath('images/ui/world_item_file.webp'),
    description: '旅で見つけた道具やカードを交換できる、にぎやかなマーケット。',
    routeReady: true,
  },
  {
    id: 'craft_workshop',
    title: 'CRAFT WORKSHOP',
    kind: 'WORKSHOP',
    x: '66%',
    y: '42%',
    image: assetPath('images/areas/bike_setting_file.webp'),
    description: '木工、手作り、DIYの職人たちが集まる工房。',
    routeReady: true,
  },
  {
    id: 'secret_tree',
    title: 'SECRET TREE',
    kind: 'SECRET ROOM',
    x: '45%',
    y: '68%',
    image: assetPath('images/the_sun_route/secret_tree.webp'),
    description: '巨大樹の中に隠された、まだ記録が少ない秘密の部屋。',
    routeReady: true,
  },
  {
    id: 'hangout_spot',
    title: 'HANGOUT SPOT',
    kind: 'PLAYGROUND',
    x: '20%',
    y: '71%',
    image: assetPath('images/areas/world_view_card.webp'),
    description: 'スケボー、音楽、笑い声が集まるみんなの遊び場。',
    routeReady: true,
  },
  {
    id: 'sunset_deck',
    title: 'SUNSET DECK',
    kind: 'VIEW POINT',
    x: '80%',
    y: '23%',
    image: assetPath('images/areas/the_sun_profile.webp'),
    description: '夕日がいちばんきれいに見える、今日をしめくくるデッキ。',
    routeReady: true,
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

const sunRoutes = {
  sun_cafe: {
    spotId: 'sun_cafe',
    spotTitle: 'SUN CAFE',
    spotImage: assetPath('images/the_sun_route/sun_cafe.webp'),
    itemId: 'sea_breeze_mug',
    itemTitle: 'SEA BREEZE MUG',
    itemKind: 'CAFE ITEM',
    itemImage: assetPath('images/the_sun_route/sea_breeze_mug.webp'),
    itemDescription: 'カフェの窓辺に置かれたマグ。うっすら光るカップをタップするとカードが見つかる。',
    finalCardId: 'sea_breeze_mug',
    tapX: '58%',
    tapY: '58%',
  },
  tree_house: {
    spotId: 'tree_house',
    spotTitle: 'TREE HOUSE',
    spotImage: assetPath('images/the_sun_route/tree_house.webp'),
    itemId: 'tree_flag',
    itemTitle: 'TREE FLAG',
    itemKind: 'ATTIC ITEM',
    itemImage: assetPath('images/the_sun_route/tree_flag.webp'),
    itemDescription: '木の家の奥にしまわれた旗。小さく光る布をタップするとカードが見つかる。',
    finalCardId: 'tree_flag',
    tapX: '50%',
    tapY: '38%',
  },
  secret_tree: {
    spotId: 'secret_tree',
    spotTitle: 'SECRET TREE',
    spotImage: assetPath('images/the_sun_route/secret_tree.webp'),
    itemId: 'secret_crystal',
    itemTitle: 'SECRET CRYSTAL',
    itemKind: 'SECRET ITEM',
    itemImage: assetPath('images/the_sun_route/secret_crystal.png'),
    itemDescription: '木の奥で静かに光る結晶。見つけた場所をタップするとカードが開く。',
    finalCardId: 'secret_crystal',
    tapX: '48%',
    tapY: '52%',
  },
  sun_dock: {
    spotId: 'sun_dock',
    spotTitle: 'SUN DOCK',
    spotImage: assetPath('images/the_sun_route/sun_dock.webp'),
    itemId: 'ticket_info',
    itemTitle: 'TICKET & INFO',
    itemKind: 'DOCK GUIDE',
    itemImage: assetPath('images/the_sun_route/sun_dock.webp'),
    itemDescription: 'SUN DOCKから出発する前に見る、チケットと案内の小さな受付。',
    finalCardId: 'lucky_shell',
    infoOnly: true,
    tapX: '61%',
    tapY: '54%',
  },
  sun_market: {
    spotId: 'sun_market',
    spotTitle: 'SUN MARKET',
    spotImage: assetPath('images/the_sun_route/sun_market.webp'),
    itemId: 'lucky_shell',
    itemTitle: 'LUCKY SHELL',
    itemKind: 'MARKET ITEM',
    itemImage: assetPath('images/the_sun_route/lucky_shell.webp'),
    itemDescription: 'マーケットの棚で見つけた幸運の貝殻。光る貝殻をタップするとカードが見つかる。',
    finalCardId: 'lucky_shell',
    tapX: '58%',
    tapY: '54%',
  },
  craft_workshop: {
    spotId: 'craft_workshop',
    spotTitle: 'CRAFT WORKSHOP',
    spotImage: assetPath('images/areas/bike_setting_file.webp'),
    itemId: 'craft_hammer',
    itemTitle: 'CRAFT HAMMER',
    itemKind: 'WORKSHOP ITEM',
    itemImage: assetPath('images/areas/bike_setting_file.webp'),
    itemDescription: '工房の作業台に置かれたハンマー。光る道具をタップするとカードが見つかる。',
    finalCardId: 'craft_hammer',
    tapX: '56%',
    tapY: '58%',
  },
  hangout_spot: {
    spotId: 'hangout_spot',
    spotTitle: 'HANGOUT SPOT',
    spotImage: assetPath('images/characters/iphone_720x1280/stay_fresh_hangout_spot_iphone.webp'),
    itemId: 'chill_badge',
    itemTitle: 'CHILL BADGE',
    itemKind: 'HANGOUT ITEM',
    itemImage: assetPath('images/characters/iphone_720x1280/chill_kitty_relaxer_card_iphone.webp'),
    itemDescription: '遊び場のすみで見つけたバッジ。光るしるしをタップするとカードが見つかる。',
    finalCardId: 'chill_badge',
    tapX: '52%',
    tapY: '56%',
  },
  sunset_deck: {
    spotId: 'sunset_deck',
    spotTitle: 'SUNSET DECK',
    spotImage: assetPath('images/areas/the_sun_profile.webp'),
    itemId: 'sunset_compass',
    itemTitle: 'SUNSET COMPASS',
    itemKind: 'VIEW ITEM',
    itemImage: assetPath('images/areas/the_sun_profile.webp'),
    itemDescription: 'デッキの上で夕日を向いていたコンパス。光る針をタップするとカードが見つかる。',
    finalCardId: 'sunset_compass',
    tapX: '54%',
    tapY: '52%',
  },
};

const allCards = [...starterCards, ...sunSpots, ...routeCards];
const zukanStorageKey = 'no_limit_crew_island_zukan_cards';

function App() {
  const savedBuildState = useMemo(() => loadBuildSave(), []);
  const [screen, setScreen] = useState('island');
  const [selectedArea, setSelectedArea] = useState(areas[0]);
  const [selectedSpot, setSelectedSpot] = useState(sunSpots[0]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [discoveredCard, setDiscoveredCard] = useState(routeCards[0]);
  const [isZukanOpen, setIsZukanOpen] = useState(false);
  const [cardNotice, setCardNotice] = useState('');
  const [player, setPlayer] = useState(initialPlayer);
  const [moveTarget, setMoveTarget] = useState(null);
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
  const activeRoute = sunRoutes[selectedSpot.id] || sunRoutes.sun_dock;
  const buildStageRef = useRef(null);
  const keysRef = useRef(new Set());
  const audioRef = useRef(null);
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

  useEffect(() => {
    if (screen !== 'build') return undefined;

    const movementKeys = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd']);
    const handleKeyDown = (event) => {
      if (movementKeys.has(event.key)) {
        event.preventDefault();
        keysRef.current.add(event.key);
        setMoveTarget(null);
      }
    };
    const handleKeyUp = (event) => {
      keysRef.current.delete(event.key);
    };
    let animationFrame = 0;
    let lastTime = performance.now();
    const tick = (time) => {
      const delta = Math.min(40, time - lastTime) / 16.67;
      lastTime = time;
      setPlayer((currentPlayer) => {
        let dx = 0;
        let dy = 0;
        const activeKeys = keysRef.current;
        if (activeKeys.has('ArrowLeft') || activeKeys.has('a')) dx -= 1;
        if (activeKeys.has('ArrowRight') || activeKeys.has('d')) dx += 1;
        if (activeKeys.has('ArrowUp') || activeKeys.has('w')) dy -= 1;
        if (activeKeys.has('ArrowDown') || activeKeys.has('s')) dy += 1;

        if (dx !== 0 || dy !== 0) {
          const length = Math.hypot(dx, dy) || 1;
          return {
            x: Math.max(15, Math.min(85, currentPlayer.x + (dx / length) * 0.72 * delta)),
            y: Math.max(22, Math.min(78, currentPlayer.y + (dy / length) * 0.72 * delta)),
          };
        }

        if (moveTarget) {
          const targetDx = moveTarget.x - currentPlayer.x;
          const targetDy = moveTarget.y - currentPlayer.y;
          const distance = Math.hypot(targetDx, targetDy);
          if (distance < 0.9) {
            setMoveTarget(null);
            return currentPlayer;
          }
          return {
            x: Math.max(15, Math.min(85, currentPlayer.x + (targetDx / distance) * 0.58 * delta)),
            y: Math.max(22, Math.min(78, currentPlayer.y + (targetDy / distance) * 0.58 * delta)),
          };
        }

        return currentPlayer;
      });
      animationFrame = requestAnimationFrame(tick);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    animationFrame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrame);
      keysRef.current.clear();
    };
  }, [moveTarget, screen]);

  useEffect(() => () => {
    if (audioRef.current) {
      audioRef.current.source.stop();
      audioRef.current.context.close();
    }
  }, []);

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

    setMoveTarget(point);
  };

  const collectPlacedPart = (event, placedPartId) => {
    event.stopPropagation();
    setPlacedParts((currentParts) => currentParts.filter((placedPart) => placedPart.id !== placedPartId));
    setCardNotice('PART RETURNED');
  };

  const resetBuildArea = () => {
    setPlacedParts(defaultPlacedParts);
    setPartMemories([]);
    setBuildEvents(['The island is listening.']);
    setCustomIslandName('');
    setIsNight(false);
    setPlayer(initialPlayer);
    setMoveTarget(null);
    setCardNotice('ISLAND RESET');
  };

  const inspectSpot = (spot) => {
    setSelectedSpot(spot);
    if (spot.routeReady) {
      setScreen('spot');
      return;
    }

    setCardNotice('NEXT ROUTE SOON');
  };

  const openCard = (card) => {
    addFoundCard(card.id);
    setSelectedCard(card);
  };

  const openRouteItem = () => {
    if (activeRoute.infoOnly) {
      setScreen('ticketInfo');
      return;
    }

    const finalCard = routeCards.find((card) => card.id === activeRoute.finalCardId);
    if (!finalCard) return;

    setDiscoveredCard(finalCard);
    setScreen('cardFound');
  };

  const openSunVoyagerPass = () => {
    const voyagerPassCard = routeCards.find((card) => card.id === 'sun_voyager_pass');
    if (!voyagerPassCard) return;

    setDiscoveredCard(voyagerPassCard);
    setScreen('cardFound');
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
          aria-label="SUN AREA build prototype"
        >
          <header className="buildTopbar">
            <button type="button" className="backButton" onClick={backToIsland}>BACK</button>
            <div>
              <p className="eyebrow">SUN AREA BUILD</p>
              <h1>GROW YOUR SUN AREA</h1>
            </div>
            <div className="buildActions">
              <button type="button" className="buildMiniButton" onClick={() => setScreen('sun')}>EXPLORE</button>
              <button type="button" className="buildMiniButton" onClick={() => setIsNight((current) => !current)}>
                {isNight ? 'DAY' : 'NIGHT'}
              </button>
              <button type="button" className="buildMiniButton" onClick={toggleWaveLoop}>
                {isWaveOn ? 'WAVES ON' : 'WAVES OFF'}
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
                    <span>{part.name}</span>
                  </button>
                );
              })}

              <div
                className="buildPlayer"
                style={{ left: `${player.x}%`, top: `${player.y}%` }}
                aria-label="Player"
              >
                <span />
              </div>

              {moveTarget && (
                <div
                  className="moveTarget"
                  style={{ left: `${moveTarget.x}%`, top: `${moveTarget.y}%` }}
                  aria-hidden="true"
                />
              )}
            </div>

            <aside className="buildStats" aria-live="polite">
              <p className="eyebrow">AREA FEEL</p>
              <label className="customIslandName">
                <span>ISLAND NAME</span>
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
              <h2>LEVEL {sunAreaStats.level}</h2>
              <p className="moodLine">{sunAreaStats.mood}</p>
              <div className="statRows">
                <span>WARMTH <b>{sunAreaStats.warmth}</b><em>{sunAreaStats.warmthText}</em></span>
                <span>PEOPLE <b>{sunAreaStats.presence}</b><em>{sunAreaStats.peopleText}</em></span>
                <span>PARTS <b>{placedParts.length}</b><em>{placedParts.length === 0 ? 'A blank little place' : 'Your touch is visible'}</em></span>
              </div>
              <div className="feelNotes">
                <p>{sunAreaStats.natureText}</p>
                <p>{sunAreaStats.peopleText}</p>
                <p>{sunAreaStats.lightText}</p>
                <p>{sunAreaStats.workText}</p>
              </div>
              <div className="eventLog">
                <p className="eyebrow">ISLAND REPLIES</p>
                {buildEvents.map((eventLine) => (
                  <p className="eventLine" key={eventLine}>{eventLine}</p>
                ))}
              </div>
              <div className="memoryLog">
                <p className="eyebrow">MEMORIES</p>
                {partMemories.length === 0 ? (
                  <p className="memoryLine">No first pieces yet.</p>
                ) : (
                  partMemories.map((partId) => (
                    <p className="memoryLine" key={partId}>{firstPartMemoryLines[partId]}</p>
                  ))
                )}
              </div>
              <p className="buildHint">
                {selectedPartId ? 'Tap the island to place a part. Tap a placed part to return it.' : 'Tap the island to walk.'}
              </p>
              <button type="button" className="enterButton" onClick={resetBuildArea}>RESET ISLAND</button>
            </aside>
          </div>

          <section className="partsTray" aria-label="Owned parts">
            <button
              type="button"
              className={`partButton ${selectedPartId === null ? 'isSelected' : ''}`}
              onClick={() => setSelectedPartId(null)}
            >
              <span>MOVE</span>
              <b>TAP WALK</b>
            </button>
            {inventory.map((part) => (
              <button
                key={part.id}
                type="button"
                className={`partButton ${selectedPartId === part.id ? 'isSelected' : ''}`}
                onClick={() => setSelectedPartId(part.id)}
                disabled={part.remaining <= 0}
              >
                <span>{part.name}</span>
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
            <button type="button" className="zukanMiniButton" onClick={() => setIsZukanOpen(true)}>
              {foundCards.length}/{allCards.length}
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
                  onClick={() => inspectSpot(spot)}
                  aria-label={spot.title}
                >
                  <span>{spot.routeReady ? `${spot.title} GO` : spot.title}</span>
                </button>
              ))}
            </div>

            <aside className="spotPanel" aria-live="polite">
              <p className="eyebrow">{selectedSpot.kind}</p>
              <h2>{selectedSpot.title}</h2>
              <img src={selectedSpot.image} alt="" loading="lazy" decoding="async" />
              <p>{selectedSpot.description}</p>
              <button
                type="button"
                className="enterButton"
                onClick={() => inspectSpot(selectedSpot)}
              >
                {selectedSpot.routeReady ? 'ENTER SPOT' : 'CHECK'}
              </button>
            </aside>
          </div>

          <section className="cardShelf" aria-label="THE SUN cards">
            {sunSpots.map((spot) => {
              const spotRoute = sunRoutes[spot.id];
              const isFound = foundCards.includes(spot.id) || Boolean(spotRoute && foundCards.includes(spotRoute.finalCardId));
              return (
                <button
                  key={spot.id}
                  type="button"
                  className={`areaCard ${isFound ? 'isFound' : ''}`}
                  onClick={() => inspectSpot(spot)}
                >
                  <img src={spot.image} alt="" loading="lazy" decoding="async" />
                  <span>{isFound ? 'FOUND' : 'TAP'}</span>
                  <b>{spot.title}</b>
                </button>
              );
            })}
          </section>
        </section>
      )}

      {screen === 'spot' && (
        <section className="routePage" aria-label={`${activeRoute.spotTitle} spot page`}>
          <header className="sunTopbar">
            <button type="button" className="backButton" onClick={backToSunArea}>BACK</button>
            <div>
              <p className="eyebrow">SPOT PAGE</p>
              <h1>{activeRoute.spotTitle}</h1>
            </div>
            <button type="button" className="zukanMiniButton" onClick={() => setIsZukanOpen(true)}>
              {foundCards.length}/{allCards.length}
            </button>
          </header>

          <div className="routeStage">
            <div className="routeVisual">
              <img src={activeRoute.spotImage} alt={activeRoute.spotTitle} loading="lazy" decoding="async" />
              <button
                type="button"
                className="routeTapArea"
                style={{ left: activeRoute.tapX, top: activeRoute.tapY }}
                onClick={openRouteItem}
              >
                <span>{activeRoute.itemTitle}</span>
              </button>
            </div>

            <aside className="routePanel">
              <p className="eyebrow">{activeRoute.itemKind}</p>
              <h2>{activeRoute.itemTitle}</h2>
              <img src={activeRoute.itemImage} alt="" loading="lazy" decoding="async" />
              <p>{activeRoute.itemDescription}</p>
              <button type="button" className="enterButton" onClick={openRouteItem}>
                TAP ITEM
              </button>
            </aside>
          </div>
        </section>
      )}

      {screen === 'ticketInfo' && (
        <section className="routePage" aria-label={`${activeRoute.itemTitle} page`}>
          <header className="sunTopbar">
            <button type="button" className="backButton" onClick={() => setScreen('spot')}>BACK</button>
            <div>
              <p className="eyebrow">SUN DOCK</p>
              <h1>{activeRoute.itemTitle}</h1>
            </div>
            <button type="button" className="zukanMiniButton" onClick={() => setIsZukanOpen(true)}>
              {foundCards.length}/{allCards.length}
            </button>
          </header>

          <div className="routeStage">
            <div className="routeVisual">
              <img src={activeRoute.itemImage} alt={activeRoute.itemTitle} loading="lazy" decoding="async" />
            </div>

            <aside className="routePanel">
              <p className="eyebrow">{activeRoute.itemKind}</p>
              <h2>{activeRoute.itemTitle}</h2>
              <p>{activeRoute.itemDescription}</p>
              <button type="button" className="enterButton" onClick={() => setScreen('boatTicket')}>
                BOAT TICKET
              </button>
              <button type="button" className="enterButton" onClick={backToSunArea}>
                BACK TO AREA
              </button>
            </aside>
          </div>
        </section>
      )}

      {screen === 'boatTicket' && (
        <section className="routePage" aria-label="BOAT TICKET page">
          <header className="sunTopbar">
            <button type="button" className="backButton" onClick={() => setScreen('ticketInfo')}>BACK</button>
            <div>
              <p className="eyebrow">TICKET & INFO</p>
              <h1>BOAT TICKET</h1>
            </div>
            <button type="button" className="zukanMiniButton" onClick={() => setIsZukanOpen(true)}>
              {foundCards.length}/{allCards.length}
            </button>
          </header>

          <div className="routeStage">
            <div className="routeVisual">
              <img src={activeRoute.spotImage} alt="BOAT TICKET" loading="lazy" decoding="async" />
            </div>

            <aside className="routePanel">
              <p className="eyebrow">BOARDING PASS</p>
              <h2>BOAT TICKET</h2>
              <p>SUN DOCKから次の場所へ向かうためのチケット。今は案内ページとして確認できます。</p>
              <button type="button" className="enterButton" onClick={() => setScreen('boardingPass')}>
                BOARDING PASS
              </button>
              <button type="button" className="enterButton" onClick={() => setScreen('ticketInfo')}>
                BACK TO INFO
              </button>
            </aside>
          </div>
        </section>
      )}

      {screen === 'boardingPass' && (
        <section className="routePage" aria-label="BOARDING PASS page">
          <header className="sunTopbar">
            <button type="button" className="backButton" onClick={() => setScreen('boatTicket')}>BACK</button>
            <div>
              <p className="eyebrow">BOAT TICKET</p>
              <h1>BOARDING PASS</h1>
            </div>
            <button type="button" className="zukanMiniButton" onClick={() => setIsZukanOpen(true)}>
              {foundCards.length}/{allCards.length}
            </button>
          </header>

          <div className="routeStage">
            <div className="routeVisual">
              <img src={activeRoute.spotImage} alt="BOARDING PASS" loading="lazy" decoding="async" />
            </div>

            <aside className="routePanel">
              <p className="eyebrow">PASS CHECK</p>
              <h2>BOARDING PASS</h2>
              <p>船に乗る前に確認するパス。SUN DOCKから次の探索へ進む準備がここに記録されます。</p>
              <button type="button" className="enterButton" onClick={() => setScreen('departureStamp')}>
                DEPARTURE STAMP
              </button>
              <button type="button" className="enterButton" onClick={() => setScreen('boatTicket')}>
                BACK TO TICKET
              </button>
            </aside>
          </div>
        </section>
      )}

      {screen === 'departureStamp' && (
        <section className="routePage" aria-label="DEPARTURE STAMP page">
          <header className="sunTopbar">
            <button type="button" className="backButton" onClick={() => setScreen('boardingPass')}>BACK</button>
            <div>
              <p className="eyebrow">BOARDING PASS</p>
              <h1>DEPARTURE STAMP</h1>
            </div>
            <button type="button" className="zukanMiniButton" onClick={() => setIsZukanOpen(true)}>
              {foundCards.length}/{allCards.length}
            </button>
          </header>

          <div className="routeStage">
            <div className="routeVisual">
              <img src={activeRoute.spotImage} alt="DEPARTURE STAMP" loading="lazy" decoding="async" />
            </div>

            <aside className="routePanel">
              <p className="eyebrow">STAMP CHECK</p>
              <h2>DEPARTURE STAMP</h2>
              <p>出発前に押す小さなスタンプ。SUN DOCKから旅立つ準備が整ったしるしです。</p>
              <button type="button" className="enterButton" onClick={() => setScreen('sailPermit')}>
                SAIL PERMIT
              </button>
              <button type="button" className="enterButton" onClick={() => setScreen('boardingPass')}>
                BACK TO PASS
              </button>
            </aside>
          </div>
        </section>
      )}

      {screen === 'sailPermit' && (
        <section className="routePage" aria-label="SAIL PERMIT page">
          <header className="sunTopbar">
            <button type="button" className="backButton" onClick={() => setScreen('departureStamp')}>BACK</button>
            <div>
              <p className="eyebrow">DEPARTURE STAMP</p>
              <h1>SAIL PERMIT</h1>
            </div>
            <button type="button" className="zukanMiniButton" onClick={() => setIsZukanOpen(true)}>
              {foundCards.length}/{allCards.length}
            </button>
          </header>

          <div className="routeStage">
            <div className="routeVisual">
              <img src={activeRoute.spotImage} alt="SAIL PERMIT" loading="lazy" decoding="async" />
            </div>

            <aside className="routePanel">
              <p className="eyebrow">PERMIT CHECK</p>
              <h2>SAIL PERMIT</h2>
              <p>SUN DOCKから船を出すための許可証。次の海へ進む準備を確認するページです。</p>
              <button type="button" className="enterButton" onClick={openSunVoyagerPass}>
                SUN VOYAGER PASS
              </button>
              <button type="button" className="enterButton" onClick={() => setScreen('departureStamp')}>
                BACK TO STAMP
              </button>
            </aside>
          </div>
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
