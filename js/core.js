import { getGameState, setGameState } from './state.js';
import { showMessage } from './ui.js';
import * as C from './config.js';
import { formatNumber } from './utils.js';

export function update(deltaTime) {
    const state = getGameState();
    const rates = calculateProductionRates(state);
    updateResources(state, rates, deltaTime);
    return rates;
}

function calculateProductionRates(state) {
    const { machines, bonuses, research } = state;
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
    // 電力不足なら効率を0にする
    const efficiency = netPower >= 0 ? 1 : 0;

    // 自動原石生産
    let autoOrePerSecond = 0;
    const manualClickPower = calculateManualClickPower(state);
    autoOrePerSecond += machines.smallAutomationDevice.count * machines.smallAutomationDevice.baseProductionMultiplier * manualClickPower * (1 + (machines.smallAutomationDevice.level - 1) * machines.smallAutomationDevice.upgradeBonus);
    autoOrePerSecond += machines.mediumAutomationDevice.count * machines.mediumAutomationDevice.baseProductionMultiplier * manualClickPower * (1 + (machines.mediumAutomationDevice.level - 1) * machines.mediumAutomationDevice.upgradeBonus);
    autoOrePerSecond += machines.largeAutomationDevice.count * machines.largeAutomationDevice.baseProductionMultiplier * manualClickPower * (1 + (machines.largeAutomationDevice.level - 1) * machines.largeAutomationDevice.upgradeBonus);

    // インゴット生産
    const potentialIngotProduction = machines.smeltingFurnace.count * machines.smeltingFurnace.baseProduction * (1 + (machines.smeltingFurnace.level - 1) * machines.smeltingFurnace.upgradeBonus);
    const oreForIngots = state.resources.ore / 2; // 1インゴット=2原石
    const ingotPerSecond = Math.min(potentialIngotProduction, oreForIngots);

    // 研究ポイント生産
    const researchPointsPerSecond = machines.researchModule.count * machines.researchModule.baseProduction * (1 + (machines.researchModule.level - 1) * machines.researchModule.upgradeBonus);

    const globalBonus = (1 + bonuses.globalProductionBonus);

    return {
        ore: autoOrePerSecond * efficiency * globalBonus,
        ingot: ingotPerSecond * efficiency * globalBonus,
        research: researchPointsPerSecond * efficiency * globalBonus,
        credit: (ingotPerSecond * efficiency * globalBonus) * C.INGOT_SELL_RATE,
        powerConsumption: powerConsumption,
        powerGeneration: powerGeneration,
        efficiency: efficiency,
    };
}

function updateResources(state, rates, deltaTime) {
    const { resources, settings } = state;
    const oreStorageCapacity = (state.machines.warehouse.count * state.machines.warehouse.baseStorageCapacity) + 1000;

    const oreConsumedForIngots = rates.ingot * deltaTime * 2;
    resources.ore -= oreConsumedForIngots;

    resources.ore = Math.min(oreStorageCapacity, resources.ore + rates.ore * deltaTime);
    resources.ingot += rates.ingot * deltaTime;
    resources.researchPoints += rates.research * deltaTime;
    resources.credits += rates.credit * deltaTime;

    if (resources.ore < 0) resources.ore = 0;

    // 自動売却
    if (settings.autoSellOreActive && resources.ore >= oreStorageCapacity) {
        const amountToSell = resources.ore - (oreStorageCapacity * 0.8); // 8割まで売る
        if (amountToSell > 0) {
            resources.ore -= amountToSell;
            resources.credits += amountToSell * C.ORE_SELL_RATE;
            showMessage(`${formatNumber(amountToSell, 2)} 原石を自動売却`, 'success');
        }
    }
}

export function handleMineRockClick() {
    const state = getGameState();
    const clickAmount = calculateManualClickPower(state);
    const oreStorageCapacity = (state.machines.warehouse.count * state.machines.warehouse.baseStorageCapacity) + 1000;
    state.resources.ore = Math.min(oreStorageCapacity, state.resources.ore + clickAmount);
}

function calculateManualClickPower(state) {
    const { machines, bonuses } = state;
    let clickPower = 1; // Base click power
    clickPower += machines.smallDrill.count * machines.smallDrill.manualClickBonus * (1 + (machines.smallDrill.level - 1) * machines.smallDrill.upgradeBonus);
    clickPower += machines.mediumDrill.count * machines.mediumDrill.manualClickBonus * (1 + (machines.mediumDrill.level - 1) * machines.mediumDrill.upgradeBonus);
    clickPower += machines.largeDrill.count * machines.largeDrill.manualClickBonus * (1 + (machines.largeDrill.level - 1) * machines.largeDrill.upgradeBonus);
    return clickPower * (1 + bonuses.globalProductionBonus);
}


export function handleBuyMachine(machineId) {
    const state = getGameState();
    const machine = state.machines[machineId];
    if (machine.count >= machine.maxCount) {
        showMessage('これ以上購入できません', 'error');
        return false;
    }
    const cost = getMachineCost(machine, state);
    if (checkCanAfford(cost, state.resources)) {
        deductResources(cost, state.resources);
        machine.count++;
        showMessage(`${machine.name} を購入しました`, 'success');
        return true;
    } else {
        showMessage('リソースが足りません', 'error');
        return false;
    }
}

export function handleUpgradeMachine(machineId) {
    const state = getGameState();
    const machine = state.machines[machineId];
    if (machine.level >= machine.maxLevel) {
        showMessage('最大レベルです', 'error');
        return false;
    }
    const cost = getMachineUpgradeCost(machine, state);
    if (checkCanAfford(cost, state.resources)) {
        deductResources(cost, state.resources);
        machine.level++;
        showMessage(`${machine.name} をアップグレードしました`, 'success');
        return true;
    } else {
        showMessage('リソースが足りません', 'error');
        return false;
    }
}

export function applyResearchEffects(state) {
    const { research, bonuses, settings } = state;
    bonuses.globalProductionBonus = research.overallEfficiency.level * research.overallEfficiency.effectPerLevel;
    bonuses.globalCostReduction = research.constructionCost.level * research.constructionCost.effectPerLevel;
    settings.autoSellOreActive = research.autoSellOre.researched;
}


// --- ヘルパー ---
function getMachineCost(machine, state) {
    const cost = {};
    cost.credits = machine.getCost(machine.count) * (1 - state.bonuses.globalCostReduction);
    if (machine.ingotCost) {
        cost.ingot = machine.ingotCost;
    }
    return cost;
}

function getMachineUpgradeCost(machine, state) {
    const cost = {};
    const rpCost = machine.getUpgradeCost(machine.level);
    cost.researchPoints = rpCost;
    cost.ingot = rpCost * C.UPGRADE_INGOT_MULTIPLIER;
    return cost;
}

function checkCanAfford(cost, resources) {
    for (const resourceType in cost) {
        if (resources[resourceType] < cost[resourceType]) {
            return false;
        }
    }
    return true;
}

function deductResources(cost, resources) {
    for (const resourceType in cost) {
        resources[resourceType] -= cost[resourceType];
    }
}
