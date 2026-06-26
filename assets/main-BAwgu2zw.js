import{n as e}from"./crewData-S_NY_971.js";var t=document.querySelector(`#crewGrid`),n=document.querySelector(`#mapPins`);n&&(n.innerHTML=e.map(e=>`
    <a
      class="map-pin"
      href="${e.detailUrl||`#${e.id}`}"
      style="--x: ${e.x}; --y: ${e.y}; --color: ${e.color}"
      aria-label="${e.area}"
    >
      <span>${e.number}</span>
      ${e.area}
    </a>
  `).join(``)),t&&(t.innerHTML=e.map(e=>`
    <article class="crew-card reveal-on-scroll" id="${e.id}" style="--accent: ${e.color}">
      <a class="crew-card-link" href="${e.detailUrl||`#${e.id}`}" aria-label="${e.name}">
        <img src="${e.image}" alt="${e.name}" loading="lazy" />
        <div class="crew-meta">
          <small>${e.number} / ${e.area}</small>
          <h3>${e.name}</h3>
          <p>${e.line}</p>
        </div>
      </a>
    </article>
  `).join(``));var r=document.querySelectorAll(`.reveal-on-scroll`),i=new IntersectionObserver(e=>{e.forEach(e=>{e.isIntersecting&&(e.target.classList.add(`is-visible`),i.unobserve(e.target))})},{rootMargin:`0px 0px -12% 0px`,threshold:.12});r.forEach(e=>i.observe(e)),document.querySelectorAll(`a[href^="#"]`).forEach(e=>{e.addEventListener(`click`,t=>{let n=document.querySelector(e.getAttribute(`href`));n&&(t.preventDefault(),n.scrollIntoView({behavior:`smooth`,block:`start`}))})});