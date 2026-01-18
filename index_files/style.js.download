
$(document).ready(function() {
    $('#searchInput').on('input', function() {
        let query = $(this).val();

        if (query.length > 1) { // Trigger search after at least 2 characters
            $.ajax({
                url: 'https://taitabgaa.com/app/api/event_searching', // Adjust as per your setup
                method: 'GET',
                data: { query: query },
                success: function(data) {
                    let suggestions = $('#suggestions');
                    suggestions.empty().hide();

                    if (data.length > 0) {
                        data.forEach(function(item) {

                        	 if (item.id === null) {
                                suggestions.append(`<div style="padding: 5px; color: red;">${item.event_name}</div>`);
                            } else {
                               suggestions.append(`<div style="padding: 5px; cursor: pointer;" class="suggestion-item">
                               	<a href="eventslist-details.php?event=${item.id}">
                               	${item.event_name}</a></div>`);

                            }



                        });
                        suggestions.show();
                    }
                },
                error: function() {
                    console.error("Error fetching suggestions.");
                }
            });
        } else {
            $('#suggestions').hide();
        }
    });

    // Select suggestion on click
      $(document).on('click', function(e) {
        if (!$(e.target).closest('#searchInput, #suggestions').length) {
            $('#suggestions').hide();
        }
    });
});

