import { characterDetails } from './data/characterDetailData.js';
import { assetPath, crew } from './data/crewData.js';

const params = new URLSearchParams(window.location.search);
const requestedId = params.get('id') || document.body.dataset.defaultCrew || 'grow';
const character = characterDetails[requestedId] || characterDetails.grow;
const crewById = new Map(crew.map((member) => [member.id, member]));
const currentCrew = crewById.get(character.id || requestedId) || crewById.get(requestedId);
const relatedCrew = (currentCrew?.related || []).map((id) => crewById.get(id)).filter(Boolean);
const app = document.querySelector('#app');
const backLink = document.querySelector('#backLink');

document.documentElement.style.setProperty('--accent', character.color);
document.documentElement.style.setProperty('--accent-rgb', character.colorRgb || '25, 216, 255');
document.documentElement.style.setProperty('--secondary', character.secondaryColor || character.color);
document.documentElement.style.setProperty('--secondary-rgb', character.secondaryRgb || character.colorRgb || '25, 216, 255');
document.body.classList.add(character.theme || `theme-${character.id}`);
document.title = `${character.name} / NO LIMIT CREW ISLAND`;

if (backLink) {
  backLink.href = character.backUrl;
}

const isEnabled = (section) => character.sections?.[section] !== false;
const image = (key) => character.images?.[key];
const sectionLabel = (section, fallback) => character.labels?.[section] || fallback;
const sectionImageKey = (section, fallback) => character.sectionImages?.[section] || fallback;
const renderedImages = new Set();
const imageTag = (key, alt, attrs = '') => {
  const src = image(key);
  if (!src || renderedImages.has(src)) return '';
  renderedImages.add(src);
  return `<img src="${src}" alt="${alt}" ${attrs} />`;
};
const textOnlyClass = (markup) => markup ? '' : ' is-text-only';
const list = (items = []) => items.map((item) => `<li>${item}</li>`).join('');
const dataRows = (rows) => rows.map(([label, value]) => `
  <div class="data-row">
    <dt>${label}</dt>
    <dd>${value}</dd>
  </div>
`).join('');

const textCards = (items) => items.map(([title, text]) => `
  <article class="text-card reveal-on-scroll">
    <span>${title}</span>
    <p>${text}</p>
  </article>
`).join('');

const galleryCards = () => {
  const localImages = new Set();
  return (character.gallery || []).map(([label, imageKey]) => {
    const src = image(imageKey);
    if (!src || renderedImages.has(src) || localImages.has(src)) return '';
    renderedImages.add(src);
    localImages.add(src);
    return `
      <figure class="gallery-card reveal-on-scroll">
        <img src="${src}" alt="${character.name} ${label}" loading="lazy" decoding="async" />
        <figcaption>${label}</figcaption>
      </figure>
    `;
  }).join('');
};

const trailLinks = relatedCrew.map((member) => `
  <a class="trail-link reveal-on-scroll" href="${member.detailUrl}" style="--route-color: ${member.color}">
    <span>${member.number}</span>
    <strong>${member.name}</strong>
    <small>${member.spot || member.area} / ${member.area}</small>
  </a>
`).join('');

