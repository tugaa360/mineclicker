import { loadGame, saveGame, resetGame, getGameState } from './state.js';
import { updateUI, getUIElements, showMessage } from './ui.js';
import { update, handleMineRockClick, handleBuyMachine, handleUpgradeMachine } from './core.js';
import { lowerFirstLetter } from './utils.js';
import * as C from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- 初期化 ---
    initializeEventListeners();
    if (!loadGame()) {
        // セーブデータがない場合、初期UIを更新
        const rates = update(0);
        updateUI(rates);
    }

    // --- ゲームループ ---
    let lastTime = performance.now();
    function gameLoop(currentTime) {
        const deltaTime = (currentTime - lastTime) / 1000;

        const rates = update(deltaTime);
        updateUI(rates);

        lastTime = currentTime;
        requestAnimationFrame(gameLoop);
    }

    // --- イベントリスナー ---
    function initializeEventListeners() {
        const ui = getUIElements();

        ui.miningRock.addEventListener('click', handleMineRockClick);

        document.getElementById('saveGameBtn').addEventListener('click', saveGame);
        document.getElementById('loadGameBtn').addEventListener('click', () => {
            if(loadGame()) {
                // ロード成功後にUIを即時更新
                const rates = update(0);
                updateUI(rates);
            }
        });
        document.getElementById('resetGameBtn').addEventListener('click', resetGame);

        // イベント委任でコントロールパネルのクリックを処理
        ui.controlPanel.addEventListener('click', handleControlPanelClick);
    }

    function handleControlPanelClick(e) {
        const button = e.target.closest('button');
        if (!button || button.disabled) return;

        const action = button.id;

        // 原石売却
        const sellMatch = action.match(/sellOre(\d+)Btn/);
        if (sellMatch) {
            const amount = parseInt(sellMatch[1], 10);
            const state = getGameState();
            if (state.resources.ore >= amount) {
                state.resources.ore -= amount;
                state.resources.credits += amount * C.ORE_SELL_RATE;
                showMessage(`${amount}個の原石を売却しました`, 'success');
            } else {
                showMessage('原石が足りません', 'error');
            }
            return;
        }

        // 購入・アップグレード
        const machineMatch = action.match(/(buy|upgrade)([A-Z]\w+)Btn/);
        if (machineMatch) {
            const type = machineMatch[1]; // 'buy' or 'upgrade'
            const machineId = lowerFirstLetter(machineMatch[2]);

            if (type === 'buy') {
                handleBuyMachine(machineId);
            } else {
                handleUpgradeMachine(machineId);
            }
        }

        // 他のボタン（研究など）の処理もここに追加
    }

    // ゲーム開始
    requestAnimationFrame(gameLoop);
});
