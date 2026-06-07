# SUN住人追加マニュアル

tags:
  - the_sun_area
  - resident
  - character
  - development_guide

## 概要

SUN AREAへ新しい住人を追加するための手順。

住人の定義と性格は `src/js/residentConfig.js` で管理し、`src/js/main.jsx` が画面へ接続する。
有効な住人は、それぞれ独立して移動・待機・配置物への反応・特別行動を行う。

## 1. 住人画像の置き場所

画像は次のフォルダへ保存する。

```text
public/images/characters/
```

例:

```text
public/images/characters/saru.png
public/images/characters/new_resident.png
```

推奨:

- PNGまたはWebP
- 背景透過
- 全身が入っている
- 足元に大きな余白を作らない
- ファイル名は半角英数字とアンダースコアを使う

黒い背景などが残っていると、島の上で四角く見える。追加前に透過状態を確認する。

## 2. residentDefinitionsへの追加方法

編集ファイル:

```text
src/js/residentConfig.js
```

`createResidentDefinitions` が返す `residentDefinitions` 配列へ、次の形式で1件追加する。

```jsx
{
  id: 'new_resident',
  name: 'New Resident',
  image: assetPath('images/characters/new_resident.png'),
  personality: 'relaxed',
  favoriteSpot: 'tree',
  position: { x: 40, y: 55 },
  enabled: true,
},
```

各項目:

| 項目 | 内容 |
| --- | --- |
| `id` | 住人を区別する固有ID。他の住人と重複させない |
| `name` | アクセシビリティ用の名前。通常の画面には表示されない |
| `image` | `public/`より下の画像パス |
| `personality` | 使用する性格設定のキー |
| `favoriteSpot` | 好きな場所。性格の候補内から指定する。省略時は住人IDから自動決定 |
| `position` | 初期位置。島ステージ内のパーセント座標 |
| `enabled` | `true`で登場、`false`で定義だけ残して非表示 |

現在の1体目:

```jsx
{
  id: 'sun_monkey',
  name: 'SUN',
  image: assetPath('images/characters/saru.png'),
  personality: 'relaxed',
  favoriteSpot: 'tree',
  position: { x: 54, y: 62 },
  enabled: true,
},
```

## 3. personalityの指定方法

性格は `src/js/residentConfig.js` の `residentPersonalities` に定義する。

現在使用できる性格:

```jsx
personality: 'relaxed'
```

`relaxed`は、日中に木とdockを少し好み、夜はライトへ行きやすい。ベンチや通常待機も少し長い。
お気に入り候補は木・dock・ライトで、お気に入りでは移動先への選ばれやすさ、滞在時間、静かな気配演出が少しだけ増える。

新しい性格を追加する例:

```jsx
const residentPersonalities = {
  relaxed: {
    // 既存設定
  },
  active: {
    destinationWeights: {
      day: {
        tree: 0.9,
        dock: 1.2,
      },
      night: {
        light: 0.9,
      },
    },
    favoriteSpotCandidates: ['dock', 'bench'],
    favoriteSpotModifiers: {
      weightMultiplier: 1.12,
      pauseBonus: 800,
      presenceChanceBonus: 0.04,
      specialActionChanceBonus: 0.01,
    },
    pauseBonuses: {
      bench: 0,
    },
    routinePauseBonus: {
      day: -800,
      night: -400,
    },
  },
};
```

追加後、住人定義で指定する。

```jsx
personality: 'active'
```

設定されていない性格名を指定した場合は、現在は `relaxed`へフォールバックする。

`favoriteSpot`は画面やセリフには表示されず、行動の偏りだけに使われる。
指定を省略した場合は、`favoriteSpotCandidates`から住人IDに応じた1か所が選ばれ、同じ住人では安定した好みになる。

## 4. enabledの使い方

```jsx
enabled: true
```

- `true`: 住人を表示し、生活サイクルを開始する
- `false`: 定義は残すが、表示も生活サイクルも開始しない

開発中の仮住人や、後から登場させたい住人は `false`にしておく。

複数住人の確認時だけ `true`にし、確認後に戻す使い方もできる。

## 5. 初期位置の決め方

```jsx
position: { x: 40, y: 55 }
```

`x`と`y`はステージ内のパーセント座標。

- `x`: 左から右へ増える
- `y`: 上から下へ増える
- 足元がこの座標へ接地する

