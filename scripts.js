document.addEventListener('DOMContentLoaded', function () {
  var dropdowns = document.querySelectorAll('.dropdown');

  dropdowns.forEach(function (dropdown) {
    var dropdownContent = dropdown.querySelector('.dropdown-content');

    dropdown.addEventListener('click', function () {
      dropdownContent.style.display = (dropdownContent.style.display === 'block') ? 'none' : 'block';
    });

    dropdownContent.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();

        var targetMenuCategoryID = link.getAttribute('href').substring(1);
        console.log('Target Menu Category ID:', targetMenuCategoryID);

        var targetMenuCategory = document.getElementById(targetMenuCategoryID);
        console.log('Target Menu Category Element:', targetMenuCategory);

        var headerHeight = document.querySelector('header').offsetHeight;
        console.log('Header Height:', headerHeight);

        if (targetMenuCategory) {
          window.scrollTo({
            top: targetMenuCategory.offsetTop - headerHeight,
            behavior: 'smooth'
          });
        }

        if (window.innerWidth <= 768) {
          dropdownContent.style.display = 'none';
        }
      });
    });

    window.addEventListener('click', function (event) {
      if (!dropdown.contains(event.target) && window.innerWidth <= 768) {
        dropdownContent.style.display = 'none';
      }
    });

    dropdownContent.addEventListener('click', function (event) {
      event.stopPropagation();
    });
  });
});

document.addEventListener('DOMContentLoaded', function () {
  var splashScreen = document.getElementById('splash-screen');
  var websiteContent = document.getElementById('website-content');

  // Add the show class to the splash screen for a smooth fade-in effect
  splashScreen.classList.add('show');

  // Simulate a delay to show the splash screen for a certain period
  setTimeout(function () {
    // Remove the splash screen
    splashScreen.style.display = 'none';

    // Show the content with a smooth transition
    websiteContent.classList.add('loaded');
  }, 1900); // Adjust the delay time (in milliseconds) as needed
});

document.addEventListener('DOMContentLoaded', () => {
  fetch('/menu.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('menu-container').innerHTML = data;
    });
});

document.addEventListener('DOMContentLoaded', function () {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      registration.addEventListener('updatefound', () => {
        if (registration.installing) {
          registration.installing.addEventListener('statechange', () => {
            if (registration.waiting) {
              showCustomModal();
            }
          });
        }
      });
    });
  }

  function showCustomModal() {
    const modal = document.getElementById('custom-modal');
    const refreshButton = document.getElementById('refresh-button');

    modal.style.display = 'block';

    refreshButton.addEventListener('click', refreshPage);
  }

  function refreshPage() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
    }
    window.location.reload(true);
  }
});