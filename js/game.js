// ゲームの状態変数
    let ore = 0;
        let ingot = 0;
        let credits = 0;
        let researchPoints = 0;

        // グローバルボーナス
        let globalProductionBonus = 0;
        let globalCostReduction = 0;
        let autoSellOreActive = false;
        let autoSellTriggered = false;

        // グローバルな生産レート変数
        var effectiveOreProductionRate = 0;
        var effectiveIngotProductionRate = 0;
        var effectiveResearchPointProductionRate = 0;
        var effectiveCreditsPerSecondRate = 0;
        var totalManualClickProductionRate = 0;

        // 定数
        const UPGRADE_RP_COST_MULTIPLIER = 1.5;
        const UPGRADE_INGOT_MULTIPLIER = 2;

        // 装置データ
        const machines = {
            smallDrill: {
                count: 0,
                maxCount: 1, // 購入上限を1個に設定
                level: 1,
                maxLevel: 2, // アップグレード上限をレベル2に設定
                name: '硬いつるはし',
                manualClickBonus: 1,
                upgradeBonus: 0.1,
                getCost: (count) => Math.floor(50 * Math.pow(2, count) * (1 - globalCostReduction)),
                getUpgradeCost: (level) => Math.floor(50 * Math.pow(UPGRADE_RP_COST_MULTIPLIER, level - 1)),
                getUpgradeIngotCost: (level) => Math.floor(machines.smallDrill.getUpgradeCost(level) * UPGRADE_INGOT_MULTIPLIER),
                displayId: null, // Hardcoded display, not in production area grid
                countId: 'smallDrillCount',
                levelId: 'smallDrillLevel',
                costId: 'smallDrillCost',
                upgradeCostId: 'smallDrillUpgradeCost',
                upgradeIngotCostId: 'smallDrillUpgradeIngotCost',
            },
            mediumDrill: {
                count: 0,
                maxCount: 2, // 購入上限を2個に設定
                level: 1,
                maxLevel: 2, // アップグレード上限をレベル2に設定
                name: 'ドリル',
                manualClickBonus: 3,
                baseConsumption: 1.0,
                humanResourceCostFactor: 0.25,
                upgradeBonus: 0.12,
                getCost: (count) => Math.floor(100 * Math.pow(2, count) * (1 - globalCostReduction)),
                getUpgradeCost: (level) => Math.floor(100 * Math.pow(UPGRADE_RP_COST_MULTIPLIER, level - 1)),
                getUpgradeIngotCost: (level) => Math.floor(machines.mediumDrill.getUpgradeCost(level) * UPGRADE_INGOT_MULTIPLIER),
                getHumanResourceCost: (count) => Math.floor(machines.mediumDrill.getCost(count) * machines.mediumDrill.humanResourceCostFactor),
                displayId: 'mediumDrillDisplay',
                countId: 'mediumDrillCount',
                levelId: 'mediumDrillLevel',
                costId: 'mediumDrillCost',
                upgradeCostId: 'mediumDrillUpgradeCost',
                humanResourceCostId: 'mediumDrillHRMCost',
                upgradeIngotCostId: 'mediumDrillUpgradeIngotCost',
            },
            largeDrill: {
                count: 0,
                maxCount: 3, // 購入上限を3個に設定
                level: 1,
                maxLevel: 2, // アップグレード上限をレベル2に設定
                name: 'すごいドリル',
                manualClickBonus: 10,
                baseConsumption: 3.0,
                humanResourceCost: 100,
                ingotCost: 100,
                upgradeBonus: 0.15,
                getCost: (count) => Math.floor(1000 * Math.pow(2, count) * (1 - globalCostReduction)),
                getUpgradeCost: (level) => Math.floor(200 * Math.pow(UPGRADE_RP_COST_MULTIPLIER, level - 1)),
                getUpgradeIngotCost: (level) => Math.floor(machines.largeDrill.getUpgradeCost(level) * UPGRADE_INGOT_MULTIPLIER),
                getHumanResourceCost: (count) => machines.largeDrill.humanResourceCost,
                displayId: 'largeDrillDisplay',
                countId: 'largeDrillCount',
                levelId: 'largeDrillLevel',
                costId: 'largeDrillCost',
                upgradeCostId: 'largeDrillUpgradeCost',
                humanResourceCostId: 'largeDrillHRMCost',
                ingotCostId: 'largeDrillIngotCost',
                upgradeIngotCostId: 'largeDrillUpgradeIngotCost',
            },
            smeltingFurnace: {
                count: 0,
                maxCount: 10, // 購入上限を10個に設定
                level: 1,
                maxLevel: 5, // アップグレード上限をレベル5に設定
                baseProduction: 0.5,
                baseConsumption: 2,
                consumptionReductionBonus: 0.1,
                upgradeBonus: 0.1,
                getCost: (count) => Math.floor(100 * Math.pow(2, count) * (1 - globalCostReduction)),
                getUpgradeCost: (level) => Math.floor(200 * Math.pow(UPGRADE_RP_COST_MULTIPLIER, level - 1)),
                getUpgradeIngotCost: (level) => Math.floor(machines.smeltingFurnace.getUpgradeCost(level) * UPGRADE_INGOT_MULTIPLIER),
                displayId: 'smeltingFurnaceDisplay',
                countId: 'smeltingFurnaceCount',
                levelId: 'smeltingFurnaceLevel',
                costId: 'smeltingFurnaceCost',
                upgradeCostId: 'smeltingFurnaceUpgradeCost',
                powerCostId: 'smeltingFurnacePowerCost',
                consumptionReductionId: 'smeltingFurnaceConsumptionReduction',
                upgradeIngotCostId: 'smeltingFurnaceUpgradeIngotCost',
            },
            generator: {
                count: 0,
                maxCount: 10, // 購入上限を10個に設定
                level: 1,
                maxLevel: 5, // アップグレード上限をレベル5に設定
                baseProduction: 5,
                upgradeBonus: 0.08,
                getCost: (count) => Math.floor(300 * Math.pow(1.5, count) * (1 - globalCostReduction)),
                getUpgradeCost: (level) => Math.floor(100 * Math.pow(UPGRADE_RP_COST_MULTIPLIER, level - 1)),
                getUpgradeIngotCost: (level) => Math.floor(machines.generator.getUpgradeCost(level) * UPGRADE_INGOT_MULTIPLIER),
                displayId: 'generatorDisplay',
                countId: 'generatorCount',
                levelId: 'generatorLevel',
                costId: 'generatorCost',
                upgradeCostId: 'generatorUpgradeCost',
                upgradeIngotCostId: 'generatorUpgradeIngotCost',
            },
            researchModule: {
                count: 0,
                maxCount: 10, // 購入上限を10個に設定
                level: 1,
                maxLevel: 5, // アップグレード上限をレベル5に設定
                name: '研究棟',
                baseProduction: 0.2,
                baseConsumption: 2.5,
                consumptionReductionBonus: 0.1,
                upgradeBonus: 0.15,
                getCost: (count) => Math.floor(500 * (1 - globalCostReduction)),
                getUpgradeCost: (level) => Math.floor(300 * Math.pow(UPGRADE_RP_COST_MULTIPLIER, level - 1)),
                getUpgradeIngotCost: (level) => Math.floor(machines.researchModule.getUpgradeCost(level) * UPGRADE_INGOT_MULTIPLIER),
                displayId: 'researchModuleDisplay',
                countId: 'researchModuleCount',
                levelId: 'researchModuleLevel',
                costId: 'researchModuleCost',
                upgradeCostId: 'researchModuleUpgradeCost',
                powerCostId: 'researchModulePowerCost',
                consumptionReductionId: 'researchModuleConsumptionReduction',
                upgradeIngotCostId: 'researchModuleUpgradeIngotCost',
            },
            smallAutomationDevice: {
                count: 0,
                maxCount: 1, // 購入上限を1個に設定
                level: 1,
                maxLevel: 2, // アップグレード上限をレベル2に設定
                name: '小型自動化装置',
                baseProductionMultiplier: 0.5,
                baseConsumption: 0.5,
                upgradeBonus: 0.1,
                getCost: (count) => Math.floor(500 * (1 - globalCostReduction)),
                ingotCost: 100,
                getUpgradeCost: (level) => Math.floor(100 * Math.pow(UPGRADE_RP_COST_MULTIPLIER, level - 1)),
                getUpgradeIngotCost: (level) => Math.floor(machines.smallAutomationDevice.getUpgradeCost(level) * UPGRADE_INGOT_MULTIPLIER),
                displayId: 'smallAutomationDeviceDisplay',
                countId: 'smallAutomationDeviceCount',
                levelId: 'smallAutomationDeviceLevel',
                costId: 'smallAutomationDeviceCost',
                powerCostId: 'smallAutomationDevicePowerCost',
                ingotCostId: 'smallAutomationDeviceIngotCost',
                upgradeCostId: 'smallAutomationDeviceUpgradeCost',
                upgradeIngotCostId: 'smallAutomationDeviceUpgradeIngotCost',
            },
            mediumAutomationDevice: {
                count: 0,
                maxCount: 1, // 購入上限を1個に設定
                level: 1,
                maxLevel: 2, // アップグレード上限をレベル2に設定
                name: '中型自動化装置',
                baseProductionMultiplier: 1.0,
                baseConsumption: 1.5,
                upgradeBonus: 0.12,
                getCost: (count) => Math.floor(1000 * (1 - globalCostReduction)),
                ingotCost: 200,
                getUpgradeCost: (level) => Math.floor(500 * Math.pow(UPGRADE_RP_COST_MULTIPLIER, level - 1)),
                getUpgradeIngotCost: (level) => Math.floor(machines.mediumAutomationDevice.getUpgradeCost(level) * UPGRADE_INGOT_MULTIPLIER),
                displayId: 'mediumAutomationDeviceDisplay',
                countId: 'mediumAutomationDeviceCount',
                levelId: 'mediumAutomationDeviceLevel',
                costId: 'mediumAutomationDeviceCost',
                powerCostId: 'mediumAutomationDevicePowerCost',
                ingotCostId: 'mediumAutomationDeviceIngotCost',
                upgradeCostId: 'mediumAutomationDeviceUpgradeCost',
                upgradeIngotCostId: 'mediumAutomationDeviceUpgradeIngotCost',
            },
            largeAutomationDevice: {
                count: 0,
                maxCount: 1, // 購入上限を1個に設定
                level: 1,
                maxLevel: 2, // アップグレード上限をレベル2に設定
                name: '大型自動化装置',
                baseProductionMultiplier: 2.0,
                baseConsumption: 3.0,
                upgradeBonus: 0.15,
                getCost: (count) => Math.floor(1500 * (1 - globalCostReduction)),
                ingotCost: 300,
                getUpgradeCost: (level) => Math.floor(1000 * Math.pow(UPGRADE_RP_COST_MULTIPLIER, level - 1)),
                getUpgradeIngotCost: (level) => Math.floor(machines.largeAutomationDevice.getUpgradeCost(level) * UPGRADE_INGOT_MULTIPLIER),
                displayId: 'largeAutomationDeviceDisplay',
                countId: 'largeAutomationDeviceCount',
                levelId: 'largeAutomationDeviceLevel',
                costId: 'largeAutomationDeviceCost',
                powerCostId: 'largeAutomationDevicePowerCost',
                ingotCostId: 'largeAutomationDeviceIngotCost',
                upgradeCostId: 'largeAutomationDeviceUpgradeCost',
                upgradeIngotCostId: 'largeAutomationDeviceUpgradeIngotCost',
            },
            warehouse: {
                count: 0,
                maxCount: 10,
                name: '倉庫',
                baseStorageCapacity: 1000,
                getCost: (count) => Math.floor(500 * (1 - globalCostReduction)),
                displayId: 'warehouseDisplay',
                countId: 'warehouseCount',
                levelId: 'warehouseLevel',
                costId: 'warehouseCost',
                capacityId: 'warehouseCapacity',
                nextCapacityId: 'warehouseNextCapacity',
            }
        };

        // 研究データ
        const research = {
            researchFacility: {
                unlocked: false,
                unlockCost: 100,
                displayId: 'researchFacilitySection',
                unlockBtnId: 'unlockResearchFacilityBtn',
                unlockCostId: 'unlockResearchFacilityCost',
                optionsDisplayId: 'researchOptions'
            },
            overallEfficiency: { // 名称変更
                level: 0,
                maxLevel: 5, // 変更: 最大レベル5
                baseCost: 50, // 変更: コスト半分
                costMultiplier: 1.5,
                effectPerLevel: 0.05, // +5% production speed
                getCost: (level) => Math.floor(research.overallEfficiency.baseCost * Math.pow(research.overallEfficiency.costMultiplier, level)),
                getIngotCost: (level) => Math.floor(research.overallEfficiency.getCost(level) * UPGRADE_INGOT_MULTIPLIER),
                getEffect: (level) => level * research.overallEfficiency.effectPerLevel,
                btnId: 'researchDrillEfficiencyBtn', // IDはそのまま
                costId: 'researchDrillEfficiencyCost',
                ingotCostId: 'researchDrillEfficiencyIngotCost',
            },
            constructionCost: {
                level: 0,
                maxLevel: 5, // 変更: 最大レベル5
                baseCost: 25, // 変更: コスト半分
                costMultiplier: 1.5,
                effectPerLevel: 0.02,
                getCost: (level) => Math.floor(research.constructionCost.baseCost * Math.pow(research.constructionCost.costMultiplier, level)),
                getIngotCost: (level) => Math.floor(research.constructionCost.getCost(level) * UPGRADE_INGOT_MULTIPLIER),
                getEffect: (level) => level * research.constructionCost.effectPerLevel,
                btnId: 'researchConstructionCostBtn',
                costId: 'researchConstructionCost',
                ingotCostId: 'researchConstructionIngotCost',
            },
            autoSellOre: {
                researched: false,
                cost: 100,
                ingotCost: 200,
                type: 'automation',
                btnId: 'researchAutoSellOreBtn',
                costId: 'researchAutoSellOreCost',
                ingotCostId: 'researchAutoSellOreIngotCost',
                unlockCondition: () => research.researchFacility.unlocked,
            }
        };

        // UI要素の参照
        const oreCountElem = document.getElementById('oreCount');
        const ingotCountElem = document.getElementById('ingotCount');
        const creditCountElem = document.getElementById('creditCount');
        const powerConsumptionDisplayElem = document.getElementById('powerConsumptionDisplay');
        const powerGenerationDisplayElem = document.getElementById('powerGenerationDisplay');
        const researchPointCountElem = document.getElementById('researchPointCount');

        const orePerSecondElem = document.getElementById('orePerSecond');
        const ingotPerSecondElem = document.getElementById('ingotPerSecond');
        const creditsPerSecondElem = document.getElementById('creditsPerSecond');
        const researchPointPerSecondElem = document.getElementById('researchPointPerSecond');
        const oreStorageCapacityElem = document.getElementById('oreStorageCapacity');

        const miningRock = document.getElementById('miningRock');

        // 原石売却ボタンの参照と数量
        const oreSellQuantities = [10, 50, 100, 1000];
        const oreSellRate = 0.5;
        const ingotSellRate = 0.55;

        // 各装置のUI要素を動的に取得
        const getMachineUIElements = (machineName) => {
            const machine = machines[machineName];
            const elements = {
                display: document.getElementById(machine.displayId),
                count: document.getElementById(machine.countId),
                level: document.getElementById(machine.levelId),
                buyBtn: document.getElementById(`buy${capitalizeFirstLetter(machineName)}Btn`),
                upgradeBtn: document.getElementById(`upgrade${capitalizeFirstLetter(machineName)}Btn`),
                costElem: document.getElementById(machine.costId),
                upgradeCostElem: document.getElementById(machine.upgradeCostId),
                humanResourceCostElem: document.getElementById(machine.humanResourceCostId),
                ingotCostElem: document.getElementById(machine.ingotCostId),
                powerCostElem: document.getElementById(machine.powerCostId),
                consumptionReductionElem: document.getElementById(machine.consumptionReductionId),
                capacityElem: document.getElementById(machine.capacityId),
                nextCapacityElem: document.getElementById(machine.nextCapacityId),
                titleElem: document.getElementById(`${machineName}Title`),
                upgradeIngotCostElem: document.getElementById(machine.upgradeIngotCostId),
            };
            return elements;
        };

        // 研究項目のUI要素を動的に取得
        const getResearchUIElements = (researchName) => {
            const researchItem = research[researchName];
            const elements = {
                btn: document.getElementById(researchItem.btnId),
                costElem: document.getElementById(researchItem.costId),
                ingotCostElem: document.getElementById(researchItem.ingotCostId),
            };
            return elements;
        };

        // メッセージ表示関数
        function showMessage(msg, type = 'info') { // type引数を追加
            const messageDisplay = document.getElementById('messageDisplay');
            messageDisplay.textContent = msg;

            // 既存のクラスを削除
            messageDisplay.classList.remove('bg-red-700', 'bg-green-600', 'bg-blue-600');

            // タイプに応じて色を変更
            if (type === 'success') {
                messageDisplay.classList.add('bg-green-600');
            } else if (type === 'error') {
                messageDisplay.classList.add('bg-red-700');
            } else {
                messageDisplay.classList.add('bg-blue-600'); // デフォルトの色
            }

            messageDisplay.classList.remove('opacity-0');
            setTimeout(() => {
                messageDisplay.classList.add('opacity-0');
            }, 3000); // メッセージ表示時間を3秒に統一
        }

        // --- Helper Function for Button State and Tooltip ---
        function updateButtonAndTooltip(button, isDisabled, tooltipContent) {
            if (!button) return;
            button.disabled = isDisabled;
            button.className = isDisabled ? 'button-disabled' : 'button-primary';
            const tooltipSpan = button.querySelector('.tooltip');
            if (tooltipSpan) {
                tooltipSpan.innerHTML = tooltipContent;
                tooltipSpan.style.opacity = isDisabled ? '0' : '1';
            }
        }
        // --- End Helper Function ---


        // イベントリスナー
        miningRock.addEventListener('click', () => {
            let clickAmount = 1;
            clickAmount += machines.smallDrill.count * machines.smallDrill.manualClickBonus * (1 + (machines.smallDrill.level - 1) * machines.smallDrill.upgradeBonus);
            clickAmount += machines.mediumDrill.count * machines.mediumDrill.manualClickBonus * (1 + (machines.mediumDrill.level - 1) * machines.mediumDrill.upgradeBonus);
            clickAmount += machines.largeDrill.count * machines.largeDrill.manualClickBonus * (1 + (machines.largeDrill.level - 1) * machines.largeDrill.upgradeBonus);
            
            const maxOreStorage = calculateMaxOreStorage();
            ore = Math.min(ore + clickAmount, maxOreStorage);
            updateUI();
        });

        // 原石売却ボタンのイベントリスナーを設定
        oreSellQuantities.forEach(quantity => {
            const sellBtn = document.getElementById(`sellOre${quantity}Btn`);
            if (sellBtn) {
                sellBtn.addEventListener('click', () => {
                    if (ore >= quantity) {
                        ore -= quantity;
                        credits += quantity * oreSellRate;
                        updateUI();
                    } else {
                        showMessage('原石が足りません！', 'error');
                    }
                });
                // Initial tooltip state for sell buttons (hidden, controlled by CSS hover)
                const tooltipSpan = sellBtn.querySelector('.tooltip');
                if (tooltipSpan) {
                    tooltipSpan.style.opacity = '0';
                    tooltipSpan.style.pointerEvents = 'none';
                }
            }
        });

        // 各装置の購入・アップグレードボタンのイベントリスナーを設定
        for (const machineName in machines) {
            const ui = getMachineUIElements(machineName);
            const machine = machines[machineName];

            if (ui.buyBtn) {
                ui.buyBtn.addEventListener('click', () => {
                    // 購入上限チェック
                    if (machine.maxCount !== undefined && machine.count >= machine.maxCount) {
                        showMessage(`「${machine.name}」はこれ以上購入できません！`, 'error');
                        return;
                    }

                    const currentCost = machine.getCost(machine.count);
                    let humanResourceCost = 0;
                    if (machine.getHumanResourceCost) {
                        humanResourceCost = machine.getHumanResourceCost(machine.count);
                    }
                    const totalCost = currentCost + humanResourceCost;

                    if (machine.ingotCost && ingot < machine.ingotCost) {
                        showMessage('インゴットが足りません！', 'error');
                        return;
                    }

                    if (credits < totalCost) {
                        showMessage('クレジットが足りません！', 'error');
                        return;
                    }

                    // 購入条件を削除したため、発電機や特定の装置の条件はここではチェックしない
                    // ただし、電力消費装置の生産停止はgameLoopで処理される
                    
                    credits -= totalCost;
                    if (machine.ingotCost) {
                        ingot -= machine.ingotCost;
                    }
                    machine.count++;
                    updateUI();
                });
            }

            if (ui.upgradeBtn && machineName !== 'warehouse') {
                ui.upgradeBtn.addEventListener('click', () => {
                    // アップグレード上限チェック
                    if (machine.maxLevel !== undefined && machine.level >= machine.maxLevel) {
                        showMessage(`「${machine.name}」のアップグレードは最大レベルです！`, 'error');
                        return;
                    }

                    const rpCost = machine.getUpgradeCost(machine.level);
                    const ingotCost = machine.getUpgradeIngotCost(machine.level);
                    
                    if (researchPoints >= rpCost && ingot >= ingotCost) {
                        researchPoints -= rpCost;
                        ingot -= ingotCost;
                        machine.level++;
                        updateUI();
                    } else {
                        showMessage('研究ポイントまたはインゴットが足りません！', 'error');
                    }
                });
            }
        }

        // 研究施設のアンロックボタン
        const unlockResearchFacilityBtn = document.getElementById(research.researchFacility.unlockBtnId);
        if (unlockResearchFacilityBtn) {
            unlockResearchFacilityBtn.addEventListener('click', () => {
                const cost = research.researchFacility.unlockCost;
                if (credits >= cost) { // アンロック条件はクレジットのみ
                    credits -= cost;
                    research.researchFacility.unlocked = true;
                    updateUI();
                } else {
                    showMessage('クレジットが足りません！', 'error');
                }
            });
        }

        // 各研究項目のボタン
        for (const researchName of ['overallEfficiency', 'constructionCost']) {
            const ui = getResearchUIElements(researchName);
            const item = research[researchName];
            if (ui.btn) {
                ui.btn.addEventListener('click', () => {
                    if (item.level < item.maxLevel) {
                        const rpCost = item.getCost(item.level);
                        const ingotCost = item.getIngotCost(item.level);
                        if (researchPoints >= rpCost && ingot >= ingotCost) {
                            researchPoints -= rpCost;
                            ingot -= ingotCost;
                            item.level++;
                            applyResearchEffects();
                            updateUI();
                        } else {
                            showMessage('研究ポイントまたはインゴットが足りません！', 'error');
                        }
                    } else {
                        showMessage('この研究は最大レベルです！', 'error');
                    }
                });
            }
        }

        const researchAutoSellOreBtn = document.getElementById(research.autoSellOre.btnId);
        if (researchAutoSellOreBtn) {
            researchAutoSellOreBtn.addEventListener('click', () => {
                const item = research.autoSellOre;
                if (!item.researched) {
                    const rpCost = item.cost;
                    const ingotCost = item.ingotCost;
                    if (researchPoints >= rpCost && ingot >= ingotCost) {
                        researchPoints -= rpCost;
                        ingot -= ingotCost;
                        item.researched = true;
                        applyResearchEffects();
                        updateUI();
                    } else {
                        showMessage('研究ポイントまたはインゴットが足りません！', 'error');
                    }
                } else {
                    showMessage('この研究は既に完了しています！', 'error');
                }
            });
        }


        // 研究効果の適用
        function applyResearchEffects() {
            globalProductionBonus = 0;
            globalCostReduction = 0;
            autoSellOreActive = research.autoSellOre.researched;

            globalProductionBonus += research.overallEfficiency.getEffect(research.overallEfficiency.level);
            globalCostReduction += research.constructionCost.getEffect(research.constructionCost.level);
        }

        // 倉庫の最大容量を計算する関数
        function calculateMaxOreStorage() {
            // 倉庫が0個でも初期容量1000
            const warehouse = machines.warehouse;
            return (warehouse.count + 1) * warehouse.baseStorageCapacity;
        }

        // UI更新関数
        function updateUI() {
            for (const machineName in machines) {
                const machine = machines[machineName];
                const ui = getMachineUIElements(machineName);
                updateMachineUI(machineName, machine, ui);
            }

            // 電力生産
            const totalGeneratorProduction = machines.generator.count * machines.generator.baseProduction * (1 + (machines.generator.level - 1) * machines.generator.upgradeBonus);

            // 電力消費
            let totalPotentialPowerConsumptionPerSecond = 0;
            
            totalPotentialPowerConsumptionPerSecond += machines.mediumDrill.count * machines.mediumDrill.baseConsumption;
            totalPotentialPowerConsumptionPerSecond += machines.largeDrill.count * machines.largeDrill.baseConsumption;
            
            const smeltingFurnaceConsumptionReduction = (machines.smeltingFurnace.level - 1) * machines.smeltingFurnace.consumptionReductionBonus;
            totalPotentialPowerConsumptionPerSecond += machines.smeltingFurnace.count * machines.smeltingFurnace.baseConsumption * Math.max(0, (1 - smeltingFurnaceConsumptionReduction));

            const researchModuleConsumptionReduction = (machines.researchModule.level - 1) * machines.researchModule.consumptionReductionBonus;
            totalPotentialPowerConsumptionPerSecond += machines.researchModule.count * machines.researchModule.baseConsumption * Math.max(0, (1 - researchModuleConsumptionReduction));

            totalPotentialPowerConsumptionPerSecond += machines.smallAutomationDevice.count * machines.smallAutomationDevice.baseConsumption;
            totalPotentialPowerConsumptionPerSecond += machines.mediumAutomationDevice.count * machines.mediumAutomationDevice.baseConsumption;
            totalPotentialPowerConsumptionPerSecond += machines.largeAutomationDevice.count * machines.largeAutomationDevice.baseConsumption;
            
            const netPowerBalance = totalGeneratorProduction - totalPotentialPowerConsumptionPerSecond;

            effectiveOreProductionRate = 0;
            effectiveIngotProductionRate = 0;
            effectiveResearchPointProductionRate = 0;
            effectiveCreditsPerSecondRate = 0;

            totalManualClickProductionRate = 0;
            totalManualClickProductionRate += machines.smallDrill.count * machines.smallDrill.manualClickBonus * (1 + (machines.smallDrill.level - 1) * machines.smallDrill.upgradeBonus);
            totalManualClickProductionRate += machines.mediumDrill.count * machines.mediumDrill.manualClickBonus * (1 + (machines.mediumDrill.level - 1) * machines.mediumDrill.upgradeBonus);
            totalManualClickProductionRate += machines.largeDrill.count * machines.largeDrill.manualClickBonus * (1 + (machines.largeDrill.level - 1) * machines.largeDrill.upgradeBonus);
            totalManualClickProductionRate *= (1 + globalProductionBonus);


            // 電力需給バランスが正の場合のみ、電力消費装置が生産
            if (netPowerBalance >= 0) {
                effectiveOreProductionRate += machines.smallAutomationDevice.count * machines.smallAutomationDevice.baseProductionMultiplier * totalManualClickProductionRate * (1 + (machines.smallAutomationDevice.level - 1) * machines.smallAutomationDevice.upgradeBonus);
                effectiveOreProductionRate += machines.mediumAutomationDevice.count * machines.mediumAutomationDevice.baseProductionMultiplier * totalManualClickProductionRate * (1 + (machines.mediumAutomationDevice.level - 1) * machines.mediumAutomationDevice.upgradeBonus);
                effectiveOreProductionRate += machines.largeAutomationDevice.count * machines.largeAutomationDevice.baseProductionMultiplier * totalManualClickProductionRate * (1 + (machines.largeAutomationDevice.level - 1) * machines.largeAutomationDevice.upgradeBonus);

                if (machines.smeltingFurnace.count > 0) {
                    const potentialIngotProductionRate = machines.smeltingFurnace.count * machines.smeltingFurnace.baseProduction * (1 + (machines.smeltingFurnace.level - 1) * machines.smeltingFurnace.upgradeBonus);
                    const oreNeededForPotentialIngot = potentialIngotProductionRate;

                    if (ore >= oreNeededForPotentialIngot * deltaTime) {
                        effectiveIngotProductionRate = potentialIngotProductionRate;
                        ore -= oreNeededForPotentialIngot * deltaTime;
                        ingot += effectiveIngotProductionRate * deltaTime;
                        effectiveCreditsPerSecondRate += effectiveIngotProductionRate * ingotSellRate;
                    } else {
                        const availableOreRate = ore / deltaTime;
                        effectiveIngotProductionRate = availableOreRate;
                        ore -= availableOreRate * deltaTime;
                        ingot += effectiveIngotProductionRate * deltaTime;
                        effectiveCreditsPerSecondRate += availableOreRate * ingotSellRate;
                    }
                }

                effectiveResearchPointProductionRate += machines.researchModule.count * machines.researchModule.baseProduction * (1 + (machines.researchModule.level - 1) * machines.researchModule.upgradeBonus);
            }

            // 各リソースの量を更新
            const maxOreStorage = calculateMaxOreStorage();
            ore = Math.min(ore + effectiveOreProductionRate * deltaTime, maxOreStorage);
            researchPoints += effectiveResearchPointProductionRate * deltaTime;
            credits += effectiveCreditsPerSecondRate * deltaTime;

            // 自動原石売却の処理 (容量の50%で全売却)
            if (autoSellOreActive) {
                const currentMaxOreStorage = calculateMaxOreStorage();
                // 無限容量でなく、原石が容量の50%以上で、かつ前回自動売却トリガーが発動していない場合
                if (currentMaxOreStorage !== Infinity && ore >= currentMaxOreStorage * 0.5 && !autoSellTriggered) {
                    credits += ore * oreSellRate;
                    ore = 0;
                    autoSellTriggered = true; // 自動売却が一度発動したことを記録
                } else if (ore < currentMaxOreStorage * 0.5) {
                    autoSellTriggered = false; // 容量の50%を下回ったらリセット
                }
            }

            // 倉庫のUI更新
            const warehouse = machines.warehouse;
            const warehouseUI = getMachineUIElements('warehouse');
            const currentCost = warehouse.getCost(warehouse.count);

            // 所持数・容量表示
            if (warehouseUI.count) warehouseUI.count.textContent = formatNumber(warehouse.count);
            if (warehouseUI.capacityElem) warehouseUI.capacityElem.textContent = formatNumber(calculateMaxOreStorage());

            // 購入ボタンの状態とツールチップ
            const isDisabledBuy = credits < currentCost || warehouse.count >= warehouse.maxCount;
            let warehouseBuyTooltipContent;
            if (warehouse.count >= warehouse.maxCount) {
                warehouseBuyTooltipContent = `売り切れ<br>最終容量: ${formatNumber(calculateMaxOreStorage())}`;
            } else {
                warehouseBuyTooltipContent = `コスト: <span id="warehouseCost">${formatNumber(currentCost)}</span> CR<br>容量: ${formatNumber((warehouse.count + 1) * warehouse.baseStorageCapacity)}`;
            }
            updateButtonAndTooltip(warehouseUI.buyBtn, isDisabledBuy, warehouseBuyTooltipContent);

            // ボタンの色を更新
            warehouseUI.buyBtn.className = isDisabledBuy ? 'button-disabled' : 'button-primary';

            if (warehouseUI.costElem) warehouseUI.costElem.textContent = formatNumber(currentCost);
        }

        // nullチェックを簡略化
        function getMachineUIElements(machineName) {
            const machine = machines[machineName];
            const elements = {
                display: document.getElementById(machine.displayId),
                count: document.getElementById(machine.countId),
                level: document.getElementById(machine.levelId),
                buyBtn: document.getElementById(`buy${capitalizeFirstLetter(machineName)}Btn`),
                upgradeBtn: document.getElementById(`upgrade${capitalizeFirstLetter(machineName)}Btn`),
                costElem: document.getElementById(machine.costId),
                upgradeCostElem: document.getElementById(machine.upgradeCostId),
                humanResourceCostElem: document.getElementById(machine.humanResourceCostId),
                ingotCostElem: document.getElementById(machine.ingotCostId),
                powerCostElem: document.getElementById(machine.powerCostId),
                consumptionReductionElem: document.getElementById(machine.consumptionReductionId),
                capacityElem: document.getElementById(machine.capacityId),
                nextCapacityElem: document.getElementById(machine.nextCapacityId),
                titleElem: document.getElementById(`${machineName}Title`),
                upgradeIngotCostElem: document.getElementById(machine.upgradeIngotCostId),
            };
            return elements;
        }

        // UI要素を更新する共通関数
        function updateMachineUI(machineName, machine, ui) {
            const currentCost = machine.getCost(machine.count);
            const currentUpgradeCost = machine.getUpgradeCost ? machine.getUpgradeCost(machine.level) : 0;
            const currentUpgradeIngotCost = machine.getUpgradeIngotCost ? machine.getUpgradeIngotCost(machine.level) : 0;

            // 購入ボタンの状態更新
            const isMaxCountReached = machine.maxCount !== undefined && machine.count >= machine.maxCount;
            const isDisabledBuy = credits < currentCost || isMaxCountReached || (machine.ingotCost !== undefined && ingot < machine.ingotCost);
            let buyTooltipContent = isMaxCountReached
                ? `購入上限: ${machine.maxCount}個`
                : `コスト: <span id="${machine.costId}">${formatNumber(currentCost)}</span> CR` +
                  (machine.ingotCost !== undefined ? `<br>インゴット: <span id="${machine.ingotCostId}">${formatNumber(machine.ingotCost)}</span>` : '');
            updateButtonAndTooltip(ui.buyBtn, isDisabledBuy, buyTooltipContent);

            // アップグレードボタンの状態更新
            const isUpgradeMaxLevel = machine.maxLevel !== undefined && machine.level >= machine.maxLevel;
            const isDisabledUpgrade = isUpgradeMaxLevel || researchPoints < currentUpgradeCost || ingot < currentUpgradeIngotCost;
            let upgradeTooltipContent = isUpgradeMaxLevel
                ? `この装置は最大レベルです！<br>レベル: MAX`
                : `コスト: <span id="${machine.upgradeCostId}">${formatNumber(currentUpgradeCost)}</span> RP<br>インゴット: <span id="${machine.upgradeIngotCostId}">${formatNumber(currentUpgradeIngotCost)}</span>`;
            updateButtonAndTooltip(ui.upgradeBtn, isDisabledUpgrade, upgradeTooltipContent);
        }

        // ゲーム開始
        window.onload = function() {
            // Initial setup for UI and game loop, deferred slightly to ensure DOM is fully ready
            setTimeout(() => {
                initializeSaveLoad(); // セーブ/ロード機能の初期化
                loadGame(); // 自動ロード
                applyResearchEffects();
                updateUI(); 
                setInterval(gameLoop, 100);
            }, 0);
        };
        console.log("ゲームスクリプト読み込み完了");

        // --- セーブ/ロード機能 ---

        const SAVE_KEY = 'mineClickerSaveData';