最初は次の範囲から選ぶと安全。

```text
x: 30〜70
y: 40〜70
```

複数住人では初期位置を離す。

```jsx
position: { x: 54, y: 62 } // 1体目
position: { x: 36, y: 48 } // 2体目
```

自律移動と手動Moveは `clampResidentPosition` により島内へ補正される。

## 6. サイズ調整の場所

編集ファイル:

```text
src/css/style.css
```

通常サイズ:

```css
.sunResident {
  width: 44px;
}
```

iPhoneなど幅760px以下:

```css
@media (max-width: 760px) {
  .sunResident {
    width: 34px;
  }
}
```

すべての住人に同じサイズが適用される。

キャラごとにサイズを変える必要が出た場合は、住人要素へID由来のクラスまたはCSS変数を追加して調整する。現状では画像ごとの個別サイズ機能はない。

足元位置は次で合わせている。

```css
transform: translate(-50%, -100%);
```

画像を変更して浮いて見える場合は、まず画像下部の透明余白を確認する。共通CSSを変更すると全住人へ影響するため注意する。

## 7. 手動Moveの対象ルール

Moveボタンを選び島をタップすると、次の条件に合う最初の住人が動く。

```jsx
const controlledResident = residents.find((resident) => resident.enabled);
```

つまり、現在は `residentConfig.js` の `createResidentDefinitions` 内で先に定義された有効住人が手動Moveの対象になる。

通常は1体目の `sun_monkey`。

2体目以降は自律移動だけを行う。将来、操作対象の切り替えUIを追加する場合は、この選択処理を変更する。

## 8. residentHistoryについて

住人の行動は、画面に表示しない内部履歴 `residentHistoryRef` に記録される。
履歴は住人IDごとに分かれ、各住人の最近10件だけをメモリ内に保持する。

記録例:

```jsx
{
  residentId: 'sun_monkey',
  spot: 'tree',
  timeOfDay: 'day',
  actionType: 'favorite',
  timestamp: '2026-06-06T12:34:56.789Z',
}
```

主な項目:

| 項目 | 内容 |
| --- | --- |
| `residentId` | 行動した住人のID |
| `spot` | `tree`、`bench`、`dock`、`light`などの行き先 |
| `timeOfDay` | `day`または`night` |
| `actionType` | `move`、`stay`、`special`、`favorite` |
| `timestamp` | 行動を記録したISO形式の時刻 |

手動Moveでは、追加情報として `source: 'manual'`と移動先の`position`も記録される。

現在、この履歴はUI、セリフ、保存データには使用されない。
ページを再読み込みすると消え、`localStorage`にも保存されない。

将来は履歴を集計して、次の機能へ利用できる。

- SUNの日記
- よく行く場所
- 今日の行動
- 思い出や図鑑の解放条件

画面表示へ使う場合は、必要なタイミングでstateへ同期するか、保存機能と接続する。

## 9. SUNの日記候補とmemory summary

`residentHistory`から「SUNの日記」「今日の思い出」「図鑑コメント」の候補を作るため、次の関数を追加している。

編集ファイル:

```text
src/js/residentMemory.js
```

### getResidentHistory

住人IDを指定し、最近の履歴を新しい配列として取得する。

```jsx
const history = getResidentHistory(
  residentHistoryRef.current,
  'sun_monkey',
);
```

取得件数を指定する場合:

```jsx
const history = getResidentHistory(
  residentHistoryRef.current,
  'sun_monkey',
  5,
);
```

存在しない住人IDや不正な履歴を渡した場合は空配列を返す。返却した配列や項目を変更しても、元の`residentHistoryRef`には影響しない。

### createResidentMemorySummary

取得した履歴を軽く集計し、日記や思い出に使える短い文章候補を返す。

```jsx
const summaries = createResidentMemorySummary(history);
```

生成候補:

```text
木の近くでよく過ごしていた
夜はライトのそばにいた
dockで海を見ていた
お気に入りの場所に長くいた
```

戻り値は文字列の配列で、標準では最大3件。2件だけ必要な場合は次のように指定する。

```jsx
const summaries = createResidentMemorySummary(history, 2);
```

集計は最近の少数履歴を対象に、必要な時だけ実行する。通常の移動処理中には呼ばれないため、iPhoneへの継続的な負荷は増えない。

### 現在の扱い

この機能は内部用の土台で、現在は画面に表示しない。