const sectionMarkup = {
  hero: () => `
  <section class="grow-hero" id="top" aria-label="${character.name} TOP">
    <div class="hero-copy">
      <p class="detail-kicker">${character.crewLabel} / ${character.number}</p>
      <h1>${character.name}</h1>
      <p class="hero-catch">${character.catch}</p>
      <a class="enter-cue" href="#${character.enterTarget || 'character'}">ENTER / SCROLL</a>
    </div>
    <figure class="hero-figure">
      ${imageTag('hero', character.name, 'class="hero-image" decoding="async" fetchpriority="high"')}
    </figure>
  </section>`,

  areaMap: () => {
    const map = character.areaMap;
    const mapFigure = imageTag(
      sectionImageKey('areaMap', 'areaMap'),
      `${character.name} area map`,
      'loading="lazy" decoding="async" class="grow-map-image"',
    );
    if (!map && !mapFigure) return '';

    const spots = (map?.spots || []).map((spot) => `
      <article class="grow-spot-card reveal-on-scroll">
        <span>${spot.number}</span>
        <h3>${spot.name}</h3>
        <p>${spot.text}</p>
      </article>
    `).join('');

    return `
  <section class="detail-section grow-map-section" id="grow-map" aria-label="${sectionLabel('areaMap', 'GROW MAP')}">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">${sectionLabel('areaMap', 'GROW MAP')}</p>
      <h2>${map?.title || character.headings?.areaMap || 'Enter the Area.'}</h2>
      <p>${map?.lead || character.catch}</p>
    </div>
    <div class="grow-map-showcase">
      ${mapFigure ? `<figure class="grow-map-frame reveal-on-scroll">${mapFigure}</figure>` : ''}
      ${spots ? `<div class="grow-spot-grid">${spots}</div>` : ''}
    </div>
  </section>`;
  },

  tourGuide: () => {
    const guide = character.tourGuide;
    const guideFigure = imageTag(
      sectionImageKey('tourGuide', 'tourGuide'),
      `${character.name} tour guide`,
      'loading="lazy" decoding="async" class="grow-guide-image"',
    );
    if (!guide && !guideFigure) return '';

    const notes = (guide?.notes || []).map((note) => `<li>${note}</li>`).join('');

    return `
  <section class="detail-section grow-guide-section" id="grow-guide" aria-label="${sectionLabel('tourGuide', 'GROW GUIDE / TOUR GUIDE')}">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">${sectionLabel('tourGuide', 'GROW GUIDE / TOUR GUIDE')}</p>
      <h2>${guide?.title || character.headings?.tourGuide || 'Tour Guide.'}</h2>
      <p>${guide?.lead || character.catch}</p>
    </div>
    <div class="grow-guide-panel reveal-on-scroll">
      ${guideFigure ? `<figure class="grow-guide-frame">${guideFigure}</figure>` : ''}
      <div class="grow-guide-copy">
        ${guide?.body ? `<p>${guide.body}</p>` : ''}
        ${notes ? `<ul class="grow-guide-list">${notes}</ul>` : ''}
      </div>
    </div>
  </section>`;
  },

  character: () => {
    const figure = imageTag(
      sectionImageKey('character', 'human'),
      `${character.name} character`,
      'loading="lazy" decoding="async"',
    );
    return `
  <section class="detail-section split-section" id="character" aria-label="CHARACTER">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">${sectionLabel('character', 'CHARACTER')}</p>
      <h2>${character.headings?.character || 'Two Faces.'}</h2>
    </div>
    <div class="profile-panel${textOnlyClass(figure)} reveal-on-scroll">
      ${figure}
      <dl class="profile-list">${dataRows(character.profile)}</dl>
    </div>
  </section>`;
  },

  emotion: () => {
    const figure = imageTag(
      sectionImageKey('emotion', 'emotionProfile'),
      `${character.name} ${sectionLabel('emotion', 'emotion')}`,
      'loading="lazy" decoding="async"',
    );
    return `
  <section class="detail-section" id="emotion" aria-label="EMOTION">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">${sectionLabel('emotion', 'EMOTION')}</p>
      <h2>${character.headings?.emotion || 'Inside the Mask.'}</h2>
    </div>
    <div class="image-led${textOnlyClass(figure)}">
      ${figure}
      <div class="card-grid">${textCards(character.emotion)}</div>
    </div>
  </section>`;
  },

  world: () => {
    const figure = imageTag(
      sectionImageKey('world', 'castle'),
      character.world.title,
      'loading="lazy" decoding="async"',
    );
    return `
  <section class="detail-section" id="world" aria-label="WORLD">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">${sectionLabel('world', 'WORLD')}</p>
      <h2>${character.world.title}</h2>
      <p>${character.world.lead}</p>
    </div>
    <div class="world-panel${textOnlyClass(figure)} reveal-on-scroll">
      ${figure}
      <div class="world-text">
        <p>${character.world.overview}</p>
        <p>${character.world.role}</p>
        <div class="mini-columns">
          <div>
            <span>Rules</span>
            <ul>${list(character.world.rules)}</ul>
          </div>
          <div>
            <span>Symbols</span>
            <ul>${list(character.world.symbols)}</ul>
          </div>
        </div>
      </div>
    </div>
  </section>`;
  },

  trail: () => currentCrew ? `
  <section class="detail-section trail-section" id="trail" aria-label="ISLAND TRAIL">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">ISLAND TRAIL</p>
      <h2>${currentCrew.spot || currentCrew.area}</h2>
      <p>${currentCrew.walkHint || currentCrew.line}</p>
    </div>
    <div class="trail-panel">
      <article class="trail-current reveal-on-scroll" style="--route-color: ${currentCrew.color}">
        <span>CURRENT AREA</span>
        <p>${currentCrew.presence || currentCrew.name}</p>
      </article>
      <div class="trail-links" aria-label="${currentCrew.name}に関連する島のエリア">
        <p class="trail-links-title">RELATED AREAS</p>
        ${trailLinks}
      </div>
      <div class="trail-actions reveal-on-scroll">
        <a href="${assetPath('index.html#world')}">BACK TO WORLD MAP</a>
        <a href="${assetPath('index.html#crew')}">ALL CREW</a>
      </div>
    </div>
  </section>` : '',

  rooms: () => `
  <section class="detail-section" id="rooms" aria-label="CASTLE MAP AND ROOMS">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">${sectionLabel('rooms', 'CASTLE MAP / ROOMS')}</p>
      <h2>${character.headings?.rooms || 'Rooms to Enter.'}</h2>
    </div>
    <div class="card-grid room-grid">${textCards(character.rooms)}</div>
  </section>`,

  home: () => {
    const figure = imageTag(
      sectionImageKey('home', 'home'),
      `${character.name} ${sectionLabel('home', 'home')}`,
      'loading="lazy" decoding="async"',
    );
    return `
  <section class="detail-section image-band${textOnlyClass(figure)}" id="home" aria-label="HOME">
    ${figure}
    <div class="band-copy reveal-on-scroll">
      <p class="detail-kicker">${sectionLabel('home', 'HOME')}</p>
      <h2>${character.home.title}</h2>
      <ul>${list(character.home.lines)}</ul>
    </div>
  </section>`;
  },

  bike: () => {
    const figure = imageTag(
      sectionImageKey('bike', 'bikeRide'),
      `${character.bike.title} bike`,
      'loading="lazy" decoding="async"',
    );
    return `
  <section class="detail-section image-band reverse${textOnlyClass(figure)}" id="bike" aria-label="BIKE">
    ${figure}
    <div class="band-copy reveal-on-scroll">
      <p class="detail-kicker">${sectionLabel('bike', 'BIKE')}</p>
      <h2>${character.bike.title}</h2>
      <ul>${list(character.bike.lines)}</ul>
    </div>
  </section>`;
  },

  gallery: () => {
    const cards = galleryCards();
    if (!cards) return '';
    return `
  <section class="detail-section" id="gallery" aria-label="GALLERY">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">${sectionLabel('gallery', 'GALLERY')}</p>
      <h2>${character.headings?.gallery || 'Collected Images.'}</h2>
    </div>
    <div class="gallery-grid">${cards}</div>
  </section>`;
  },

  lifestyle: () => `
  <section class="detail-section" id="lifestyle" aria-label="LIFE STYLE">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">${sectionLabel('lifestyle', 'LIFE STYLE')}</p>
      <h2>${character.headings?.lifestyle || 'Life Style.'}</h2>
    </div>
    <div class="card-grid">${textCards(character.lifestyle || [])}</div>
  </section>`,

  story: () => `
  <section class="detail-section" id="story" aria-label="STORY">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">${sectionLabel('story', 'STORY')}</p>
      <h2>${character.headings?.story || 'Still Growing.'}</h2>
    </div>
    <div class="timeline">${textCards(character.story)}</div>
  </section>`,

  connection: () => `
  <section class="detail-section" id="connection" aria-label="CONNECTION">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">${sectionLabel('connection', 'CONNECTION')}</p>
      <h2>${character.headings?.connection || 'Crew Links.'}</h2>
    </div>
    <div class="card-grid">${textCards(character.connections)}</div>
  </section>`,

  music: () => `
  <section class="detail-section" id="music" aria-label="MUSIC">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">${sectionLabel('music', 'MUSIC')}</p>
      <h2>${character.headings?.music || 'Sound Image.'}</h2>
    </div>
    <div class="music-panel reveal-on-scroll">
      ${(character.music || []).map((item) => `<span>${item}</span>`).join('')}
    </div>
  </section>`,

  quote: () => `
  <section class="quote-section" id="quote" aria-label="QUOTE">
    <p>${character.quote}</p>
    <span>${character.name}</span>
    <a href="${character.backUrl}">BACK TO ISLAND</a>
  </section>`,
};

const defaultSectionOrder = [
  'hero',
  'character',
  'emotion',
  'world',
  'trail',
  'rooms',
  'home',
  'bike',
  'lifestyle',
  'gallery',
  'story',
  'connection',
  'music',
  'quote',
];

const pageOrder = [...(character.sectionOrder || defaultSectionOrder)];
if (currentCrew && !pageOrder.includes('trail')) {
  const worldIndex = pageOrder.indexOf('world');
  pageOrder.splice(worldIndex >= 0 ? worldIndex + 1 : pageOrder.length - 1, 0, 'trail');
}

app.innerHTML = pageOrder
  .filter((section) => sectionMarkup[section] && isEnabled(section))
  .map((section) => sectionMarkup[section]())
  .filter(Boolean)
  .join('');

const revealTargets = document.querySelectorAll('.reveal-on-scroll');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, {
  rootMargin: '0px 0px -12% 0px',
  threshold: 0.12,
});

revealTargets.forEach((target) => revealObserver.observe(target));

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
