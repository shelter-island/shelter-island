import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, Sun, Music, Map, Bike, Home, Newspaper, Package, X } from 'lucide-react';
import './style.css';

const cards = [
  {
    id: 'world',
    title: 'WORLD VIEW CARD',
    subtitle: 'THE SUN AREA',
    image: '/images/world-view-card.png',
    tag: 'MAP',
    description: 'SUN AREA全体を見渡せるメインマップ。海、橋、ガレージ、カフェ、キャンプがつながる世界の入口。',
  },
  {
    id: 'sun',
    title: 'THE SUN',
    subtitle: 'なんとかなるって。',
    image: '/images/the-sun-character.png',
    tag: 'CHARACTER',
    description: 'ちょっとダメだけど愛せる、SUN WORLDのムードメーカー。自由・笑顔・自然を大事にする太陽みたいな存在。',
  },
  {
    id: 'profile',
    title: 'THE SUN PROFILE',
    subtitle: 'MOOD MAKER / PEACE KEEPER',
    image: '/images/the-sun-profile.png',
    tag: 'DATA',
    description: 'THE SUNの性格、二面性、アイテム、世界観をまとめたプロフィールカード。表は明るく、裏は少し繊細。',
  },
  {
    id: 'tour',
    title: 'THE SUN TOURING GUIDE',
    subtitle: 'SUNSET COAST ROUTE',
    image: '/images/touring-guide.png',
    tag: 'GUIDE',
    description: 'バイクでSUN AREAを旅するためのツーリングガイド。時間、ルート、寄り道、夜プランまで入った旅カード。',
  },
  {
    id: 'bike',
    title: 'THE SUN BIKE',
    subtitle: 'RIDE FREE',
    image: '/images/the-sun-bike.png',
    tag: 'BIKE',
    description: 'THE SUNの相棒バイク。夕焼け、ランタン、旅荷物、ステッカーが詰まった自由の乗り物。',
  },
  {
    id: 'bikefile',
    title: 'BIKE SETTING FILE',
    subtitle: 'SUN-GT125',
    image: '/images/bike-setting-file.png',
    tag: 'BIKE',
    description: 'バイクの細かい設定資料。パーツ、音、乗り方、好き嫌い、メモリーまで入ったカスタムファイル。',
  },
  {
    id: 'housefile',
    title: 'SUN HOUSE FILE',
    subtitle: '疲れたら帰る場所',
    image: '/images/sun-house-file.png',
    tag: 'HOUSE',
    description: 'SUN HOUSEの外観、部屋、家具、ルールをまとめた家カード。ここは勝つ場所ではなく、帰ってくる場所。',
  },
  {
    id: 'village',
    title: 'THE SUN VILLAGE',
    subtitle: '帰ってこれる場所',
    image: '/images/sun-village.png',
    tag: 'MAP',
    description: '木の家、ロープ橋、バナナ屋台、ランタン通り。SUNの文化と空気感をまとめた村カード。',
  },
  {
    id: 'house',
    title: 'SUN HOUSE',
    subtitle: 'とりあえず来いよ。',
    image: '/images/sun-house.png',
    tag: 'HOUSE',
    description: '大きな木の上にある秘密基地。ロープ橋、ハンモック、ランタン、バナナの匂いがある安心の場所。',
  },
  {
    id: 'newspaper',
    title: 'SUN VILLAGE NEWSPAPER',
    subtitle: '今日も事件が起きている',
    image: '/images/sun-newspaper.png',
    tag: 'NEWS',
    description: 'SUN VILLAGEの日常ニュース。バナナ不足、秘密ライブ、ロープ橋修理など、どうでもいいけど大事な出来事。',
  },
  {
    id: 'worldnews',
    title: 'WORLD NEWS',
    subtitle: 'SUN VILLAGE TIMES',
    image: '/images/world-news.png',
    tag: 'NEWS',
    description: '村のニュースを一枚にまとめたワールドニュースカード。読むだけでこの街の一日が見えてくる。',
  },
  {
    id: 'item',
    title: 'WORLD ITEM FILE',
    subtitle: 'たいせつなモノたち',
    image: '/images/world-item-file.png',
    tag: 'ITEM',
    description: 'ステッカー、ランタン、お守り、レコード、ドリンク、パンケーキ。戦う道具ではなく、気持ちを整える道具。',
  },
  {
    id: 'mini',
    title: 'SUN WORLD MINI CARDS',
    subtitle: '小さな遊びのカード集',
    image: '/images/mini-cards.png',
    tag: 'ITEM',
    description: 'ラジオ、クエスト、ステッカー、レシピ、夜マップなど、SUN WORLDを遊びに変えるカードたち。',
  },
  {
    id: 'passport',
    title: 'SUN PASSPORT',
    subtitle: 'どこでも行ける券',
    image: '/images/sun-passport.png',
    tag: 'ITEM',
    description: '天気、感情、チケット、言葉、夜ラジオまで入ったパスポートカード。世界を持ち歩くための一枚。',
  },
];