- 日記ボタンは追加しない
- セリフには使用しない
- `console.log`は行わない
- `localStorage`には保存しない
- ページを再読み込みすると履歴は消える

`main.jsx`のデバッグ表示では、`getResidentHistory`と`createResidentMemorySummary`を組み合わせて確認している。通常画面には表示せず、将来の日記画面や図鑑コメント実装時に接続できる。

将来は、要約候補を日付、天候、解放したカード、島の配置物などと組み合わせることで、次の形へ発展できる。

- SUNの日記
- 今日の思い出
- MY ZUKANの住人コメント
- お気に入り場所の記録
- 特定行動による思い出カード解放

## 10. 開発用デバッグ表示

`residentHistory`とmemory summaryを画面上で確認するための開発用パネルがある。

編集ファイル:

```text
src/js/residentConfig.js
```

通常は次のフラグを`false`にする。

```jsx
export const SHOW_RESIDENT_DEBUG = false;
```

`false`の場合:

- デバッグ用DOMを表示しない
- residentHistory更新による追加レンダーを行わない
- 通常の見た目と操作を変えない

開発中に一時的に`true`へ変更すると、SUN AREAのビルド画面右上に小さな半透明パネルが表示される。

```jsx
export const SHOW_RESIDENT_DEBUG = true;
```

パネルで確認できる内容:

- resident ID
- 最近5件の行動ログ
- `createResidentMemorySummary`が生成した最大3件の要約

パネルは`pointer-events: none`で、島やボタンのタップを妨げない。iPhoneでは幅と高さをさらに抑える。

確認後は必ず`false`へ戻す。本番では表示せず、`console.log`や`localStorage`も使用しない。
常時state更新を行わない現在の構造は、住人の移動描画へ余分な再レンダリングを追加しない。

## 11. 住人が残す痕跡

住人は低い確率で、滞在した場所に小さな痕跡を残す。

痕跡の例:

- 木の近くの`🌿`
- 小さな足跡`· ·`
- 静かな気配`…`
- 光や空を見た後の`☀️`

発生候補:

- 特別行動の後
- `favoriteSpot`で過ごした後
- 長めのstayの後

特別行動後が最も発生しやすく、通常の長時間stayではかなり低い確率にしている。痕跡は滞在の終わり近くに現れ、8〜13秒程度でCSSフェードして自然に消える。

各痕跡は内部的に次の情報を持つ。

```jsx
{
  id: 'sun_monkey_0',
  residentId: 'sun_monkey',
  reason: 'favorite',
  spot: 'tree',
  mark: '🌿',
  x: 52,
  y: 60,
  duration: 10000,
}
```

痕跡は最大4件。新しい痕跡が増えた場合は、古いものから表示対象外になる。タップ、説明、保存機能はなく、`pointer-events: none`でゲーム操作を妨げない。

描画はCSS animationだけを使用し、`requestAnimationFrame`は追加していない。ページ再読み込みや島のリセットで消える。

`SHOW_RESIDENT_DEBUG = true`の場合、住人IDの横に現在表示中のtrace数が出る。

## 12. areaMood

住人の最近の行動履歴から、エリア全体の空気感を内部状態`areaMood`として管理する。

現在のmood:

- `calm`
- `sleepy`
- `lively`
- `nostalgic`

判定の目安:

| 行動 | 上がりやすいmood |
| --- | --- |
| 木・ベンチでのstay | `calm` |
| 夜のライトでのstay | `sleepy` |
| 特別行動 | `lively` |
| dockでの移動・stay | `nostalgic` |

判定関数は`src/js/residentMemory.js`の`createAreaMoodSnapshot`に分離している。最近の履歴をスコア化し、以前のスコアを65%、新しい観測を35%残して緩やかに更新する。別moodへ変わるには現在のmoodより一定以上スコアが高い必要がある。

再評価は履歴が6件増えるごとで、毎行動では実行しない。

現在の微小効果:

- `calm`: 痕跡の表示時間が約8%長くなる
- `sleepy`: 次の移動までの待機が約6%長くなる
- `nostalgic`: dockの選択重みが約6%上がる
- `lively`: 特別行動の発生率が約4%だけ上がる

通常画面にはmood名やスコアを表示しない。`SHOW_RESIDENT_DEBUG = true`の場合だけ、現在のmoodと各mood scoreをデバッグパネルで確認できる。

