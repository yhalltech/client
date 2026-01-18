// talents.js - Dynamic talent loading and filtering

// Configuration
const TALENTS_PER_PAGE = 6;
let currentPage = 1;
let currentFilter = 'all';
let allTalents = [];
let filteredTalents = [];

// DOM Elements - will be initialized after DOM loads
let talentGrid = null;
let loadingSpinner = null;
let noResults = null;
let paginationContainer = null;
let filterRadios = null;

// Initialize DOM elements
function initDOMElements() {
    talentGrid = document.getElementById('talentGrid');
    loadingSpinner = document.getElementById('loadingSpinner');
    noResults = document.getElementById('noResults');
    paginationContainer = document.getElementById('paginationContainer');
    filterRadios = document.querySelectorAll('input[name="talent_type"]');
    
    console.log('DOM Elements initialized:', {
        talentGrid: !!talentGrid,
        loadingSpinner: !!loadingSpinner,
        noResults: !!noResults,
        paginationContainer: !!paginationContainer,
        filterRadios: filterRadios.length
    });
}

// Fetch talents from JSON
async function fetchTalents() {
    try {
        console.log('Fetching talents.json...');
        
        // Add timeout to prevent endless loading
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch('talents.json', {
            signal: controller.signal,
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        clearTimeout(timeoutId);
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Raw data received:', data);
        
        if (!data.talents || !Array.isArray(data.talents)) {
            throw new Error('Invalid JSON structure: talents array not found');
        }
        
        console.log(`Successfully fetched ${data.talents.length} talents`);
        return data.talents;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('Request timeout: talents.json took too long to load');
            showError('Request timeout. Please check your internet connection and try again.');
        } else {
            console.error('Error loading talents:', error);
            showError('Failed to load talents. Please check that talents.json exists and is accessible.');
        }
        return [];
    }
}

// Render talent card
function renderTalentCard(talent) {
    return `
        <div class="col-xl-4 col-lg-6 col-sm-6 filter-item">
            <div class="package-style1">
                <div class="package-img">
                    <a href="talent-details.html?talent=${talent.id}">
                        <img src="${talent.image}" alt="${talent.name}" class="img-fluid" loading="lazy" onerror="this.src='assets/img/placeholder.jpg'">
                    </a>
                </div>
                <div class="package-content">
                    <h3 class="package-title">
                        <a href="talent-details.html?talent=${talent.id}">${talent.name}</a>
                    </h3>
                    <p class="package-text">${talent.role}</p>
                    <div class="package-footer">
                        <a href="talent-details.html?talent=${talent.id}" class="vs-btn">Book Talent</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Filter talents by category
function filterTalents(category) {
    console.log('Filtering by category:', category);
    
    if (category === 'all') {
        return allTalents;
    }
    
    // Map filter values to talent categories
    const categoryMap = {
        'artists': 'artists',
        'djs': 'djs',
        'mcs': 'mcs',
        'producers': 'producers'
    };
    
    const talentCategory = categoryMap[category];
    if (!talentCategory) return allTalents;
    
    const filtered = allTalents.filter(talent => talent.category === talentCategory);
    console.log(`Filtered ${filtered.length} talents for category: ${category}`);
    return filtered;
}

// Paginate talents
function paginateTalents(talents, page) {
    const start = (page - 1) * TALENTS_PER_PAGE;
    const end = start + TALENTS_PER_PAGE;
    return talents.slice(start, end);
}

// Render pagination
function renderPagination(totalPages) {
    if (totalPages <= 1) return '';
    
    let paginationHTML = '<ul>';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<li><a href="#" data-page="${currentPage - 1}"><i class="fas fa-chevron-left"></i></a></li>`;
    }
    
    // Page numbers (show max 5 pages)
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            paginationHTML += `<li class="active"><a href="#" data-page="${i}">${i}</a></li>`;
        } else {
            paginationHTML += `<li><a href="#" data-page="${i}">${i}</a></li>`;
        }
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<li><a href="#" data-page="${currentPage + 1}"><i class="fas fa-chevron-right"></i></a></li>`;
    }
    
    paginationHTML += '</ul>';
    return paginationHTML;
}

// Update talent grid
function updateTalentGrid() {
    console.log('Updating talent grid...');
    
    if (!talentGrid || !loadingSpinner || !noResults || !paginationContainer) {
        console.error('Required DOM elements not found');
        return;
    }
    
    // Show loading
    loadingSpinner.style.display = 'flex';
    noResults.style.display = 'none';
    talentGrid.innerHTML = '';
    
    // Filter talents
    filteredTalents = filterTalents(currentFilter);
    
    if (filteredTalents.length === 0) {
        setTimeout(() => {
            loadingSpinner.style.display = 'none';
            noResults.style.display = 'block';
            paginationContainer.innerHTML = '';
        }, 300);
        return;
    }
    
    // Calculate total pages
    const totalPages = Math.ceil(filteredTalents.length / TALENTS_PER_PAGE);
    console.log(`Total pages: ${totalPages}, Current page: ${currentPage}`);
    
    // Ensure current page is valid
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }
    
    // Get current page talents
    const currentTalents = paginateTalents(filteredTalents, currentPage);
    console.log(`Rendering ${currentTalents.length} talents on page ${currentPage}`);
    
    // Render talents
    setTimeout(() => {
        talentGrid.innerHTML = currentTalents.map(renderTalentCard).join('');
        loadingSpinner.style.display = 'none';
        
        // Render pagination
        if (totalPages > 1) {
            paginationContainer.innerHTML = renderPagination(totalPages);
            
            // Add pagination event listeners
            document.querySelectorAll('#paginationContainer a[data-page]').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    currentPage = parseInt(this.dataset.page);
                    updateTalentGrid();
                    window.scrollTo({ top: talentGrid.offsetTop - 100, behavior: 'smooth' });
                });
            });
        } else {
            paginationContainer.innerHTML = '';
        }
    }, 300);
}

// Initialize talent list page
async function initTalentList() {
    console.log('=== Initializing Talent List ===');
    
    // Initialize DOM elements first
    initDOMElements();
    
    if (!talentGrid) {
        console.error('CRITICAL: Talent grid element not found!');
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
        return;
    }
    
    // Safety timeout - hide loading spinner after 15 seconds no matter what
    const safetyTimeout = setTimeout(() => {
        if (loadingSpinner && loadingSpinner.style.display !== 'none') {
            console.warn('Safety timeout: Hiding loading spinner after 15 seconds');
            loadingSpinner.style.display = 'none';
            if (noResults) {
                noResults.style.display = 'block';
                noResults.innerHTML = '<p class="text-danger">Loading took too long. Please refresh the page.</p>';
            }
        }
    }, 15000);
    
    try {
        // Load talents
        console.log('Starting to load talents...');
        allTalents = await fetchTalents();
        clearTimeout(safetyTimeout); // Clear safety timeout if successful
        
        console.log(`Successfully loaded ${allTalents.length} talents:`, allTalents);
        
        if (allTalents.length === 0) {
            console.warn('No talents found in JSON file');
            if (loadingSpinner) loadingSpinner.style.display = 'none';
            if (noResults) {
                noResults.style.display = 'block';
                noResults.innerHTML = '<p class="text-warning">No talents available at the moment. Please check back later.</p>';
            }
            return;
        }
        
        // Set up filter event listeners
        if (filterRadios && filterRadios.length > 0) {
            console.log('Setting up filter listeners...');
            filterRadios.forEach(radio => {
                radio.addEventListener('change', function() {
                    console.log('Filter changed to:', this.value);
                    currentFilter = this.value;
                    currentPage = 1;
                    updateTalentGrid();
                });
            });
        } else {
            console.warn('No filter radios found');
        }
        
        // Initial render
        console.log('Starting initial render...');
        updateTalentGrid();
    } catch (error) {
        clearTimeout(safetyTimeout);
        console.error('Error in initTalentList:', error);
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        if (noResults) {
            noResults.style.display = 'block';
            noResults.innerHTML = '<p class="text-danger">Error loading talents. Please refresh the page.</p>';
        }
    }
}

// Load talent details
async function loadTalentDetails() {
    console.log('=== Loading Talent Details ===');
    
    const talentDetails = document.getElementById('talentDetails');
    const loadingDetails = document.getElementById('loadingDetails');
    const errorMessage = document.getElementById('errorMessage');
    
    if (!talentDetails) {
        console.warn('Talent details element not found - not on details page');
        return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const talentId = parseInt(urlParams.get('talent'));
    
    console.log('Talent ID from URL:', talentId);
    
    if (!talentId) {
        showError('No talent specified.');
        return;
    }
    
    try {
        const talents = await fetchTalents();
        console.log('Searching for talent with ID:', talentId);
        
        const talent = talents.find(t => t.id === talentId);
        
        if (!talent) {
            console.error('Talent not found with ID:', talentId);
            showError('Talent not found.');
            return;
        }
        
        console.log('Found talent:', talent);
        
        // Populate talent details
        document.getElementById('talentImage').src = talent.image;
        document.getElementById('talentImage').alt = talent.name;
        document.getElementById('talentName').textContent = talent.name;
        document.getElementById('talentRole').textContent = talent.role;
        document.getElementById('talentDescription').textContent = talent.description;
        document.getElementById('talentIdInput').value = talent.id;
        document.getElementById('talentNameInput').value = talent.name;
        
        // Update breadcrumb
        updateBreadcrumb(talent.name);
        
        // Update page title
        document.title = `Kalenjin Vibes | ${talent.name} - ${talent.role}`;
        
        // Show content
        loadingDetails.style.display = 'none';
        errorMessage.style.display = 'none';
        talentDetails.style.display = 'block';
        
        console.log('Talent details loaded successfully');
    } catch (error) {
        console.error('Error loading talent details:', error);
        showError('Error loading talent information.');
    }
}

// Update breadcrumb
function updateBreadcrumb(talentName) {
    const currentTalentName = document.getElementById('currentTalentName');
    if (currentTalentName) {
        currentTalentName.textContent = talentName;
    }
}

// Show error message
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    const loadingDetails = document.getElementById('loadingDetails');
    
    if (errorMessage && loadingDetails) {
        loadingDetails.style.display = 'none';
        errorMessage.style.display = 'block';
    }
    console.error(message);
}

// Form submission handler
function setupBookingForm() {
    const form = document.getElementById('bookingForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        
        // Basic validation
        if (!data.first_name || !data.last_name || !data.email || !data.phone_number || !data.event_name || !data.location || !data.event_date || !data.amount) {
            Swal.fire({
                title: 'Incomplete Form',
                text: 'Please fill in all required fields.',
                icon: 'warning',
                confirmButtonColor: '#BA0909'
            });
            return;
        }
        
        // Encode form data as URL parameters
        const params = new URLSearchParams();
        params.append('type', 'talent_booking');
        params.append('talent_id', data.talent_id || '');
        params.append('talent_name', data.talent_name || '');
        params.append('first_name', data.first_name);
        params.append('last_name', data.last_name);
        params.append('email', data.email);
        params.append('phone_number', data.phone_number);
        params.append('event_name', data.event_name);
        params.append('location', data.location);
        params.append('event_date', data.event_date);
        params.append('amount', data.amount);
        if (data.notes) {
            params.append('notes', data.notes);
        }
        
        // Redirect to payments page with booking data
        window.location.href = `payments.html?${params.toString()}`;
    });
}

// Initialize based on page
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DOM Content Loaded ===');
    
    // Initialize talent list page
    if (document.getElementById('talentGrid')) {
        console.log('Detected talent list page');
        initTalentList().catch(error => {
            console.error('Error initializing talent list:', error);
            // Make sure loading spinner is hidden on error
            const spinner = document.getElementById('loadingSpinner');
            const noResults = document.getElementById('noResults');
            if (spinner) spinner.style.display = 'none';
            if (noResults) {
                noResults.style.display = 'block';
                noResults.innerHTML = '<p class="text-danger">Error loading talents. Please refresh the page.</p>';
            }
        });
    }
    
    // Initialize talent details page
    if (document.getElementById('talentDetails')) {
        console.log('Detected talent details page');
        loadTalentDetails().catch(error => {
            console.error('Error loading talent details:', error);
        });
        setupBookingForm();
    }
});