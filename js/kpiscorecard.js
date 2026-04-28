function initKPIApp() {
    let config = {};
    let agents = [];
    let currentAgentIndex = 0;
    let appMode = 'comparison'; // Default mode: comparison or single
    let formatMode = 'abbreviated'; // Default format mode
    
    // Store rendered Chart.js instances to avoid memory leaks
    window.activeCharts = [];

    // Register DataLabels globally for Chart.js
    if (window.ChartDataLabels) {
        Chart.register(ChartDataLabels);
    }

    // Standard KPIs mapping for smart features (Presets, Quick Add, Excel Import)
    const standardKpiMap = {
        "cs csat": { type: 'percentage', chartType: 'none', icon: 'fa-star', goal: 90, danger: 80 },
        "cs efficiency": { type: 'number', chartType: 'none', icon: 'fa-bolt', goal: 15.9, danger: 12.7 },
        "cs specialized qa": { type: 'percentage', chartType: 'none', icon: 'fa-gem', goal: 95, danger: 90 },
        "cs specialized efficiency": { type: 'number', chartType: 'none', icon: 'fa-bolt', goal: 20.9, danger: 16.7 },
        "moderation ads qa": { type: 'percentage', chartType: 'none', icon: 'fa-gem', goal: 95, danger: 90 },
        "moderation ads efficiency": { type: 'number', chartType: 'none', icon: 'fa-bolt', goal: 231, danger: 184.8 },
        "moderation content qa": { type: 'percentage', chartType: 'none', icon: 'fa-gem', goal: 94, danger: 88 },
        "moderation content efficiency": { type: 'number', chartType: 'none', icon: 'fa-bolt', goal: 139.3, danger: 111.4 },
        "moderation advanced qa": { type: 'percentage', chartType: 'none', icon: 'fa-gem', goal: 96, danger: 92 },
        "moderation advanced efficiency": { type: 'number', chartType: 'none', icon: 'fa-bolt', goal: 148.5, danger: 118.8 },
        "tns fraud detection": { type: 'percentage', chartType: 'none', icon: 'fa-user-secret', goal: 90, danger: 80 },
        "tns efficiency": { type: 'number', chartType: 'none', icon: 'fa-bolt', goal: 141, danger: 112.8 },
        "ads reviewed": { type: 'number', chartType: 'none', icon: 'fa-rectangle-ad', goal: '', danger: '' },
        "ads quality": { type: 'percentage', chartType: 'none', icon: 'fa-gem', goal: 95, danger: 90 },
        "tickets": { type: 'number', chartType: 'none', icon: 'fa-ticket-alt', goal: '', danger: '' },
        "messages": { type: 'number', chartType: 'none', icon: 'fa-message', goal: '', danger: '' },
        "users": { type: 'number', chartType: 'none', icon: 'fa-users', goal: '', danger: '' },
        "profiles": { type: 'number', chartType: 'none', icon: 'fa-id-card', goal: '', danger: '' },
        "cs tickets": { type: 'number', chartType: 'none', icon: 'fa-ticket-alt', goal: '', danger: '' },
        "qa checks": { type: 'number', chartType: 'none', icon: 'fa-spell-check', goal: '', danger: '' },
        "qa accuracy": { type: 'percentage', chartType: 'none', icon: 'fa-check-double', goal: 98, danger: 95 },
        "qa check efficiency": { type: 'number', chartType: 'none', icon: 'fa-bolt', goal: 100, danger: 60 }
    };

    // DOM Elements
    const cardContainer = document.getElementById('card-container');
    const placeholder = document.getElementById('placeholder');
    const exportActions = document.getElementById('export-actions');
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    // Config Form Elements
    const modeSelector = document.getElementById('app-mode');
    const formatSelector = document.getElementById('format-mode');
    const reportTitleInput = document.getElementById('report-title');
    const m1Input = document.getElementById('month1-label');
    const m2Input = document.getElementById('month2-label');
    const m1Container = document.getElementById('container-month1');
    const labelM2 = document.getElementById('label-month2');
    
    const teamHeaderInput = document.getElementById('team-header-input');
    const teamAchievementsList = document.getElementById('team-achievements-list');
    const addAchievementBtn = document.getElementById('add-achievement-btn');
    const positiveQuoteInput = document.getElementById('positive-quote');
    const kpiList = document.getElementById('kpi-list');
    const agentList = document.getElementById('agent-list');
    const addKpiBtn = document.getElementById('add-kpi-btn');
    const addAgentBtn = document.getElementById('add-agent-btn');
    const generateBtn = document.getElementById('generate-cards-btn');
    const finalGenerateBtn = document.getElementById('btn-final-generate');
    const excelFileInput = document.getElementById('excel-file-input');
    const downloadTemplateBtn = document.getElementById('btn-download-template');
    const resetBtn = document.getElementById('btn-reset-all');
    const btnClearAgentFields = document.getElementById('btn-clear-agent-fields');
    const btnDeleteAllAgents = document.getElementById('btn-delete-all-agents');
    const btnClearKpis = document.getElementById('btn-clear-kpis');
    
    const btnSaveLocalKpis = document.getElementById('btn-save-local-kpis');
    const btnLoadLocalKpis = document.getElementById('btn-load-local-kpis');
    const btnExportJsonKpis = document.getElementById('btn-export-json-kpis');
    const kpiPresetUpload = document.getElementById('kpi-preset-upload');

    const toggleExcelSection = document.getElementById('toggle-excel-section');
    const excelSectionBody = document.getElementById('excel-section-body');
    const excelChevron = document.getElementById('excel-chevron');
    
    const toggleQuickKpisSection = document.getElementById('toggle-quick-kpis-section');
    const quickKpisSectionBody = document.getElementById('quick-kpis-section-body');
    const quickKpisChevron = document.getElementById('quick-kpis-chevron');
    
    let deletedAgentNodes = []; // Store nodes for Undo action
    
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const downloadBtn = document.getElementById('download-btn');

    // Templates
    const achievementTemplate = document.getElementById('achievement-template');
    const kpiTemplate = document.getElementById('kpi-template');
    const agentTemplate = document.getElementById('agent-template');

    // --- THEME TOGGLE LOGIC ---
    if(themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const icon = themeToggleBtn.querySelector('i');
            if (document.body.classList.contains('light-theme')) {
                icon.classList.replace('fa-sun', 'fa-moon');
            } else {
                icon.classList.replace('fa-moon', 'fa-sun');
            }
            // Optional: Re-render charts to update colors immediately if card is visible
            if(document.getElementById('kpi-card')) {
                displayAgent(currentAgentIndex); 
            }
        });
    }
    
    // --- DYNAMIC PLACEHOLDERS (DATES) ---
    function initDatePlaceholders() {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const now = new Date();
        const currMonthIdx = now.getMonth();
        const prevMonthIdx = (currMonthIdx === 0) ? 11 : currMonthIdx - 1;
        
        const currYearStr = now.getFullYear().toString().slice(-2);
        const prevYearStr = (currMonthIdx === 0) ? (now.getFullYear() - 1).toString().slice(-2) : currYearStr;

        const currMonthName = months[currMonthIdx];
        const prevMonthName = months[prevMonthIdx];

        if(m1Input) { m1Input.placeholder = prevMonthName; m1Input.value = ""; }
        if(m2Input) { m2Input.placeholder = currMonthName; m2Input.value = ""; }
        
        updatePlaceholdersByMode(prevMonthName, currMonthName, prevYearStr, currYearStr);
        
        if (teamHeaderInput) {
            teamHeaderInput.value = `Team Achievements (${currMonthName})`;
        }
    }

    function updatePlaceholdersByMode(pMonth = null, cMonth = null, pYear = null, cYear = null) {
        if(!pMonth) pMonth = m1Input ? m1Input.placeholder : 'Prev';
        if(!cMonth) cMonth = m2Input ? m2Input.placeholder : 'Curr';
        
        const now = new Date();
        if(!pYear) pYear = (now.getMonth() === 0) ? (now.getFullYear() - 1).toString().slice(-2) : now.getFullYear().toString().slice(-2);
        if(!cYear) cYear = now.getFullYear().toString().slice(-2);

        if(reportTitleInput) {
            reportTitleInput.value = "";
            if (appMode === 'comparison') {
                reportTitleInput.placeholder = `Performance Review: ${pMonth} '${pYear} vs ${cMonth} '${cYear}`;
            } else {
                reportTitleInput.placeholder = `Performance Review: ${cMonth} 20${cYear}`;
            }
        }
    }

    // --- TOAST NOTIFICATION LOGIC ---
    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if(!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle';
        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // --- MODE LOGIC ---
    if(modeSelector) {
        modeSelector.addEventListener('change', (e) => {
            appMode = e.target.value;
            
            if(appMode === 'single') {
                if(m1Container) m1Container.style.display = 'none';
                if(labelM2) labelM2.innerText = 'Month Name';
            } else {
                if(m1Container) m1Container.style.display = 'block';
                if(labelM2) labelM2.innerText = 'Month 2 Name (Curr)';
            }
            
            updatePlaceholdersByMode();
            updateAgentKpiInputs(); // Re-render agent manual inputs based on mode
        });
    }

    if(formatSelector) {
        formatSelector.addEventListener('change', (e) => {
            formatMode = e.target.value;
            updateAgentKpiInputs(); // Updates manual entry view
            if(document.getElementById('kpi-card')) {
                displayAgent(currentAgentIndex); // Instantly updates the generated card if it exists
            }
        });
    }

    // Sync Team Header with Current Month
    if(m2Input && teamHeaderInput) {
        m2Input.addEventListener('input', (e) => {
            const val = e.target.value.trim() !== '' ? e.target.value : e.target.placeholder;
            teamHeaderInput.value = `Team Achievements (${val})`;
        });
    }

    // --- STEP TRACKING & MODAL LOGIC (Event Delegation for WP) ---
    function updateStepAnimations(completedStepNum) {
        document.querySelectorAll('.nav-btn[data-modal]').forEach(btn => {
            const stepNum = parseInt(btn.dataset.step);
            if (!stepNum) return;
            
            const badge = btn.querySelector('.step-badge');

            if (stepNum <= completedStepNum) {
                btn.classList.add('completed');
                btn.classList.remove('pulse');
                if(badge) badge.innerHTML = '<i class="fa-solid fa-check"></i>';
            } else if (stepNum === completedStepNum + 1) {
                btn.classList.add('pulse');
                btn.classList.remove('completed');
                if(badge) badge.innerHTML = stepNum;
            } else {
                btn.classList.remove('pulse', 'completed');
                if(badge) badge.innerHTML = stepNum;
            }
        });
    }

    document.addEventListener('click', (e) => {
        // Modal Triggers (Nav Buttons)
        const navBtn = e.target.closest('.nav-btn[data-modal]');
        if (navBtn) {
            const target = document.getElementById(navBtn.dataset.modal);
            if(target) {
                navBtn.classList.remove('pulse');
                target.classList.add('active');
            }
        }

        // Close Modals via 'X' Button
        const closeBtn = e.target.closest('.modal-close');
        if (closeBtn) {
            const modal = closeBtn.closest('.modal-backdrop');
            if(modal) modal.classList.remove('active');
        }

        // Close Modals on Background Click
        if (e.target.classList.contains('modal-backdrop')) {
            e.target.classList.remove('active');
        }

        // Close Tutorial "Got it" Button
        if (e.target.id === 'close-tutorial-btn') {
            const tutorialModal = document.getElementById('modal-tutorial');
            if (tutorialModal) tutorialModal.classList.remove('active');
        }

        // Next Step Buttons
        const nextBtn = e.target.closest('.btn-next-step');
        if (nextBtn) {
            const currentModal = document.getElementById(nextBtn.dataset.currentModal);
            if (currentModal) currentModal.classList.remove('active');
            
            const triggerNavBtn = document.querySelector(`.nav-btn[data-modal="${nextBtn.dataset.currentModal}"]`);
            if (triggerNavBtn && triggerNavBtn.dataset.step) {
                const stepNum = parseInt(triggerNavBtn.dataset.step);
                updateStepAnimations(stepNum);
                
                const nextNavBtn = document.querySelector(`.nav-btn[data-step="${stepNum + 1}"]`);
                if (nextNavBtn) {
                    setTimeout(() => nextNavBtn.click(), 300);
                }
            }
        }

        // Feedback Prompts
        if (e.target.classList.contains('btn-feedback')) {
            const targetId = e.target.dataset.target;
            if(targetId) {
                const inputElement = document.getElementById(targetId);
                if (inputElement) inputElement.value = e.target.dataset.text;
            }
        }

        // Agent Action Plan Prompts
        if (e.target.classList.contains('btn-prompt') && !e.target.classList.contains('btn-feedback') && !e.target.classList.contains('btn-quick-kpi') && !e.target.classList.contains('btn-role-preset') && e.target.id !== 'btn-clear-agents') {
            const formGroup = e.target.closest('.form-group');
            if (formGroup) {
                const textarea = formGroup.querySelector('.agent-data-strategy');
                if (textarea) textarea.value = e.target.dataset.text;
            }
        }

        // Undo Clear Agents action
        if (e.target.id === 'btn-undo-agents') {
            deletedAgentNodes.forEach(node => agentList.appendChild(node));
            deletedAgentNodes = [];
            updateAgentCounters();
            e.target.closest('.toast').remove();
            showToast('Agents successfully restored!', 'success');
        }

        // Collapsible Excel Section
        const toggleExcelBtn = e.target.closest('#toggle-excel-section');
        if (toggleExcelBtn) {
            excelSectionBody.classList.toggle('collapsed');
            excelChevron.classList.toggle('rotated');
        }
        
        // Collapsible Quick Add Single KPIs Section
        const toggleQuickKpisBtn = e.target.closest('#toggle-quick-kpis-section');
        if (toggleQuickKpisBtn) {
            quickKpisSectionBody.classList.toggle('collapsed');
            quickKpisChevron.classList.toggle('rotated');
        }

        // Role Presets (Quick Add KPIs + Agent)
        const roleBtn = e.target.closest('.btn-role-preset');
        if (roleBtn) {
            addRolePreset(roleBtn.dataset.role);
        }

        // Quick Add Single KPIs
        if (e.target.classList.contains('btn-quick-kpi')) {
            const name = e.target.dataset.name;
            const key = name.toLowerCase();

            const data = {
                name: name,
                type: e.target.dataset.type,
                icon: e.target.dataset.icon,
                goal: standardKpiMap[key] ? standardKpiMap[key].goal : '',
                danger: standardKpiMap[key] ? standardKpiMap[key].danger : '',
                chartType: standardKpiMap[key] ? standardKpiMap[key].chartType : 'none'
            };
            addKpi(data);
        }
    });

    // --- QUICK ROLE PRESETS LOGIC ---
    function addRolePreset(role) {
        const presets = {
            'cs-agent': {
                name: 'CS Agent',
                kpis: [
                    { name: 'CS Tickets', type: 'number', chartType: 'none', icon: 'fa-ticket-alt', goal: '', danger: '', defaultCurr: 500, defaultPrev: 450 },
                    { name: 'CS CSAT', type: 'percentage', chartType: 'none', icon: 'fa-star', goal: 75, danger: 50, defaultCurr: 80, defaultPrev: 72 },
                    { name: 'CS Efficiency', type: 'number', chartType: 'none', icon: 'fa-bolt', goal: 12, danger: 8, defaultCurr: 14, defaultPrev: 10 }
                ]
            },
            'moderator': {
                name: 'Moderator',
                kpis: [
                    { name: 'Ads Reviewed', type: 'number', chartType: 'none', icon: 'fa-rectangle-ad', goal: '', danger: '', defaultCurr: 3000, defaultPrev: 2800 },
                    { name: 'Ads Quality', type: 'percentage', chartType: 'none', icon: 'fa-gem', goal: 95, danger: 90, defaultCurr: 96, defaultPrev: 94 },
                    { name: 'Ads Efficiency', type: 'number', chartType: 'none', icon: 'fa-bolt', goal: 300, danger: 260, defaultCurr: 310, defaultPrev: 280 }
                ]
            },
            'qa-analyst': {
                name: 'QA Analyst',
                kpis: [
                    { name: 'QA Checks', type: 'number', chartType: 'none', icon: 'fa-spell-check', goal: '', danger: '', defaultCurr: 300, defaultPrev: 290 },
                    { name: 'QA Accuracy', type: 'percentage', chartType: 'none', icon: 'fa-check-double', goal: 98, danger: 95, defaultCurr: 99, defaultPrev: 97 },
                    { name: 'QA Check Efficiency', type: 'number', chartType: 'none', icon: 'fa-bolt', goal: 100, danger: 60, defaultCurr: 105, defaultPrev: 95 }
                ]
            }
        };

        const preset = presets[role];
        if(!preset) return;

        const existingNames = Array.from(kpiList.querySelectorAll('.kpi-name')).map(input => input.value.toLowerCase());
        let addedKpisCount = 0;

        // Add KPIs only if they don't exist
        preset.kpis.forEach(k => {
            if(!existingNames.includes(k.name.toLowerCase())) {
                addKpi(k);
                addedKpisCount++;
            }
        });

        // Add Sample Agent
        const agentData = {
            Name: `Sample ${preset.name}`,
            Role: preset.name,
            Level: Math.floor(Math.random() * 3) + 1,
            'Action Plan': 'Keep improving those metrics!',
            Quote: 'Quality is our priority!'
        };
        
        // Add default values for this preset's KPIs
        preset.kpis.forEach(k => {
            agentData[`Curr ${k.name}`] = k.defaultCurr;
            agentData[`Prev ${k.name}`] = k.defaultPrev;
            agentData[k.name] = k.defaultCurr; // Fallback for single mode smart import logic
        });

        addAgent(agentData);
        
        if (addedKpisCount > 0) {
            showToast(`Added ${addedKpisCount} new KPIs and 1 Sample Agent for ${preset.name}.`, 'success');
        } else {
            showToast(`Added 1 Sample Agent for ${preset.name}. (KPIs already existed)`, 'success');
        }
    }

    // --- CUSTOM KPI PRESETS (SAVE/LOAD) LOGIC ---
    function getCurrentKpiDefinitions() {
        const kpis = [];
        if(kpiList) {
            kpiList.querySelectorAll('.list-item').forEach(item => {
                kpis.push({
                    name: item.querySelector('.kpi-name').value,
                    type: item.querySelector('.kpi-type').value,
                    chartType: item.querySelector('.kpi-chart-type').value,
                    icon: item.querySelector('.kpi-icon').value,
                    goal: item.querySelector('.kpi-goal').value,
                    danger: item.querySelector('.kpi-danger').value
                });
            });
        }
        return kpis;
    }

    function loadKpisFromArray(kpiArray) {
        const existingNames = Array.from(kpiList.querySelectorAll('.kpi-name')).map(input => input.value.toLowerCase());
        let added = 0;
        kpiArray.forEach(k => {
            if(k.name && !existingNames.includes(k.name.toLowerCase())) {
                addKpi(k);
                added++;
            }
        });
        if(added > 0) {
            updateAgentKpiInputs();
        }
        return added;
    }

    // Save to LocalStorage
    if(btnSaveLocalKpis) {
        btnSaveLocalKpis.addEventListener('click', () => {
            const kpis = getCurrentKpiDefinitions();
            if(kpis.length === 0) {
                showToast('There are no KPIs to save. Add some first!', 'warning');
                return;
            }
            localStorage.setItem('cv_kpi_presets', JSON.stringify(kpis));
            showToast('KPI configuration successfully saved to your browser!', 'success');
        });
    }

    // Load from LocalStorage
    if(btnLoadLocalKpis) {
        btnLoadLocalKpis.addEventListener('click', () => {
            const saved = localStorage.getItem('cv_kpi_presets');
            if(!saved) {
                showToast('No saved configuration found in this browser.', 'warning');
                return;
            }
            try {
                const kpis = JSON.parse(saved);
                const addedCount = loadKpisFromArray(kpis);
                if (addedCount > 0) {
                    showToast(`Successfully loaded ${addedCount} KPIs from browser!`, 'success');
                } else {
                    showToast('Saved KPIs are already in the list.', 'warning');
                }
            } catch (e) {
                showToast('Error loading saved configuration.', 'warning');
            }
        });
    }

    // Export as JSON File
    if(btnExportJsonKpis) {
        btnExportJsonKpis.addEventListener('click', () => {
            const kpis = getCurrentKpiDefinitions();
            if(kpis.length === 0) {
                showToast('There are no KPIs to export. Add some first!', 'warning');
                return;
            }
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(kpis, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "custom_kpi_config.json");
            document.body.appendChild(downloadAnchorNode); // required for firefox
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            showToast('KPI configuration file downloaded successfully!', 'success');
        });
    }

    // Import from JSON File
    if(kpiPresetUpload) {
        kpiPresetUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedKpis = JSON.parse(e.target.result);
                    if (Array.isArray(importedKpis)) {
                        const addedCount = loadKpisFromArray(importedKpis);
                        if (addedCount > 0) {
                            showToast(`Successfully imported ${addedCount} KPIs from file!`, 'success');
                        } else {
                            showToast('Imported KPIs are already in the list.', 'warning');
                        }
                    } else {
                        showToast('Invalid file format. Expected a JSON array.', 'warning');
                    }
                } catch(err) {
                    console.error(err);
                    showToast('Error reading the configuration file.', 'warning');
                }
            };
            reader.readAsText(file);
            e.target.value = ''; // Reset input so the same file can be loaded again if needed
        });
    }

    // --- RESET FUNCTIONALITY ---
    if(resetBtn) {
        resetBtn.addEventListener('click', () => {
            if(confirm("Are you sure you want to clear all data? This cannot be undone.")) {
                if(teamAchievementsList) teamAchievementsList.innerHTML = '';
                if(kpiList) kpiList.innerHTML = '';
                if(agentList) agentList.innerHTML = '';
                
                appMode = 'comparison';
                if(modeSelector) modeSelector.value = 'comparison';
                formatMode = 'abbreviated';
                if(formatSelector) formatSelector.value = 'abbreviated';
                if(m1Container) m1Container.style.display = 'block';
                if(labelM2) labelM2.innerText = 'Month 2 Name (Curr)';

                initDatePlaceholders();
                if(positiveQuoteInput) positiveQuoteInput.value = "Great job this month, {name}!";
                if(excelFileInput) excelFileInput.value = '';
                
                if(cardContainer) {
                    cardContainer.innerHTML = `
                        <div class="placeholder" id="placeholder">
                            <i class="fa-solid fa-wand-magic-sparkles"></i>
                            <h2>Workspace Ready</h2>
                            <p>Follow steps 1 to 5 in the navigation bar to configure your data.</p>
                        </div>`;
                }
                if(exportActions) exportActions.style.display = 'none';
                
                document.querySelectorAll('.nav-btn[data-modal]').forEach(btn => {
                    btn.classList.remove('completed', 'pulse');
                    const badge = btn.querySelector('.step-badge');
                    if (badge && btn.dataset.step) badge.innerHTML = btn.dataset.step;
                    
                    if(btn.dataset.step === "1") btn.classList.add('pulse');
                });
                
                agents = [];
                config = {};
                updateAgentCounters();
            }
        });
    }

    // --- EVENT LISTENERS ---
    if(addAchievementBtn) addAchievementBtn.addEventListener('click', () => addAchievement());
    if(addKpiBtn) addKpiBtn.addEventListener('click', () => addKpi());
    if(addAgentBtn) addAgentBtn.addEventListener('click', () => addAgent());
    
    // Clear All KPIs
    if(btnClearKpis) {
        btnClearKpis.addEventListener('click', () => {
            if (kpiList.children.length === 0) return;
            if (confirm("Are you sure you want to delete all KPIs? This will also remove them from all agents.")) {
                kpiList.innerHTML = '';
                updateAgentKpiInputs();
                showToast('All KPIs deleted successfully.', 'success');
            }
        });
    }

    // Clear Agent Fields
    if(btnClearAgentFields) {
        btnClearAgentFields.addEventListener('click', () => {
            if (agentList.children.length === 0) return;
            if (confirm("Are you sure you want to clear all data fields? The agents will be kept, but their values will be erased.")) {
                agentList.querySelectorAll('.list-item').forEach(item => {
                    item.querySelectorAll('.agent-kpi-prev, .agent-kpi-curr, .agent-data-strategy, .agent-data-quote').forEach(input => {
                        input.value = '';
                    });
                });
                showToast('All agent fields have been cleared.', 'success');
            }
        });
    }

    // Delete All Agents with Undo
    if(btnDeleteAllAgents) {
        btnDeleteAllAgents.addEventListener('click', () => {
            if (agentList.children.length === 0) return;
            if (confirm("Are you sure you want to delete all agents from the list?")) {
                deletedAgentNodes = Array.from(agentList.children);
                agentList.innerHTML = '';
                updateAgentCounters();
                showToast('All agents deleted. <button id="btn-undo-agents" style="margin-left: 15px; background: none; border: none; color: #fff; text-decoration: underline; cursor: pointer; font-weight: bold; font-size: 0.9rem;">Undo</button>', 'warning');
            }
        });
    }

    const triggerGenerate = () => {
        generateCards();
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
        updateStepAnimations(5);
    };
    if(generateBtn) generateBtn.addEventListener('click', triggerGenerate);
    if(finalGenerateBtn) finalGenerateBtn.addEventListener('click', triggerGenerate);
    
    if(excelFileInput) excelFileInput.addEventListener('change', handleExcelUpload);
    if(downloadTemplateBtn) downloadTemplateBtn.addEventListener('click', downloadExcelTemplate);

    if(fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => { 
            const card = document.getElementById('kpi-card');
            if (document.fullscreenElement) document.exitFullscreen(); 
            else if(card) card.requestFullscreen().catch(err => console.log(err)); 
        });
    }
    
    if(downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const card = document.getElementById('kpi-card');
            if(card) downloadCard(card);
        });
    }

    // --- DYNAMIC FORM LOGIC ---
    function addAchievement(data = null) {
        if (!achievementTemplate || !teamAchievementsList) return;
        const clone = achievementTemplate.content.cloneNode(true);
        const achievementItem = clone.querySelector('.list-item');
        if (data) {
            achievementItem.querySelector('.achievement-value').value = data.value || '';
            achievementItem.querySelector('.achievement-text').value = data.text || '';
        }
        achievementItem.querySelector('.btn-remove').addEventListener('click', () => achievementItem.remove());
        teamAchievementsList.appendChild(clone);
    }

    function addKpi(data = null, insertAfterNode = null) {
        if (!kpiTemplate || !kpiList) return;
        const clone = kpiTemplate.content.cloneNode(true);
        const kpiItem = clone.querySelector('.list-item');
        
        if (data) {
            kpiItem.querySelector('.kpi-name').value = data.name || '';
            kpiItem.querySelector('.kpi-type').value = data.type || 'number';
            kpiItem.querySelector('.kpi-icon').value = data.icon || 'fa-bolt';
            kpiItem.querySelector('.kpi-goal').value = data.goal !== undefined ? data.goal : '';
            kpiItem.querySelector('.kpi-danger').value = data.danger !== undefined ? data.danger : '';
            if(data.chartType) kpiItem.querySelector('.kpi-chart-type').value = data.chartType;
        }

        // Action Buttons Setup
        kpiItem.querySelector('.remove').addEventListener('click', () => {
            kpiItem.remove();
            updateAgentKpiInputs();
        });

        kpiItem.querySelector('.move-up').addEventListener('click', () => {
            const prev = kpiItem.previousElementSibling;
            if (prev) {
                kpiItem.parentNode.insertBefore(kpiItem, prev);
                updateAgentKpiInputs();
            }
        });

        kpiItem.querySelector('.move-down').addEventListener('click', () => {
            const next = kpiItem.nextElementSibling;
            if (next) {
                // Insert next element BEFORE current to move current DOWN
                kpiItem.parentNode.insertBefore(next, kpiItem);
                updateAgentKpiInputs();
            }
        });

        kpiItem.querySelector('.duplicate').addEventListener('click', () => {
            const duplicateData = {
                name: kpiItem.querySelector('.kpi-name').value + ' (Copy)',
                type: kpiItem.querySelector('.kpi-type').value,
                chartType: kpiItem.querySelector('.kpi-chart-type').value,
                icon: kpiItem.querySelector('.kpi-icon').value,
                goal: kpiItem.querySelector('.kpi-goal').value,
                danger: kpiItem.querySelector('.kpi-danger').value
            };
            addKpi(duplicateData, kpiItem);
        });

        // Insert at specific place or append to end
        if (insertAfterNode && insertAfterNode.nextSibling) {
            insertAfterNode.parentNode.insertBefore(kpiItem, insertAfterNode.nextSibling);
        } else if (insertAfterNode) {
            insertAfterNode.parentNode.appendChild(kpiItem);
        } else {
            kpiList.appendChild(kpiItem);
        }
        
        updateAgentKpiInputs();
    }
    
    function addAgent(agentData = null) {
        if (!agentTemplate || !agentList) return;
        const clone = agentTemplate.content.cloneNode(true);
        const agentItem = clone.querySelector('.list-item');
        
        if (agentData) {
            agentItem.querySelector('.agent-data-name').value = agentData.Name || '';
            agentItem.querySelector('.agent-data-role').value = agentData.Role || '';
            agentItem.querySelector('.agent-data-level').value = agentData.Level || '';
            agentItem.querySelector('.agent-data-strategy').value = agentData['Action Plan'] || '';
            agentItem.querySelector('.agent-data-quote').value = agentData.Quote || '';
        }

        agentList.appendChild(clone);
        agentItem.querySelector('.btn-remove').addEventListener('click', () => {
            agentItem.remove();
            updateAgentCounters();
        });
        updateAgentKpiInputsFor(agentItem, agentData);
        updateAgentCounters();
        return agentItem;
    }
    
    function updateAgentCounters() {
        const count = agentList ? agentList.children.length : 0;
        const navBadge = document.getElementById('nav-agent-counter');
        const modalBadge = document.getElementById('modal-agent-counter');
        
        if (navBadge) {
            navBadge.textContent = count;
            navBadge.style.display = count > 0 ? 'inline-block' : 'none';
        }
        if (modalBadge) {
            modalBadge.textContent = count;
            modalBadge.style.display = count > 0 ? 'inline-block' : 'none';
        }
    }
    
    function updateAgentKpiInputs() {
        if (!agentList) return;
        agentList.querySelectorAll('.list-item').forEach(agentItem => updateAgentKpiInputsFor(agentItem));
    }

    function updateAgentKpiInputsFor(agentItem, initialData = null) {
        const kpiValuesContainer = agentItem.querySelector('.agent-kpi-values');
        const definedKpis = kpiList ? kpiList.querySelectorAll('.list-item') : [];
        
        const currentValues = {};
        const existingPrevInputs = kpiValuesContainer.querySelectorAll('.agent-kpi-prev');
        const existingCurrInputs = kpiValuesContainer.querySelectorAll('.agent-kpi-curr');
        
        existingPrevInputs.forEach((input, i) => {
            const id = input.dataset.kpiId;
            currentValues[id] = { 
                prev: input.value, 
                curr: existingCurrInputs[i] ? existingCurrInputs[i].value : '' 
            };
        });

        if (definedKpis.length === 0) {
             kpiValuesContainer.innerHTML = '<p style="color:var(--cv-text-muted); font-size:0.9rem;"><small><i class="fa-solid fa-circle-info"></i> Configure KPIs in Step 3 first to enter values here.</small></p>';
             return;
        }

        let kpiInputsHtml = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">';
        
        definedKpis.forEach((kpi, index) => {
            const kpiName = kpi.querySelector('.kpi-name').value || `KPI ${index + 1}`;
            const kpiGoal = kpi.querySelector('.kpi-goal').value;
            const kpiDanger = kpi.querySelector('.kpi-danger').value;
            const kpiId = kpiName.toLowerCase().replace(/\s+/g, '-');
            
            let goalText = '';
            if (kpiGoal) goalText += `(Goal: ${kpiGoal})`;
            if (kpiDanger) goalText += ` (Below < ${kpiDanger})`;
            if (!kpiGoal && !kpiDanger) goalText = '(Vol)';
            
            const m1 = (m1Input && m1Input.value) ? m1Input.value : (m1Input ? m1Input.placeholder : 'Prev');
            const m2 = (m2Input && m2Input.value) ? m2Input.value : (m2Input ? m2Input.placeholder : 'Curr');
            
            // Smart import: if single mode, we might just have `agentData['KPI Name']` instead of `Curr KPI Name`
            let existingPrev = currentValues[kpiId]?.prev ?? (initialData ? (initialData[`Prev ${kpiName}`] || '') : '');
            let existingCurr = currentValues[kpiId]?.curr ?? (initialData ? (initialData[`Curr ${kpiName}`] || initialData[kpiName] || '') : '');

            // Hide previous input if single mode
            const prevDisplay = appMode === 'single' ? 'none' : 'block';

            kpiInputsHtml += `
                <div class="form-group" style="margin-bottom:0; background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; border: 1px solid var(--cv-border-dark);">
                    <label style="margin-bottom:8px; color: var(--cv-accent-light); font-weight:600;">${kpiName} <span style="color:var(--cv-text-muted); font-weight:normal; font-size:0.8em; display:block;">${goalText}</span></label>
                    <div style="display: flex; gap: 10px;">
                        <input type="text" class="agent-kpi-prev" data-kpi-id="${kpiId}" value="${existingPrev}" placeholder="Prev (${m1})" style="display: ${prevDisplay}">
                        <input type="text" class="agent-kpi-curr" data-kpi-id="${kpiId}" value="${existingCurr}" placeholder="${appMode === 'single' ? 'Value' : 'Curr'} (${m2})">
                    </div>
                </div>
            `;
        });
        kpiInputsHtml += '</div>';
        kpiValuesContainer.innerHTML = kpiInputsHtml;
    }

    if(kpiList) {
        kpiList.addEventListener('input', (e) => {
            if (e.target.classList.contains('kpi-name') || e.target.classList.contains('kpi-goal') || e.target.classList.contains('kpi-danger') || e.target.classList.contains('kpi-chart-type')) {
                updateAgentKpiInputs();
            }
        });
    }
    
    if(m1Input) m1Input.addEventListener('input', updateAgentKpiInputs);
    if(m2Input) m2Input.addEventListener('input', updateAgentKpiInputs);

    // --- EXCEL TEMPLATE GENERATION ---
    function downloadExcelTemplate() {
        let cols = ["Name", "Role", "Level", "Action Plan", "Quote"];
        const definedKpis = kpiList.querySelectorAll('.list-item');
        
        if (definedKpis.length === 0) {
            alert("Please define at least one KPI in Step 3 before downloading the template.");
            const modalAgents = document.getElementById('modal-agents');
            const modalKpis = document.getElementById('modal-kpis');
            if(modalAgents) modalAgents.classList.remove('active');
            if(modalKpis) modalKpis.classList.add('active');
            return;
        }

        definedKpis.forEach((kpi, index) => {
            const name = kpi.querySelector('.kpi-name').value || `KPI ${index + 1}`;
            if (appMode === 'comparison') {
                cols.push(`Prev ${name}`, `Curr ${name}`);
            } else {
                cols.push(`Curr ${name}`);
            }
        });

        const ws_data = [cols];
        
        // Populate with current UI data or fallback to dummy
        let agentsData = [];
        
        if (agentList && agentList.children.length > 0) {
            // Export current loaded agents
            Array.from(agentList.children).forEach(item => {
                const name = item.querySelector('.agent-data-name').value;
                const role = item.querySelector('.agent-data-role').value;
                const level = item.querySelector('.agent-data-level').value;
                const strategy = item.querySelector('.agent-data-strategy').value;
                const quote = item.querySelector('.agent-data-quote').value;
                
                let row = [name, role, level, strategy, quote];
                
                definedKpis.forEach(kpi => {
                    const kpiName = kpi.querySelector('.kpi-name').value || 'KPI';
                    const kpiId = kpiName.toLowerCase().replace(/\s+/g, '-');
                    
                    const prevInput = item.querySelector(`.agent-kpi-prev[data-kpi-id="${kpiId}"]`);
                    const currInput = item.querySelector(`.agent-kpi-curr[data-kpi-id="${kpiId}"]`);
                    
                    if (appMode === 'comparison') {
                        row.push(prevInput ? prevInput.value : '', currInput ? currInput.value : '');
                    } else {
                        row.push(currInput ? currInput.value : '');
                    }
                });
                agentsData.push(row);
            });
        } else {
            // Fallback: 4 agents dummy data
            agentsData = [
                ["Cristian Villafañe", "Assignment Manager", "5", "Focus on maintaining excellent quality while gradually increasing volume.", "Tech and code lead the way!"],
                ["Linda Hernandez", "QA Specialist", "4", "Let's work together to boost efficiency this month. Make sure to track tasks precisely.", "Quality first."],
                ["Sara Valeria", "Customer Support Agent", "2", "Solid results! Continue supporting the team and maintaining your CSAT score.", "Always happy to help."],
                ["Alexander F.", "Transactions Agent", "3", "We need to align your metrics with the targets to prepare for your next promotion.", "Keep pushing forward!"]
            ];
            
            definedKpis.forEach((kpi) => {
                const name = (kpi.querySelector('.kpi-name').value || '').toLowerCase();
                const type = kpi.querySelector('.kpi-type').value;
                
                let v1p, v1c, v2p, v2c, v3p, v3c, v4p, v4c;

                if (type === 'percentage' || name.includes('csat') || name.includes('qa') || name.includes('fraud')) {
                    v1p = "92%"; v1c = "96%";
                    v2p = "85%"; v2c = "89%";
                    v3p = "78%"; v3c = "91%";
                    v4p = "95%"; v4c = "94%";
                } else if (name.includes('ads efficiency') || name.includes('moderation') && name.includes('efficiency')) {
                    v1p = "240.5"; v1c = "255.2";
                    v2p = "190.0"; v2c = "210.6";
                    v3p = "150.5"; v3c = "180.2";
                    v4p = "280.0"; v4c = "295.5";
                } else if (name.includes('efficiency')) { 
                    v1p = "15.5"; v1c = "20.2";
                    v2p = "12.0"; v2c = "14.6";
                    v3p = "9.5";  v3c = "16.1";
                    v4p = "18.0"; v4c = "19.5";
                } else if (name.includes('ads') || name.includes('messages') || name.includes('users') || name.includes('profiles')) {
                    v1p = "12500"; v1c = "15200";
                    v2p = "9800";  v2c = "10500";
                    v3p = "5400";  v3c = "8900";
                    v4p = "18000"; v4c = "19500";
                } else { 
                    v1p = "150"; v1c = "180";
                    v2p = "120"; v2c = "115";
                    v3p = "80";  v3c = "145";
                    v4p = "210"; v4c = "230";
                }
                
                if (appMode === 'comparison') {
                    agentsData[0].push(v1p, v1c);
                    agentsData[1].push(v2p, v2c);
                    agentsData[2].push(v3p, v3c);
                    agentsData[3].push(v4p, v4c);
                } else {
                    agentsData[0].push(v1c);
                    agentsData[1].push(v2c);
                    agentsData[2].push(v3c);
                    agentsData[3].push(v4c);
                }
            });
        }
        
        agentsData.forEach(agentRow => ws_data.push(agentRow));

        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Agent_Data_Template");
        XLSX.writeFile(wb, "Scorecard_Data.xlsx");
    }

    function handleExcelUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const agentDataList = XLSX.utils.sheet_to_json(worksheet);

                if (agentDataList.length === 0) {
                    alert("Excel file seems to be empty or in the wrong format.");
                    return;
                }
                
                // --- SMART KPI EXTRACTION LOGIC ---
                // Identify standard columns to ignore when extracting KPIs
                const baseColumns = ["name", "role", "level", "action plan", "quote"];
                const extractedKpis = new Set();

                // Scan the headers of the first row to detect KPIs
                Object.keys(agentDataList[0]).forEach(key => {
                    if (!baseColumns.includes(key.toLowerCase())) {
                        // Clean prefix if it's 'Curr ' or 'Prev '
                        const cleanName = key.replace(/^(Curr |Prev )/i, '').trim();
                        extractedKpis.add(cleanName);
                    }
                });

                const existingNames = Array.from(kpiList.querySelectorAll('.kpi-name')).map(input => input.value.toLowerCase());
                let newKpisCount = 0;

                // Automatically create KPIs if they don't exist
                extractedKpis.forEach(kpiName => {
                    const lowerName = kpiName.toLowerCase();
                    if (!existingNames.includes(lowerName)) {
                        // Build basic KPI Data
                        let newKpi = { name: kpiName, type: 'number', icon: 'fa-bolt', goal: '', danger: '', chartType: 'none' };
                        
                        // Try to find if it matches any standard predefined KPI
                        let knownKey = Object.keys(standardKpiMap).find(k => lowerName === k || lowerName.includes(k));
                        
                        if (knownKey && standardKpiMap[knownKey]) {
                            newKpi = { ...newKpi, ...standardKpiMap[knownKey], name: kpiName };
                        } else {
                            // Heuristic Guessing: Guess type from the actual data in the Excel
                            let hasPercent = false;
                            for(let i=0; i < Math.min(5, agentDataList.length); i++) {
                                const originalKeyCurr = Object.keys(agentDataList[i]).find(k => k.toLowerCase() === `curr ${lowerName}`);
                                const originalKeyBase = Object.keys(agentDataList[i]).find(k => k.toLowerCase() === lowerName);
                                
                                const val = agentDataList[i][originalKeyCurr] || agentDataList[i][originalKeyBase];
                                if(typeof val === 'string' && val.includes('%')) {
                                    hasPercent = true;
                                    break;
                                }
                            }
                            
                            // If data has '%', or name suggests it's a percentage
                            if (hasPercent || lowerName.includes('qa') || lowerName.includes('csat') || lowerName.includes('quality') || lowerName.includes('accuracy')) {
                                newKpi.type = 'percentage';
                                if(lowerName.includes('csat')) newKpi.icon = 'fa-star';
                                else newKpi.icon = 'fa-gem';
                            } else if (lowerName.includes('ticket') || lowerName.includes('ad') || lowerName.includes('message')) {
                                newKpi.icon = 'fa-ticket-alt';
                            }
                        }
                        
                        // Create the KPI
                        addKpi(newKpi);
                        newKpisCount++;
                    }
                });

                // Small delay to allow the DOM to render the newly added KPIs before binding inputs
                setTimeout(() => {
                    if (newKpisCount > 0) {
                        showToast(`<i class="fa-solid fa-magic"></i> Smart Import: Auto-created ${newKpisCount} KPIs from Excel headers!`, 'success');
                    }

                    if(agentList) agentList.innerHTML = '';
                    agentDataList.forEach(agentData => addAgent(agentData));
                    updateAgentCounters();
                    
                    if(excelFileInput) excelFileInput.value = '';
                }, 100);

            } catch (error) {
                console.error("Error processing Excel file:", error);
                alert("Failed to process the Excel file. Please ensure it's a valid .xlsx or .xls file and the format is correct.");
            }
        };
        reader.readAsArrayBuffer(file);
    }

    // --- CARD GENERATION AND DISPLAY LOGIC ---
    function generateCards() {
        config = {
            mode: appMode,
            format: formatMode,
            title: (reportTitleInput && reportTitleInput.value) ? reportTitleInput.value : (reportTitleInput ? reportTitleInput.placeholder : ''),
            month1: (m1Input && m1Input.value) ? m1Input.value : (m1Input ? m1Input.placeholder : 'Prev'),
            month2: (m2Input && m2Input.value) ? m2Input.value : (m2Input ? m2Input.placeholder : 'Curr'),
            teamTitle: teamHeaderInput ? teamHeaderInput.value : `Team Achievements (${m2Input ? m2Input.value || m2Input.placeholder : 'Curr'})`,
            defaultQuote: positiveQuoteInput ? positiveQuoteInput.value : '',
            teamAchievements: [],
            kpis: []
        };
        
        if(teamAchievementsList) {
            teamAchievementsList.querySelectorAll('.list-item').forEach(item => {
                config.teamAchievements.push({
                    value: item.querySelector('.achievement-value').value,
                    text: item.querySelector('.achievement-text').value
                });
            });
        }

        if(kpiList) {
            kpiList.querySelectorAll('.list-item').forEach((item, index) => {
                const name = item.querySelector('.kpi-name').value;
                config.kpis.push({
                    id: name.toLowerCase().replace(/\s+/g, '-') || `kpi-${index}`,
                    name: name,
                    icon: item.querySelector('.kpi-icon').value,
                    goal: item.querySelector('.kpi-goal').value ? parseFloat(item.querySelector('.kpi-goal').value) : null,
                    danger: item.querySelector('.kpi-danger').value ? parseFloat(item.querySelector('.kpi-danger').value) : null,
                    type: item.querySelector('.kpi-type').value,
                    chartType: item.querySelector('.kpi-chart-type').value
                });
            });
        }
        
        agents = [];
        if(agentList) {
            agentList.querySelectorAll('.list-item').forEach(item => {
                const agent = {
                    name: item.querySelector('.agent-data-name').value,
                    role: item.querySelector('.agent-data-role').value,
                    level: item.querySelector('.agent-data-level').value,
                    strategy: item.querySelector('.agent-data-strategy').value,
                    quote: item.querySelector('.agent-data-quote').value,
                    kpiValues: {}
                };
                
                const prevInputs = item.querySelectorAll('.agent-kpi-prev');
                const currInputs = item.querySelectorAll('.agent-kpi-curr');
                
                prevInputs.forEach((pInput, idx) => {
                    const cInput = currInputs[idx];
                    const kpiId = pInput.dataset.kpiId;
                    agent.kpiValues[kpiId] = {
                        prev: pInput.value,
                        curr: cInput.value
                    };
                });
                agents.push(agent);
            });
        }

        if (agents.length === 0) {
            alert("Please add at least one agent in the Agent Data menu.");
            const modalAgents = document.getElementById('modal-agents');
            if(modalAgents) modalAgents.classList.add('active');
            return;
        }
        
        if(placeholder) placeholder.style.display = 'none';
        if(exportActions) exportActions.style.display = 'flex';
        
        if(cardContainer) {
            cardContainer.innerHTML = `
                <div class="page-wrapper">
                    <div class="nav-arrow left" id="prev-agent" title="Previous Agent"><i class="fa-solid fa-chevron-left"></i></div>
                    <div class="kpi-card" id="kpi-card">
                        <div class="card-header">
                            <h1 class="main-title" id="card-title"></h1>
                            <h2 class="agent-name" id="agent-name"></h2>
                            <p class="agent-role" id="agent-role"></p>
                        </div>
                        <div class="kpi-grid" id="kpi-grid"></div>
                        
                        <div class="strategy-box" id="strategy-box" style="display:none;">
                            <h4><i class="fa-solid fa-bullseye" style="color: var(--cv-accent); margin-right: 8px;"></i> Action Plan</h4>
                            <p id="agent-strategy"></p>
                        </div>

                        <div class="team-achievements" id="team-achievements-section" style="display:none;">
                            <h4 id="rendered-team-title"></h4>
                            <div class="team-grid" id="team-grid"></div>
                        </div>

                        <div class="card-footer">
                            <i class="fa-solid fa-quote-left quote-icon"></i>
                            <p id="motivational-quote"></p>
                            <i class="fa-solid fa-quote-right quote-icon"></i>
                        </div>
                    </div>
                    <div class="nav-arrow right" id="next-agent" title="Next Agent"><i class="fa-solid fa-chevron-right"></i></div>
                </div>`;
            
            const prevAgentBtn = document.getElementById('prev-agent');
            const nextAgentBtn = document.getElementById('next-agent');
            if(prevAgentBtn) prevAgentBtn.addEventListener('click', () => { currentAgentIndex = (currentAgentIndex - 1 + agents.length) % agents.length; displayAgent(currentAgentIndex); });
            if(nextAgentBtn) nextAgentBtn.addEventListener('click', () => { currentAgentIndex = (currentAgentIndex + 1) % agents.length; displayAgent(currentAgentIndex); });
        }

        displayAgent(0);
    }
    
    const parseNumeric = (val) => {
        if (val === null || val === undefined || val === '') return null;
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
            let clean = val.replace(/,/g, '').trim().toLowerCase();
            if (clean.endsWith('%')) return parseFloat(clean.replace('%', ''));
            if (clean.endsWith('k')) return parseFloat(clean.replace('k', '')) * 1000;
            if (clean.endsWith('m')) return parseFloat(clean.replace('m', '')) * 1000000;
            return parseFloat(clean);
        }
        return parseFloat(val);
    };

    const formatDisplay = (val, isPct) => {
        if (val === undefined || val === null || val === '') return '--';
        if (typeof val === 'string' && val.includes('%')) return val; 
        
        const num = parseNumeric(val);
        if(num === null || isNaN(num)) return val; 
        
        if (!isPct) {
            if (formatMode === 'abbreviated') {
                if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
                if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
            }
        }
        
        return num.toLocaleString() + (isPct ? '%' : '');
    };

    const getGoalColor = (rawVal, goal, dangerThreshold) => {
        const val = parseNumeric(rawVal);
        if (val === null || goal === null || goal === undefined || goal === '') return 'var(--cv-text-main)'; // Default/Volume
        
        if (val >= goal) return 'var(--goal-met-color)'; // Green
        
        if (dangerThreshold !== null && dangerThreshold !== undefined && dangerThreshold !== '') {
            if (val < dangerThreshold) return 'var(--goal-danger-color)'; // Red
        }
        
        return 'var(--goal-warning-color)'; // Yellow/Amber
    };

    const getChartColor = (rawVal, goal, dangerThreshold) => {
        const val = parseNumeric(rawVal);
        const isLightTheme = document.body.classList.contains('light-theme');
        // Para métricas de volumen: Casi negro en tema claro, Gris/Blanco en tema oscuro para que sea visible
        const volumeColor = isLightTheme ? '#111827' : '#9CA3AF'; 
        
        if (val === null || goal === null || goal === undefined || goal === '') return volumeColor; 
        
        if (val >= goal) return '#10B981'; // Green
        
        if (dangerThreshold !== null && dangerThreshold !== undefined && dangerThreshold !== '') {
            if (val < dangerThreshold) return '#EF4444'; // Red
        }
        
        return '#F59E0B'; // Yellow/Amber
    };

    function displayAgent(index) {
        currentAgentIndex = index;
        const agent = agents[index];
        const isSingleMode = config.mode === 'single';
        
        // Clean up old charts to prevent memory leaks
        if (window.activeCharts) {
            window.activeCharts.forEach(c => c.destroy());
        }
        window.activeCharts = [];
        let chartQueue = []; // Queue to render charts after HTML is injected

        const elCardTitle = document.getElementById('card-title');
        const elAgentName = document.getElementById('agent-name');
        const elAgentRole = document.getElementById('agent-role');
        const sBox = document.getElementById('strategy-box');
        const elAgentStrategy = document.getElementById('agent-strategy');
        const kpiGrid = document.getElementById('kpi-grid');
        
        if(elCardTitle) elCardTitle.textContent = config.title;
        if(elAgentName) elAgentName.textContent = agent.name;
        if(elAgentRole) elAgentRole.textContent = `Lvl ${agent.level} - ${agent.role}`;

        if (sBox && elAgentStrategy) {
            if (agent.strategy && agent.strategy.trim() !== '') {
                elAgentStrategy.textContent = agent.strategy;
                sBox.style.display = 'block';
            } else {
                sBox.style.display = 'none';
            }
        }

        if(kpiGrid) {
            kpiGrid.innerHTML = '';
            
            config.kpis.forEach(kpi => {
                const vals = agent.kpiValues[kpi.id] || {prev: '', curr: ''};
                
                // If it's empty in both (or empty in curr for single mode), skip.
                if (isSingleMode && (vals.curr === '' || vals.curr === null)) return;
                if (!isSingleMode && (vals.prev === '' || vals.prev === null) && (vals.curr === '' || vals.curr === null)) return;

                const isPct = kpi.type === 'percentage';
                const numP = parseNumeric(vals.prev);
                const numC = parseNumeric(vals.curr);
                
                const rawCurrColor = getChartColor(vals.curr, kpi.goal, kpi.danger);
                const textCurrColor = getGoalColor(vals.curr, kpi.goal, kpi.danger);
                
                // Trend Arrow Logic (More is better)
                let trendHtml = '';
                if (!isSingleMode && vals.prev !== '' && vals.curr !== '') {
                    if (numP !== null && numC !== null) {
                        if (numC > numP) trendHtml = '<span class="trend-up"><i class="fa-solid fa-caret-up"></i></span>';
                        else if (numC < numP) trendHtml = '<span class="trend-down"><i class="fa-solid fa-caret-down"></i></span>';
                        else trendHtml = '<span class="trend-neutral"><i class="fa-solid fa-minus"></i></span>';
                    }
                }
                
                // Visual Badge for Goal inside the generated card
                let goalBadgeHtml = '';
                if (kpi.goal !== null && kpi.goal !== undefined && kpi.goal !== '') {
                    goalBadgeHtml = `
                    <div style="text-align: center; width: 100%; margin-top: 10px;">
                        <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(37, 99, 235, 0.1); border: 1px solid rgba(37, 99, 235, 0.2); padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; color: var(--cv-accent-light); font-weight: 600;">
                            <i class="fa-solid fa-bullseye"></i> Target: ${kpi.goal}${isPct ? '%' : ''}
                        </div>
                    </div>`;
                }

                // Layout Structure Based on Mode & Chart Type
                let comparisonHtml = '';
                if (isSingleMode) {
                    comparisonHtml = `
                    <div class="comparison-container" style="flex-grow: 1;">
                        <div class="month-block single-mode">
                            <p class="kpi-value curr single-mode" style="color: ${textCurrColor}">${formatDisplay(vals.curr, isPct)}</p>
                        </div>
                    </div>`;
                } else {
                    if (kpi.chartType === 'bar' && numP !== null && numC !== null) {
                        comparisonHtml = `<div class="chart-wrapper"><canvas id="chart-${kpi.id}"></canvas></div>`;
                        chartQueue.push({
                            id: `chart-${kpi.id}`,
                            config: {
                                type: 'bar',
                                data: {
                                    labels: [config.month1, config.month2],
                                    datasets: [{
                                        data: [numP, numC],
                                        backgroundColor: ['rgba(156, 163, 175, 0.5)', rawCurrColor],
                                        borderRadius: 6,
                                        barPercentage: 0.7
                                    }]
                                },
                                options: {
                                    responsive: true, 
                                    maintainAspectRatio: false, 
                                    animation: false, // Critical for html2canvas
                                    layout: {
                                        padding: { top: 22 } // Padding to make room for labels
                                    },
                                    plugins: { 
                                        legend: { display: false },
                                        datalabels: {
                                            anchor: 'end',
                                            align: 'top',
                                            offset: 2,
                                            color: document.body.classList.contains('light-theme') ? '#4B5563' : '#F9FAFB',
                                            font: { weight: 'bold', size: 12, family: "'Poppins', sans-serif" },
                                            formatter: function(value) {
                                                return formatDisplay(value, isPct); // Use our custom display formatter
                                            }
                                        }
                                    },
                                    scales: {
                                        y: { 
                                            beginAtZero: true, 
                                            grace: '15%', // Gives extra space at the top of the chart so labels don't get cut off
                                            grid: { color: 'rgba(128, 128, 128, 0.1)' },
                                            ticks: { display: false } // Hide axis ticks since we have data labels
                                        },
                                        x: { 
                                            grid: { display: false },
                                            ticks: {
                                                color: document.body.classList.contains('light-theme') ? '#6B7280' : '#9CA3AF',
                                                font: { size: 11, weight: 600, family: "'Poppins', sans-serif" }
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    } else {
                        comparisonHtml = `
                        <div class="comparison-container" style="flex-grow: 1;">
                            <div class="month-block">
                                <div class="month-label">${config.month1}</div>
                                <p class="kpi-value prev">${formatDisplay(vals.prev, isPct)}</p>
                            </div>
                            <div class="divider"></div>
                            <div class="month-block">
                                <div class="month-label">${config.month2}</div>
                                <p class="kpi-value curr" style="color: ${textCurrColor}">
                                    ${formatDisplay(vals.curr, isPct)}
                                    ${trendHtml}
                                </p>
                            </div>
                        </div>`;
                    }
                }

                kpiGrid.innerHTML += `
                    <div class="kpi-item" style="display: flex; flex-direction: column;">
                        <p class="kpi-label"><i class="fa-solid ${kpi.icon} icon-style"></i> ${kpi.name}</p>
                        ${comparisonHtml}
                        ${goalBadgeHtml}
                    </div>`;
            });
            
            // Render Chart.js instances after HTML is injected
            chartQueue.forEach(item => {
                const ctx = document.getElementById(item.id);
                if (ctx) {
                    // Adapt defaults for theme
                    Chart.defaults.color = document.body.classList.contains('light-theme') ? '#6B7280' : '#9CA3AF';
                    window.activeCharts.push(new Chart(ctx, item.config));
                }
            });
        }
        
        const teamAchievementsSection = document.getElementById('team-achievements-section');
        const renderedTeamTitle = document.getElementById('rendered-team-title');
        const teamGrid = document.getElementById('team-grid');
        const validAchievements = config.teamAchievements.filter(item => item.value && item.text);

        if (teamAchievementsSection && teamGrid && renderedTeamTitle) {
            renderedTeamTitle.textContent = config.teamTitle;
            
            if (validAchievements.length > 0) {
                teamAchievementsSection.style.display = 'block';
                teamGrid.innerHTML = '';
                validAchievements.forEach(item => {
                    teamGrid.innerHTML += `<div class="team-grid-item"><span>${formatDisplay(item.value, false)}</span> ${item.text}</div>`;
                });
            } else {
                teamAchievementsSection.style.display = 'none';
            }
        }
        
        const quoteBox = document.getElementById('motivational-quote');
        const customQuote = agent.quote && agent.quote.trim() !== '' ? agent.quote : config.defaultQuote;
        if(quoteBox) quoteBox.textContent = customQuote.replace(/{name}/g, agent.name.split(' ')[0]);
    }
    
    function downloadCard(cardElement) {
        if(!cardElement) return;
        const agentName = agents[currentAgentIndex].name.replace(/\s+/g, '-');
        const currentYear = new Date().getFullYear();
        
        const arrows = document.querySelectorAll('.nav-arrow');
        arrows.forEach(a => a.style.opacity = '0');
        
        html2canvas(cardElement, { 
            backgroundColor: null, 
            useCORS: true,
            scale: 2,
            logging: false
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `KPI-${agentName}-${config.month2}-${currentYear}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            arrows.forEach(a => a.style.opacity = '1');
        });
    }

    // Bind keyboard navigation safely
    document.addEventListener('keydown', (e) => {
        const hasOpenModal = document.querySelector('.modal-backdrop.active');
        if(!hasOpenModal && agents.length > 0) {
            const prevBtn = document.getElementById('prev-agent');
            const nextBtn = document.getElementById('next-agent');
            if(e.key === 'ArrowLeft' && prevBtn) prevBtn.click();
            if(e.key === 'ArrowRight' && nextBtn) nextBtn.click();
        }
    });

    // Init Date Placeholders & Pulse
    initDatePlaceholders();
    const step1Btn = document.querySelector('.nav-btn[data-step="1"]');
    if(step1Btn) step1Btn.classList.add('pulse');

} // End initKPIApp

// --- WORDPRESS SAFE EXECUTION ---
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKPIApp);
} else {
    initKPIApp();
}