`areaMoodEffects`を拡張すれば、将来は次の要素へ接続できる。

- BGM
- 光の色や強さ
- 天気
- UI色
- 住人の痕跡
- エリア固有イベント

### moodの薄いビジュアル反映

SUN AREAのステージには`data-area-mood`属性が付き、`areaMoodOverlay`が環境だけに薄い色を重ねる。

| mood | 見た目 |
| --- | --- |
| `calm` | やわらかい明るさ |
| `sleepy` | 少し夜に寄った暗さ |
| `nostalgic` | ごく薄い夕方の温度感 |
| `lively` | ほんの少し明るい光 |

overlayは配置物・痕跡・住人より下にあり、上部ボタンやサイドUIにはかからない。透明度は低く、切り替えには8秒のCSS transitionを使う。

追加のタイマー、canvas、`requestAnimationFrame`は使わない。

## 13. areaMoodHistory

`areaMood`が別のmoodへ切り替わった時だけ、内部履歴`areaMoodHistoryRef`へ記録する。

記録例:

```jsx
{
  mood: 'nostalgic',
  score: 3.5,
  scores: {
    calm: 0,
    sleepy: 0,
    lively: 0,
    nostalgic: 3.5,
  },
  timestamp: '2026-06-07T12:34:56.789Z',
  reason: 'dockで海を眺める時間が増えた',
}
```

記録される項目:

| 項目 | 内容 |
| --- | --- |
| `mood` | 変化後のmood名 |
| `score` | 変化後moodの代表score |
| `scores` | 変化時点の全mood score |
| `timestamp` | moodが切り替わった時刻 |
| `reason` | 行動傾向を表す短い理由 |

同じmoodのままscoreだけが変わった場合は記録しない。履歴は最大10件で、古いものから除外される。

関連関数は`src/js/residentMemory.js`に分離している。

- `createAreaMoodHistoryEntry`: mood変化から履歴項目を作る
- `getAreaMoodHistory`: 最近のmood履歴をコピーして取得する

通常画面、セリフ、`localStorage`には接続していない。`SHOW_RESIDENT_DEBUG = true`の場合だけ、最近3件のmood、代表score、reasonをデバッグパネルに表示する。

将来は履歴を集計して、次の機能へ発展できる。

- 今日のエリア日記
- よく出たmood
- SUN AREAの思い出
- mood変化を条件にした図鑑コメント

## 14. createAreaMemorySummary

`residentHistory`と`areaMoodHistory`を組み合わせ、今日のSUN AREAを表す短い文章候補を作る。

編集ファイル:

```text
src/js/residentMemory.js
```

使用例:

```jsx
const summaries = createAreaMemorySummary(
  residentHistoryRef.current,
  areaMoodHistoryRef.current,
  3,
);
```

生成候補:

```text
今日は木の近くで静かな時間が多かった
dockで海を眺める時間が増えた
夜はライトのそばで眠たそうな空気だった
SUN AREAには少し懐かしい空気が残っていた
```

判定には最近の住人行動最大24件とmood履歴最大10件を使用する。通常は最大3件を返し、候補が重複する場合は1件にまとめる。

現在は通常画面、セリフ、`localStorage`には接続しない。`SHOW_RESIDENT_DEBUG = true`の場合だけ、デバッグパネル内にarea memory summaryを小さく表示する。

関数はUIから独立しているため、将来はそのまま次の機能へ接続できる。

- 今日の日記
- エリア図鑑
- 思い出カード
- 日付単位のエリア記録

## 15. 開発用「今日のSUN AREAカード」

`createAreaMemorySummary`の文章候補をカードUIとして確認するため、独立した開発フラグを用意している。

```jsx
const SHOW_AREA_MEMORY_CARD = false;
```

通常は`false`にする。`false`の場合はカード用DOMを表示せず、文章候補更新のための追加レンダーも行わない。

開発中に一時的に`true`へ変更すると、画面下部に「今日のSUN AREA」カードが表示される。

```jsx
const SHOW_AREA_MEMORY_CARD = true;
```

カード内容:

- タイトル「今日のSUN AREA」
- `createAreaMemorySummary`の候補を最大3行
- 履歴がまだない場合は「今日の記憶を集めています」

カードは半透明で小さく、`pointer-events: none`のためタップ操作を妨げない。ボタンや保存処理はなく、`localStorage`にも接続しない。