const filters = ['ALL', 'CHARACTER', 'MAP', 'HOUSE', 'BIKE', 'ITEM', 'NEWS'];

function iconFor(tag) {
  const props = { size: 18 };
  if (tag === 'MAP') return <Map {...props} />;
  if (tag === 'HOUSE') return <Home {...props} />;
  if (tag === 'BIKE') return <Bike {...props} />;
  if (tag === 'ITEM') return <Package {...props} />;
  if (tag === 'NEWS') return <Newspaper {...props} />;
  return <Sun {...props} />;
}

function App() {
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [selectedCard, setSelectedCard] = useState(cards[1]);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchFilter = selectedFilter === 'ALL' || card.tag === selectedFilter;
      const text = `${card.title} ${card.subtitle} ${card.description}`.toLowerCase();
      const matchQuery = text.includes(query.toLowerCase());
      return matchFilter && matchQuery;
    });
  }, [selectedFilter, query]);

  const openCard = (card) => {
    setSelectedCard(card);
    setIsOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app">
      <div className="glow glowTop" />
      <div className="glow glowBottom" />

      <main className="container">
        <header className="hero">
          <div>
            <div className="eyebrow">SHELTER CREW / NO LIMIT CREW</div>
            <h1>THE SUN ZUKAN</h1>
            <p>RIDE FREE. SMILE MORE. LOVE NATURE.</p>
          </div>
          <div className="badge">
            <span>TODAY IS</span>
            <strong>A GOOD DAY.</strong>
          </div>
        </header>

        <section className="viewer">
          <div className="imagePanel">
            <img src={selectedCard.image} alt={selectedCard.title} />
          </div>

          <div className="infoPanel">
            <div className="tag">{iconFor(selectedCard.tag)} {selectedCard.tag}</div>
            <h2>{selectedCard.title}</h2>
            <h3>{selectedCard.subtitle}</h3>
            <p>{selectedCard.description}</p>

            <div className="dataGrid">
              <div><span>COLOR</span><b>SUN YELLOW</b></div>
              <div><span>VIBE</span><b>GOOD VIBES</b></div>
              <div><span>AIR</span><b>SUNSET BREEZE</b></div>
              <div><span>RULE</span><b>なんとかなる</b></div>
            </div>
          </div>
        </section>

        <section className="controls">
          <div className="search">
            <Search size={18} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="カードを検索..." />
          </div>

          <div className="filters">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={selectedFilter === filter ? 'active' : ''}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        <section className="grid">
          {filteredCards.map((card) => (
            <button key={card.id} className="card" onClick={() => openCard(card)}>
              <div className="thumb">
                <img src={card.image} alt={card.title} />
              </div>
              <div className="cardText">
                <span>{card.tag}</span>
                <h4>{card.title}</h4>
                <p>{card.subtitle}</p>
              </div>
            </button>
          ))}
        </section>

        <section className="radio">
          <Music size={34} />
          <h2>SUN RADIO</h2>
          <p>波の音、カセットノイズ、夜のラジオ。ここから音楽ページにも広げられる。</p>
          <button>PLAY MUSIC</button>
        </section>

        <footer>“笑って終われた日なら、たぶん今日は勝ち。”</footer>
      </main>

      {isOpen && (
        <div className="modal" onClick={() => setIsOpen(false)}>
          <button className="close" onClick={() => setIsOpen(false)}><X /></button>
          <img src={selectedCard.image} alt={selectedCard.title} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
