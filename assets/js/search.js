// File: search-events.js
// Enhanced Search Functionality for Events
class EventSearch {
    constructor() {
        this.events = [];
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
        this.searchModal = document.getElementById('searchModal');
        this.initialize();
    }

    async initialize() {
        await this.loadEvents();
        this.setupEventListeners();
        this.displayPopularEvents();
    }

    async loadEvents() {
        try {
            // In production, fetch from API
            // const response = await fetch('/api/events');
            // this.events = await response.json();
            
            // Sample events data (same as in header)
            this.events = [
                {
                    id: 1,
                    title: "Weekend Vibes Festival",
                    date: "2024-03-15",
                    venue: "KICC Grounds, Nairobi",
                    category: "Music Festival",
                    description: "The biggest music festival of the year featuring top artists and DJs.",
                    image: "assets/img/events/festival.jpg",
                    link: "eventdetails.html?id=1",
                    price: 1500,
                    ticketsAvailable: true
                },
                {
                    id: 2,
                    title: "Cultural Night Extravaganza",
                    date: "2024-03-22",
                    venue: "Bomas of Kenya",
                    category: "Cultural Event",
                    description: "Experience rich cultural performances and traditional music.",
                    image: "assets/img/events/cultural.jpg",
                    link: "eventdetails.html?id=2",
                    price: 800,
                    ticketsAvailable: true
                },
                {
                    id: 3,
                    title: "DJ Night Special",
                    date: "2024-03-28",
                    venue: "Carnivore Grounds",
                    category: "Club Event",
                    description: "All night party with international DJs and local talent.",
                    image: "assets/img/events/djnight.jpg",
                    link: "eventdetails.html?id=3",
                    price: 1200,
                    ticketsAvailable: true
                },
                {
                    id: 4,
                    title: "Kalenjin Heritage Festival",
                    date: "2024-04-05",
                    venue: "Eldoret Sports Club",
                    category: "Cultural Festival",
                    description: "Celebrating Kalenjin culture, music, and traditions.",
                    image: "assets/img/events/heritage.jpg",
                    link: "eventdetails.html?id=4",
                    price: 1000,
                    ticketsAvailable: true
                },
                {
                    id: 5,
                    title: "Urban Music Concert",
                    date: "2024-04-12",
                    venue: "Uhuru Gardens",
                    category: "Concert",
                    description: "Featuring the hottest urban artists from across Kenya.",
                    image: "assets/img/events/concert.jpg",
                    link: "eventdetails.html?id=5",
                    price: 2000,
                    ticketsAvailable: true
                },
                {
                    id: 6,
                    title: "Traditional Dance Competition",
                    date: "2024-04-20",
                    venue: "Nyayo National Stadium",
                    category: "Competition",
                    description: "Watch the best traditional dance groups compete for the crown.",
                    image: "assets/img/events/dance.jpg",
                    link: "eventdetails.html?id=6",
                    price: 500,
                    ticketsAvailable: true
                }
            ];
        } catch (error) {
            console.error('Error loading events:', error);
            this.events = [];
        }
    }