/**
 * 現在のゲーム状態をオブジェクトとして集約します。
 */
function getGameState() {
    const machineStates = {};
    for (const machineName in machines) {
        machineStates[machineName] = {
            count: machines[machineName].count,
            level: machines[machineName].level,
        };
    }

    const researchStates = {};
    for (const researchName in research) {
        researchStates[researchName] = {
            level: research[researchName].level,
            unlocked: research[researchName].unlocked,
            researched: research[researchName].researched,
        };
    }

    return {
        ore,
        ingot,
        credits,
        researchPoints,
        machines: machineStates,
        research: researchStates,
    };
}

/**
 * ゲームの状態をlocalStorageに保存します。
 */
function saveGame() {
    try {
        const gameState = getGameState();
        localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
        showMessage('ゲームを保存しました。', 'success');
    } catch (e) {
        console.error('セーブに失敗しました。', e);
        showMessage('セーブに失敗しました。', 'error');
    }
}

/**
 * localStorageからゲームの状態を読み込み、適用します。
 */
function loadGame() {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (!savedData) {
        return; // セーブデータがなければ何もしない
    }

    try {
        const gameState = JSON.parse(savedData);

        ore = gameState.ore || 0;
        ingot = gameState.ingot || 0;
        credits = gameState.credits || 0;
        researchPoints = gameState.researchPoints || 0;

        for (const machineName in gameState.machines) {
            if (machines[machineName]) {
                machines[machineName].count = gameState.machines[machineName].count || 0;
                machines[machineName].level = gameState.machines[machineName].level || 1;
            }
        }

        for (const researchName in gameState.research) {
            if (research[researchName]) {
                Object.assign(research[researchName], gameState.research[researchName]);
            }
        }

        applyResearchEffects();
        updateUI();
        showMessage('ゲームをロードしました。', 'info');
    } catch (e) {
        console.error('ロードに失敗しました。', e);
        showMessage('ロードに失敗しました。データが破損している可能性があります。', 'error');
    }
}

