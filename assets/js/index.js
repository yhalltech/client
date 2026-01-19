// Index Page JavaScript - Event Loading

// Function to fetch and display events from JSON
async function loadEvents() {
  try {
    const response = await fetch('index.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
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
        <div class="col-span-full text-center py-12">
          <p class="text-gray-600 text-lg">No upcoming events at the moment. Check back soon!</p>
        </div>
      `;
    }
    
    // Load first 4 past events
    const pastContainer = document.getElementById('pastEventsContainer');
    if (window.pastEvents.length > 0) {
      pastContainer.innerHTML = '';
      const displayEvents = window.pastEvents.slice(0, 4);
      displayEvents.forEach(event => {
        const eventHTML = createEventCard(event, true);
        pastContainer.innerHTML += eventHTML;
      });
    } else {
      pastContainer.innerHTML = `
        <div class="col-span-full text-center py-12">
          <p class="text-gray-600 text-lg">No past events available.</p>
        </div>
      `;
    }
    
  } catch (error) {
    console.error('Error loading events:', error);
    
    document.getElementById('upcomingEventsContainer').innerHTML = `
      <div class="col-span-full text-center py-12">
        <p class="text-red-600 mb-4">Unable to load events. Please try again later.</p>
        <button onclick="location.reload()" class="bg-primary hover:bg-red-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
          <i class="fas fa-redo mr-2"></i> Retry
        </button>
      </div>
    `;
    
    document.getElementById('pastEventsContainer').innerHTML = `
      <div class="col-span-full text-center py-12">
        <p class="text-red-600">Unable to load past events. Please try again later.</p>
      </div>
    `;
  }
}

// Create event card HTML with Tailwind CSS
function createEventCard(event, isPast = false) {
  const eventLink = event.link || (isPast ? 'past-events.html' : `eventslist-details.html?event=${event.id}`);
  const eventId = event.id || event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  return `
    <div class="event-card bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl">
      <div class="event-img relative overflow-hidden h-64 bg-gray-100">
        <a href="${eventLink}">
          <img class="w-full h-full object-cover" src="${event.image}" alt="${event.title}" loading="lazy" onerror="this.src='assets/img/placeholder.jpg'">
        </a>
      </div>
      <div class="p-5">
        <h5 class="text-xl font-bold text-gray-900 mb-3 hover:text-primary transition-colors">
          <a href="${eventLink}">${event.title}</a>
        </h5>
        <div class="flex items-center gap-2 text-gray-600 mb-3">
          <i class="fas fa-map-marker-alt text-primary"></i>
          <span>${event.location}</span>
        </div>
        <div class="flex items-center gap-2 text-gray-900 font-semibold mb-4">
          <i class="fas fa-calendar-alt text-primary"></i>
          <span>${event.date}</span>
          ${isPast ? '<span class="ml-2 bg-gray-500 text-white text-xs px-2 py-1 rounded">Past Event</span>' : ''}
        </div>
        ${!isPast ? `
        <div class="flex justify-between items-center mt-4">
          <div class="text-2xl font-bold text-primary">
            ${event.price || 'Free'}
          </div>
          <a href="${eventLink}" class="bg-primary hover:bg-red-800 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-300 hover:-translate-y-1">
            ${event.price ? 'Buy Ticket' : 'View Details'}
          </a>
        </div>
        ` : ''}
      </div>
    </div>
  `;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  loadEvents();
  console.log('Index page initialized successfully');
});