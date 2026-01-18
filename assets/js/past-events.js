// assets/js/past-events.js

// Past Events Data
let pastEvents = [];
let filteredEvents = [];
let currentPage = 1;
const eventsPerPage = 12;

// DOM Elements
const loadingState = document.getElementById('loadingState');
const eventsGrid = document.getElementById('eventsGrid');
const noResults = document.getElementById('noResults');
const eventCount = document.getElementById('eventCount');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const clearSearchBtn = document.getElementById('clearSearch');
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');
const currentPageSpan = document.getElementById('currentPage');
const totalPagesSpan = document.getElementById('totalPages');

// Load past events from JSON
async function loadPastEvents() {
    try {
        const response = await fetch('index.json');
        const data = await response.json();
        pastEvents = data.pastEvents || [];
        filteredEvents = [...pastEvents];
        renderEvents();
        setupPagination();
        setupEventListeners();
    } catch (error) {
        console.error('Error loading past events:', error);
        showError('Failed to load past events. Please try again later.');
    } finally {
        loadingState.classList.add('hidden');
    }
}

// Render events for current page
function renderEvents() {
    const startIndex = (currentPage - 1) * eventsPerPage;
    const endIndex = startIndex + eventsPerPage;
    const pageEvents = filteredEvents.slice(startIndex, endIndex);

    if (pageEvents.length === 0) {
        eventsGrid.classList.add('hidden');
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
        eventsGrid.classList.remove('hidden');
        
        eventsGrid.innerHTML = pageEvents.map(event => `
            <div class="event-card bg-white rounded-xl shadow-lg overflow-hidden h-full">
                <div class="event-img relative">
                    <img src="${event.image}" alt="${event.title}" class="w-full h-full object-cover">
                    <div class="absolute top-4 right-4">
                        <span class="past-event-badge">Past Event</span>
                    </div>
                </div>
                <div class="p-6 flex-grow">
                    <h3 class="text-xl font-bold text-gray-800 mb-3 line-clamp-2">${event.title}</h3>
                    <div class="flex items-center text-gray-600 mb-3">
                        <i class="fas fa-map-marker-alt text-primary mr-2"></i>
                        <span class="text-sm line-clamp-2">${event.location}</span>
                    </div>
                    <div class="flex items-center text-gray-700 mb-4">
                        <i class="fas fa-calendar-alt text-primary mr-2"></i>
                        <span class="font-medium">${event.date}</span>
                    </div>
                    <div class="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
                        <span class="text-gray-500 text-sm">
                            <i class="fas fa-clock mr-1"></i> Ended
                        </span>
                        <button class="view-details-btn text-primary hover:text-red-800 font-semibold text-sm transition-colors duration-300" 
                                data-event-id="${event.id}">
                            View Details <i class="fas fa-arrow-right ml-1"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Update event count
    eventCount.textContent = filteredEvents.length;
    
    // Update pagination info
    updatePaginationInfo();
}

// Filter events based on search
function filterEvents() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredEvents = [...pastEvents];
    } else {
        filteredEvents = pastEvents.filter(event => 
            event.title.toLowerCase().includes(searchTerm) ||
            event.location.toLowerCase().includes(searchTerm) ||
            event.date.toLowerCase().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    renderEvents();
    setupPagination();
}

// Setup pagination
function setupPagination() {
    const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
    
    prevPage.disabled = currentPage === 1;
    nextPage.disabled = currentPage === totalPages || totalPages === 0;
    
    updatePaginationInfo();
}

function updatePaginationInfo() {
    const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
    currentPageSpan.textContent = currentPage;
    totalPagesSpan.textContent = totalPages || 1;
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    if (searchButton) {
        searchButton.addEventListener('click', filterEvents);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                filterEvents();
            }
        });
    }

    // Clear search
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            filterEvents();
        });
    }

    // Pagination
    if (prevPage) {
        prevPage.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderEvents();
                setupPagination();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    if (nextPage) {
        nextPage.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderEvents();
                setupPagination();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    // Event card clicks (delegated)
    if (eventsGrid) {
        eventsGrid.addEventListener('click', (e) => {
            if (e.target.closest('.view-details-btn')) {
                const eventId = e.target.closest('.view-details-btn').dataset.eventId;
                viewEventDetails(eventId);
            }
        });
    }
}

// View event details
function viewEventDetails(eventId) {
    // Find the event
    const event = pastEvents.find(e => e.id === eventId);
    if (event) {
        // Show event details in a modal or redirect to event page
        Swal.fire({
            title: event.title,
            html: `
                <div class="text-left">
                    <img src="${event.image}" alt="${event.title}" class="w-full h-48 object-cover rounded-lg mb-4">
                    <p class="mb-2"><strong>Date:</strong> ${event.date}</p>
                    <p class="mb-2"><strong>Location:</strong> ${event.location}</p>
                    ${event.description ? `<p class="mb-4">${event.description}</p>` : ''}
                </div>
            `,
            showCloseButton: true,
            showCancelButton: false,
            confirmButtonText: 'Close',
            confirmButtonColor: '#BA0909'
        });
    }
}

// Show error message
function showError(message) {
    loadingState.innerHTML = `
        <i class="fas fa-exclamation-circle text-red-500 text-5xl mb-4"></i>
        <p class="text-red-600 text-lg">${message}</p>
    `;
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadPastEvents();
});