const assetPath = (path) => `${import.meta.env.BASE_URL}${path}`;

const crew = [
  {
    id: 'the-sun',
    number: '01',
    name: 'THE SUN',
    area: 'THE SUN',
    line: 'Today is a good day.',
    color: '#ffd21f',
    image: assetPath('images/world/crew/the-sun.png'),
    x: '30%',
    y: '18%',
  },
  {
    id: 'grow',
    number: '02',
    name: 'GROW',
    area: 'GROW',
    line: 'No limit, no excuse.',
    color: '#19d8ff',
    image: assetPath('images/world/crew/grow.png'),
    x: '57%',
    y: '18%',
  },
  {
    id: 'mayuki',
    number: '03',
    name: 'MAYUKI',
    area: 'MAYUKI',
    line: 'It is okay to be afraid of freedom.',
    color: '#ff4fae',
    image: assetPath('images/world/crew/mayuki.png'),
    x: '22%',
    y: '34%',
  },
  {
    id: 'baby-face',
    number: '04',
    name: 'BABY FACE',
    area: 'BABY FACE',
    line: 'Silent night, hidden emotions.',
    color: '#125dff',
    image: assetPath('images/world/crew/baby-face.png'),
    x: '84%',
    y: '39%',
  },
  {
    id: 'queen-bee',
    number: '05',
    name: 'QUEEN BEE',
    area: 'QUEEN BEE',
    line: 'Lead, protect, inspire.',
    color: '#d7a10e',
    image: assetPath('images/world/crew/queen-bee.png'),
    x: '18%',
    y: '58%',
  },
  {
    id: 'red-braids',
    number: '06',
    name: 'RED BRAIDS',
    area: 'RED BRAIDS',
    line: 'Make peace, not war.',
    color: '#ff3434',
    image: assetPath('images/world/crew/red-braids.png'),
    x: '50%',
    y: '83%',
  },
  {
    id: 'giggles',
    number: '07',
    name: 'GIGGLES',
    area: 'GIGGLES CIRCUS',
    line: 'No limit, just giggles.',
    color: '#9d42ff',
    image: assetPath('images/world/crew/giggles.png'),
    x: '73%',
    y: '82%',
  },
  {
    id: 'peace',
    number: '08',
    name: 'PEACE',
    area: 'PEACE',
    line: 'Make peace, not war.',
    color: '#19d8ff',
    image: assetPath('images/world/crew/peace.png'),
    x: '83%',
    y: '60%',
  },
  {
    id: 'break-up',
    number: '09',
    name: 'BREAK UP',
    area: 'BREAK UP',
    line: 'Cry, dance, rise.',
    color: '#ff2b9f',
    image: assetPath('images/world/crew/break-up.png'),
    x: '18%',
    y: '82%',
  },
  {
    id: 'chopper',
    number: '10',
    name: 'CHOPPER',
    area: 'CHOPPER',
    line: 'Protect, ride, loyalty.',
    color: '#7b2cff',
    image: assetPath('images/world/crew/chopper.png'),
    x: '78%',
    y: '18%',
  },
  {
    id: 'exprose',
    number: '11',
    name: 'EXPROSE',
    area: 'EXPROSE',
    line: 'The hidden heart blooms in the dark.',
    color: '#b64cff',
    image: assetPath('images/world/crew/exprose.png'),
    x: '60%',
    y: '50%',
  },
];

const crewGrid = document.querySelector('#crewGrid');
const mapPins = document.querySelector('#mapPins');

if (mapPins) {
  mapPins.innerHTML = crew.map((member) => `
    <a
      class="map-pin"
      href="#${member.id}"
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
      <img src="${member.image}" alt="${member.name}" loading="lazy" />
      <div class="crew-meta">
        <small>${member.number} / ${member.area}</small>
        <h3>${member.name}</h3>
        <p>${member.line}</p>
      </div>
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
