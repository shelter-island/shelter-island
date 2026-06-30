import"./modulepreload-polyfill-Dezn_h7o.js";import{n as e}from"./crewData-Cw8zsfhP.js";var t=document.querySelector(`#crewGrid`),n=document.querySelector(`#mapPins`),r=document.querySelector(`#worldGuide`),i=document.querySelector(`#routeStrip`),a=new Map(e.map(e=>[e.id,e]));document.documentElement.style.setProperty(`--hero-map-image`,`url("./images/world/map/no-limit-crew-island.png")`);var o=e=>(e.related||[]).map(e=>a.get(e)).filter(Boolean).map(e=>`
    <a href="${e.detailUrl}" style="--route-color: ${e.color}">
      <span>${e.number}</span>
      ${e.name}
    </a>
  `).join(``),s=(t=e[0])=>{!r||!t||(r.style.setProperty(`--guide-color`,t.color),r.innerHTML=`
    <div class="guide-copy">
      <p class="kicker">AREA GUIDE / ${t.number}</p>
      <h3>${t.spot||t.area}</h3>
      <p>${t.walkHint||t.line}</p>
    </div>
    <div class="guide-presence">
      <span>CREW IN THIS AREA</span>
      <p>${t.presence||t.name}</p>
    </div>
    <div class="guide-links" aria-label="${t.name}に関連するCREW">
      ${o(t)}
    </div>
    <a class="guide-enter" href="${t.detailUrl}">VIEW ${t.area}</a>
  `)};if(i&&(i.innerHTML=e.map(e=>`
    <a class="route-card" href="${e.detailUrl}" style="--route-color: ${e.color}">
      <span>${e.number}</span>
      <strong>${e.spot||e.area}</strong>
      <small>${e.name} / ${e.area}</small>
    </a>
  `).join(``)),s(),n){n.innerHTML=e.map(e=>`
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
  `).join(``);let t=[...n.querySelectorAll(`.map-pin`)],r=e=>{t.forEach(t=>t.classList.toggle(`is-active`,t===e)),n.classList.toggle(`has-active`,!!e),e&&s(a.get(e.dataset.crewId))};t.forEach(e=>{e.addEventListener(`mouseenter`,()=>r(e)),e.addEventListener(`focus`,()=>r(e)),e.addEventListener(`touchstart`,()=>r(e),{passive:!0})}),n.addEventListener(`mouseleave`,()=>r(null))}t&&(t.innerHTML=e.map(e=>`
    <article class="crew-card reveal-on-scroll" id="${e.id}" style="--accent: ${e.color}">
      <a class="crew-card-link" href="${e.detailUrl||`#${e.id}`}" data-crew-id="${e.id}" aria-label="${e.name}">
        <img src="${e.image}" alt="${e.name}" loading="lazy" decoding="async" />
        <div class="crew-meta">
          <small>${e.number} / ${e.area}</small>
          <h3>${e.name}</h3>
          <p>${e.line}</p>
        </div>
      </a>
    </article>
  `).join(``),t.querySelectorAll(`.crew-card-link`).forEach(e=>{e.addEventListener(`mouseenter`,()=>s(a.get(e.dataset.crewId))),e.addEventListener(`focus`,()=>s(a.get(e.dataset.crewId)))}));var c=document.querySelectorAll(`.reveal-on-scroll`),l=new IntersectionObserver(e=>{e.forEach(e=>{e.isIntersecting&&(e.target.classList.add(`is-visible`),l.unobserve(e.target))})},{rootMargin:`0px 0px -12% 0px`,threshold:.12});c.forEach(e=>l.observe(e)),document.querySelectorAll(`a[href^="#"]`).forEach(e=>{e.addEventListener(`click`,t=>{let n=document.querySelector(e.getAttribute(`href`));n&&(t.preventDefault(),n.scrollIntoView({behavior:`smooth`,block:`start`}))})});