iPhoneではSUN AREAステージ内の左下に置き、幅・文字サイズ・余白を小さくする。確認後は必ず`SHOW_AREA_MEMORY_CARD = false`へ戻す。

## 16. 環境イベント

SUN AREAでは、住人の行動とは別に小さな環境イベントが低頻度で発生する。

現在の種類:

- 海風
- 木揺れ
- 夜の静けさ
- 光の反射
- 小さな流れ星

発生しやすさは、`areaMood`、昼夜、木やライトなどの配置物で少し変わる。
たとえば`nostalgic`では海風、`sleepy`の夜は静けさや流れ星、`calm`では木揺れが選ばれやすい。

環境イベントはSUN住人とは独立しているため、住人がいない場合も発生できる。
演出は数秒で消え、イベント名や履歴を通常UIには表示しない。

最近のイベントは`environmentEventHistory`へ最大5件だけ内部保持する。
`SHOW_RESIDENT_DEBUG = true`の場合のみ、デバッグパネルで種類と発生時のmoodを確認できる。

編集ファイル:

```text
src/js/environmentEvent.js
```

将来は同じ仕組みを、季節、天気、BGM、時間帯ごとの演出へ発展できる。

## 17. 住人関連コードの構成

住人機能が増えても役割を追いやすいよう、次のファイルへ分けている。

| ファイル | 役割 |
| --- | --- |
| `residentConfig.js` | 住人定義、性格、mood効果、件数上限、開発フラグ |
| `residentMovement.js` | 島内座標補正、移動先の重み選択、性格とmoodの補正 |
| `residentMemory.js` | residentHistory、areaMood、mood履歴、日記候補 |
| `residentTrace.js` | 痕跡の種類、位置、表示時間を含むtraceデータ生成 |
| `environmentEvent.js` | 環境イベントの種類、発生条件、履歴データ |
| `main.jsx` | Reactのstate、タイマー、画面表示との接続 |

### やりたいこと別の編集先

| やりたいこと | 最初に見るファイル |
| --- | --- |
| 住人を追加する、性格を変える | `residentConfig.js` |
| mood効果や開発フラグを変える | `residentConfig.js` |
| 移動先の計算や島内補正を変える | `residentMovement.js` |
| 履歴、mood判定、summary文章を変える | `residentMemory.js` |
| 痕跡の種類、位置、表示時間を変える | `residentTrace.js` |
| 環境イベントの種類や発生しやすさを変える | `environmentEvent.js` |
| React state、タイマー、画面表示をつなぐ | `main.jsx` |

住人を追加する場合は、まず`residentConfig.js`の`createResidentDefinitions`を編集する。
通常の住人追加では、`main.jsx`を最初に変更する必要はない。

開発表示の切り替えも`residentConfig.js`に置いている。

```jsx
export const SHOW_RESIDENT_DEBUG = false;
export const SHOW_AREA_MEMORY_CARD = false;
```

本番では両方を`false`のままにする。

## 18. 追加後の確認チェックリスト

### 定義

- [ ] `id`が他の住人と重複していない
- [ ] 画像パスの大文字・小文字と拡張子が正しい
- [ ] `personality`が `residentPersonalities`に存在する
- [ ] 表示したい住人だけ `enabled: true`になっている

### 見た目

- [ ] 背景が透過されている
- [ ] 足元が島へ接地している
- [ ] dock、木、ベンチ、ライトより巨大に見えない
- [ ] 複数住人の初期位置が重なっていない
- [ ] 390×844でUIを圧迫していない

### 動作

- [ ] 各住人が別々に移動する
- [ ] 到着後に別々に待機する
- [ ] 木、ベンチ、ライト、dockへ反応する
- [ ] 特別行動がresidentごとに独立している
- [ ] 行動履歴がresident IDごとに最大10件で管理される
- [ ] 手動Moveで1体目だけが動く
- [ ] 住人が島外へはみ出さない

### 最終確認

開発サーバー:

```bash
npm run dev
```

ブラウザを390×844にして、日中・夜間・手動Moveを確認する。

ビルド:

```bash
npm run build
```

エラーなく完了すれば追加作業は完了。

## 関連リンク

* [[THE SUN AREA]]
* [[SUN DOCK]]
* [[THE SUN]]
* [[SUN AREA 開発チェックリスト]]
* [[SUN AREA v0.1 記録]]
