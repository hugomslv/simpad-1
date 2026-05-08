const SIMBA_URL = 'https://app-simba.azurewebsites.net/simba/ui/home';

const TUTORIAL_STEPS = [
    {
        type: 'choice',
        titleKey: 'tutorial_step1_title',
        textKey: 'tutorial_step1_text',
        choices: [
            { id: 'cash', emoji: '', labelKey: 'tutorial_choice_cash', descKey: 'tutorial_choice_cash_desc' },
            { id: 'simba', emoji: '', labelKey: 'tutorial_choice_simba', descKey: 'tutorial_choice_simba_desc' }
        ]
    },
    { type: 'conditional', variant: 'connect' },
    { type: 'conditional', variant: 'select' },
    { type: 'conditional', variant: 'pay' },
];

let currentStep = 0;
let selectedChoice = null;

function openTutorial() {
    currentStep = 0;
    selectedChoice = null;
    document.getElementById('tutorialOverlay').classList.add('active');
    renderStep();
}

function closeTutorial() {
    document.getElementById('tutorialOverlay').classList.remove('active');
}

function closeTutorialFromOverlay(event) {
    if (event.target.id === 'tutorialOverlay') {
        closeTutorial();
    }
}

function nextStep() {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
        currentStep++;
        renderStep();
    } else {
        closeTutorial();
    }
}

function prevStep() {
    if (currentStep > 0) {
        currentStep--;
        renderStep();
    }
}

function selectChoice(choiceId) {
    selectedChoice = choiceId;
    document.querySelectorAll('.tutorial-choice-card').forEach(card => {
        card.classList.toggle('selected', card.dataset.choice === choiceId);
    });
    document.getElementById('tutorialNext').disabled = false;
    setTimeout(() => nextStep(), 300);
}

function renderStep() {
    const step = TUTORIAL_STEPS[currentStep];
    const t = window.currentTranslations || {};
    const content = document.getElementById('tutorialContent');

    if (step.type === 'choice') {
        content.innerHTML = `
            <h2 class="tutorial-title">${t[step.titleKey] || step.titleKey}</h2>
            <p class="tutorial-text">${t[step.textKey] || step.textKey}</p>
            <div class="tutorial-choices">
                ${step.choices.map(c => `
                    <button class="tutorial-choice-card ${selectedChoice === c.id ? 'selected' : ''}"
                            data-choice="${c.id}"
                            onclick="selectChoice('${c.id}')">
                        <div class="tutorial-choice-emoji">${c.emoji}</div>
                        <div class="tutorial-choice-label">${t[c.labelKey] || c.labelKey}</div>
                        <div class="tutorial-choice-desc">${t[c.descKey] || c.descKey}</div>
                    </button>
                `).join('')}
            </div>
        `;
    } else if (step.type === 'conditional') {
        renderConditionalStep(content, t, step.variant);
    } else {
        content.innerHTML = `
            <div class="tutorial-emoji">${step.emoji}</div>
            <h2 class="tutorial-title">${t[step.titleKey] || step.titleKey}</h2>
            <p class="tutorial-text">${t[step.textKey] || step.textKey}</p>
        `;
    }

    const prevBtn = document.getElementById('tutorialPrev');
    prevBtn.disabled = currentStep === 0;

    const nextBtn = document.getElementById('tutorialNext');
    const isLast = currentStep === TUTORIAL_STEPS.length - 1;
    nextBtn.textContent = isLast
        ? (t.tutorial_finish || 'Terminer')
        : (t.tutorial_next || 'Suivant');

    if (step.type === 'choice') {
        nextBtn.disabled = !selectedChoice;
    } else {
        nextBtn.disabled = false;
    }

    renderDots();
}

