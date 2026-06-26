import { characterDetails } from './data/characterDetailData.js';

const character = characterDetails.grow;
const app = document.querySelector('#app');
const backLink = document.querySelector('#backLink');

if (backLink) {
  backLink.href = character.backUrl;
}

const image = (key) => character.images[key];
const list = (items) => items.map((item) => `<li>${item}</li>`).join('');
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

const galleryCards = character.gallery.map(([label, imageKey]) => `
  <figure class="gallery-card reveal-on-scroll">
    <img src="${image(imageKey)}" alt="GROW ${label}" loading="lazy" />
    <figcaption>${label}</figcaption>
  </figure>
`).join('');

app.innerHTML = `
  <section class="grow-hero" id="top" aria-label="GROW TOP">
    <div class="hero-copy">
      <p class="detail-kicker">NO LIMIT CREW / 02</p>
      <h1>${character.name}</h1>
      <p class="hero-catch">${character.catch}</p>
      <a class="enter-cue" href="#character">ENTER / SCROLL</a>
    </div>
    <figure class="hero-figure">
      <img src="${image('hero')}" alt="GROW" />
    </figure>
  </section>

  <section class="detail-section split-section" id="character" aria-label="CHARACTER">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">CHARACTER</p>
      <h2>Two Faces.</h2>
    </div>
    <div class="profile-panel reveal-on-scroll">
      <img src="${image('human')}" alt="GROW human form" loading="lazy" />
      <dl class="profile-list">${dataRows(character.profile)}</dl>
    </div>
  </section>

  <section class="detail-section" id="emotion" aria-label="EMOTION">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">EMOTION</p>
      <h2>Inside the Mask.</h2>
    </div>
    <div class="image-led">
      <img src="${image('emotionProfile')}" alt="GROW emotion profile" loading="lazy" />
      <div class="card-grid">${textCards(character.emotion)}</div>
    </div>
  </section>

  <section class="detail-section" id="world" aria-label="WORLD">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">WORLD</p>
      <h2>${character.world.title}</h2>
      <p>${character.world.lead}</p>
    </div>
    <div class="world-panel reveal-on-scroll">
      <img src="${image('castle')}" alt="Devil Castle" loading="lazy" />
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
  </section>

  <section class="detail-section" id="rooms" aria-label="CASTLE MAP AND ROOMS">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">CASTLE MAP / ROOMS</p>
      <h2>Rooms to Enter.</h2>
    </div>
    <div class="card-grid room-grid">${textCards(character.rooms)}</div>
  </section>

  <section class="detail-section image-band" id="home" aria-label="HOME">
    <img src="${image('home')}" alt="GROW home" loading="lazy" />
    <div class="band-copy reveal-on-scroll">
      <p class="detail-kicker">HOME</p>
      <h2>${character.home.title}</h2>
      <ul>${list(character.home.lines)}</ul>
    </div>
  </section>

  <section class="detail-section image-band reverse" id="bike" aria-label="BIKE">
    <img src="${image('bikeRide')}" alt="DEVIL GROW bike" loading="lazy" />
    <div class="band-copy reveal-on-scroll">
      <p class="detail-kicker">BIKE</p>
      <h2>${character.bike.title}</h2>
      <ul>${list(character.bike.lines)}</ul>
    </div>
  </section>

  <section class="detail-section" id="gallery" aria-label="GALLERY">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">GALLERY</p>
      <h2>Collected Images.</h2>
    </div>
    <div class="gallery-grid">${galleryCards}</div>
  </section>

  <section class="detail-section" id="story" aria-label="STORY">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">STORY</p>
      <h2>Still Growing.</h2>
    </div>
    <div class="timeline">${textCards(character.story)}</div>
  </section>

  <section class="detail-section" id="connection" aria-label="CONNECTION">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">CONNECTION</p>
      <h2>Crew Links.</h2>
    </div>
    <div class="card-grid">${textCards(character.connections)}</div>
  </section>

  <section class="detail-section" id="music" aria-label="MUSIC">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">MUSIC</p>
      <h2>Coming Soon.</h2>
    </div>
    <div class="music-panel reveal-on-scroll">
      ${character.music.map((item) => `<span>${item}</span>`).join('')}
    </div>
  </section>

  <section class="quote-section" id="quote" aria-label="QUOTE">
    <p>${character.quote}</p>
    <span>${character.name}</span>
    <a href="${character.backUrl}">BACK TO ISLAND</a>
  </section>
`;

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
