import React, { useState } from 'react';
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

function App() {
  const [selectedArea, setSelectedArea] = useState(null);
  const [isEntering, setIsEntering] = useState(false);

  const chooseArea = (area) => {
    setSelectedArea(area);
  };

  const enterArea = (area = selectedArea) => {
    if (!area) return;

    setSelectedArea(area);
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
              onClick={() => enterArea(area)}
            >
              <span>{area.label === 'COMING SOON' ? 'SOON' : area.label}</span>
            </button>
          ))}
        </div>

        <header className="hud hudLeft">
          <p className="eyebrow">ISLAND MAP</p>
          <h1>NO LIMIT CREW ISLAND</h1>
          <p className="slogan">NO WAR.<br />NO LIMIT.<br />TODAY IS A GOOD DAY.</p>
        </header>

        <aside className="hud hudRight" aria-live="polite">
          <p className="eyebrow">SELECT AREA</p>
          <p className="selectedArea">{selectedArea ? `${selectedArea.label} is ready` : 'Hover a glowing sign'}</p>
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
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