function renderConditionalStep(content, t, variant) {
    if (variant === 'connect') {
        if (selectedChoice === 'cash') {
            content.innerHTML = `
                <div class="tutorial-image-wrapper">
                    <img src="/static/Simba_files/cash1.png"
                         alt="Cash"
                         class="tutorial-image"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="tutorial-image-fallback" style="display:none;">
                        <span>📷</span>
                        <small>cash1.png</small>
                    </div>
                </div>
                <h2 class="tutorial-title">${t.tutorial_cash_title || 'Paiement en cash'}</h2>
                <p class="tutorial-text">${t.tutorial_cash_text || 'Cliquez sur ce bouton pour continuer.'}</p>
            `;
        } else if (selectedChoice === 'simba') {
            content.innerHTML = `
                <div class="tutorial-qr-wrapper">
                    <div id="tutorialQrCode" class="tutorial-qr-code"></div>
                </div>
                <h2 class="tutorial-title">${t.tutorial_simba_title || 'Connectez-vous à Simba'}</h2>
                <p class="tutorial-text">${t.tutorial_simba_text || 'Scannez ce QR code avec votre téléphone.'}</p>
            `;
            generateQrCode();
        }
    } else if (variant === 'select') {
        if (selectedChoice === 'cash') {
            content.innerHTML = `
                <div class="tutorial-image-wrapper">
                    <img src="/static/Simba_files/cash-simba.png"
                         alt="Articles"
                         class="tutorial-image"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="tutorial-image-fallback" style="display:none;">
                        <span>📷</span>
                        <small>cash-simba.png</small>
                    </div>
                </div>
                <h2 class="tutorial-title">${t.tutorial_cash_select_title || 'Choisissez votre article'}</h2>
                <p class="tutorial-text">${t.tutorial_cash_select_text || 'Sélectionnez l\'article que vous souhaitez acheter.'}</p>
            `;
        } else if (selectedChoice === 'simba') {
            content.innerHTML = `
                <div class="tutorial-image-wrapper">
                    <img src="/static/Simba_files/simba1.png"
                         alt="Badge"
                         class="tutorial-image"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="tutorial-image-fallback" style="display:none;">
                        <span>📷</span>
                        <small>simba-badge-name.png</small>
                    </div>
                </div>
                <h2 class="tutorial-title">${t.tutorial_simba_select_title || 'Scannez votre badge'}</h2>
                <p class="tutorial-text">${t.tutorial_simba_select_text || 'Approchez votre badge et choisissez votre nom dans la liste.'}</p>
            `;
        }
    } else if (variant === 'pay') {
        if (selectedChoice === 'cash') {
            content.innerHTML = `
                <h2 class="tutorial-title">${t.tutorial_cash_pay_title || 'N\'oubliez pas !'}</h2>
                <p class="tutorial-text">${t.tutorial_cash_pay_text || 'N\'oubliez pas de mettre l\'argent dans le cochon (la tirelire) après votre achat.'}</p>
            `;
        } else if (selectedChoice === 'simba') {
            content.innerHTML = `
                <div class="tutorial-image-wrapper">
                    <img src="/static/Simba_files/cash-simba.png"
                         alt="Articles"
                         class="tutorial-image"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="tutorial-image-fallback" style="display:none;">
                        <span>📷</span>
                        <small>cash-simba.png</small>
                    </div>
                </div>
                <h2 class="tutorial-title">${t.tutorial_simba_pay_title || 'Choisissez et payez'}</h2>
                <p class="tutorial-text">${t.tutorial_simba_pay_text || 'Choisissez votre article et procédez au paiement.'}</p>
            `;
        }
    }
}

function generateQrCode() {
    const qrContainer = document.getElementById('tutorialQrCode');
    if (!qrContainer) return;

    if (typeof QRCode === 'undefined') {
        qrContainer.innerHTML = '<p style="color:#999;font-size:14px;">QR code indisponible</p>';
        console.warn('QRCode library not loaded');
        return;
    }

    qrContainer.innerHTML = '';
    new QRCode(qrContainer, {
        text: SIMBA_URL,
        width: 180,
        height: 180,
        colorDark: '#1a1a1a',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });
}

function renderDots() {
    const dotsContainer = document.getElementById('tutorialDots');
    dotsContainer.innerHTML = '';
    TUTORIAL_STEPS.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'tutorial-dot' + (i === currentStep ? ' active' : '');
        dotsContainer.appendChild(dot);
    });
}

document.addEventListener('keydown', (e) => {
    const overlay = document.getElementById('tutorialOverlay');
    if (!overlay.classList.contains('active')) return;

    if (e.key === 'Escape') closeTutorial();
    if (e.key === 'ArrowRight' && !document.getElementById('tutorialNext').disabled) nextStep();
    if (e.key === 'ArrowLeft' && !document.getElementById('tutorialPrev').disabled) prevStep();
});