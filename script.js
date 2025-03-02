$(document).ready(() => {
    // Theme switching
    $('.theme-option').on('click', function() {
        const theme = $(this).data('theme');
        
        // Remove active class from all options
        $('.theme-option').removeClass('active');
        
        // Add active class to selected option
        $(this).addClass('active');
        
        // Apply theme
        $('html').attr('data-theme', theme);
        
        // Save theme preference
        localStorage.setItem('preferred-theme', theme);
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('preferred-theme');
    if (savedTheme) {
        $('html').attr('data-theme', savedTheme);
        $(`.theme-option[data-theme="${savedTheme}"]`).addClass('active');
    }

    // App Launcher Toggle
    $('#appLauncherBtn').on('click', function(e) {
        e.stopPropagation();
        $('#appLauncher').toggleClass('show');
    });

    // Close app launcher when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('#appLauncher').length) {
            $('#appLauncher').removeClass('show');
        }
    });

    
    // Initialize timezone settings
    function initializeTimezoneSettings() {
        const timezones = moment.tz.names(); // Get all available timezones
        const savedTimezones = JSON.parse(localStorage.getItem('clockTimezones')) || [
            'Europe/Copenhagen',
            'Europe/London',
            'Asia/Dhaka',
            'America/New_York'
        ];

        // Populate timezone selects
        $('.timezone-select').each(function(index) {
            const select = $(this);
            timezones.forEach(timezone => {
                const parts = timezone.split('/');
                let displayText = '';
                
                if (parts.length > 1) {
                    // If timezone has a slash, format it with parentheses
                    displayText = parts.reverse().join(' (').replace(/_/g, ' ') + ')';
                } else {
                    // If no slash, just use the timezone name with spaces instead of underscores
                    displayText = timezone.replace(/_/g, ' ');
                }
                
                const option = $('<option></option>')
                    .val(timezone)
                    .text(displayText);
                select.append(option);
            });
            // Set saved value
            select.val(savedTimezones[index]);
        });

        // Update clocks with saved timezones
        updateClockTimezones(savedTimezones);
    }

    // Handle timezone changes
    $('.timezone-select').on('change', function() {
        const newTimezones = $('.timezone-select').map(function() {
            return $(this).val();
        }).get();

        // Save to localStorage
        localStorage.setItem('clockTimezones', JSON.stringify(newTimezones));
        
        // Update clocks
        updateClockTimezones(newTimezones);
    });

    function updateClockTimezones(timezones) {
        $('.clock').each(function(index) {
            $(this).attr('data-timezone', timezones[index]);
            
            const timezone = timezones[index];
            const parts = timezone.split('/');
            
            if (parts.length > 1) {
                // If timezone has a slash, format it with parentheses
                $(this).siblings('.clock-title').text(parts.reverse().join(' (').replace(/_/g, ' ') + ')');
            } else {
                // If no slash, just display the timezone name with spaces instead of underscores
                $(this).siblings('.clock-title').text(timezone.replace(/_/g, ' '));
            }
        });
    }

    // Initialize timezone settings
    initializeTimezoneSettings();

    // Clock
    function updateClock() {
        $(".clock").each(function() {
            const clock = $(this);
            const timezone = clock.data('timezone'); // Get the timezone from data attribute
            const now = moment().tz(timezone); // Use moment-timezone to get the correct time
            const hour = now.format('H');
            const minute = now.format('m');
            const second = now.format('s');

            // Calculate the angle for the hands
            const secondAngle = (second / 60) * 360;
            const minuteAngle = (minute / 60) * 360;
            const hourAngle = (hour / 12) * 360;

            // Update the clock hands
            clock.find(".second-hand").css('transform', `rotate(${secondAngle}deg)`);
            clock.find(".minute-hand").css('transform', `rotate(${minuteAngle}deg)`);
            clock.find(".hour-hand").css('transform', `rotate(${hourAngle}deg)`);
        });
    }

    // Update the clock every second
    setInterval(updateClock, 1000);

    // Initialize the clock after the DOM is ready
    updateClock();

    

    //Weather Input
    const weather = () => {
        const savedLocation = localStorage.getItem('weatherLocation') || 'New York';
        const apiKey = getApiKey();
        const encodedLocation = encodeURIComponent(savedLocation);

        $.ajax({
            url: `https://api.openweathermap.org/data/2.5/weather?q=${encodedLocation}&appid=${apiKey}&units=metric`,
            method: 'GET',
            success: function (data) {
                updateWeatherUI(data);
            },
            error: function (data) {
                console.log('Weather API Error: ' + data);
            }
        });
    }

    const updateWeatherUI = (data) => {
        $('.city-name').text(data.name);
        $('.temperature').text(`${Math.round(data.main.temp)}°`);
        $('.weather-description').text(data.weather[0].description);
        $('.weather-icon img').attr('src', `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`);
        $('.wind-speed').text(`${data.wind.speed} km/h`);
        $('.clouds-all').text(`${data.main.feels_like}°`);
        $('.pressure').text(`${data.main.pressure} mbar`);
        $('.humidity').text(`${data.main.humidity}%`);
    }

    if (localStorage.getItem('weatherLocation')) {
        weather();
    }



    // IP Info
    const getIpInfo = () => {
        $.ajax({
            url: 'https://api.ipquery.io/?format=json',
            method: 'GET',
            success: function (data) {
                updateIpInfoUI(data);
                if (!localStorage.getItem('weatherLocation')) {
                    localStorage.setItem('weatherLocation', data.location.city + ', ' + data.location.country_code);
                    weather();
                }

            },
            error: function () {
                console.log('IP Info API Error');
                if (!localStorage.getItem('weatherLocation')) {
                    localStorage.setItem('weatherLocation', data.location.city + ', ' + data.location.country_code);
                    weather();
                }
            }
        });
    }

    const updateIpInfoUI = (data) => {
        $('.ip-address').text(data.ip);
        $('.country').text(data.location.country_code);
        $('.city').text(data.location.city);
        $('.flag').text(getFlagEmoji(data.location.country_code));
        $('.isp').text(data.isp.isp);
        $('.timezone').text(data.location.timezone);
        $('.coordinates').text(`${data.location.latitude.toFixed(2)}, ${data.location.longitude.toFixed(2)}`);
        $('.risk-score').text(data.risk.risk_score);
    }

    const getFlagEmoji = (countryCode) => {
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt());
        return String.fromCodePoint(...codePoints);
    }

    getIpInfo();

    // Search engine selection
    function initializeSearchEngine() {
        const savedEngine = localStorage.getItem('selectedSearchEngine') || 'google';
        $('.search-option').removeClass('active');
        $(`.search-option[data-engine="${savedEngine}"]`).addClass('active');
    }

    $('.search-option').click(function () {
        $('.search-option').removeClass('active');
        $(this).addClass('active');
        localStorage.setItem('selectedSearchEngine', $(this).data('engine'));
    });

    // Initialize search engine selection
    initializeSearchEngine();
    // Search functionality
    $('.search-container').submit(function (e) {
        e.preventDefault(); // Prevent default form submission
        const query = $('.search-bar').val();
        const engine = $('.search-option.active').data('engine');

        const searchUrls = {
            google: `https://www.google.com/search?q=${query}`,
            duck: `https://duckduckgo.com/?q=${query}`,
            bing: `https://www.bing.com/search?q=${query}`,
            brave: `https://search.brave.com/search?q=${query}`,
            youtube: `https://www.youtube.com/results?search_query=${query}`,
            yandex: `https://yandex.com/search/?text=${query}`,
            googleMaps: `https://www.google.com/maps/search/${query}`,
        };

        if (query && engine) {
            window.location.href = searchUrls[engine];
        }
    });
    // Modified search suggestions code
    let currentFocus = -1; // Track currently focused suggestion
    // Replace or add this function
    async function getGoogleSuggestions(query) {
        try {
            const response = await fetch(`https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}`);
            const data = await response.json();
            return data[1]; // Returns the array of suggestions
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            return [];
        }
    }
    // Update your search input event handler
    $('.search-bar').on('input', async function() {
        // Check if autocomplete is enabled
        const autocompleteEnabled = localStorage.getItem('autocompleteEnabled') !== 'false';
        if (!autocompleteEnabled) {
            $('#suggestions').empty().css('opacity', '0');
            $('input.search-bar').removeClass('focus');
            return;
        }
    
        const query = $(this).val().trim();
        const $suggestions = $('#suggestions');
        
        if (query.length < 1) {
            $suggestions.empty().css('opacity', '0');
            $('input.search-bar').removeClass('focus');
            return;
        }
        
        try {
            const suggestions = await getGoogleSuggestions(query);
            $suggestions.empty();
            
            suggestions.forEach(suggestion => {
                $suggestions.append(`<li>${suggestion}</li>`);
            });
            $suggestions.show().css('opacity', '1');
            $('input.search-bar').addClass('focus');
        } catch (error) {
            console.error('Error:', error);
            $suggestions.css('opacity', '0');
            $('input.search-bar').removeClass('focus');
        }
    });
    // Also preload when the autocomplete toggle is enabled
    $('#autocompleteToggle').on('change', function () {
        const isEnabled = $(this).is(':checked');
        localStorage.setItem('autocompleteEnabled', isEnabled);
        updateAutocompleteUI(isEnabled);
    });
    // Add keyboard navigation
    $('.search-bar').on('keydown', function (e) {
        const suggestions = $('#suggestions li');
        const maxIndex = suggestions.length - 1;
    
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                currentFocus = (currentFocus < maxIndex) ? currentFocus + 1 : 0; // Loop back to the first suggestion
                updateFocus(suggestions);
                break;
    
            case 'ArrowUp':
                e.preventDefault();
                currentFocus = (currentFocus > 0) ? currentFocus - 1 : maxIndex; // Loop to the last suggestion
                updateFocus(suggestions);
                break;
    
            case 'Enter':
                e.preventDefault();
                if (currentFocus > -1) {
                    const selectedText = suggestions.eq(currentFocus).text();
                    $('.search-bar').val(selectedText);
                    $('#suggestions').empty().css('opacity', '0');
                    $('input.search-bar').removeClass('focus');
                    $('.search-container').submit(); // Trigger search
                } else {
                    // Trigger search if no suggestion is focused
                    $('.search-container').submit(); // Add this line to submit the form
                }
                break;
    
            case 'Escape':
                $('#suggestions').empty().css('opacity', '0');
                $('input.search-bar').removeClass('focus');
                currentFocus = -1; // Reset focus
                break;
        }
    });
    function updateFocus(suggestions) {
        suggestions.removeClass('active');
        if (currentFocus > -1) {
            const focusedSuggestion = suggestions.eq(currentFocus);
            focusedSuggestion.addClass('active');
            $('.search-bar').val(focusedSuggestion.text());
            // Scroll the focused suggestion into view
            focusedSuggestion[0].scrollIntoView({
                block: 'nearest'
            });
        }
    }
    // Store original input value
    $('.search-bar').on('input', function () {
        $(this).data('originalValue', $(this).val());
    });
    // Handle suggestion click
    $(document).on('click', '#suggestions li', function () {
        $('.search-bar').val($(this).text());
        $('#suggestions').empty();
        // Optionally trigger the search
        //$('.search-container').submit();
    });
    // Clear suggestions when clicking outside
    $(document).on('click', function (e) {
        if (!$(e.target).closest('.search-container').length) {
            $('#suggestions').empty().css('opacity', '0');
            $('input.search-bar').removeClass('focus');
        }
    });
    // Add these new functions for autocomplete settings
    function initializeAutocompleteSettings() {
        // Load saved setting or default to true
        const autocompleteEnabled = localStorage.getItem('autocompleteEnabled') !== 'false';
        $('#autocompleteToggle').prop('checked', autocompleteEnabled);
    // Update UI based on current setting
        updateAutocompleteUI(autocompleteEnabled);
    }
    function updateAutocompleteUI(enabled) {
        if (!enabled) {
            // Clear and hide suggestions
            $('#suggestions').empty().css('opacity', '0');
            $('input.search-bar').removeClass('focus');
        }
    }
    // Initialize settings
    initializeAutocompleteSettings();
    // Initialize location input with saved value
    function initializeLocationSettings() {
        const savedLocation = localStorage.getItem('weatherLocation') || 'New York';
        $('#locationInput').val(savedLocation);
    }
    // Handle location save
    $('#saveLocation').click(function (e) {
        e.preventDefault();
        $('.city-name').text('Loading...');
        const newLocation = $('#locationInput').val().trim();
    
        if (newLocation) {
            // Test the location first
            const apiKey = getApiKey();
            const encodedLocation = encodeURIComponent(newLocation);
    
            $.ajax({
                url: `https://api.openweathermap.org/data/2.5/weather?q=${encodedLocation}&appid=${apiKey}&units=metric`,
                method: 'GET',
                success: function (data) {
                    // Save location if valid
                    localStorage.setItem('weatherLocation', newLocation);
                    weather(); // Update weather display
                    //alert('Location updated successfully!');
                },
                error: function (xhr) {
                    console.error('Weather API Error:', xhr);
                    // Try with geocoding API as fallback
                    $.ajax({
                        url: `https://api.openweathermap.org/geo/1.0/direct?q=${encodedLocation}&limit=1&appid=${apiKey}`,
                        method: 'GET',
                        success: function (geoData) {
                            if (geoData && geoData.length > 0) {
                                const location = `${geoData[0].name}, ${geoData[0].country}`;
                                localStorage.setItem('weatherLocation', location);
                                weather(); // Update weather display
                                //alert('Location updated successfully!');
                            } else {
                                alert('Invalid location. Please try again.');
                            }
                        },
                        error: function () {
                            alert('Invalid location. Please try again.');
                        }
                    });
                }
            });
        } else {
            alert('Please enter a location');
        }
    });
    // Add this to your initialization code
    initializeLocationSettings();
    // Add geolocation detection
    $('#detectLocation').click(function () {
        if ("geolocation" in navigator) {
            const button = $(this);
            button.prop('disabled', true);
    
            // Show loading state
            button.html('<svg class="loading-spinner" viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle></svg>');
    
            navigator.geolocation.getCurrentPosition(function (position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const apiKey = getApiKey();
    
                // Reverse geocoding to get city name
                $.ajax({
                    url: `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`,
                    method: 'GET',
                    success: function (data) {
                        if (data && data[0]) {
                            const location = `${data[0].name}, ${data[0].country}`;
                            $('#locationInput').val(location);
                        }
                    },
                    error: function () {
                        alert('Could not determine location name. Please enter manually.');
                    },
                    complete: function () {
                        // Restore button state
                        button.prop('disabled', false);
                        button.html('<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>');
                    }
                });
            }, function (error) {
                alert('Could not detect location. Please ensure location access is allowed.');
                button.prop('disabled', false);
                button.html('<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>');
            });
        } else {
            alert('Geolocation is not supported by your browser');
        }
    });
    // Initialize bookmarks with default values
    let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [{
            url: 'https://facebook.com',
            favicon: 'https://www.google.com/s2/favicons?domain=facebook.com&sz=32',
            name: 'Facebook'
        },
        {
            url: 'https://youtube.com',
            favicon: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=32',
            name: 'YouTube'
        },
        {
            url: 'https://telegram.org',
            favicon: 'https://www.google.com/s2/favicons?domain=telegram.org&sz=32',
            name: 'Telegram'
        },
        {
            url: 'https://web.whatsapp.com',
            favicon: 'https://www.google.com/s2/favicons?domain=whatsapp.com&sz=32',
            name: 'WhatsApp'
        },
        {
            url: 'https://reddit.com',
            favicon: 'https://www.google.com/s2/favicons?domain=reddit.com&sz=32',
            name: 'Reddit'
        },
        {
            url: 'https://twitter.com',
            favicon: 'https://www.google.com/s2/favicons?domain=twitter.com&sz=32',
            name: 'Twitter'
        }
    ];
    // Function to get favicon URL
    function getFaviconUrl(url) {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
        } catch (e) {
            console.error('Invalid URL for favicon:', e);
            return '';
        }
    }
    // Function to get site name from URL
    function getSiteName(url) {
        try {
            const domain = new URL(url).hostname;
            return domain.replace('www.', '').split('.')[0]; // Extract the main part of the domain
        } catch (e) {
            console.error('Invalid URL for site name:', e);
            return 'Website';
        }
    }
    // Function to validate URL
    function isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }
    // Function to render bookmarks
    function renderBookmarks() {
        const bookmarksList = $('.bookmarks-list');
        const bookmarksContainer = $('.bookmarks'); // For bottom-center bookmarks
        bookmarksList.empty(); // Clear existing bookmarks in settings
        bookmarksContainer.empty(); // Clear existing bookmarks in bottom-center
    
        bookmarks.forEach(bookmark => {
            // Render in settings panel
            bookmarksList.append(`
                <div class="bookmark-item">
                    <div class="bookmark-item-info">
                        <img src="${bookmark.favicon}" alt="${bookmark.name}">
                        <span class="bookmark-item-name">${bookmark.name}</span>
                    </div>
                    <div>
                        <button class="edit-bookmark" data-url="${bookmark.url}">Edit</button>
                        <button class="remove-bookmark" data-url="${bookmark.url}">Remove</button>
                    </div>
                </div>
            `);
    
            // Render in bottom-center
            bookmarksContainer.append(`
                <a href="${bookmark.url}" class="bookmark" data-name="${bookmark.name}">
                    <div class="bookmark-icon">
                        <img src="${bookmark.favicon}" alt="${bookmark.name}">
                    </div>
                    <span class="bookmark-name">${bookmark.name}</span>
                </a>
            `);
        });
    // Save to localStorage
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    }
    // Add bookmark handler
    $('#addBookmark').click(() => {
        const url = $('#bookmarkUrl').val().trim();
        if (!url || !isValidUrl(url)) {
            alert('Please enter a valid URL');
            return;
        }
    // Check if bookmark already exists
        if (!bookmarks.some(b => b.url === url)) {
            const favicon = getFaviconUrl(url);
            const name = getSiteName(url);
            
            bookmarks.push({
                url: url,
                favicon: favicon,
                name: name
            });
            renderBookmarks();
            $('#bookmarkUrl').val(''); // Clear input field
        } else {
            alert('Bookmark already exists!');
        }
    });
    // Remove bookmark handler
    $(document).on('click', '.remove-bookmark', function () {
        const url = $(this).data('url');
        bookmarks = bookmarks.filter(b => b.url !== url);
        renderBookmarks();
    });
    // Edit bookmark handler
    $(document).on('click', '.edit-bookmark', function () {
        const url = $(this).data('url');
        const bookmark = bookmarks.find(b => b.url === url);
    
        const newName = prompt("Edit bookmark name:", bookmark.name);
        const newUrl = prompt("Edit bookmark URL:", bookmark.url);
    
        if (newName && newUrl && isValidUrl(newUrl)) {
            bookmark.name = newName;
            bookmark.url = newUrl;
            bookmark.favicon = getFaviconUrl(newUrl); // Update favicon
            renderBookmarks();
        } else {
            alert('Please enter a valid URL');
        }
    });
    // Show settings panel when settingsButton is clicked
    $('#settingsButton').on('click', (event) => {
        event.stopPropagation();
        $('#settingsPanel').toggleClass('open');
        $('#overlay').toggle(); // Show or hide the overlay
    });
    // Hide settings panel and overlay when clicking outside
    $(document).on('click', function (event) {
        const settingsPanel = $('#settingsPanel');
        const overlay = $('#overlay');
        const newsPanel = $('#newsPanel');
        
        // Only hide panels if clicking outside both panels
        if (!settingsPanel.is(event.target) && 
            settingsPanel.has(event.target).length === 0 && 
            !newsPanel.is(event.target) && 
            newsPanel.has(event.target).length === 0 && 
            !$(event.target).closest('#settingsButton').length && 
            !$(event.target).closest('#newsButton').length) {
            
            settingsPanel.removeClass('open'); // Hide the settings panel
            newsPanel.removeClass('showPanel'); // Hide the news panel
            overlay.hide(); // Hide the overlay
        }
    });
    // Hide settings panel and overlay when clicking on the overlay
    $('#overlay').on('click', function (event) {
        // Prevent the click from propagating to document
        event.stopPropagation();
        
        $('#settingsPanel').removeClass('open'); // Hide the settings panel
        $('#newsPanel').removeClass('showPanel'); // Hide the news panel
        $(this).hide(); // Hide the overlay
    });
    // Initial render
    renderBookmarks();

    //ToDo App
    // Todo App Toggle
    $('#todoAppBtn').on('click', function(e) {
        e.stopPropagation();
        $('#todoApp').toggleClass('show');
    });

    // Close todo app when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('#todoApp').length && !$(e.target).closest('#todoAppBtn').length) {
            $('#todoApp').removeClass('show');
        }
    });

    // Todo App Functionality
    function initializeTodoApp() {
        // Load saved todos
        const savedTodos = JSON.parse(localStorage.getItem('todos')) || [];
        renderTodos(savedTodos);

        // Add new todo
        $('#addTodoBtn').on('click', addTodo);
        $('#todoInput').on('keypress', function(e) {
            if (e.which === 13) {
                addTodo();
            }
        });

        // Clear completed todos
        $('#clearCompletedTodos').on('click', clearCompletedTodos);
    }

    function addTodo() {
        const todoText = $('#todoInput').val().trim();
        if (todoText) {
            const todos = JSON.parse(localStorage.getItem('todos')) || [];
            const newTodo = {
                id: Date.now(),
                text: todoText,
                completed: false
            };
            todos.push(newTodo);
            localStorage.setItem('todos', JSON.stringify(todos));
            renderTodos(todos);
            $('#todoInput').val('');
        }
    }

    function toggleTodoComplete(id) {
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        const updatedTodos = todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
        localStorage.setItem('todos', JSON.stringify(updatedTodos));
        renderTodos(updatedTodos);
    }

    function deleteTodo(id) {
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        const updatedTodos = todos.filter(todo => todo.id !== id);
        localStorage.setItem('todos', JSON.stringify(updatedTodos));
        renderTodos(updatedTodos);
    }

    function clearCompletedTodos() {
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        const updatedTodos = todos.filter(todo => !todo.completed);
        localStorage.setItem('todos', JSON.stringify(updatedTodos));
        renderTodos(updatedTodos);
    }

    function renderTodos(todos) {
        const $todoList = $('#todoList');
        $todoList.empty();

        todos.forEach(todo => {
            const $todoItem = $(`
                <li class="todo-item" data-id="${todo.id}">
                    <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                    <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
                    <button class="delete-todo">×</button>
                </li>
            `);

            $todoItem.find('.todo-checkbox').on('change', function() {
                toggleTodoComplete(todo.id);
            });

            $todoItem.find('.delete-todo').on('click', function() {
                deleteTodo(todo.id);
            });

            $todoList.append($todoItem);
        });
    }

    // Initialize Todo App
    initializeTodoApp();

    // News Panel 
    // News Panel Toggle
    $('#newsButton').on('click', function(e) {
        e.stopPropagation();
        $('#newsPanel').addClass('showPanel');
        $('#overlay').show();
        
        // Check if news preferences are already set
        const newsPreferences = JSON.parse(localStorage.getItem('newsPreferences'));
        if (!newsPreferences) {
            // Show configuration panel if preferences aren't set
            $('#newsConfig').addClass('show');
            $('#newsContent').removeClass('show');
        } else {
            // Show news content if preferences are set
            $('#newsConfig').removeClass('show');
            $('#newsContent').addClass('show');
            loadNews();
        }
    });
    // Remove this event handler that's causing the issue
    // Close news panel when clicking outside
    /*$(document).on('click', function(e) {
        if (!$(e.target).closest('#newsPanel').length && !$(e.target).closest('#newsButton').length) {
            e.stopPropagation();
            $('#newsPanel').removeClass('showPanel');
            $('#overlay').hide();
        }
    });*/
    // Save news preferences
    $('#saveNewsPreferences').on('click', function() {
        const selectedCategories = [];
        $('.category-checkbox:checked').each(function() {
            selectedCategories.push($(this).val());
        });

        if (selectedCategories.length === 0) {
            alert('Please select at least one category');
            return;
        }

        // Save preferences to localStorage
        localStorage.setItem('newsPreferences', JSON.stringify(selectedCategories));
        
        // Update category filter dropdown
        updateCategoryFilter(selectedCategories);
        
        // Switch to news content view
        $('#newsConfig').removeClass('show');
        $('#newsContent').addClass('show');
        
        // Load news
        loadNews();
    });

    // Configure news button
    $('#configureNews').on('click', function() {
        $('#newsContent').removeClass('show');
        $('#newsConfig').addClass('show');
        
        // Check saved preferences and update checkboxes
        const newsPreferences = JSON.parse(localStorage.getItem('newsPreferences')) || [];
        $('.category-checkbox').prop('checked', false);
        newsPreferences.forEach(category => {
            $(`.category-checkbox[value="${category}"]`).prop('checked', true);
        });
    });

    // Refresh news button
    $('#refreshNews').on('click', function() {
        loadNews();
    });

    // Filter news by category
    $('#newsCategoryFilter').on('change', function() {
        const selectedCategory = $(this).val();
        
        if (selectedCategory === 'all') {
            $('.news-item').show();
        } else {
            $('.news-item').hide();
            $(`.news-item[data-category="${selectedCategory}"]`).show();
        }
    });

    // Update category filter dropdown
    function updateCategoryFilter(categories) {
        const $filter = $('#newsCategoryFilter');
        $filter.empty();
        $filter.append('<option value="all">All Categories</option>');
        
        categories.forEach(category => {
            $filter.append(`<option value="${category}">${category.charAt(0).toUpperCase() + category.slice(1)}</option>`);
        });
    }

        // Variables to track pagination
        let currentPage = 1;
        let isLoadingMore = false;
        
        // Load more news button handler
        $('#loadMoreNews').on('click', function() {
            if (!isLoadingMore) {
                loadMoreNews();
            }
        });
        
        // Function to load more news
        function loadMoreNews() {
            isLoadingMore = true;
            currentPage++;
            
            // Show loading state
            $('#loadMoreNews').addClass('loading');
            
            const newsPreferences = JSON.parse(localStorage.getItem('newsPreferences')) || [];
            if (newsPreferences.length === 0) return;
            
            // Build query string with selected categories
            const sectionQuery = newsPreferences.join('|');
            const apiKey = '8ba90e96-b598-4ed1-a162-f7dba02cf081';
            const apiUrl = `https://content.guardianapis.com/search?section=${sectionQuery}&api-key=${apiKey}&show-fields=thumbnail&page-size=10&page=${currentPage}`;
            
            $.ajax({
                url: apiUrl,
                method: 'GET',
                success: function(data) {
                    appendNews(data.response.results);
                    $('#loadMoreNews').removeClass('loading');
                    isLoadingMore = false;
                },
                error: function(error) {
                    $('#loadMoreNews').removeClass('loading').text('Error loading more news');
                    console.error('Error fetching more news:', error);
                    isLoadingMore = false;
                }
            });
        }
        
        // Function to append more news to the existing list
        function appendNews(articles) {
            const $newsList = $('#newsList');
            
            if (!articles || articles.length === 0) {
                $('#loadMoreNews').text('No more news available').prop('disabled', true);
                return;
            }
            
            articles.forEach(article => {
                const category = article.sectionName;
                const sectionId = article.sectionId;
                const publishDate = moment(article.webPublicationDate);
                const formattedDate = publishDate.format('DD MMM YYYY');
                const timeAgo = publishDate.fromNow(true);
                
                const $newsItem = $(`
                    <div class="news-item" data-category="${sectionId}">
                        <a href="${article.webUrl}" target="_blank">${article.webTitle}</a>
                        <div class="news-meta">
                            <span class="news-date">${formattedDate} | ${timeAgo} Ago</span>
                            <span class="news-category">${category}</span>
                        </div>
                    </div>
                `);
                
                $newsList.append($newsItem);
            });
            
            // Apply current category filter
            const selectedCategory = $('#newsCategoryFilter').val();
            if (selectedCategory !== 'all') {
                $('.news-item').hide();
                $(`.news-item[data-category="${selectedCategory}"]`).show();
            }
        }
        
        // Update the loadNews function to reset pagination
        function loadNews() {
            currentPage = 1;
            isLoadingMore = false;
            $('#loadMoreNews').removeClass('loading').text('Show More News').prop('disabled', false);
            
            const newsPreferences = JSON.parse(localStorage.getItem('newsPreferences')) || [];
            if (newsPreferences.length === 0) return;
            
            const $newsList = $('#newsList');
            $newsList.html('<div class="news-loading">Loading news...</div>');
            
            // Build query string with selected categories
            const sectionQuery = newsPreferences.join('|');
            const apiKey = '8ba90e96-b598-4ed1-a162-f7dba02cf081';
            const apiUrl = `https://content.guardianapis.com/search?section=${sectionQuery}&api-key=${apiKey}&show-fields=thumbnail&page-size=10&page=1`;
            
            $.ajax({
                url: apiUrl,
                method: 'GET',
                success: function(data) {
                    displayNews(data.response.results);
                },
                error: function(error) {
                    $newsList.html('<div class="news-loading">Failed to load news. Please try again later.</div>');
                    console.error('Error fetching news:', error);
                }
            });
        }

    // Display news in the panel
    function displayNews(articles) {
        const $newsList = $('#newsList');
        $newsList.empty();
        
        if (!articles || articles.length === 0) {
            $newsList.html('<div class="news-loading">No news found. Try selecting different categories.</div>');
            return;
        }
        
        articles.forEach(article => {
            const category = article.sectionName;
            const sectionId = article.sectionId;
            const publishDate = moment(article.webPublicationDate);
            const formattedDate = publishDate.format('DD MMM YYYY');
            const timeAgo = publishDate.fromNow(true);
            
            const $newsItem = $(`
                <div class="news-item" data-category="${sectionId}">
                    <a href="${article.webUrl}" target="_blank">${article.webTitle}</a>
                    <div class="news-meta">
                        <span class="news-date">${formattedDate} | ${timeAgo} Ago</span>
                        <span class="news-category">${category}</span>
                    </div>
                </div>
            `);
            
            $newsList.append($newsItem);
        });
    }

    // Initialize news if preferences exist
    function initializeNews() {
        const newsPreferences = JSON.parse(localStorage.getItem('newsPreferences'));
        if (newsPreferences) {
            updateCategoryFilter(newsPreferences);
        }
    }

    // Initialize news
    initializeNews();
});