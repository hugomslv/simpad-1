 //const RANDOM_IMAGE_URL = "http://localhost:8080/simba/external/api/v1/pad-dashboard/image";
const RANDOM_IMAGE_URL = "https://app-simba.azurewebsites.net/simba/external/api/v1/pad-dashboard/image";
//const INFORMATION_URL = "https://app-simba.azurewebsites.net/simba/external/api/v1/informations"
document.addEventListener("load", onInit());
let inactivityTimer;
const overlay = document.getElementById('startOverlay');

function showOverlay() {
    overlay.classList.remove('fade-out');
    overlay.style.display = 'flex';
}

function hideOverlay() {
    overlay.classList.add('fade-out');
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 1500);
}

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    hideOverlay();
    inactivityTimer = setTimeout(showOverlay, 30000);
}

document.addEventListener('DOMContentLoaded', function() {
    overlay.style.display = 'none';
    resetInactivityTimer();

    document.addEventListener('click', resetInactivityTimer);
    
    overlay.addEventListener('click', () => {
        hideOverlay();
        resetInactivityTimer();
    });
});

function onInit(){
    loadRandomImage();
    //getInformation();
}

document.querySelector('.card-stack').addEventListener('click', function() {
    connectPigAccount()
});
function changeCard(){
  const card1 = document.getElementById('card1');
  const card2 = document.getElementById('card2');

    card1.classList.toggle('base-card');
    card1.classList.toggle('inclined-card');
    card2.classList.toggle('base-card');
    card2.classList.toggle('inclined-card');
    launchAnimation()
}
const badgeCard = document.querySelector('.inclined-card');
const arrow = document.querySelector('.arrow-right');
const noBadgeToggledContent = document.querySelector('.no-badge-content');
const noAccountToggledContent = document.querySelector('.no-account-content');
const noBadgeToggledButton = document.querySelector('.toggle-button-top');
const noAccountToggledButton = document.querySelector('.toggle-button-bottom');

let noBadgeToggled = false;
let noAccountToggled = false;
let piggyBankToggled = false;

fetchData();

async function fetchData() {
  try {
      const response = await fetch('/waiting');
      const data = await response.json();
      if (data.redirect_url) {
        await launchAnimation();
        window.location.href = data.redirect_url;
      } else {
          console.error('Error: No redirect URL in response');
      }
  } catch (error) {
      console.error('Error calling the API:', error);
  }
}
async function loadRandomImage() {
    try {
        // Call the `/image` endpoint to get the image URL
        const response = await fetch(RANDOM_IMAGE_URL);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        // Parse the image URL from the response
        document.getElementById("randomImage").src = await response.text();
    } catch (error) {
        console.error('Error loading random image:', error);
    }
}
function arrayToDate(dateArray) {
    const [year, month, day] = dateArray;
    return new Date(year, month - 1, day);
  }
  
  function isDateInRange(date, start, end) {
    return date >= start && date <= end;
  }
  
 // async function getInformation() {
 //   try {
 //     const response = await fetch(INFORMATION_URL);
 //     if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
 //     const data = await response.json();
 //     const today = new Date();
 //     today.setHours(0, 0, 0, 0);
 //     const validInformation = data.filter(item => {
 //       const startDate = arrayToDate(item.startDate);
 //       const endDate = arrayToDate(item.endDate);
 //       return isDateInRange(today, startDate, endDate) && item.info && item.info.trim() !== "";
 //     });
 //     const h2Element = document.querySelector("h2");
 //     let alertContainer = document.querySelector('.alert.alert-info.no-icon');
 //     if (validInformation.length > 0) {
 //       const randomIndex = Math.floor(Math.random() * validInformation.length);
 //       const selectedInfo = validInformation[randomIndex];
 //       if (alertContainer) {
 //         alertContainer.innerHTML = `<p>${selectedInfo.info}</p>`;
 //       } else {
 //         alertContainer = document.createElement('div');
 //         alertContainer.setAttribute('role', 'alert');
 //         alertContainer.className = 'alert alert-info no-icon';
 //         alertContainer.innerHTML = `<p>${selectedInfo.info}</p>`;
 //         if (h2Element) {
 //           h2Element.insertAdjacentElement('afterend', alertContainer);
 //         } else {
 //           document.body.appendChild(alertContainer);
 //         }
 //       }
 //     } else {
 //       if (alertContainer) alertContainer.remove();
 //     }
 //   } catch (error) {
 //     console.error("Error calling the API:", error);
 //   }
 // }

function launchAnimation() {
  const badgeCard = document.querySelector('.inclined-card');
  const langSelector = document.querySelector('.language-selector');
  const helpLion = document.querySelector('.help-lion');

    return new Promise((resolve) => {
        badgeCard.style.zIndex = '99999';

        if (langSelector) langSelector.style.display = 'none';
        if (helpLion) helpLion.style.display = 'none';

        badgeCard.style.animation = 'none';
        void badgeCard.offsetWidth;
        badgeCard.style.animation = 'badged 1.5s forwards';

        arrow.style.display = 'none';

        badgeCard.addEventListener('animationend', function() {
            badgeCard.style.position = 'fixed';
            badgeCard.style.right = 'calc(50% - 165px)';
            badgeCard.style.bottom = 'calc(50% - 100px)';
            badgeCard.style.transform = 'scale(40) rotate(0deg)';
            resolve();
        }, { once: true });
    });
}

const BORDER = '2px solid rgb(102, 102, 102)';




function toggleAccordion(number) {
    const noBadgeToggledContent = document.querySelector('.no-badge-content');
    const noBadgeToggledButton = document.querySelector('.toggle-button-top');
    
    const noAccountToggledContent = document.querySelectorAll('.no-account-content')[0];
    const noAccountToggledButton = document.querySelectorAll('.toggle-button-bottom')[0];
    

    if (number === 1) {
        noBadgeToggled = !noBadgeToggled;
        noAccountToggled = false;
    } 
    else if (number === 2){
        noAccountToggled = !noAccountToggled;
        noBadgeToggled = false;
    } 

    noBadgeToggledContent.classList.toggle('d-none', !noBadgeToggled);
    noAccountToggledContent.classList.toggle('d-none', !noAccountToggled);

    noBadgeToggledButton.style.borderBottom = noBadgeToggled ? 'none' : '1px solid #ccc';
    noAccountToggledButton.style.borderBottom = noAccountToggled ? 'none' : '1px solid #ccc';
}

async function connectPigAccount() {
    try {
        const response = await fetch('/get-pig-login');
        const data = await response.json();
        if (data.redirect_url) {
        await changeCard()
        await launchAnimation();
          window.location.href = data.redirect_url;
        } else {
            console.error('Error: No redirect URL in response');
        }
    } catch (error) {
        console.error('Error calling the API:', error);
    }
}