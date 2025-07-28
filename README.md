# Mine Clicker

**(English follows Japanese)**

Mine Clickerは、資源を採掘し、工場を拡張していくクリッカーゲームです。

## 遊び方

1.  **原石の採掘**:
    *   中央の岩をクリックして原石を採掘します。

2.  **施設の購入とアップグレード**:
    *   採掘した原石を売却してクレジットを獲得します。
    *   クレジットを使って、採掘効率を上げるための施設（ドリル、精錬炉など）を購入・アップグレードします。

3.  **自動化**:
    *   自動化装置を導入することで、手動クリックなしで資源を生産できるようになります。

4.  **研究**:
    *   研究施設を建設し、研究ポイントを貯めることで、工場全体の効率を向上させる様々なアップグレードをアンロックできます。

## 資源

*   **原石**: 最も基本的な資源。クリックやドリルで採掘します。
*   **インゴット**: 精錬炉で原石を加工することで生産されます。
*   **クレジット**: 原石を売却して得られる通貨。施設の購入やアップグレードに使用します。
*   **研究ポイント**: 研究棟で生産され、新たな技術のアンロックに使用します。

## データ管理

*   **セーブ**: 現在のゲーム進行状況をブラウザに保存します。
*   **ロード**: 最後にセーブしたデータを読み込みます。
*   **リセット**: すべてのデータを消去し、ゲームを最初からやり直します。

## プロジェクト構造

```
/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── core.js
│   ├── state.js
│   ├── ui.js
│   ├── config.js
│   └── utils.js
└── README.md
```

### ファイル説明

*   `index.html`: ゲームのメインとなるHTMLファイル。UI要素の配置を行います。
*   `css/style.css`: ゲーム全体のスタイリングを担当します。
*   `js/main.js`: アプリケーションのエントリーポイント。ゲームループとイベントリスナーの初期化を行います。
*   `js/core.js`: ゲームのコアロジック（資源の生産、施設の購入・アップグレードなど）を管理します。
*   `js/state.js`: ゲームの状態（資源の数、施設のレベルなど）を管理し、セーブ・ロード機能を提供します。
*   `js/ui.js`: UIの更新、メッセージ表示など、ユーザーインターフェース関連の処理を担当します。
*   `js/config.js`: 施設のコストや生産レートなど、ゲームの定数を一元管理します。
*   `js/utils.js`: 汎用的な補助関数を提供します。

---

# Mine Clicker (English)

Mine Clicker is a clicker game where you mine resources and expand your factory.

## How to Play

1.  **Mine Ore**:
    *   Click the rock in the center to mine ore.

2.  **Purchase and Upgrade Facilities**:
    *   Sell the mined ore to earn credits.
    *   Use credits to purchase and upgrade facilities (drills, smelters, etc.) to improve your mining efficiency.

3.  **Automation**:
    *   Introduce automation devices to produce resources without manual clicking.

4.  **Research**:
    *   Build a research facility and accumulate research points to unlock various upgrades that improve the overall efficiency of your factory.

## Resources

*   **Ore**: The most basic resource. Mined by clicking or using drills.
*   **Ingot**: Produced by processing ore in a smelter.
*   **Credits**: Currency obtained by selling ore. Used to purchase and upgrade facilities.
*   **Research Points**: Produced in the research building and used to unlock new technologies.

## Data Management

*   **Save**: Saves the current game progress to your browser.
*   **Load**: Loads the last saved data.
*   **Reset**: Deletes all data and restarts the game from the beginning.

## Project Structure

```
/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── core.js
│   ├── state.js
│   ├── ui.js
│   ├── config.js
│   └── utils.js
└── README.md
```

### File Descriptions

*   `index.html`: The main HTML file for the game. Lays out the UI elements.
*   `css/style.css`: Handles the overall styling of the game.
*   `js/main.js`: The application's entry point. Initializes the game loop and event listeners.
*   `js/core.js`: Manages the core game logic (resource production, facility purchase/upgrades, etc.).
*   `js/state.js`: Manages the game state (resource counts, facility levels, etc.) and provides save/load functionality.
*   `js/ui.js`: Handles UI-related processes such as updating the display and showing messages.
*   `js/config.js`: Centralizes game constants like facility costs and production rates.
*   `js/utils.js`: Provides general-purpose utility functions.

Enjoy!