    setupEventListeners() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => this.performSearch());
        }
    }

    performSearch() {
        const query = this.searchInput.value.toLowerCase().trim();
        
        if (query.length < 2) {
            this.displayPopularEvents();
            return;
        }

        const filteredEvents = this.events.filter(event => 
            event.title.toLowerCase().includes(query) ||
            event.description.toLowerCase().includes(query) ||
            event.category.toLowerCase().includes(query) ||
            event.venue.toLowerCase().includes(query) ||
            event.date.includes(query)
        );

        this.displaySearchResults(filteredEvents, query);
    }

    displayPopularEvents() {
        if (!this.searchResults) return;

        const upcomingEvents = this.events
            .filter(event => new Date(event.date) >= new Date())
            .slice(0, 3);

        let html = `
            <div class="no-results">
                <div class="text-center mb-4">
                    <i class="fas fa-search fa-3x mb-3" style="color: #8A2387;"></i>
                    <h4 class="mb-3">Search Upcoming Events</h4>
                    <p class="text-muted mb-4">Type to search for events, festivals, concerts, and more...</p>
                </div>
                <div class="mb-4">
                    <h6 class="mb-3">Popular Searches:</h6>
                    <div class="d-flex flex-wrap gap-2">
                        <span class="badge cursor-pointer" onclick="eventSearch.setSearch('festival')" style="background: linear-gradient(135deg, #8A2387 0%, #E94057 100%); color: white; padding: 8px 15px; border-radius: 20px;">Festival</span>
                        <span class="badge cursor-pointer" onclick="eventSearch.setSearch('concert')" style="background: linear-gradient(135deg, #8A2387 0%, #E94057 100%); color: white; padding: 8px 15px; border-radius: 20px;">Concert</span>
                        <span class="badge cursor-pointer" onclick="eventSearch.setSearch('cultural')" style="background: linear-gradient(135deg, #8A2387 0%, #E94057 100%); color: white; padding: 8px 15px; border-radius: 20px;">Cultural</span>
                        <span class="badge cursor-pointer" onclick="eventSearch.setSearch('music')" style="background: linear-gradient(135deg, #8A2387 0%, #E94057 100%); color: white; padding: 8px 15px; border-radius: 20px;">Music</span>
                        <span class="badge cursor-pointer" onclick="eventSearch.setSearch('dance')" style="background: linear-gradient(135deg, #8A2387 0%, #E94057 100%); color: white; padding: 8px 15px; border-radius: 20px;">Dance</span>
                    </div>
                </div>
        `;

        if (upcomingEvents.length > 0) {
            html += `
                <div class="mt-4">
                    <h6 class="mb-3">Upcoming Events:</h6>
                    <div class="list-group">
            `;

            upcomingEvents.forEach(event => {
                const eventDate = new Date(event.date);
                const formattedDate = eventDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                });

                html += `
                    <div class="list-group-item list-group-item-action border-0 mb-2 rounded-3" onclick="eventSearch.viewEventDetails(${event.id})" style="cursor: pointer; background: rgba(138, 35, 135, 0.05); transition: all 0.3s ease;">
                        <div class="d-flex align-items-center">
                            <div class="flex-shrink-0">
                                <div class="rounded-circle d-flex align-items-center justify-content-center" style="width: 60px; height: 60px; background: linear-gradient(135deg, #8A2387 0%, #E94057 100%);">
                                    <span class="text-white fw-bold">${formattedDate}</span>
                                </div>
                            </div>
                            <div class="flex-grow-1 ms-3">
                                <h6 class="mb-1">${event.title}</h6>
                                <small class="text-muted">${event.venue}</small>
                            </div>
                            <div class="flex-shrink-0">
                                <i class="fas fa-chevron-right text-primary"></i>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        }

        html += `</div>`;
        this.searchResults.innerHTML = html;
    }

    displaySearchResults(events, query) {
        if (!this.searchResults) return;

        if (events.length === 0) {
            this.searchResults.innerHTML = `
                <div class="no-results">
                    <div class="text-center py-5">
                        <i class="fas fa-search fa-4x mb-4" style="color: #8A2387;"></i>
                        <h4 class="mb-3">No events found for "${query}"</h4>
                        <p class="text-muted mb-4">Try searching with different keywords</p>
                        <button class="btn" onclick="eventSearch.displayPopularEvents()" style="background: linear-gradient(135deg, #8A2387 0%, #E94057 100%); color: white; padding: 10px 30px; border-radius: 25px;">
                            <i class="fas fa-arrow-left me-2"></i>Back to Popular Events
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        let html = `
            <div class="search-results-container">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h5>Found ${events.length} event${events.length === 1 ? '' : 's'}</h5>
                    <button class="btn btn-sm" onclick="eventSearch.displayPopularEvents()" style="background: linear-gradient(135deg, #8A2387 0%, #E94057 100%); color: white; padding: 5px 15px; border-radius: 20px;">
                        Clear Search
                    </button>
                </div>
        `;

        events.forEach(event => {
            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            html += `
                <div class="search-result-item" onclick="eventSearch.viewEventDetails(${event.id})">
                    <div class="row g-3 align-items-center">
                        <div class="col-auto">
                            <div class="rounded-circle" style="width: 60px; height: 60px; background: linear-gradient(135deg, #8A2387 0%, #E94057 100%); display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-calendar-alt text-white fa-lg"></i>
                            </div>
                        </div>
                        <div class="col">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 class="mb-1">${event.title}</h6>
                                    <div class="d-flex flex-wrap gap-2 mb-1">
                                        <small class="text-muted"><i class="fas fa-calendar me-1"></i>${formattedDate}</small>
                                        <small class="text-muted"><i class="fas fa-map-marker-alt me-1"></i>${event.venue}</small>
                                    </div>
                                    <small class="text-truncate d-block text-muted">${event.description.substring(0, 100)}...</small>
                                </div>
                                <div class="text-end">
                                    <span class="badge mb-2" style="background: linear-gradient(135deg, #8A2387 0%, #E94057 100%); color: white;">${event.category}</span>
                                    <div class="text-primary fw-bold">Ksh ${event.price}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        this.searchResults.innerHTML = html;
    }

    setSearch(keyword) {
        if (this.searchInput && this.searchModal) {
            this.searchInput.value = keyword;
            
            // Ensure modal is open
            if (!this.searchModal.classList.contains('active')) {
                this.searchModal.classList.add('active');
            }
            
            this.searchInput.focus();
            this.performSearch();
        }
    }

    viewEventDetails(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (event) {
            // Close search modal
            if (this.searchModal) {
                this.searchModal.classList.remove('active');
            }
            
            // Store event data for the details page
            sessionStorage.setItem('currentEvent', JSON.stringify(event));
            
            // Navigate to event details page
            window.location.href = event.link;
        }
    }
}

// Initialize search when DOM is loaded
let eventSearch;
document.addEventListener('DOMContentLoaded', () => {
    eventSearch = new EventSearch();
});