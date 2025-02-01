(function() {
    async function addTvButton() {
        // Find Movie TMDB ID
        const tvid = getTmdbIdFromUrl('tv');

        // Find the "Play Trailer" or "Watchlist" button to place our custom button next to it
        let referenceButton = document.querySelector('.play_trailer');

        if (!referenceButton) {
            referenceButton = document.querySelector('.watchlist');
        }
        
        // Get Dictionary with seasons as keys and number of episodes as values
        const seasonEpisodes = await fetchTvShowData(tvid);

        if (referenceButton) {
            // Create a new custom play button
            let customButton = document.createElement('button');
            customButton.textContent = 'Play';
            customButton.style.cssText = `
                margin-left: 25px;
                font-size: 16px;
                padding: 10px 20px;
                background: #032541;
                color: white;
                border: none;
                cursor: pointer;
                border-radius: 20px;
                font-weight: bold;
            `;

            // Add event listener to open the new link
            customButton.onclick = function() {
                window.open(`https://tmdbplayer.nunesnetwork.com/?type=tv&id=${tvid}&s=${seasonSelect.value}&e=${episodeSelect.value}`, '_blank');
            };

            // Insert custom play Button
            if (isMobile()) {
                // On mobile, find the div with classes "trailer ml-2" or span with classes "certification".
                let referenceElement = document.querySelector('div.trailer.ml-2');
                if (!referenceElement) {
                    referenceElement = document.querySelector('span.certification');
                }

                // Create a container div that will have the same parent as the referenceElement.
                let buttonDiv = document.createElement('div');
                buttonDiv.className = 'custom-play-container';

                // As a block-level element, a div naturally occupies full width.
                buttonDiv.style.width = '100%';
                buttonDiv.style.marginTop = '8px';
                buttonDiv.style.textAlign = 'center'; 
        
                // Append the custom play button into this container.
                buttonDiv.appendChild(customButton);
        
                // Insert the container below the referenceElement.
                referenceElement.parentElement.insertBefore(buttonDiv, referenceElement.nextSibling);
            } else {
                // Non-mobile: simply append the play button next to the reference button.
                referenceButton.parentElement.appendChild(customButton);
            }

            // Create season selection dropdown
            let seasonSelect = document.createElement('select');
            seasonSelect.style.cssText = `
                margin-left: 25px;
                margin-bottom: 0px;
                font-size: 16px;
                padding: 10px 20px;
                background: #032541;
                color: white;
                border: none;
                cursor: pointer;
                border-radius: 10px;
                font-weight: bold;
                -webkit-appearance: none; /* Remove default dropdown style */
                -moz-appearance: none;
                appearance: none;
            `;

            // Create season options dynamically
            Object.keys(seasonEpisodes).forEach(season => {
                let option = document.createElement('option');
                option.value = season;
                option.className = 'season-option';
                option.textContent = `Season ${season}`;
                seasonSelect.appendChild(option);
            });

            // Set default season (Season 1)
            seasonSelect.value = '1';

            // Create episode selection dropdown
            let episodeSelect = document.createElement('select');
            episodeSelect.style.cssText = `
                margin-left: 25px;
                margin-bottom: 0px;
                font-size: 16px;
                padding: 10px 20px;
                background: #032541;
                color: white;
                border: none;
                cursor: pointer;
                border-radius: 10px;
                font-weight: bold;
                -webkit-appearance: none; /* Remove default dropdown style */
                -moz-appearance: none;
                appearance: none;
            `;
            
            // Set default episode (Episode 1)
            function updateEpisodeSelect() {
                // Clear current options
                episodeSelect.innerHTML = ''; // Clear options before adding
                const episodes = seasonEpisodes[seasonSelect.value];
                for (let i = 1; i <= episodes; i++) {
                    let option = document.createElement('option');
                    option.value = i;
                    option.className = 'episode-option';
                    option.textContent = `Episode ${i}`;
                    episodeSelect.appendChild(option);
                }
                episodeSelect.value = '1'; // Set default episode to Episode 1
            }

            updateEpisodeSelect(); // Initialize episode dropdown

            episodeSelect.disabled = false; // Enable episode selection initially

            // Event listeners for the select dropdowns
            seasonSelect.addEventListener('change', () => {
                updateEpisodeSelect();
            });

            // Append the season and episode dropdowns to the customButton parent.
            customButton.parentElement.appendChild(seasonSelect);
            customButton.parentElement.appendChild(episodeSelect);

            // Customize option elements via CSS
            const style = document.createElement('style');
            style.textContent = `
                .season-option, .episode-option {
                    background-color: #032541;
                    color: white;
                    padding: 10px;
                    font-size: 16px;
                    font-weight: bold;
                    border: none;
                    transition: background-color 0.3s ease;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Run function after the page has loaded
    window.addEventListener('load', addTvButton);
})();
