# SUN DOCK 魚影 v0.1

作成日: 2026-06-12

## 目的

SUN DOCKの水面に、捕獲対象ではない小さな魚影を追加する。
攻略要素ではなく、海に生き物がいる気配を静かに感じられる演出とする。

## v0.1の仕様

- SUN DOCK画面にだけ魚影が出現する
- 魚影は左右どちらかへゆっくり通過する
- 魚影のあとに薄い波紋が残る
- 魚影付近をタップすると、魚が驚いて逃げる
- 一部の魚影は自然に逃げる
- 魚を捕まえる、得点を得る、カードを獲得する仕組みは追加しない
- 通常時は約1分以上の間隔で、まれに現れる
- 季節・昼夜・島の空気によって出現間隔や動きが少し変わる
- `prefers-reduced-motion` 設定時はアニメーションを抑える

## 現在の季節設定

- 現在値: `summer`
- 対応候補: `summer` / `autumn` / `night_breeze`

## 関連ファイル

- `src/js/fishShadow.js`
- `src/js/seasonConfig.js`
- `src/js/main.jsx`
- `src/css/style.css`
- `src/js/environmentEvent.js`
- `src/js/residentMemory.js`
- `src/js/sunExploration.js`
- `SUN AREA 探索構造.md`

## 保存時の確認

- [x] `npm run build` が成功する
- [x] `git diff --check` でエラーがない
- [ ] SUN DOCK以外では魚影が表示されない
- [ ] 魚影付近のタップで逃げる
- [ ] SUN DOCKの既存ルートを邪魔しない
- [ ] console error / warning がない

## 次版候補

- 魚影の大きさや速度の種類を少し増やす
- 天候による出現差
- SUNが魚影を眺める静かな反応
