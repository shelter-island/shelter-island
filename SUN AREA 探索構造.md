# SUN AREA 探索構造

SUN AREAの探索スポットを、親子関係で辿れる1つの構造に整理した記録。

## 概要

- 総スポット数: 25
- 接続済み: 25
- 未接続: 0
- 入口スポット: 8
- 終点スポット: 12

探索データ:

```text
src/js/sunExploration.js
```

各スポットは次の項目を持つ。

- `id`
- `name`
- `image`
- `unlocked`
- `parent`
- `children`
- `item`
- `description`

## 探索ツリー

```text
TREE HOUSE
├ TREE FLAG
├ BED ROOM
├ LIBRARY
└ ROPE BRIDGE

SUN CAFE
└ SEA BREEZE MUG

SUN DOCK
└ TICKET & INFO
  └ BOAT TICKET
    └ BOARDING PASS
      └ DEPARTURE STAMP
        └ SAIL PERMIT
          └ SUN VOYAGER PASS

SUN MARKET
└ LUCKY SHELL

CRAFT WORKSHOP
└ CRAFT HAMMER

SECRET TREE
└ SECRET CRYSTAL

HANGOUT SPOT
└ CHILL BADGE

SUNSET DECK
├ SUNSET COMPASS
└ LIGHT HOUSE
```

## 進行数

画面右上の`到達済み数 / 25`は、実際に開いた探索スポット数と連動する。
進行はブラウザ内へ保存され、同じスポットを再訪しても重複しない。

## 未接続確認

### 画像はあるが探索へ未接続

- `sun_village.webp`
- `the_sun_bike.webp`
- `the_sun_map.webp`
- `world_news.webp`
- `world_view_card.webp`

これらは将来スポットを増やす時の候補。今回は無理に接続しない。

### 専用画像がまだないスポット

- BED ROOM
- LIBRARY
- ROPE BRIDGE
- SUN DOCK内のチケット導線
- LIGHT HOUSE

現在は既存のSUN AREA画像を仮使用している。

### データはあるが未使用

なし。

### 遷移先がないスポット

次の12件は、未接続ではなく探索ルートの終点。

- TREE FLAG
- BED ROOM
- LIBRARY
- ROPE BRIDGE
- SEA BREEZE MUG
- SUN VOYAGER PASS
- LUCKY SHELL
- CRAFT HAMMER
- SECRET CRYSTAL
- CHILL BADGE
- SUNSET COMPASS
- LIGHT HOUSE

## 将来の変更

探索関係はUIから独立しているため、後から次の表示へ変更できる。

- UIボタンの削減
- 画像内ラベル
- 光だけを使った探索
- 自然発見型の遷移

## 関連リンク

- [[THE SUN AREA]]
- [[SUN AREA 開発チェックリスト]]
- [[SUN AREA v0.1 記録]]
- [[SUN AREA 空気探索UI 記録]]
