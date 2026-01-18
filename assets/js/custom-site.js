// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.querySelector('.vs-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const closeBtn = document.querySelector('.menu-close');
  const overlay = document.querySelector('.menu-overlay');
  const menuLinks = document.querySelectorAll('.menu-link');

  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (menuToggle) menuToggle.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);
  if (menuLinks && menuLinks.length) {
    menuLinks.forEach(link => link.addEventListener('click', closeMenu));
  }

  // Header search modal (Bootstrap 5 modal API)
  const searchModalEl = document.getElementById('searchModal');
  if (searchModalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    const searchModal = new bootstrap.Modal(searchModalEl);
    const searchToggleBtns = document.querySelectorAll('.search-toggle');
    const searchInput = document.getElementById('searchInput');
    const searchForm = document.getElementById('searchForm');
    const searchResults = document.getElementById('searchResults');

    searchToggleBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        searchModal.show();
        if (searchInput) searchInput.focus();
      });
    });

    if (searchInput && searchResults) {
      searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        if (query.length > 2 && typeof $ !== 'undefined') {
          $.ajax({
            url: 'search_events.php',
            type: 'GET',
            data: { query: query, live: true },
            success: function(response) {
              searchResults.innerHTML = response;
            }
          });
        } else {
          searchResults.innerHTML = '';
        }
      });
    }

    if (searchForm && searchInput) {
      searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = 'search_events.php?query=' + encodeURIComponent(query);
        }
      });
    }
  }

  // Simple hero slider support (if elements exist)
  const slider = document.querySelector('.hero-slider-container');
  const slides = document.querySelectorAll('.hero-slide');
  const prevBtn = document.querySelector('.slider-prev');
  const nextBtn = document.querySelector('.slider-next');

  if (slider && slides.length && prevBtn && nextBtn) {
    let currentIndex = 0;
    const slideCount = slides.length;

    function updateSlider() {
      slider.style.transform = `translateX(-${currentIndex * 50}%)`;
    }

    nextBtn.addEventListener('click', function() {
      currentIndex = (currentIndex + 1) % slideCount;
      updateSlider();
    });

    prevBtn.addEventListener('click', function() {
      currentIndex = (currentIndex - 1 + slideCount) % slideCount;
      updateSlider();
    });

    setInterval(function() {
      currentIndex = (currentIndex + 1) % slideCount;
      updateSlider();
    }, 5000);
  }

  // Simple redirect handler for select[name="name"] inside #event form
  const eventForm = document.getElementById('event');
  if (eventForm) {
    const selectElement = eventForm.querySelector('select[name="name"]');
    if (selectElement) {
      selectElement.addEventListener('change', function() {
        const value = this.value;
        if (value === 'events') {
          window.location.href = 'eventslist';
        } else if (value === 'talent') {
          window.location.href = 'talentlist';
        } else if (value === 'shop') {
          window.location.href = 'shop';
        }
      });
    }
  }
});
