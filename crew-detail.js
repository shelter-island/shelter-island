import { characterDetails } from './data/characterDetailData.js';

const params = new URLSearchParams(window.location.search);
const requestedId = params.get('id') || document.body.dataset.defaultCrew || 'grow';
const character = characterDetails[requestedId] || characterDetails.grow;
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
const image = (key) => character.images[key];
const sectionLabel = (section, fallback) => character.labels?.[section] || fallback;
const sectionImage = (section, fallback) => image(character.sectionImages?.[section] || fallback);
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

const galleryCards = (character.gallery || []).map(([label, imageKey]) => `
  <figure class="gallery-card reveal-on-scroll">
    <img src="${image(imageKey)}" alt="${character.name} ${label}" loading="lazy" />
    <figcaption>${label}</figcaption>
  </figure>
`).join('');

const sectionMarkup = {
  hero: () => `
  <section class="grow-hero" id="top" aria-label="${character.name} TOP">
    <div class="hero-copy">
      <p class="detail-kicker">${character.crewLabel} / ${character.number}</p>
      <h1>${character.name}</h1>
      <p class="hero-catch">${character.catch}</p>
      <a class="enter-cue" href="#character">ENTER / SCROLL</a>
    </div>
    <figure class="hero-figure">
      <img src="${image('hero')}" alt="${character.name}" />
    </figure>
  </section>`,

  character: () => `
  <section class="detail-section split-section" id="character" aria-label="CHARACTER">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">${sectionLabel('character', 'CHARACTER')}</p>
      <h2>${character.headings?.character || 'Two Faces.'}</h2>
    </div>
    <div class="profile-panel reveal-on-scroll">
      <img src="${sectionImage('character', 'human')}" alt="${character.name} character" loading="lazy" />
      <dl class="profile-list">${dataRows(character.profile)}</dl>
    </div>
  </section>`,

  emotion: () => `
  <section class="detail-section" id="emotion" aria-label="EMOTION">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">${sectionLabel('emotion', 'EMOTION')}</p>
      <h2>${character.headings?.emotion || 'Inside the Mask.'}</h2>
    </div>
    <div class="image-led">
      <img src="${sectionImage('emotion', 'emotionProfile')}" alt="${character.name} ${sectionLabel('emotion', 'emotion')}" loading="lazy" />
      <div class="card-grid">${textCards(character.emotion)}</div>
    </div>
  </section>`,

  world: () => `
  <section class="detail-section" id="world" aria-label="WORLD">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">${sectionLabel('world', 'WORLD')}</p>
      <h2>${character.world.title}</h2>
      <p>${character.world.lead}</p>
    </div>
    <div class="world-panel reveal-on-scroll">
      <img src="${sectionImage('world', 'castle')}" alt="${character.world.title}" loading="lazy" />
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
  </section>`,

  rooms: () => `
  <section class="detail-section" id="rooms" aria-label="CASTLE MAP AND ROOMS">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">${sectionLabel('rooms', 'CASTLE MAP / ROOMS')}</p>
      <h2>${character.headings?.rooms || 'Rooms to Enter.'}</h2>
    </div>
    <div class="card-grid room-grid">${textCards(character.rooms)}</div>
  </section>`,

  home: () => `
  <section class="detail-section image-band" id="home" aria-label="HOME">
    <img src="${sectionImage('home', 'home')}" alt="${character.name} ${sectionLabel('home', 'home')}" loading="lazy" />
    <div class="band-copy reveal-on-scroll">
      <p class="detail-kicker">${sectionLabel('home', 'HOME')}</p>
      <h2>${character.home.title}</h2>
      <ul>${list(character.home.lines)}</ul>
    </div>
  </section>`,

  bike: () => `
  <section class="detail-section image-band reverse" id="bike" aria-label="BIKE">
    <img src="${sectionImage('bike', 'bikeRide')}" alt="${character.bike.title} bike" loading="lazy" />
    <div class="band-copy reveal-on-scroll">
      <p class="detail-kicker">${sectionLabel('bike', 'BIKE')}</p>
      <h2>${character.bike.title}</h2>
      <ul>${list(character.bike.lines)}</ul>
    </div>
  </section>`,

  gallery: () => `
  <section class="detail-section" id="gallery" aria-label="GALLERY">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">${sectionLabel('gallery', 'GALLERY')}</p>
      <h2>${character.headings?.gallery || 'Collected Images.'}</h2>
    </div>
    <div class="gallery-grid">${galleryCards}</div>
  </section>`,

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
      <h2>${character.headings?.music || 'Coming Soon.'}</h2>
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

app.innerHTML = (character.sectionOrder || defaultSectionOrder)
  .filter((section) => sectionMarkup[section] && isEnabled(section))
  .map((section) => sectionMarkup[section]())
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
