
// Index Page JavaScript - Event Loading and Search Functionality

// Function to fetch and display events from JSON
async function loadEvents() {
  try {
    // Fetch events data from JSON file
    const response = await fetch('index.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Store events globally for search functionality
    window.upcomingEvents = data.upcomingEvents || [];
    window.pastEvents = data.pastEvents || [];
    
    console.log('Loaded events:', {
      upcoming: window.upcomingEvents.length,
      past: window.pastEvents.length
    });
    
    // Load upcoming events
    const upcomingContainer = document.getElementById('upcomingEventsContainer');
    if (window.upcomingEvents.length > 0) {
      upcomingContainer.innerHTML = '';
      window.upcomingEvents.forEach(event => {
        const eventHTML = createEventCard(event, false);
        upcomingContainer.innerHTML += eventHTML;
      });
    } else {
      upcomingContainer.innerHTML = `
        <div class="col-12 text-center">
          <p class="text-gray-600">No upcoming events at the moment. Check back soon!</p>
        </div>
      `;
    }
    
    // Load first 4 past events
    const pastContainer = document.getElementById('pastEventsContainer');
    if (window.pastEvents.length > 0) {
      pastContainer.innerHTML = '';
      // Display first 4 past events on homepage
      const displayEvents = window.pastEvents.slice(0, 4);
      displayEvents.forEach(event => {
        const eventHTML = createEventCard(event, true);
        pastContainer.innerHTML += eventHTML;
      });
    } else {
      pastContainer.innerHTML = `
        <div class="col-12 text-center">
          <p class="text-gray-600">No past events available.</p>
        </div>
      `;
    }
    
    // Initialize search after events are loaded
    initializeSearch();
    
  } catch (error) {
    console.error('Error loading events:', error);
    
    // Show error messages
    document.getElementById('upcomingEventsContainer').innerHTML = `
      <div class="col-12 text-center">
        <p class="text-red-600">Unable to load events. Please try again later.</p>
        <button onclick="location.reload()" class="vs-btn style4 mt-3">
          <i class="fas fa-redo me-2"></i> Retry
        </button>
      </div>
    `;
    
    document.getElementById('pastEventsContainer').innerHTML = `
      <div class="col-12 text-center">
        <p class="text-red-600">Unable to load past events. Please try again later.</p>
      </div>
    `;
  }
}

// Create event card HTML
function createEventCard(event, isPast = false) {
  const eventLink = event.link || (isPast ? 'past-events.html' : `eventslist-details.html?event=${event.id}`);
  const eventId = event.id || event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  return `
    <div class="col-xl-3 col-lg-4 col-md-6 mb-8">
      <div class="event-card">
        <div class="event-img">
          <a href="${eventLink}">
            <img class="w-100 h-100" src="${event.image}" alt="${event.title}" loading="lazy" onerror="this.src='assets/img/placeholder.jpg'">
          </a>
        </div>
        <div class="event-content">
          <h5 class="event-title">
            <a href="${eventLink}">${event.title}</a>
          </h5>
          <div class="event-meta">
            <span><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
          </div>
          <div class="event-date-meta">
            <i class="fas fa-calendar-alt"></i>
            <span>${event.date}</span>
            ${isPast ? '<span class="past-event-badge">Past Event</span>' : ''}
          </div>
          ${!isPast ? `
          <div class="event-footer">
            <div class="event-price">
              ${event.price || 'Free'}
            </div>
            <a href="${eventLink}" class="btn btn-sm btn-buy-ticket">${event.price ? 'Buy Ticket' : 'View Details'}</a>
          </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

// Real-time search functionality
function initializeSearch() {
  const searchInput = document.getElementById('eventSearch');
  const searchResults = document.getElementById('searchResults');
  const clearSearchBtn = document.getElementById('clearSearch');
  const upcomingContainer = document.getElementById('upcomingEventsContainer');
  
  if (!searchInput || !window.upcomingEvents) return;
  
  // Show/hide clear button
  searchInput.addEventListener('input', function() {
    clearSearchBtn.style.display = this.value ? 'block' : 'none';
  });
  
  // Clear search
  clearSearchBtn.addEventListener('click', function() {
    searchInput.value = '';
    searchResults.style.display = 'none';
    clearSearchBtn.style.display = 'none';
    // Restore all events
    displayAllUpcomingEvents();
  });
  
  // Real-time search
  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase().trim();
    
    if (searchTerm.length === 0) {
      searchResults.style.display = 'none';
      displayAllUpcomingEvents();
      return;
    }
    
    // Filter upcoming events
    const filteredEvents = window.upcomingEvents.filter(event => {
      const searchableText = `
        ${event.title.toLowerCase()}
        ${event.location.toLowerCase()}
        ${event.date.toLowerCase()}
        ${(event.description || '').toLowerCase()}
        ${(event.category || '').toLowerCase()}
      `;
      return searchableText.includes(searchTerm);
    });
    
    // Update search results dropdown
    updateSearchResults(filteredEvents);
    
    // Filter displayed events
    filterDisplayedEvents(filteredEvents);
  });
  
  // Close search results when clicking outside
  document.addEventListener('click', function(event) {
    if (!event.target.closest('.search-input-container')) {
      searchResults.style.display = 'none';
    }
  });
  
  // Handle Enter key in search
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const searchTerm = this.value.trim();
      if (searchTerm && window.upcomingEvents.length > 0) {
        const filteredEvents = window.upcomingEvents.filter(event => {
          const searchableText = `
            ${event.title.toLowerCase()}
            ${event.location.toLowerCase()}
            ${event.date.toLowerCase()}
          `;
          return searchableText.includes(searchTerm.toLowerCase());
        });
        
        if (filteredEvents.length === 1) {
          // If only one result, navigate to it
          const event = filteredEvents[0];
          const eventLink = event.link || `eventslist-details.html?event=${event.id}`;
          window.location.href = eventLink;
        } else if (filteredEvents.length > 0) {
          // Show results
          updateSearchResults(filteredEvents);
          filterDisplayedEvents(filteredEvents);
        }
      }
    }
  });
}

