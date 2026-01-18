// ========== MOBILE MENU FUNCTIONALITY ==========
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.vs-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Close Menu
    const closeBtn = document.querySelector('.menu-close');
    const overlay = document.querySelector('.menu-overlay');
    
    function closeMenu() {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    if (overlay) overlay.addEventListener('click', closeMenu);
    
    // Close menu when clicking links
    const menuLinks = document.querySelectorAll('.menu-link');
    menuLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // ========== SEARCH FUNCTIONALITY ==========
    $(document).ready(function() {
        // Initialize modal
        var searchModal = new bootstrap.Modal(document.getElementById('searchModal'));
        
        // Show modal when search button is clicked
        $('.search-toggle').click(function() {
            searchModal.show();
            $('#searchInput').focus();
        });
        
        // Live search functionality
        $('#searchInput').on('input', function() {
            var query = $(this).val().trim();
            if (query.length > 2) {
                $.ajax({
                    url: 'search_events.php',
                    type: 'GET',
                    data: { query: query, live: true },
                    success: function(response) {
                        $('#searchResults').html(response);
                    }
                });
            } else {
                $('#searchResults').html('');
            }
        });
        
        // Form submission
        $('#searchForm').on('submit', function(e) {
            e.preventDefault();
            var query = $('#searchInput').val().trim();
            if (query) {
                window.location.href = 'search_events.php?query=' + encodeURIComponent(query);
            }
        });
    });

    // ========== TALENT BOOKING FORM ==========
    $('#bookingForm').on('submit', function (e) {
        e.preventDefault();
        
        const formData = $(this).serialize();
        
        $.ajax({
            url: 'helpers/controllers/talentscontroller.php',
            type: 'POST',
            data: formData,
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    $('#responseMessage').html(`
                        <div class="alert alert-success">
                            ${response.message}
                        </div>
                    `);
                    
                    setTimeout(function () {
                        window.location.href = 'talentlist.php';
                    }, 3000);
                } else {
                    let errorHtml = `<div class="alert alert-danger">${response.message}`;
                    if (response.errors) {
                        errorHtml += `<ul>`;
                        $.each(response.errors, function (key, error) {
                            errorHtml += `<li>${error}</li>`;
                        });
                        errorHtml += `</ul>`;
                    }
                    errorHtml += `</div>`;
                    $('#responseMessage').html(errorHtml);
                }
            },
            error: function (xhr, status, error) {
                $('#responseMessage').html(`
                    <div class="alert alert-danger">
                        An unexpected error occurred: ${error}
                    </div>
                `);
            },
        });
    });

    // ========== DROPDOWN NAVIGATION ==========
    document.addEventListener("DOMContentLoaded", function() {
        let form_1 = document.getElementById('event');
        if (form_1) {
            let selectElement = form_1.querySelector('select[name="name"]');
            if (selectElement) {
                selectElement.addEventListener("change", function() {
                    let value = this.value;
                    
                    if (value === 'events') {
                        window.location.href = "eventslist.html";
                    } else if (value === 'talent') {
                        window.location.href = "talentlist.html";
                    } else if (value === 'shop') {
                        window.location.href = "shop.html";
                    }
                });
            }
        }
    });

    // ========== HERO SLIDER ==========
    const slider = document.querySelector('.hero-slider-container');
    if (slider) {
        const slides = document.querySelectorAll('.hero-slide');
        const prevBtn = document.querySelector('.slider-prev');
        const nextBtn = document.querySelector('.slider-next');
        let currentIndex = 0;
        const slideCount = slides.length;

        function updateSlider() {
            slider.style.transform = `translateX(-${currentIndex * 50}%)`;
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                currentIndex = (currentIndex + 1) % slideCount;
                updateSlider();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                currentIndex = (currentIndex - 1 + slideCount) % slideCount;
                updateSlider();
            });
        }

        // Auto-slide every 5 seconds
        setInterval(function() {
            currentIndex = (currentIndex + 1) % slideCount;
            updateSlider();
        }, 5000);
    }
});