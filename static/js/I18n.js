const I18N_BASE_PATH = '/static/i18n';
const DEFAULT_LANG = 'fr';
const SUPPORTED_LANGS = ['fr', 'de', 'it', 'en'];

window.currentTranslations = {};
let currentLang = DEFAULT_LANG;

async function loadLanguage(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) {
        console.warn(`Langue non supportée : ${lang}, fallback sur ${DEFAULT_LANG}`);
        lang = DEFAULT_LANG;
    }

    try {
        const response = await fetch(`${I18N_BASE_PATH}/${lang}.json`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        window.currentTranslations = await response.json();
        currentLang = lang;
        applyTranslations();
        updateLanguageButtons();
        document.documentElement.lang = lang;

        if (typeof renderStep === 'function') {
            const overlay = document.getElementById('tutorialOverlay');
            if (overlay && overlay.classList.contains('active')) {
                renderStep();
            }
        }
    } catch (error) {
        console.error(`Erreur lors du chargement de ${lang}.json :`, error);
    }
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = window.currentTranslations[key];

        if (translation === undefined) {
            console.warn(`Clé manquante : ${key}`);
            return;
        }

        if (el.tagName === 'TITLE') {
            document.title = translation;
        } else {
            el.textContent = translation;
        }
    });
}

function updateLanguageButtons() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
}

function setLanguage(lang) {
    loadLanguage(lang);
    console.log(lang);
}

document.addEventListener('DOMContentLoaded', () => loadLanguage(DEFAULT_LANG));