// Update search results dropdown
function updateSearchResults(events) {
  const searchResults = document.getElementById('searchResults');
  
  if (events.length === 0) {
    searchResults.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <p>No events found matching your search</p>
        <small class="text-muted">Try different keywords</small>
      </div>
    `;
    searchResults.style.display = 'block';
    return;
  }
  
  let resultsHTML = '';
  events.slice(0, 5).forEach(event => {
    const eventId = event.id || event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const eventLink = event.link || `eventslist-details.html?event=${eventId}`;
    
    resultsHTML += `
      <div class="search-result-item" data-event-id="${eventId}">
        <div class="search-result-title">${event.title}</div>
        <div class="search-result-meta">
          <span><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
          <span><i class="fas fa-calendar-alt"></i> ${event.date}</span>
        </div>
      </div>
    `;
  });
  
  if (events.length > 5) {
    resultsHTML += `
      <div class="search-result-item text-center">
        <small class="text-primary">Showing 5 of ${events.length} events</small>
      </div>
    `;
  }
  
  searchResults.innerHTML = resultsHTML;
  searchResults.style.display = 'block';
  
  // Add click event to search results
  document.querySelectorAll('.search-result-item[data-event-id]').forEach(item => {
    item.addEventListener('click', function() {
      const eventId = this.getAttribute('data-event-id');
      const event = window.upcomingEvents.find(e => {
        const eId = e.id || e.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return eId === eventId;
      });
      if (event) {
        const eventLink = event.link || `eventslist-details.html?event=${eventId}`;
        window.location.href = eventLink;
      }
    });
  });
}

// Filter displayed events
function filterDisplayedEvents(filteredEvents) {
  const upcomingContainer = document.getElementById('upcomingEventsContainer');
  
  if (filteredEvents.length === 0) {
    upcomingContainer.innerHTML = `
      <div class="col-12 text-center">
        <i class="fas fa-search fa-2x text-gray-300 mb-3"></i>
        <p class="text-gray-600">No upcoming events match your search criteria.</p>
        <button onclick="clearSearchAndReset()" class="vs-btn style4 mt-3">
          <i class="fas fa-times me-2"></i> Clear Search
        </button>
      </div>
    `;
    return;
  }
  
  upcomingContainer.innerHTML = '';
  filteredEvents.forEach(event => {
    const eventHTML = createEventCard(event, false);
    upcomingContainer.innerHTML += eventHTML;
  });
}

// Display all upcoming events
function displayAllUpcomingEvents() {
  const upcomingContainer = document.getElementById('upcomingEventsContainer');
  
  if (!window.upcomingEvents || window.upcomingEvents.length === 0) {
    upcomingContainer.innerHTML = `
      <div class="col-12 text-center">
        <p class="text-gray-600">No upcoming events at the moment. Check back soon!</p>
      </div>
    `;
    return;
  }
  
  upcomingContainer.innerHTML = '';
  window.upcomingEvents.forEach(event => {
    const eventHTML = createEventCard(event, false);
    upcomingContainer.innerHTML += eventHTML;
  });
}

// Clear search and reset display
function clearSearchAndReset() {
  const searchInput = document.getElementById('eventSearch');
  const clearSearchBtn = document.getElementById('clearSearch');
  const searchResults = document.getElementById('searchResults');
  
  searchInput.value = '';
  searchResults.style.display = 'none';
  clearSearchBtn.style.display = 'none';
  displayAllUpcomingEvents();
}

// Scroll to top functionality
function initializeScrollToTop() {
  const scrollToTopBtn = document.querySelector('.scrollToTop');
  
  if (!scrollToTopBtn) return;
  
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      scrollToTopBtn.classList.add('show');
    } else {
      scrollToTopBtn.classList.remove('show');
    }
  });
  
  scrollToTopBtn.addEventListener('click', function(e) {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Load events
  loadEvents();
  
  // Initialize scroll to top
  initializeScrollToTop();
  
  // Make functions available globally
  window.clearSearchAndReset = clearSearchAndReset;
  window.displayAllUpcomingEvents = displayAllUpcomingEvents;
  
  console.log('Index page initialized successfully');
});