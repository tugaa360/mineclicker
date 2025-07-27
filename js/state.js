import { createDefaultGameState } from './config.js';
import { SAVE_KEY } from './config.js';
import { applyResearchEffects } from './core.js'; // core.jsからインポート(後で作成)
import { showMessage } from './ui.js'; // ui.jsからインポート(後で作成)

let gameState = createDefaultGameState();

export function getGameState() {
    return gameState;
}

export function setGameState(newState) {
    gameState = newState;
}

export function saveGame() {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
        showMessage('ゲームを保存しました', 'success');
    } catch (e) {
        console.error('Save failed:', e);
        showMessage('セーブに失敗しました', 'error');
    }
}

export function loadGame() {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (savedData) {
        try {
            const loadedState = JSON.parse(savedData);
            // デフォルトの状態とマージして、新しいプロパティが追加されても壊れないようにする
            gameState = deepMerge(createDefaultGameState(), loadedState);
            applyResearchEffects(gameState);
            showMessage('ゲームをロードしました', 'info');
            return true; // ロード成功
        } catch (e) {
            console.error('Load failed:', e);
            showMessage('ロードに失敗しました', 'error');
            return false; // ロード失敗
        }
    }
    return false; // セーブデータなし
}

export function resetGame() {
    if (confirm('本当にゲームデータをリセットしますか？この操作は元に戻せません。')) {
        localStorage.removeItem(SAVE_KEY);
        setGameState(createDefaultGameState());
        location.reload();
    }
}

// オブジェクトを再帰的にマージするヘルパー関数
function deepMerge(target, source) {
    const isObject = (obj) => obj && typeof obj === 'object' && !Array.isArray(obj);

    if (!isObject(target) || !isObject(source)) {
        return source;
    }

    const output = { ...target };

    for (const key in source) {
        if (isObject(source[key])) {
            if (!(key in target)) {
                Object.assign(output, { [key]: source[key] });
            } else {
                output[key] = deepMerge(target[key], source[key]);
            }
        } else {
            Object.assign(output, { [key]: source[key] });
        }
    }
    return output;
}