/**
 * ゲームデータをリセットします。
 */
function resetGame() {
    if (confirm('本当にゲームデータをリセットしますか？この操作は元に戻せません。')) {
        localStorage.removeItem(SAVE_KEY);
        location.reload();
    }
}

/**
 * セーブ/ロードボタンにイベントリスナーを登録します。
 */
function initializeSaveLoad() {
    document.getElementById('saveGameBtn').addEventListener('click', saveGame);
    document.getElementById('loadGameBtn').addEventListener('click', loadGame);
    document.getElementById('resetGameBtn').addEventListener('click', resetGame);
}

// 初期値
let warehouseCount = 0;
let warehouseCapacity = 1000;
const warehouseMax = 10;
const warehouseUnitCapacity = 1000;
const warehouseCost = 400; // CR

// UI初期化
function updateWarehouseUI() {
    const warehouse = machines.warehouse;
    const warehouseUI = getMachineUIElements('warehouse');
    const currentCost = warehouse.getCost(warehouse.count);

    const isDisabledBuy = credits < currentCost || warehouse.count >= warehouse.maxCount;
    const buyBtn = warehouseUI.buyBtn;

    if (buyBtn) {
        buyBtn.classList.toggle('disabled', isDisabledBuy);
        buyBtn.disabled = isDisabledBuy;
    }

    if (warehouseUI.costElem) warehouseUI.costElem.textContent = formatNumber(currentCost);
    if (warehouseUI.capacityElem) warehouseUI.capacityElem.textContent = formatNumber(calculateMaxOreStorage());
}

