import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/style.css';

const assetPath = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;

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
  const [screen, setScreen] = useState('island');
  const [selectedArea, setSelectedArea] = useState(areas[0]);
  const [selectedSpot, setSelectedSpot] = useState(sunSpots[0]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [discoveredCard, setDiscoveredCard] = useState(routeCards[0]);
  const [isZukanOpen, setIsZukanOpen] = useState(false);
  const [cardNotice, setCardNotice] = useState('');
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

  useEffect(() => {
    window.localStorage.setItem(zukanStorageKey, JSON.stringify(foundCards));
  }, [foundCards]);

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
      enterSunArea();
    } else {
      setCardNotice('COMING SOON');
    }
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
