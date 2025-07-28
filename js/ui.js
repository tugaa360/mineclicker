import { getGameState } from './state.js';
import { formatNumber } from './utils.js'; // utils.jsを作成予定
import * as C from './config.js';

const ui = {
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
    machineControls: document.getElementById('machineControls'),
};

export function updateUI(rates) {
    const state = getGameState();
    const { resources, machines } = state;

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
    updateTooltips();

    // 生産ラインの表示更新
    updateProductionGrid(state);
}

function updateAllButtons() {
    const state = getGameState();
    const { resources, machines, research, bonuses } = state;

    for (const machineId in machines) {
        updateMachineButtons(machineId, state);
    }

    // 研究ボタン
    const unlockBtn = ui.unlockResearchFacilityBtn;
    if (unlockBtn) {
        const canAfford = resources.credits >= research.researchFacility.unlockCost;
        const isUnlocked = research.researchFacility.unlocked;
        unlockBtn.style.display = isUnlocked ? 'none' : 'block';
        ui.researchOptions.style.display = isUnlocked ? 'flex' : 'none';
        updateButtonState(unlockBtn, canAfford, isUnlocked);
    }

    // 他の研究ボタンも同様に...
}

function updateMachineButtons(machineId, state) {
    const { resources, machines, bonuses } = state;
    const machine = machines[machineId];
    if (!machine) return;

    const buyBtn = document.getElementById(`buy${capitalizeFirstLetter(machineId)}Btn`);
    const upgradeBtn = document.getElementById(`upgrade${capitalizeFirstLetter(machineId)}Btn`);

    if (buyBtn) {
        const cost = getMachineCost(machine, state);
        const canAfford = checkCanAfford(cost, resources);
        const isMaxCount = machine.count >= machine.maxCount;
        updateButtonState(buyBtn, canAfford, isMaxCount);
    }

    if (upgradeBtn) {
        const cost = getMachineUpgradeCost(machine, state);
        const canAfford = checkCanAfford(cost, resources);
        const isMaxLevel = machine.level >= machine.maxLevel;
        updateButtonState(upgradeBtn, canAfford, isMaxLevel);
    }
}


function updateButtonState(button, canAfford, isMaxed) {
    if (!button) return;

    button.disabled = !canAfford || isMaxed;
    button.classList.remove('button-primary', 'button-secondary', 'button-disabled', 'button-maxed');

    if (isMaxed) {
        button.classList.add('button-maxed');
    } else if (canAfford) {
        button.classList.add(button.id.includes('upgrade') ? 'button-secondary' : 'button-primary');
    } else {
        button.classList.add('button-disabled');
    }
}


function updateTooltips() {
    const state = getGameState();
    for (const machineId in state.machines) {
        const buyBtn = document.getElementById(`buy${capitalizeFirstLetter(machineId)}Btn`);
        const upgradeBtn = document.getElementById(`upgrade${capitalizeFirstLetter(machineId)}Btn`);
        if (buyBtn) {
            buyBtn.querySelector('.tooltip').innerHTML = generateTooltipContent(machineId, 'buy', state);
        }
        if (upgradeBtn) {
            upgradeBtn.querySelector('.tooltip').innerHTML = generateTooltipContent(machineId, 'upgrade', state);
        }
    }
    // 他のツールチップも同様に...
}

function generateTooltipContent(id, type, state) {
    const { machines, resources } = state;
    const machine = machines[id];
    let content = '';

    if (type === 'buy') {
        if (machine.count >= machine.maxCount) return '最大数に達しました';
        const cost = getMachineCost(machine, state);
        content += `<strong>${machine.name} (Lv.${machine.level})</strong><br>`;
        content += `現在: ${machine.count} / ${machine.maxCount}<br><hr>`;
        content += '<strong>コスト:</strong><br>';
        content += formatCostForTooltip(cost, resources);
    } else if (type === 'upgrade') {
        if (machine.level >= machine.maxLevel) return '最大レベルです';
        const cost = getMachineUpgradeCost(machine, state);
        content += `<strong>${machine.name} アップグレード</strong><br>`;
        content += `Lv.${machine.level} → Lv.${machine.level + 1}<br><hr>`;
        content += '<strong>コスト:</strong><br>';
        content += formatCostForTooltip(cost, resources);
    }
    return content;
}

function formatCostForTooltip(cost, resources) {
    let html = '';
    for (const resourceType in cost) {
        const hasEnough = resources[resourceType] >= cost[resourceType];
        const className = hasEnough ? '' : 'insufficient';
        html += `<div class="cost-item ${className}">
                    <span>${translateResource(resourceType)}:</span>
                    <span>${formatNumber(cost[resourceType])}</span>
                 </div>`;
    }
    return html;
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

function calculateOreStorageCapacity() {
    const { machines } = getGameState();
    return (machines.warehouse.count * machines.warehouse.baseStorageCapacity) + 1000;
}

export function showMessage(msg, type = 'info') {
    ui.messageDisplay.textContent = msg;
    ui.messageDisplay.className = 'message-display'; // Reset classes
    ui.messageDisplay.classList.add(`message-${type}`);
    ui.messageDisplay.classList.add('visible');
    setTimeout(() => {
        ui.messageDisplay.classList.remove('visible');
    }, 3000);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function translateResource(type) {
    switch(type) {
        case 'credits': return 'クレジット';
        case 'ingot': return 'インゴット';
        case 'researchPoints': return '研究ポイント';
        case 'ore': return '原石';
        default: return type;
    }
}

export function getUIElements() {
    return ui;
}

function updateProductionGrid(state) {
    const { machines } = state;
    const grid = ui.productionArea.querySelector('#productionGrid');
    if (!grid) return;

    grid.innerHTML = ''; // グリッドをクリア

    for (const machineId in machines) {
        const machine = machines[machineId];
        if (machine.count > 0) {
            const el = document.createElement('div');
            el.className = 'production-item bg-gray-700 p-3 rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-600';
            el.dataset.machineId = machineId;

            el.innerHTML = `
                <div>
                    <h4 class="font-bold text-lg">${machine.name}</h4>
                    <p class="text-sm text-gray-400">数: ${machine.count} / ${machine.maxCount}</p>
                    <p class="text-sm text-gray-400">レベル: ${machine.level} / ${machine.maxLevel}</p>
                </div>
                <div class="production-status">
                    <span class="text-2xl">⚙️</span>
                </div>
            `;

            el.addEventListener('click', () => {
                // TODO: 詳細表示などのインタラクションをここに追加
                showMessage(`${machine.name} が選択されました`, 'info');
            });

            grid.appendChild(el);
        }
    }
}
