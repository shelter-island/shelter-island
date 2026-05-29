import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const areas = [
  {
    id: 'sun',
    label: 'THE SUN',
    x: '29%',
    y: '16%',
    tone: 'sun',
    note: 'Sun passport is warming up.',
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
    id: 'soon',
    label: 'COMING SOON',
    x: '50%',
    y: '70%',
    tone: 'soon',
    note: 'This route is under construction.',
  },
];

const zukanCards = [
  {
    id: 'sun',
    title: 'SUN',
    type: 'CHARACTER FILE',
    rarity: 'STARTER',
    image: '/images/the-sun-character.png',
    description: 'THE SUNエリアに入ると記録される、最初の太陽カード。',
  },
  {
    id: 'bolt-jii',
    title: 'ボルトじい',
    type: 'CHARACTER FILE',
    rarity: 'RARE',
    image: null,
    description: 'CRAFT WORKSHOP付近で出会える発明家カード。',
  },
  {
    id: 'tree-house',
    title: 'TREE HOUSE',
    type: 'LOCATION CARD',
    rarity: 'COMMON',
    image: '/images/sun-house.png',
    description: '大きな木の上にある、帰ってこられる秘密基地。',
  },
  {
    id: 'sun-plaza',
    title: 'SUN PLAZA',
    type: 'LOCATION CARD',
    rarity: 'COMMON',
    image: '/images/world-view-card.png',
    description: 'THE SUNの中心にある、GOOD VIBESな集合場所。',
  },
];

const zukanStorageKey = 'noLimitCrewIsland.zukanCards';

function App() {
  const [selectedArea, setSelectedArea] = useState(areas[0]);
  const [isEntering, setIsEntering] = useState(false);
  const [foundCards, setFoundCards] = useState(() => {
    try {
      const savedCards = JSON.parse(window.localStorage.getItem(zukanStorageKey) || '[]');
      return Array.isArray(savedCards) ? savedCards : [];
    } catch {
      return [];
    }
  });
  const [isZukanOpen, setIsZukanOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardNotice, setCardNotice] = useState('');

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

  const chooseArea = (area) => {
    setSelectedArea(area);
  };

  const addFoundCard = (cardId) => {
    setFoundCards((currentCards) => {
      if (currentCards.includes(cardId)) {
        setCardNotice('CARD FOUND');
        return currentCards;
      }

      setCardNotice('NEW CARD GET');
      return [...currentCards, cardId];
    });
  };

  const enterArea = (area = selectedArea) => {
    if (!area) return;

    setSelectedArea(area);
    if (area.id === 'sun') {
      addFoundCard('sun');
    }
    setIsEntering(true);
    window.clearTimeout(window.noLimitCrewTimer);
    window.noLimitCrewTimer = window.setTimeout(() => {
      setIsEntering(false);
    }, 1600);
  };

  return (
    <main className="topPage" aria-label="NO LIMIT CREW ISLAND top page">
      <section
        className={`mapScreen ${isEntering ? 'isEntering' : ''}`}
        data-target={selectedArea?.id || ''}
        aria-label="Island map screen"
      >
        <div className="mapShell">
          <img
            className="islandMap"
            src="/no-limit-top/island_map.webp"
            alt="Illustrated NO LIMIT CREW ISLAND map with selectable areas"
            draggable="false"
            fetchPriority="high"
            decoding="async"
          />

          {areas.map((area) => (
            <button
              key={area.id}
              type="button"
              className={`hotspot ${area.tone} ${selectedArea?.id === area.id ? 'isActive' : ''}`}
              style={{ left: area.x, top: area.y }}
              onMouseEnter={() => chooseArea(area)}
              onFocus={() => chooseArea(area)}
              onClick={() => chooseArea(area)}
            >
              <span>{area.label === 'COMING SOON' ? 'SOON' : area.label}</span>
            </button>
          ))}

          <button className="zukanButton" type="button" onClick={() => setIsZukanOpen(true)}>
            <span>MY ZUKAN</span>
            <b>{foundCards.length}/{zukanCards.length}</b>
          </button>
        </div>

        <header className="hud hudLeft">
          <p className="eyebrow">ISLAND MAP</p>
          <h1>NO LIMIT CREW ISLAND</h1>
          <p className="slogan">NO WAR.<br />NO LIMIT.<br />TODAY IS A GOOD DAY.</p>
        </header>

        <aside className="hud hudRight" aria-live="polite">
          <p className="eyebrow">SELECT AREA</p>
          <p className="selectedArea">{selectedArea ? `${selectedArea.label} is ready` : 'Tap a glowing sign'}</p>
          <button
            className="enterButton"
            type="button"
            onClick={() => enterArea()}
            disabled={!selectedArea}
          >
            {isEntering ? 'ENTERING...' : 'ENTER AREA'}
          </button>
        </aside>

        <div className="tapPrompt">TAP TO EXPLORE</div>

        <div className={`transitionCard ${isEntering ? 'isVisible' : ''}`} role="status" aria-live="polite">
          <p className="stamp">TRAVEL STAMP</p>
          <strong>{selectedArea?.label || 'THE SUN'}</strong>
          <span>{selectedArea?.id === 'sun' ? 'Loading entrance...' : 'Entrance will be built next.'}</span>
        </div>

        <div className={`cardNotice ${cardNotice ? 'isVisible' : ''}`} role="status" aria-live="polite">
          {cardNotice}
        </div>

        {isZukanOpen && (
          <div className="zukanOverlay" role="presentation" onClick={() => setIsZukanOpen(false)}>
            <section className="zukanPanel" role="dialog" aria-modal="true" aria-label="MY ZUKAN" onClick={(event) => event.stopPropagation()}>
              <div className="zukanHeader">
                <div>
                  <p className="eyebrow">COLLECTION</p>
                  <h2>MY ZUKAN</h2>
                  <span>{foundCards.length} / {zukanCards.length} CARDS</span>
                </div>
                <button type="button" className="zukanClose" onClick={() => setIsZukanOpen(false)}>CLOSE</button>
              </div>

              <div className="zukanGrid">
                {zukanCards.map((card) => {
                  const isFound = foundCards.includes(card.id);
                  return (
                    <button
                      key={card.id}
                      type="button"
                      className={`zukanCard ${isFound ? 'isFound' : 'isLocked'}`}
                      onClick={() => isFound && setSelectedCard(card)}
                    >
                      <span>{isFound ? card.type : 'LOCKED'}</span>
                      <div className="zukanThumb">
                        {isFound && card.image ? <img src={card.image} alt="" loading="lazy" decoding="async" /> : <b>?</b>}
                      </div>
                      <h3>{isFound ? card.title : '???'}</h3>
                      <p>{isFound ? card.rarity : 'NOT FOUND'}</p>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {selectedCard && (
          <div className="cardOverlay" role="presentation" onClick={() => setSelectedCard(null)}>
            <article className="cardDetail" role="dialog" aria-modal="true" aria-label={selectedCard.title} onClick={(event) => event.stopPropagation()}>
              <button type="button" className="zukanClose" onClick={() => setSelectedCard(null)}>CLOSE</button>
              <span>{selectedCard.type}</span>
              <h2>{selectedCard.title}</h2>
              {selectedCard.image ? <img src={selectedCard.image} alt="" loading="lazy" decoding="async" /> : <div className="cardSilhouette">?</div>}
              <p>{selectedCard.description}</p>
            </article>
          </div>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
