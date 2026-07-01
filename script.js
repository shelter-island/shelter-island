import { crew } from './data/crewData.js';

const crewGrid = document.querySelector('#crewGrid');
const mapPins = document.querySelector('#mapPins');
const worldGuide = document.querySelector('#worldGuide');
const routeStrip = document.querySelector('#routeStrip');
const crewById = new Map(crew.map((member) => [member.id, member]));

document.documentElement.style.setProperty(
  '--hero-map-image',
  `url("${new URL('images/world/map/no-limit-crew-island.png', document.baseURI).href}")`,
);

const relatedLinks = (member) => (member.related || [])
  .map((id) => crewById.get(id))
  .filter(Boolean)
  .map((related) => `
    <a href="${related.detailUrl}" style="--route-color: ${related.color}">
      <span>${related.number}</span>
      ${related.name}
    </a>
  `).join('');

const setGuide = (member = crew[0]) => {
  if (!worldGuide || !member) return;
  worldGuide.style.setProperty('--guide-color', member.color);
  worldGuide.innerHTML = `
    <div class="guide-copy">
      <p class="kicker">AREA GUIDE / ${member.number}</p>
      <h3>${member.spot || member.area}</h3>
      <p>${member.walkHint || member.line}</p>
    </div>
    <div class="guide-presence">
      <span>CREW IN THIS AREA</span>
      <p>${member.presence || member.name}</p>
    </div>
    <div class="guide-links" aria-label="${member.name}に関連するCREW">
      ${relatedLinks(member)}
    </div>
    <a class="guide-enter" href="${member.detailUrl}">VIEW ${member.area}</a>
  `;
};

if (routeStrip) {
  routeStrip.innerHTML = crew.map((member) => `
    <a class="route-card" href="${member.detailUrl}" style="--route-color: ${member.color}">
      <span>${member.number}</span>
      <strong>${member.spot || member.area}</strong>
      <small>${member.name} / ${member.area}</small>
    </a>
  `).join('');
}

setGuide();

if (mapPins) {
  mapPins.innerHTML = crew.map((member) => `
    <a
      class="map-pin"
      data-crew-id="${member.id}"
      href="${member.detailUrl || `#${member.id}`}"
      style="--x: ${member.x}; --y: ${member.y}; --color: ${member.color}"
      aria-label="${member.area}"
    >
      <span>${member.number}</span>
      ${member.area}
    </a>
  `).join('');

  const pins = [...mapPins.querySelectorAll('.map-pin')];
  const setActivePin = (pin) => {
    pins.forEach((item) => item.classList.toggle('is-active', item === pin));
    mapPins.classList.toggle('has-active', Boolean(pin));
    if (pin) setGuide(crewById.get(pin.dataset.crewId));
  };

  pins.forEach((pin) => {
    pin.addEventListener('mouseenter', () => setActivePin(pin));
    pin.addEventListener('focus', () => setActivePin(pin));
    pin.addEventListener('touchstart', () => setActivePin(pin), { passive: true });
  });

  mapPins.addEventListener('mouseleave', () => setActivePin(null));
}

if (crewGrid) {
  crewGrid.innerHTML = crew.map((member) => `
    <article class="crew-card reveal-on-scroll" id="${member.id}" style="--accent: ${member.color}">
      <a class="crew-card-link" href="${member.detailUrl || `#${member.id}`}" data-crew-id="${member.id}" aria-label="${member.name}">
        <img src="${member.image}" alt="${member.name}" loading="lazy" decoding="async" />
        <div class="crew-meta">
          <small>${member.number} / ${member.area}</small>
          <h3>${member.name}</h3>
          <p>${member.line}</p>
        </div>
      </a>
    </article>
  `).join('');

  crewGrid.querySelectorAll('.crew-card-link').forEach((link) => {
    link.addEventListener('mouseenter', () => setGuide(crewById.get(link.dataset.crewId)));
    link.addEventListener('focus', () => setGuide(crewById.get(link.dataset.crewId)));
  });
}

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
