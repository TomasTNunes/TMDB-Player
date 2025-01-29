(function() {
    function addMovieButton() {

        // Find Movie TMDB ID
        const movieid = getTmdbIdFromUrl('movie');

        // Find the "Play Trailer" or "Watchlist" button to place our custom button next to it
        let referenceButton = document.querySelector('.play_trailer');

        if (!referenceButton) {
        referenceButton = document.querySelector('.watchlist');
        }

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
                font-weight: bold; /* Make the font bold */
            `;

            // Add event listener to open the new link
            customButton.onclick = function() {
                window.open(`https://tmdbplayer.nunesnetwork.com/?type=movie&id=${movieid}`, '_blank');
            };

            // Insert our custom button next to the trailer button
            referenceButton.parentElement.appendChild(customButton);

        }
    }

    // Run function after the page has loaded
    window.addEventListener('load', addMovieButton);
})();
