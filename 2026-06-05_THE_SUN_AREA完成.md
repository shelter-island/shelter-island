# 2026-06-05 THE SUN AREA完成

tags:
  - no_limit_crew_island
  - the_sun_area
  - exploration_game
  - react
  - vite
  - vercel
  - github
  - my_zukan
  - iphone_ui

## 関連リンク

* [[THE SUN AREA]]
* [[THE SUN]]
* [[SUN DOCK]]
* [[SUN VOYAGER PASS]]
* [[MY ZUKAN]]
* [[カード一覧]]
* [[readme|THE SUN ZUKAN APP]]

## 概要

`the_sun_zukan_app` で、iPhone縦画面向けの探索ゲームとして `THE SUN AREA` の基本ループを完成させた。

基本ループ:

```text
スポット
→ アイテム
→ カード発見
→ GET CARD
→ MY ZUKAN反映
```

トップ画面は、正式画像 `public/images/no_limit_crew_island.webp` を使う構成にした。古い横長トップUIは使わず、URLを開いた瞬間に縦型マップが表示される状態にした。

## 対象アプリ

```text
/Users/itouyasuhito/Documents/Codex/01_WEB制作/the_sun_zukan_app
```

## 提案フォルダ構成

Obsidianでは、以下のように管理すると後から探しやすい。

```text
NO_LIMIT_CREW_ISLAND_開発ノート/
├── 00_Index/
│   └── NO_LIMIT_CREW_ISLAND_Index.md
├── 01_開発ログ/
│   └── 2026-06-05_THE_SUN_AREA完成.md
├── 02_仕様/
│   ├── 探索ゲーム基本ループ.md
│   ├── MY_ZUKAN仕様.md
│   └── 画像命名ルール.md
├── 03_ルート設計/
│   └── THE_SUN_AREAルート一覧.md
├── 04_公開手順/
│   ├── GitHub公開手順.md
│   └── Vercel公開手順.md
└── 99_メモ/
```

## 作業手順

1. `NO_LIMIT_CREW_ISLAND` 素材フォルダと `the_sun_zukan_app` を分けて整理した。
2. Web公開で危険なファイル名を小文字・英数字・アンダースコア中心へ整理した。
3. トップ画面を `public/images/no_limit_crew_island.webp` に変更した。
4. トップ画像の `THE SUN` 部分だけタップできるようにした。
5. `THE SUN AREA` へ入れるようにした。
6. 各スポットに探索ループを追加した。
7. `GET CARD` 後に `MY ZUKAN` へカードが反映されるようにした。
8. `npm run build` を何度も実行し、ビルド成功を確認した。
9. ブラウザ確認で画像404、console error / warning が出ないことを確認した。
10. Git commit を作成した。

## 完成した仕組み

### トップ画面

- 正式トップ画像: `public/images/no_limit_crew_island.webp`
- 黒背景で中央表示
- 画像比率を崩さない
- `THE SUN` だけタップ可能

### THE SUN AREA

[[THE SUN AREA]] 内の全スポットに、カードGETまでの探索ループを追加した。

完成済みルート:

```text
SUN CAFE
→ [[SEA BREEZE MUG]]
→ GET CARD
→ [[MY ZUKAN]]
```

```text
TREE HOUSE
→ [[TREE FLAG]]
→ GET CARD
→ [[MY ZUKAN]]
```

```text
SECRET TREE
→ [[SECRET CRYSTAL]]
→ GET CARD
→ [[MY ZUKAN]]
```

```text
[[SUN DOCK]]
→ TICKET & INFO
→ BOAT TICKET
→ BOARDING PASS
→ DEPARTURE STAMP
→ SAIL PERMIT
→ [[SUN VOYAGER PASS]]
→ GET CARD
→ [[MY ZUKAN]]
```

```text
SUN MARKET
→ [[LUCKY SHELL]]
→ GET CARD
→ [[MY ZUKAN]]
```

```text
CRAFT WORKSHOP
→ [[CRAFT HAMMER]]
→ GET CARD
→ [[MY ZUKAN]]
```

```text
HANGOUT SPOT
→ [[CHILL BADGE]]
→ GET CARD
→ [[MY ZUKAN]]
```

```text
SUNSET DECK
→ [[SUNSET COMPASS]]
→ GET CARD
→ [[MY ZUKAN]]
```

## 主な修正ファイル

```text
src/js/main.jsx
src/css/style.css
public/images/no_limit_crew_island.webp
.gitignore
```

## Git記録

作成済みcommit:

```text
7f5f438 Complete THE SUN AREA exploration loops
```

pushはGitHub認証で停止した。

```text
fatal: could not read Username for 'https://github.com': Device not configured
```

## 確認したこと

- `npm run build` 成功
- `dist` 生成成功
- 縦型トップ画像表示OK
- THE SUNタップOK
- 各ルートのカード発見OK
- `GET CARD` 後、`MY ZUKAN` 反映OK
- 壊れた画像 0件
- console error / warning 0件

## 学んだこと

### 素材フォルダとWeb本体は分ける

`no_limit_crew_island` は素材置き場として残し、Webで使う画像だけ `public/images/` に置くと安全。

### Web公開ではファイル名が重要

日本語、スペース、大文字、特殊記号はパスエラーの原因になる。小文字、英数字、アンダースコアに統一するとGitHub PagesやVercelでも壊れにくい。

### 仕組みを先に完成させると広げやすい

スポットごとに別々の作り方をせず、同じ基本ループを使うことで、新しいスポットを増やしやすくなった。

### MY ZUKANはゲームの達成感になる

カード発見だけで終わらず、`GET CARD` で図鑑に残ることで、探索した結果が見えるようになった。

## 次回やること

1. GitHub Desktopで `Push origin` を押す。
2. Vercelの `the-sun-zukan` プロジェクトで自動デプロイ成功を確認する。
3. 発行されたURLをiPhone Safariで開く。
4. 縦型トップ画面が正しく出るか確認する。
5. THE SUN AREAの全ルートをURL上で確認する。
6. `MY ZUKAN` に全カードが反映されるか確認する。
7. 次のエリア制作に入る前に、ルート追加用テンプレートを整理する。

## 次の開発候補

- THE SUN AREAのルート追加テンプレート化
- カード画像の専用素材追加
- MY ZUKANのカード一覧整理
- 他エリアの入口だけ追加
- Vercel本番URLでのiPhone検証ログ作成
