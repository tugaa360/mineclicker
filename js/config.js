export const TICK_INTERVAL = 1000; // 1秒ごとの更新に変更
export const SAVE_KEY = 'mineClickerSaveData';
export const ORE_SELL_RATE = 0.5;
export const INGOT_SELL_RATE = 0.55;
export const UPGRADE_RP_COST_MULTIPLIER = 1.5;
export const UPGRADE_INGOT_MULTIPLIER = 2;

export function createDefaultGameState() {
    return {
        resources: {
            ore: 0,
            ingot: 0,
            credits: 0,
            researchPoints: 0,
        },
        machines: {
            smallDrill: { name: '硬いつるはし', count: 0, level: 1, maxCount: 1, maxLevel: 5, manualClickBonus: 1, upgradeBonus: 0.1, getCost: (c) => Math.floor(50 * Math.pow(2, c)), getUpgradeCost: (l) => Math.floor(50 * Math.pow(UPGRADE_RP_COST_MULTIPLIER, l - 1)) },
            mediumDrill: { name: 'ドリル', count: 0, level: 1, maxCount: 2, maxLevel: 5, manualClickBonus: 3, baseConsumption: 1.0, upgradeBonus: 0.12, getCost: (c) => Math.floor(100 * Math.pow(2, c)), getUpgradeCost: (l) => Math.floor(100 * Math.pow(UPGRADE_RP_COST_MULTIPLIER, l - 1)) },
            largeDrill: { name: 'すごいドリル', count: 0, level: 1, maxCount: 3, maxLevel: 5, manualClickBonus: 10, baseConsumption: 3.0, ingotCost: 100, upgradeBonus: 0.15, getCost: (c) => Math.floor(1000 * Math.pow(2, c)), getUpgradeCost: (l) => Math.floor(200 * Math.pow(UPGRADE_RP_COST_MULTIPLIER, l - 1)) },
            smeltingFurnace: { name: '精錬炉', count: 0, level: 1, maxCount: 10, maxLevel: 5, baseProduction: 0.5, baseConsumption: 2, consumptionReductionBonus: 0.1, upgradeBonus: 0.1, getCost: (c) => Math.floor(100 * Math.pow(2, c)), getUpgradeCost: (l) => Math.floor(200 * Math.pow(UPGRADE_RP_COST_MULTIPLIER, l - 1)) },
            generator: { name: '発電機', count: 0, level: 1, maxCount: 10, maxLevel: 5, baseProduction: 5, upgradeBonus: 0.08, getCost: (c) => Math.floor(300 * Math.pow(1.5, c)), getUpgradeCost: (l) => Math.floor(100 * Math.pow(UPGRADE_RP_COST_MULTIPLIER, l - 1)) },
            researchModule: { name: '研究棟', count: 0, level: 1, maxCount: 10, maxLevel: 5, baseProduction: 0.2, baseConsumption: 2.5, consumptionReductionBonus: 0.1, upgradeBonus: 0.15, getCost: (c) => Math.floor(500), getUpgradeCost: (l) => Math.floor(300 * Math.pow(UPGRADE_RP_COST_MULTIPLIER, l - 1)) },
            smallAutomationDevice: { name: '小型自動化装置', count: 0, level: 1, maxCount: 1, maxLevel: 5, baseProductionMultiplier: 0.5, baseConsumption: 0.5, ingotCost: 100, upgradeBonus: 0.1, getCost: (c) => Math.floor(500), getUpgradeCost: (l) => Math.floor(100 * Math.pow(UPGRADE_RP_COST_MULTIPLIER, l - 1)) },
            mediumAutomationDevice: { name: '中型自動化装置', count: 0, level: 1, maxCount: 1, maxLevel: 5, baseProductionMultiplier: 1.0, baseConsumption: 1.5, ingotCost: 200, upgradeBonus: 0.12, getCost: (c) => Math.floor(1000), getUpgradeCost: (l) => Math.floor(500 * Math.pow(UPGRADE_RP_COST_MULTIPLIER, l - 1)) },
            largeAutomationDevice: { name: '大型自動化装置', count: 0, level: 1, maxCount: 1, maxLevel: 5, baseProductionMultiplier: 2.0, baseConsumption: 3.0, ingotCost: 300, upgradeBonus: 0.15, getCost: (c) => Math.floor(1500), getUpgradeCost: (l) => Math.floor(1000 * Math.pow(UPGRADE_RP_COST_MULTIPLIER, l - 1)) },
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
