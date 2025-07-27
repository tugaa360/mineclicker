document.addEventListener('DOMContentLoaded', () => {
    // --- 定数定義 ---
    const CONSTANTS = {
        TICK_INTERVAL: 100,
        SAVE_KEY: 'mineClickerSaveData',
        ORE_SELL_RATE: 0.5,
        INGOT_SELL_RATE: 0.55,
        UPGRADE_RP_COST_MULTIPLIER: 1.5,
        UPGRADE_INGOT_MULTIPLIER: 2,
    };

    // --- ゲーム状態管理 ---
    let gameState = createDefaultGameState();

    // --- UI要素のキャッシュ ---
    const ui = cacheUIElements();

    // --- 初期化処理 ---
    initializeEventListeners();
    loadGame();
    requestAnimationFrame(gameLoop);

    // --- 関数定義 ---

    /**
     * デフォルトのゲーム状態を生成する
     */
    function createDefaultGameState() {
        return {
            resources: {
                ore: 0,
                ingot: 0,
                credits: 0,
                researchPoints: 0,
            },
            machines: {
                smallDrill: { name: '硬いつるはし', count: 0, level: 1, maxCount: 1, maxLevel: 2, manualClickBonus: 1, upgradeBonus: 0.1, getCost: (c) => Math.floor(50 * Math.pow(2, c)), getUpgradeCost: (l) => Math.floor(50 * Math.pow(CONSTANTS.UPGRADE_RP_COST_MULTIPLIER, l - 1)) },
                mediumDrill: { name: 'ドリル', count: 0, level: 1, maxCount: 2, maxLevel: 2, manualClickBonus: 3, baseConsumption: 1.0, humanResourceCostFactor: 0.25, upgradeBonus: 0.12, getCost: (c) => Math.floor(100 * Math.pow(2, c)), getUpgradeCost: (l) => Math.floor(100 * Math.pow(CONSTANTS.UPGRADE_RP_COST_MULTIPLIER, l - 1)) },
                largeDrill: { name: 'すごいドリル', count: 0, level: 1, maxCount: 3, maxLevel: 2, manualClickBonus: 10, baseConsumption: 3.0, ingotCost: 100, humanResourceCost: 100, upgradeBonus: 0.15, getCost: (c) => Math.floor(1000 * Math.pow(2, c)), getUpgradeCost: (l) => Math.floor(200 * Math.pow(CONSTANTS.UPGRADE_RP_COST_MULTIPLIER, l - 1)) },
                smeltingFurnace: { name: '精錬炉', count: 0, level: 1, maxCount: 10, maxLevel: 5, baseProduction: 0.5, baseConsumption: 2, consumptionReductionBonus: 0.1, upgradeBonus: 0.1, getCost: (c) => Math.floor(100 * Math.pow(2, c)), getUpgradeCost: (l) => Math.floor(200 * Math.pow(CONSTANTS.UPGRADE_RP_COST_MULTIPLIER, l - 1)) },
                generator: { name: '発電機', count: 0, level: 1, maxCount: 10, maxLevel: 5, baseProduction: 5, upgradeBonus: 0.08, getCost: (c) => Math.floor(300 * Math.pow(1.5, c)), getUpgradeCost: (l) => Math.floor(100 * Math.pow(CONSTANTS.UPGRADE_RP_COST_MULTIPLIER, l - 1)) },
                researchModule: { name: '研究棟', count: 0, level: 1, maxCount: 10, maxLevel: 5, baseProduction: 0.2, baseConsumption: 2.5, consumptionReductionBonus: 0.1, upgradeBonus: 0.15, getCost: (c) => Math.floor(500), getUpgradeCost: (l) => Math.floor(300 * Math.pow(CONSTANTS.UPGRADE_RP_COST_MULTIPLIER, l - 1)) },
                smallAutomationDevice: { name: '小型自動化装置', count: 0, level: 1, maxCount: 1, maxLevel: 2, baseProductionMultiplier: 0.5, baseConsumption: 0.5, ingotCost: 100, upgradeBonus: 0.1, getCost: (c) => Math.floor(500), getUpgradeCost: (l) => Math.floor(100 * Math.pow(CONSTANTS.UPGRADE_RP_COST_MULTIPLIER, l - 1)) },
                mediumAutomationDevice: { name: '中型自動化装置', count: 0, level: 1, maxCount: 1, maxLevel: 2, baseProductionMultiplier: 1.0, baseConsumption: 1.5, ingotCost: 200, upgradeBonus: 0.12, getCost: (c) => Math.floor(1000), getUpgradeCost: (l) => Math.floor(500 * Math.pow(CONSTANTS.UPGRADE_RP_COST_MULTIPLIER, l - 1)) },
                largeAutomationDevice: { name: '大型自動化装置', count: 0, level: 1, maxCount: 1, maxLevel: 2, baseProductionMultiplier: 2.0, baseConsumption: 3.0, ingotCost: 300, upgradeBonus: 0.15, getCost: (c) => Math.floor(1500), getUpgradeCost: (l) => Math.floor(1000 * Math.pow(CONSTANTS.UPGRADE_RP_COST_MULTIPLIER, l - 1)) },
                warehouse: { name: '倉庫', count: 0, level: 1, maxCount: 10, baseStorageCapacity: 1000, getCost: (c) => Math.floor(400 * Math.pow(1.8, c)) },
            },
            research: {
                researchFacility: { unlocked: false, unlockCost: 5000 },
                overallEfficiency: { name: '全体効率改善', level: 0, maxLevel: 5, baseCost: 50, costMultiplier: 1.5, effectPerLevel: 0.05 },
                constructionCost: { name: '建設コスト削減', level: 0, maxLevel: 5, baseCost: 25, costMultiplier: 1.5, effectPerLevel: 0.02 },
                autoSellOre: { name: '自動原石売却', researched: false, cost: 500, ingotCost: 200 },
            },
            bonuses: {
                globalProductionBonus: 0,
                globalCostReduction: 0,
            },
            settings: {
                autoSellOreActive: false,
            },
            lastUpdate: performance.now(),
        };
    }

    /**
     * UI要素をキャッシュする
     */
    function cacheUIElements() {
        const elements = {
            oreCount: document.getElementById('oreCount'),
            ingotCount: document.getElementById('ingotCount'),
            creditCount: document.getElementById('creditCount'),
            researchPointCount: document.getElementById('researchPointCount'),
            orePerSecond: document.getElementById('orePerSecond'),
            ingotPerSecond: document.getElementById('ingotPerSecond'),
            creditsPerSecond: document.getElementById('creditsPerSecond'),
            researchPointPerSecond: document.getElementById('researchPointPerSecond'),
            oreStorageCapacity: document.getElementById('oreStorageCapacity'),
            powerConsumptionDisplay: document.getElementById('powerConsumptionDisplay'),
            powerGenerationDisplay: document.getElementById('powerGenerationDisplay'),
            miningRock: document.getElementById('miningRock'),
            messageDisplay: document.getElementById('messageDisplay'),
            controlPanel: document.querySelector('.control-panel'),
            productionArea: document.querySelector('.production-area'),
            researchOptions: document.getElementById('researchOptions'),
            unlockResearchFacilityBtn: document.getElementById('unlockResearchFacilityBtn'),
        };
        // 動的に生成される要素もここに追加していく
        return elements;
    }

    /**
     * イベントリスナーを初期化する
     */
    function initializeEventListeners() {
        ui.miningRock.addEventListener('click', handleMineRockClick);
        document.getElementById('saveGameBtn').addEventListener('click', saveGame);
        document.getElementById('loadGameBtn').addEventListener('click', loadGame);
        document.getElementById('resetGameBtn').addEventListener('click', resetGame);

        // イベント委任でボタンクリックを処理
        ui.controlPanel.addEventListener('click', handleControlPanelClick);
        ui.productionArea.addEventListener('click', handleProductionAreaClick);
    }

    // --- ゲームループ ---
    let lastRender = 0;
    function gameLoop(timestamp) {
        const deltaTime = (timestamp - (lastRender || timestamp)) / 1000;
        lastRender = timestamp;

        const rates = calculateProductionRates();
        updateResources(rates, deltaTime);
        updateUI(rates);

        requestAnimationFrame(gameLoop);
    }

    // --- 主要なゲームロジック関数 ---

    /**
     * 生産率を計算する
     */
    function calculateProductionRates() {
        const { machines, bonuses, research } = gameState;
        let orePerSecond = 0;
        let ingotPerSecond = 0;
        let researchPointsPerSecond = 0;
        let powerConsumption = 0;
        let powerGeneration = 0;

        // 電力生産
        powerGeneration = machines.generator.count * machines.generator.baseProduction * (1 + (machines.generator.level - 1) * machines.generator.upgradeBonus);

        // 電力消費
        powerConsumption += machines.mediumDrill.count * machines.mediumDrill.baseConsumption;
        powerConsumption += machines.largeDrill.count * machines.largeDrill.baseConsumption;
        const smeltingFurnaceConsumptionReduction = (machines.smeltingFurnace.level - 1) * machines.smeltingFurnace.consumptionReductionBonus;
        powerConsumption += machines.smeltingFurnace.count * machines.smeltingFurnace.baseConsumption * Math.max(0, (1 - smeltingFurnaceConsumptionReduction));
        const researchModuleConsumptionReduction = (machines.researchModule.level - 1) * machines.researchModule.consumptionReductionBonus;
        powerConsumption += machines.researchModule.count * machines.researchModule.baseConsumption * Math.max(0, (1 - researchModuleConsumptionReduction));
        powerConsumption += machines.smallAutomationDevice.count * machines.smallAutomationDevice.baseConsumption;
        powerConsumption += machines.mediumAutomationDevice.count * machines.mediumAutomationDevice.baseConsumption;
        powerConsumption += machines.largeAutomationDevice.count * machines.largeAutomationDevice.baseConsumption;

        const netPower = powerGeneration - powerConsumption;
        const efficiency = netPower >= 0 ? 1 : Math.max(0, 1 + netPower / powerConsumption); // 電力不足の場合の効率

        // 自動生産
        let manualClickPower = 0;
        manualClickPower += machines.smallDrill.count * machines.smallDrill.manualClickBonus * (1 + (machines.smallDrill.level - 1) * machines.smallDrill.upgradeBonus);
        manualClickPower += machines.mediumDrill.count * machines.mediumDrill.manualClickBonus * (1 + (machines.mediumDrill.level - 1) * machines.mediumDrill.upgradeBonus);
        manualClickPower += machines.largeDrill.count * machines.largeDrill.manualClickBonus * (1 + (machines.largeDrill.level - 1) * machines.largeDrill.upgradeBonus);
        manualClickPower *= (1 + bonuses.globalProductionBonus);

        orePerSecond += machines.smallAutomationDevice.count * machines.smallAutomationDevice.baseProductionMultiplier * manualClickPower * (1 + (machines.smallAutomationDevice.level - 1) * machines.smallAutomationDevice.upgradeBonus);
        orePerSecond += machines.mediumAutomationDevice.count * machines.mediumAutomationDevice.baseProductionMultiplier * manualClickPower * (1 + (machines.mediumAutomationDevice.level - 1) * machines.mediumAutomationDevice.upgradeBonus);
        orePerSecond += machines.largeAutomationDevice.count * machines.largeAutomationDevice.baseProductionMultiplier * manualClickPower * (1 + (machines.largeAutomationDevice.level - 1) * machines.largeAutomationDevice.upgradeBonus);

        // インゴット生産
        const potentialIngotProduction = machines.smeltingFurnace.count * machines.smeltingFurnace.baseProduction * (1 + (machines.smeltingFurnace.level - 1) * machines.smeltingFurnace.upgradeBonus);
        ingotPerSecond = Math.min(potentialIngotProduction, gameState.resources.ore / 2); // 1インゴット=2原石と仮定

        // 研究ポイント生産
        researchPointsPerSecond = machines.researchModule.count * machines.researchModule.baseProduction * (1 + (machines.researchModule.level - 1) * machines.researchModule.upgradeBonus);

        return {
            ore: orePerSecond * efficiency,
            ingot: ingotPerSecond * efficiency,
            research: researchPointsPerSecond * efficiency,
            credit: (ingotPerSecond * efficiency) * CONSTANTS.INGOT_SELL_RATE,
            powerConsumption: powerConsumption,
            powerGeneration: powerGeneration,
        };
    }

    /**
     * リソースを更新する
     * @param {object} rates - 生産率
     * @param {number} deltaTime - 経過時間
     */
    function updateResources(rates, deltaTime) {
        const { resources } = gameState;
        const oreStorageCapacity = calculateOreStorageCapacity();

        const oreConsumedForIngots = rates.ingot * deltaTime * 2; // 1インゴット=2原石
        resources.ore -= oreConsumedForIngots;

        resources.ore = Math.min(oreStorageCapacity, resources.ore + rates.ore * deltaTime);
        resources.ingot += rates.ingot * deltaTime;
        resources.researchPoints += rates.research * deltaTime;
        resources.credits += rates.credit * deltaTime;

        // 自動売却
        if (gameState.settings.autoSellOreActive && resources.ore >= oreStorageCapacity * 0.8) {
            resources.credits += resources.ore * CONSTANTS.ORE_SELL_RATE;
            resources.ore = 0;
            showMessage('原石を自動売却しました', 'success');
        }
    }

    /**
     * UIを更新する
     * @param {object} rates - 生産率
     */
    function updateUI(rates) {
        const { resources, machines, research } = gameState;

        // リソース表示
        ui.oreCount.textContent = formatNumber(resources.ore);
        ui.ingotCount.textContent = formatNumber(resources.ingot);
        ui.creditCount.textContent = formatNumber(resources.credits);
        ui.researchPointCount.textContent = formatNumber(resources.researchPoints);
        ui.oreStorageCapacity.textContent = formatNumber(calculateOreStorageCapacity());

        // 生産率表示
        ui.orePerSecond.textContent = formatNumber(rates.ore, 2);
        ui.ingotPerSecond.textContent = formatNumber(rates.ingot, 2);
        ui.creditsPerSecond.textContent = formatNumber(rates.credit, 2);
        ui.researchPointPerSecond.textContent = formatNumber(rates.research, 2);

        // 電力表示
        ui.powerGenerationDisplay.textContent = formatNumber(rates.powerGeneration, 1);
        ui.powerConsumptionDisplay.textContent = formatNumber(rates.powerConsumption, 1);

        // ボタンの状態更新
        updateAllButtons();
    }

    /**
     * 全てのボタンの状態を更新する
     */
    function updateAllButtons() {
        const { resources, machines, research, bonuses } = gameState;

        // 装置ボタン
        for (const machineName in machines) {
            const machine = machines[machineName];
            const cost = machine.getCost(machine.count) * (1 - bonuses.globalCostReduction);
            const canAfford = resources.credits >= cost && (!machine.ingotCost || resources.ingot >= machine.ingotCost);
            const isMaxCount = machine.count >= machine.maxCount;
            updateButtonState(document.getElementById(`buy${capitalizeFirstLetter(machineName)}Btn`), canAfford, isMaxCount);

            if (machine.getUpgradeCost) {
                const upgradeCost = machine.getUpgradeCost(machine.level);
                const upgradeIngotCost = upgradeCost * CONSTANTS.UPGRADE_INGOT_MULTIPLIER;
                const canAffordUpgrade = resources.researchPoints >= upgradeCost && resources.ingot >= upgradeIngotCost;
                const isMaxLevel = machine.level >= machine.maxLevel;
                updateButtonState(document.getElementById(`upgrade${capitalizeFirstLetter(machineName)}Btn`), canAffordUpgrade, isMaxLevel);
            }
        }

        // 研究ボタン
        ui.unlockResearchFacilityBtn.style.display = research.researchFacility.unlocked ? 'none' : 'block';
        ui.researchOptions.style.display = research.researchFacility.unlocked ? 'flex' : 'none';
        updateButtonState(ui.unlockResearchFacilityBtn, resources.credits >= research.researchFacility.unlockCost, research.researchFacility.unlocked);

        if(research.researchFacility.unlocked) {
            // ... 研究項目のボタン状態更新ロジック ...
        }
    }

    /**
     * ボタンの有効/無効状態とスタイルを更新する
     * @param {HTMLElement} button
     * @param {boolean} canAfford
     * @param {boolean} isMaxed
     */
    function updateButtonState(button, canAfford, isMaxed) {
        if (!button) return;

        if (isMaxed) {
            button.disabled = true;
            button.classList.add('button-maxed');
            button.classList.remove('button-primary', 'button-secondary', 'button-disabled');
            // button.querySelector('.tooltip').textContent = '最大です'; // ツールチップ更新
        } else if (canAfford) {
            button.disabled = false;
            button.classList.remove('button-disabled', 'button-maxed');
            button.classList.add(button.id.includes('upgrade') ? 'button-secondary' : 'button-primary');
        } else {
            button.disabled = true;
            button.classList.add('button-disabled');
            button.classList.remove('button-primary', 'button-secondary', 'button-maxed');
        }
    }


    // --- イベントハンドラ ---

    function handleMineRockClick() {
        let clickAmount = 1;
        // ... (クリック時の処理はリファクタリングの対象)
        gameState.resources.ore = Math.min(calculateOreStorageCapacity(), gameState.resources.ore + clickAmount);
        // No need to call updateUI here, the loop does it.
    }

    function handleControlPanelClick(e) {
        const button = e.target.closest('button');
        if (!button) return;

        const action = button.id;
        // 売却ボタンの処理
        const sellMatch = action.match(/sellOre(\d+)Btn/);
        if (sellMatch) {
            const amount = parseInt(sellMatch[1], 10);
            if (gameState.resources.ore >= amount) {
                gameState.resources.ore -= amount;
                gameState.resources.credits += amount * CONSTANTS.ORE_SELL_RATE;
                showMessage(`${amount}個の原石を売却しました`, 'success');
            } else {
                showMessage('原石が足りません', 'error');
            }
            return;
        }

        // 購入・アップグレードボタンの処理
        const buyUpgradeMatch = action.match(/(buy|upgrade)([A-Z]\w+)Btn/);
        if (buyUpgradeMatch) {
            const type = buyUpgradeMatch[1]; // 'buy' or 'upgrade'
            const machineName = lowerFirstLetter(buyUpgradeMatch[2]);
            
            if (type === 'buy') {
                handleBuyMachine(machineName);
            } else {
                handleUpgradeMachine(machineName);
            }
        }
    }

    function handleProductionAreaClick(e) {
        // 将来的に生産エリア内のクリックイベントを扱う場合
    }

    function handleBuyMachine(machineName) {
        const machine = gameState.machines[machineName];
        if (machine.count >= machine.maxCount) {
            showMessage('これ以上購入できません', 'error');
            return;
        }
        const cost = machine.getCost(machine.count) * (1 - gameState.bonuses.globalCostReduction);
        const ingotCost = machine.ingotCost || 0;

        if (gameState.resources.credits >= cost && gameState.resources.ingot >= ingotCost) {
            gameState.resources.credits -= cost;
            gameState.resources.ingot -= ingotCost;
            machine.count++;
            showMessage(`${machine.name} を購入しました`, 'success');
        } else {
            showMessage('リソースが足りません', 'error');
        }
    }

    function handleUpgradeMachine(machineName) {
        const machine = gameState.machines[machineName];
        if (machine.level >= machine.maxLevel) {
            showMessage('最大レベルです', 'error');
            return;
        }
        const rpCost = machine.getUpgradeCost(machine.level);
        const ingotCost = rpCost * CONSTANTS.UPGRADE_INGOT_MULTIPLIER;

        if (gameState.resources.researchPoints >= rpCost && gameState.resources.ingot >= ingotCost) {
            gameState.resources.researchPoints -= rpCost;
            gameState.resources.ingot -= ingotCost;
            machine.level++;
            showMessage(`${machine.name} をアップグレードしました`, 'success');
        } else {
            showMessage('リソースが足りません', 'error');
        }
    }


    // --- ヘルパー関数 ---

    function calculateOreStorageCapacity() {
        return (gameState.machines.warehouse.count * gameState.machines.warehouse.baseStorageCapacity) + 1000;
    }

    function formatNumber(num, digits = 0) {
        if (num === undefined || num === null) return '0';
        const si = [
            { value: 1, symbol: "" },
            { value: 1E3, symbol: "k" },
            { value: 1E6, symbol: "M" },
            { value: 1E9, symbol: "G" },
            { value: 1E12, symbol: "T" },
            { value: 1E15, symbol: "P" },
            { value: 1E18, symbol: "E" }
        ];
        const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        let i;
        for (i = si.length - 1; i > 0; i--) {
            if (num >= si[i].value) {
                break;
            }
        }
        return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function lowerFirstLetter(string) {
        return string.charAt(0).toLowerCase() + string.slice(1);
    }

    function showMessage(msg, type = 'info') {
        ui.messageDisplay.textContent = msg;
        ui.messageDisplay.className = 'message-display'; // Reset classes
        ui.messageDisplay.classList.add(`message-${type}`);
        ui.messageDisplay.classList.add('visible');
        setTimeout(() => {
            ui.messageDisplay.classList.remove('visible');
        }, 3000);
    }

    // --- セーブ/ロード ---
    function saveGame() {
        try {
            localStorage.setItem(CONSTANTS.SAVE_KEY, JSON.stringify(gameState));
            showMessage('ゲームを保存しました', 'success');
        } catch (e) {
            console.error('Save failed:', e);
            showMessage('セーブに失敗しました', 'error');
        }
    }

    function loadGame() {
        const savedData = localStorage.getItem(CONSTANTS.SAVE_KEY);
        if (savedData) {
            try {
                const loadedState = JSON.parse(savedData);
                // Merge loaded state with default state to prevent errors if data structure changes
                gameState = deepMerge(createDefaultGameState(), loadedState);
                applyResearchEffects(); // Apply loaded research effects
                showMessage('ゲームをロードしました', 'info');
            } catch (e) {
                console.error('Load failed:', e);
                showMessage('ロードに失敗しました', 'error');
            }
        }
    }

    function applyResearchEffects() {
        const { research, bonuses, settings } = gameState;
        bonuses.globalProductionBonus = research.overallEfficiency.level * research.overallEfficiency.effectPerLevel;
        bonuses.globalCostReduction = research.constructionCost.level * research.constructionCost.effectPerLevel;
        settings.autoSellOreActive = research.autoSellOre.researched;
    }

    function resetGame() {
        if (confirm('本当にゲームデータをリセットしますか？')) {
            localStorage.removeItem(CONSTANTS.SAVE_KEY);
            gameState = createDefaultGameState();
            location.reload();
        }
    }

    function deepMerge(target, source) {
        for (const key in source) {
            if (source[key] instanceof Object && key in target) {
                Object.assign(source[key], deepMerge(target[key], source[key]))
            }
        }
        Object.assign(target || {}, source)
        return target
    }
});
