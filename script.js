import { crew } from './data/crewData.js';

const crewGrid = document.querySelector('#crewGrid');
const mapPins = document.querySelector('#mapPins');

if (mapPins) {
  mapPins.innerHTML = crew.map((member) => `
    <a
      class="map-pin"
      href="${member.detailUrl || `#${member.id}`}"
      style="--x: ${member.x}; --y: ${member.y}; --color: ${member.color}"
      aria-label="${member.area}"
    >
      <span>${member.number}</span>
      ${member.area}
    </a>
  `).join('');
}

if (crewGrid) {
  crewGrid.innerHTML = crew.map((member) => `
    <article class="crew-card reveal-on-scroll" id="${member.id}" style="--accent: ${member.color}">
      <a class="crew-card-link" href="${member.detailUrl || `#${member.id}`}" aria-label="${member.name}">
        <img src="${member.image}" alt="${member.name}" loading="lazy" />
        <div class="crew-meta">
          <small>${member.number} / ${member.area}</small>
          <h3>${member.name}</h3>
          <p>${member.line}</p>
        </div>
      </a>
    </article>
  `).join('');
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
