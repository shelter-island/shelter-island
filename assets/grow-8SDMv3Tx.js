import{t as e}from"./crewData-S_NY_971.js";var t={grow:{id:`grow`,name:`GROW`,kana:`グロウ`,catch:`踊る時は人間、普段はデビル。`,quote:`限界は、まだ入口だ。`,color:`#19d8ff`,backUrl:e(`index.html#crew`),images:{hero:e(`images/grow/character-devil.png`),human:e(`images/grow/character-human.png`),emotionProfile:e(`images/grow/emotion-profile.png`),emotionDevil:e(`images/grow/emotion-devil.png`),setting:e(`images/grow/setting-data.png`),castle:e(`images/grow/world-castle.png`),home:e(`images/grow/home.png`),bikeRide:e(`images/grow/bike-ride.png`),bikeDetail:e(`images/grow/bike-detail.png`)},profile:[[`名前`,`GROW / グロウ`],[`年齢`,`??歳`],[`好きなもの`,`重低音HIPHOP、深夜の街、仲間の成長を見ること`],[`苦手なもの`,`舐められること、弱い自分、感情を見せること`],[`性格`,`強く見せるけど、本当は仲間思い。`],[`二つの姿`,`踊る時は人間。普段はデビルの仮面を被る。`],[`口ぐせ`,`限界？まだ入口だろ。`],[`習慣`,`深呼吸をする。夜中にバスケをする。`],[`ストーリー`,`弱さを隠すために強さを選んだ。仲間と出会い、本当の自分で進み始める。`]],emotion:[[`本当の姿`,`繊細な心を隠し、デビルの仮面を被る。`],[`葛藤`,`強く見せることで自分を守る。`],[`覚悟`,`限界は自分で作るものじゃない。`],[`信念`,`仲間を信じ、支え合うこと。`],[`恐れ`,`弱さを知られること。`],[`Core Feeling`,`孤独、葛藤、信念、成長、絆、覚悟。`]],world:{title:`Devil Castle`,lead:`闇の中で、強くなる者たちの城。`,overview:`GROWの本当の居場所。外の世界のルールは通用しない。`,role:`弱さを隠さず、強さへ変えるための場所。`,rules:[`弱さを見せるな`,`恐怖を受け入れる`,`自分を超え続ける`,`仲間を信じ、支える`],symbols:[`デビルスカル`,`クラウン`,`X`,`ブルーフレイム`]},rooms:[[`入口`,`外の世界から城へ入る境界。`],[`玉座`,`強さと誇りの象徴。`],[`図書館`,`知識と過去を学ぶ場所。`],[`訓練場`,`踊りと闘志を磨く場所。`],[`地下`,`本音と向き合う暗い部屋。`],[`屋上`,`夜風で心を整える場所。`],[`寝室`,`一番素の自分に戻れる場所。`]],home:{title:`Home`,lines:[`外は強く`,`中は優しい`,`暖かい`,`本当の自分でいられる場所`]},bike:{title:`DEVIL GROW`,lines:[`青い炎`,`V-TWINエンジン`,`仲間との約束を刻んだシート`,`夜の街`,`孤独な道を走る時間`]},gallery:[[`Character`,`human`],[`Emotion`,`emotionProfile`],[`Castle`,`castle`],[`Home`,`home`],[`Bike`,`bikeRide`],[`Concept Art`,`setting`]],story:[[`幼少期`,`弱く見られることに怯えていた。`],[`葛藤`,`強い仮面の奥に、本当の心を隠した。`],[`仲間`,`信じられる相手と出会い、少しずつ変わった。`],[`今`,`自分を超えるために踊り続ける。`],[`未来`,`限界の向こうへ、仲間と進む。`]],connections:[[`THE SUN`,`光を思い出させてくれる存在。`],[`PEACE`,`静かな強さを知る仲間。`],[`CHOPPER`,`最後まで背中を預けられる守護者。`]],music:[`テーマ曲 Coming Soon`,`ダンス動画 Coming Soon`,`プレイリスト Coming Soon`]}}.grow,n=document.querySelector(`#app`),r=document.querySelector(`#backLink`);r&&(r.href=t.backUrl);var i=e=>t.images[e],a=e=>e.map(e=>`<li>${e}</li>`).join(``),o=e=>e.map(([e,t])=>`
  <div class="data-row">
    <dt>${e}</dt>
    <dd>${t}</dd>
  </div>
`).join(``),s=e=>e.map(([e,t])=>`
  <article class="text-card reveal-on-scroll">
    <span>${e}</span>
    <p>${t}</p>
  </article>
`).join(``),c=t.gallery.map(([e,t])=>`
  <figure class="gallery-card reveal-on-scroll">
    <img src="${i(t)}" alt="GROW ${e}" loading="lazy" />
    <figcaption>${e}</figcaption>
  </figure>
`).join(``);n.innerHTML=`
  <section class="grow-hero" id="top" aria-label="GROW TOP">
    <div class="hero-copy">
      <p class="detail-kicker">NO LIMIT CREW / 02</p>
      <h1>${t.name}</h1>
      <p class="hero-catch">${t.catch}</p>
      <a class="enter-cue" href="#character">ENTER / SCROLL</a>
    </div>
    <figure class="hero-figure">
      <img src="${i(`hero`)}" alt="GROW" />
    </figure>
  </section>

  <section class="detail-section split-section" id="character" aria-label="CHARACTER">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">CHARACTER</p>
      <h2>Two Faces.</h2>
    </div>
    <div class="profile-panel reveal-on-scroll">
      <img src="${i(`human`)}" alt="GROW human form" loading="lazy" />
      <dl class="profile-list">${o(t.profile)}</dl>
    </div>
  </section>

  <section class="detail-section" id="emotion" aria-label="EMOTION">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">EMOTION</p>
      <h2>Inside the Mask.</h2>
    </div>
    <div class="image-led">
      <img src="${i(`emotionProfile`)}" alt="GROW emotion profile" loading="lazy" />
      <div class="card-grid">${s(t.emotion)}</div>
    </div>
  </section>

  <section class="detail-section" id="world" aria-label="WORLD">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">WORLD</p>
      <h2>${t.world.title}</h2>
      <p>${t.world.lead}</p>
    </div>
    <div class="world-panel reveal-on-scroll">
      <img src="${i(`castle`)}" alt="Devil Castle" loading="lazy" />
      <div class="world-text">
        <p>${t.world.overview}</p>
        <p>${t.world.role}</p>
        <div class="mini-columns">
          <div>
            <span>Rules</span>
            <ul>${a(t.world.rules)}</ul>
          </div>
          <div>
            <span>Symbols</span>
            <ul>${a(t.world.symbols)}</ul>
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
    <div class="card-grid room-grid">${s(t.rooms)}</div>
  </section>

  <section class="detail-section image-band" id="home" aria-label="HOME">
    <img src="${i(`home`)}" alt="GROW home" loading="lazy" />
    <div class="band-copy reveal-on-scroll">
      <p class="detail-kicker">HOME</p>
      <h2>${t.home.title}</h2>
      <ul>${a(t.home.lines)}</ul>
    </div>
  </section>

  <section class="detail-section image-band reverse" id="bike" aria-label="BIKE">
    <img src="${i(`bikeRide`)}" alt="DEVIL GROW bike" loading="lazy" />
    <div class="band-copy reveal-on-scroll">
      <p class="detail-kicker">BIKE</p>
      <h2>${t.bike.title}</h2>
      <ul>${a(t.bike.lines)}</ul>
    </div>
  </section>

  <section class="detail-section" id="gallery" aria-label="GALLERY">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">GALLERY</p>
      <h2>Collected Images.</h2>
    </div>
    <div class="gallery-grid">${c}</div>
  </section>

  <section class="detail-section" id="story" aria-label="STORY">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">STORY</p>
      <h2>Still Growing.</h2>
    </div>
    <div class="timeline">${s(t.story)}</div>
  </section>

  <section class="detail-section" id="connection" aria-label="CONNECTION">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">CONNECTION</p>
      <h2>Crew Links.</h2>
    </div>
    <div class="card-grid">${s(t.connections)}</div>
  </section>

  <section class="detail-section" id="music" aria-label="MUSIC">
    <div class="section-title reveal-on-scroll">
      <p class="detail-kicker">MUSIC</p>
      <h2>Coming Soon.</h2>
    </div>
    <div class="music-panel reveal-on-scroll">
      ${t.music.map(e=>`<span>${e}</span>`).join(``)}
    </div>
  </section>

  <section class="quote-section" id="quote" aria-label="QUOTE">
    <p>${t.quote}</p>
    <span>${t.name}</span>
    <a href="${t.backUrl}">BACK TO ISLAND</a>
  </section>
`;var l=document.querySelectorAll(`.reveal-on-scroll`),u=new IntersectionObserver(e=>{e.forEach(e=>{e.isIntersecting&&(e.target.classList.add(`is-visible`),u.unobserve(e.target))})},{rootMargin:`0px 0px -12% 0px`,threshold:.12});l.forEach(e=>u.observe(e)),document.querySelectorAll(`a[href^="#"]`).forEach(e=>{e.addEventListener(`click`,t=>{let n=document.querySelector(e.getAttribute(`href`));n&&(t.preventDefault(),n.scrollIntoView({behavior:`smooth`,block:`start`}))})});