document.getElementById('buyWarehouseBtn').addEventListener('click', function() {
    const warehouse = machines.warehouse;
    const currentCost = warehouse.getCost(warehouse.count);

    if (credits >= currentCost && warehouse.count < warehouse.maxCount) {
        credits -= currentCost;
        warehouse.count++;
        updateWarehouseUI();
        updateUI(); // UI全体を更新
    } else {
        showMessage('倉庫を購入するための条件が満たされていません！', 'error');
    }
});

// ゲーム進行時にUI更新
function gameTick() {
    // ...他の処理...
    updateWarehouseUI();
}

// 倉庫の最大容量を計算する関数
function calculateMaxOreStorage() {
    // 倉庫が0個でも初期容量1000
    const warehouse = machines.warehouse;
    return (warehouse.count + 1) * warehouse.baseStorageCapacity;
}

// UI更新関数
function updateUI() {
    for (const machineName in machines) {
        const machine = machines[machineName];
        const ui = getMachineUIElements(machineName);
        updateMachineUI(machineName, machine, ui);
    }

    // 電力生産
    const totalGeneratorProduction = machines.generator.count * machines.generator.baseProduction * (1 + (machines.generator.level - 1) * machines.generator.upgradeBonus);

    // 電力消費
    let totalPotentialPowerConsumptionPerSecond = 0;
    
    totalPotentialPowerConsumptionPerSecond += machines.mediumDrill.count * machines.mediumDrill.baseConsumption;
    totalPotentialPowerConsumptionPerSecond += machines.largeDrill.count * machines.largeDrill.baseConsumption;
    
    const smeltingFurnaceConsumptionReduction = (machines.smeltingFurnace.level - 1) * machines.smeltingFurnace.consumptionReductionBonus;
    totalPotentialPowerConsumptionPerSecond += machines.smeltingFurnace.count * machines.smeltingFurnace.baseConsumption * Math.max(0, (1 - smeltingFurnaceConsumptionReduction));

    const researchModuleConsumptionReduction = (machines.researchModule.level - 1) * machines.researchModule.consumptionReductionBonus;
    totalPotentialPowerConsumptionPerSecond += machines.researchModule.count * machines.researchModule.baseConsumption * Math.max(0, (1 - researchModuleConsumptionReduction));

    totalPotentialPowerConsumptionPerSecond += machines.smallAutomationDevice.count * machines.smallAutomationDevice.baseConsumption;
    totalPotentialPowerConsumptionPerSecond += machines.mediumAutomationDevice.count * machines.mediumAutomationDevice.baseConsumption;
    totalPotentialPowerConsumptionPerSecond += machines.largeAutomationDevice.count * machines.largeAutomationDevice.baseConsumption;
    
    const netPowerBalance = totalGeneratorProduction - totalPotentialPowerConsumptionPerSecond;

    effectiveOreProductionRate = 0;
    effectiveIngotProductionRate = 0;
    effectiveResearchPointProductionRate = 0;
    effectiveCreditsPerSecondRate = 0;

    totalManualClickProductionRate = 0;
    totalManualClickProductionRate += machines.smallDrill.count * machines.smallDrill.manualClickBonus * (1 + (machines.smallDrill.level - 1) * machines.smallDrill.upgradeBonus);
    totalManualClickProductionRate += machines.mediumDrill.count * machines.mediumDrill.manualClickBonus * (1 + (machines.mediumDrill.level - 1) * machines.mediumDrill.upgradeBonus);
    totalManualClickProductionRate += machines.largeDrill.count * machines.largeDrill.manualClickBonus * (1 + (machines.largeDrill.level - 1) * machines.largeDrill.upgradeBonus);
    totalManualClickProductionRate *= (1 + globalProductionBonus);


    // 電力需給バランスが正の場合のみ、電力消費装置が生産
    if (netPowerBalance >= 0) {
        effectiveOreProductionRate += machines.smallAutomationDevice.count * machines.smallAutomationDevice.baseProductionMultiplier * totalManualClickProductionRate * (1 + (machines.smallAutomationDevice.level - 1) * machines.smallAutomationDevice.upgradeBonus);
        effectiveOreProductionRate += machines.mediumAutomationDevice.count * machines.mediumAutomationDevice.baseProductionMultiplier * totalManualClickProductionRate * (1 + (machines.mediumAutomationDevice.level - 1) * machines.mediumAutomationDevice.upgradeBonus);
        effectiveOreProductionRate += machines.largeAutomationDevice.count * machines.largeAutomationDevice.baseProductionMultiplier * totalManualClickProductionRate * (1 + (machines.largeAutomationDevice.level - 1) * machines.largeAutomationDevice.upgradeBonus);

        if (machines.smeltingFurnace.count > 0) {
            const potentialIngotProductionRate = machines.smeltingFurnace.count * machines.smeltingFurnace.baseProduction * (1 + (machines.smeltingFurnace.level - 1) * machines.smeltingFurnace.upgradeBonus);
            const oreNeededForPotentialIngot = potentialIngotProductionRate;

            if (ore >= oreNeededForPotentialIngot * deltaTime) {
                effectiveIngotProductionRate = potentialIngotProductionRate;
                ore -= oreNeededForPotentialIngot * deltaTime;
                ingot += effectiveIngotProductionRate * deltaTime;
                effectiveCreditsPerSecondRate += effectiveIngotProductionRate * ingotSellRate;
            } else {
                const availableOreRate = ore / deltaTime;
                effectiveIngotProductionRate = availableOreRate;
                ore -= availableOreRate * deltaTime;
                ingot += effectiveIngotProductionRate * deltaTime;
                effectiveCreditsPerSecondRate += availableOreRate * ingotSellRate;
            }
        }

        effectiveResearchPointProductionRate += machines.researchModule.count * machines.researchModule.baseProduction * (1 + (machines.researchModule.level - 1) * machines.researchModule.upgradeBonus);
    }

    // 各リソースの量を更新
    const maxOreStorage = calculateMaxOreStorage();
    ore = Math.min(ore + effectiveOreProductionRate * deltaTime, maxOreStorage);
    researchPoints += effectiveResearchPointProductionRate * deltaTime;
    credits += effectiveCreditsPerSecondRate * deltaTime;

    // 自動原石売却の処理 (容量の50%で全売却)
    if (autoSellOreActive) {
        const currentMaxOreStorage = calculateMaxOreStorage();
        // 無限容量でなく、原石が容量の50%以上で、かつ前回自動売却トリガーが発動していない場合
        if (currentMaxOreStorage !== Infinity && ore >= currentMaxOreStorage * 0.5 && !autoSellTriggered) {
            credits += ore * oreSellRate;
            ore = 0;
            autoSellTriggered = true; // 自動売却が一度発動したことを記録
        } else if (ore < currentMaxOreStorage * 0.5) {
            autoSellTriggered = false; // 容量の50%を下回ったらリセット
        }
    }

    // 倉庫のUI更新
    const warehouse = machines.warehouse;
    const warehouseUI = getMachineUIElements('warehouse');
    const currentCost = warehouse.getCost(warehouse.count);

    // 所持数・容量表示
    if (warehouseUI.count) warehouseUI.count.textContent = formatNumber(warehouse.count);
    if (warehouseUI.capacityElem) warehouseUI.capacityElem.textContent = formatNumber(calculateMaxOreStorage());

    // 購入ボタンの状態とツールチップ
    const isDisabledBuy = credits < currentCost || warehouse.count >= warehouse.maxCount;
    let warehouseBuyTooltipContent;
    if (warehouse.count >= warehouse.maxCount) {
        warehouseBuyTooltipContent = `売り切れ<br>最終容量: ${formatNumber(calculateMaxOreStorage())}`;
    } else {
        warehouseBuyTooltipContent = `コスト: <span id="warehouseCost">${formatNumber(currentCost)}</span> CR<br>容量: ${formatNumber((warehouse.count + 1) * warehouse.baseStorageCapacity)}`;
    }
    updateButtonAndTooltip(warehouseUI.buyBtn, isDisabledBuy, warehouseBuyTooltipContent);

    // ボタンの色を更新
    warehouseUI.buyBtn.className = isDisabledBuy ? 'button-disabled' : 'button-primary';

    if (warehouseUI.costElem) warehouseUI.costElem.textContent = formatNumber(currentCost);
}

