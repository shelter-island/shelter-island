import"./modulepreload-polyfill-Dezn_h7o.js";import{n as e}from"./crewData-4ONBVaDY.js";var t=document.querySelector(`#crewGrid`),n=document.querySelector(`#mapPins`);if(n){n.innerHTML=e.map(e=>`
    <a
      class="map-pin"
      data-crew-id="${e.id}"
      href="${e.detailUrl||`#${e.id}`}"
      style="--x: ${e.x}; --y: ${e.y}; --color: ${e.color}"
      aria-label="${e.area}"
    >
      <span>${e.number}</span>
      ${e.area}
    </a>
  `).join(``);let t=[...n.querySelectorAll(`.map-pin`)],r=e=>{t.forEach(t=>t.classList.toggle(`is-active`,t===e)),n.classList.toggle(`has-active`,!!e)};t.forEach(e=>{e.addEventListener(`mouseenter`,()=>r(e)),e.addEventListener(`focus`,()=>r(e)),e.addEventListener(`touchstart`,()=>r(e),{passive:!0})}),n.addEventListener(`mouseleave`,()=>r(null))}t&&(t.innerHTML=e.map(e=>`
    <article class="crew-card reveal-on-scroll" id="${e.id}" style="--accent: ${e.color}">
      <a class="crew-card-link" href="${e.detailUrl||`#${e.id}`}" aria-label="${e.name}">
        <img src="${e.image}" alt="${e.name}" loading="lazy" decoding="async" />
        <div class="crew-meta">
          <small>${e.number} / ${e.area}</small>
          <h3>${e.name}</h3>
          <p>${e.line}</p>
        </div>
      </a>
    </article>
  `).join(``));var r=document.querySelectorAll(`.reveal-on-scroll`),i=new IntersectionObserver(e=>{e.forEach(e=>{e.isIntersecting&&(e.target.classList.add(`is-visible`),i.unobserve(e.target))})},{rootMargin:`0px 0px -12% 0px`,threshold:.12});r.forEach(e=>i.observe(e)),document.querySelectorAll(`a[href^="#"]`).forEach(e=>{e.addEventListener(`click`,t=>{let n=document.querySelector(e.getAttribute(`href`));n&&(t.preventDefault(),n.scrollIntoView({behavior:`smooth`,block:`start`}))})});