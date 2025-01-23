(function() {
    async function addTvButton() {
        // Find Movie TMDB ID
        const tvid = getTmdbIdFromUrl('tv');

        // Find the "Play Trailer" button to place our custom button next to it
        const trailerButton = document.querySelector('.play_trailer');

        // Get Dictionary with seasons as keys and number of episodes as values
        const seasonEpisodes = await fetchTvShowData(tvid);

        if (trailerButton) {
            // Create a new custom play button
            let customButton = document.createElement('button');
            customButton.innerText = 'Play';
            customButton.style.cssText = `
                margin-left: 25px;
                font-size: 16px;
                padding: 10px 20px;
                background: #032541;
                color: white;
                border: none;
                cursor: pointer;
                border-radius: 20px;
                font-weight: bold; /* Make the font bold */
            `;

            // Add event listener to open the new link
            customButton.onclick = function() {
                window.open(`https://tmdbplayer.nunesnetwork.com/?type=tv&id=${tvid}&s=${selectedSeason}&e=${selectedEpisode}`, '_blank');
            };

            // Insert our custom play button next to the trailer button
            trailerButton.parentElement.appendChild(customButton);

            // Create season selection dropdown
            let seasonSelect = document.createElement('select');
            seasonSelect.style.cssText = `
                margin-left: 25px;
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
            seasonSelect.innerHTML = Object.keys(seasonEpisodes).map(season => 
                `<option value="${season}" class="season-option">Season ${season}</option>`
            ).join('');

            // Set default season (Season 1)
            seasonSelect.value = '1';
            let selectedSeason = '1'; // Default selected season

            // Create episode selection dropdown
            let episodeSelect = document.createElement('select');
            episodeSelect.style.cssText = `
                margin-left: 25px;
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
            episodeSelect.innerHTML = Array.from({ length: seasonEpisodes[selectedSeason] }, (_, i) => 
                `<option value="${i + 1}" class="episode-option">Episode ${i + 1}</option>`
            ).join('');
            episodeSelect.value = '1'; // Default selected episode
            let selectedEpisode = '1'; // Default selected episode
            episodeSelect.disabled = false; // Enable episode selection initially

            // Function to update episode dropdown based on selected season
            function updateEpisodeSelect() {
                const episodes = seasonEpisodes[selectedSeason];
                episodeSelect.innerHTML = Array.from({ length: episodes }, (_, i) => 
                    `<option value="${i + 1}" class="episode-option">Episode ${i + 1}</option>`
                ).join('');
                episodeSelect.value = '1'; // Set default episode to Episode 1
                selectedEpisode = episodeSelect.value;
            }

            // Event listeners for the select dropdowns
            seasonSelect.addEventListener('change', () => {
                selectedSeason = seasonSelect.value;
                updateEpisodeSelect();
            });

            episodeSelect.addEventListener('change', () => {
                selectedEpisode = episodeSelect.value;
            });

            // Append season and episode selection to the trailer button container
            trailerButton.parentElement.appendChild(seasonSelect);
            trailerButton.parentElement.appendChild(episodeSelect);

            // Customize option elements via CSS
            const style = document.createElement('style');
            style.innerHTML = `
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