// 研究施設の表示とボタンの状態更新
const researchFacilitySection = document.getElementById(research.researchFacility.displayId);
const researchOptions = document.getElementById(research.researchFacility.optionsDisplayId);
const unlockResearchFacilityCostElem = document.getElementById(research.researchFacility.unlockCostId);

researchFacilitySection.style.display = 'flex'; 

if (!research.researchFacility.unlocked) {
    unlockResearchFacilityBtn.style.display = 'block';
    researchOptions.style.display = 'none';
    const isDisabledUnlock = credits < research.researchFacility.unlockCost;
    updateButtonAndTooltip(unlockResearchFacilityBtn, isDisabledUnlock, `コスト: <span id="${research.researchFacility.unlockCostId}">${formatNumber(research.researchFacility.unlockCost)}</span> CR`);
    if (unlockResearchFacilityCostElem) unlockResearchFacilityCostElem.textContent = formatNumber(research.researchFacility.unlockCost);
} else {
    unlockResearchFacilityBtn.style.display = 'none';
    researchOptions.style.display = 'flex';
}

// 各研究項目のボタンの状態更新
if (research.researchFacility.unlocked) {
    // Overall Efficiency (formerly Drill Efficiency)
    const overallEfficiencyUI = getResearchUIElements('overallEfficiency'); // Use new research name
    const overallEfficiencyItem = research.overallEfficiency; // Use new research name
    if (overallEfficiencyUI.btn) {
        const rpCost = overallEfficiencyItem.getCost(overallEfficiencyItem.level);
        const ingotCost = overallEfficiencyItem.getIngotCost(overallEfficiencyItem.level);
        const isDisabledResearch = overallEfficiencyItem.level >= overallEfficiencyItem.maxLevel || researchPoints < rpCost || ingot < ingotCost;
        
        let researchTooltipContent;
        if (overallEfficiencyItem.level >= overallEfficiencyItem.maxLevel) {
            researchTooltipContent = `この研究は最大レベルです！<br>レベル: MAX`;
        } else {
            const nextEffectDisplay = `+${formatNumber(overallEfficiencyItem.getEffect(overallEfficiencyItem.level + 1) * 100, 0)}% (次レベル)`;
            researchTooltipContent = `コスト: <span id="${overallEfficiencyItem.costId}">${formatNumber(rpCost)}</span> RP<br>インゴット: <span id="${overallEfficiencyItem.ingotCostId}">${formatNumber(ingotCost)}</span><br>効果: 全体の生産速度 ${nextEffectDisplay}<br>レベル: ${overallEfficiencyItem.level}/${overallEfficiencyItem.maxLevel}`;
        }
        updateButtonAndTooltip(overallEfficiencyUI.btn, isDisabledResearch, researchTooltipContent);
        if (overallEfficiencyUI.costElem) overallEfficiencyUI.costElem.textContent = formatNumber(rpCost);
        if (overallEfficiencyUI.ingotCostElem) overallEfficiencyUI.ingotCostElem.textContent = formatNumber(ingotCost);
        
        // Update button text for Overall Efficiency
        overallEfficiencyUI.btn.textContent = '全体効率改善';
        const spanForTooltip = document.createElement('span');
        spanForTooltip.className = 'tooltip absolute top-full left-1/2 -translate-x-1/2 mt-2';
        spanForTooltip.innerHTML = researchTooltipContent;
        if (!overallEfficiencyUI.btn.querySelector('.tooltip')) { // Add tooltip span if it doesn't exist
            overallEfficiencyUI.btn.appendChild(spanForTooltip);
        } else {
            overallEfficiencyUI.btn.querySelector('.tooltip').innerHTML = researchTooltipContent;
        }
    }


    // Construction Cost
    const constructionCostUI = getResearchUIElements('constructionCost');
    const constructionCostItem = research.constructionCost;
    if (constructionCostUI.btn) {
        const rpCost = constructionCostItem.getCost(constructionCostItem.level);
        const ingotCost = constructionCostItem.getIngotCost(constructionCostItem.level);
        const isDisabledResearch = constructionCostItem.level >= constructionCostItem.maxLevel || researchPoints < rpCost || ingot < ingotCost;
        
        let researchTooltipContent;
        if (constructionCostItem.level >= constructionCostItem.maxLevel) {
            researchTooltipContent = `この研究は最大レベルです！<br>レベル: MAX`;
        } else {
            const nextEffectDisplay = `-${formatNumber(constructionCostItem.getEffect(constructionCostItem.level + 1) * 100, 0)}% (次レベル)`;
            researchTooltipContent = `コスト: <span id="${constructionCostItem.costId}">${formatNumber(rpCost)}</span> RP<br>インゴット: <span id="${constructionCostItem.ingotCostId}">${formatNumber(ingotCost)}</span><br>効果: 全装置購入コスト ${nextEffectDisplay}<br>レベル: ${constructionCostItem.level}/${constructionCostItem.maxLevel}`;
        }
        updateButtonAndTooltip(constructionCostUI.btn, isDisabledResearch, researchTooltipContent);
        if (constructionCostUI.costElem) constructionCostUI.costElem.textContent = formatNumber(rpCost);
        if (constructionCostUI.ingotCostElem) constructionCostUI.ingotCostElem.textContent = formatNumber(ingotCost);
    }

    const autoSellOreUI = getResearchUIElements('autoSellOre');
    const autoSellOreItem = research.autoSellOre;
    if (autoSellOreUI.btn) {
        const isDisabledAutoSell = autoSellOreItem.researched || researchPoints < autoSellOreItem.cost || ingot < autoSellOreItem.ingotCost;
        let autoSellTooltipContent = '';
        if (autoSellOreItem.researched) {
            autoSellTooltipContent = `研究済み`;
        } else {
            autoSellTooltipContent = `コスト: <span id="${autoSellOreItem.costId}">${formatNumber(autoSellOreItem.cost)}</span> RP<br>インゴット: <span id="${autoSellOreItem.ingotCostId}">${formatNumber(autoSellOreItem.ingotCost)}</span><br>効果: 原石生産量が容量の50％まで来ると自動的に全売却`;
        }
        updateButtonAndTooltip(autoSellOreUI.btn, isDisabledAutoSell, autoSellTooltipContent);
        if (autoSellOreUI.costElem) autoSellOreUI.costElem.textContent = formatNumber(autoSellOreItem.cost);
        if (autoSellOreUI.ingotCostElem) autoSellOreUI.ingotCostElem.textContent = formatNumber(autoSellOreItem.ingotCost);
    }
}
