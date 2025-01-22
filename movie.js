(function() {
    function addMovieButton() {

        // Find Movie TMDB ID
        const movieNumber = getTmdbIdFromUrl('movie');

        // Find the "Play Trailer" button to place our custom button next to it
        const trailerButton = document.querySelector('.play_trailer');

        if (trailerButton) {
            // Create a new custom play button
            let customButton = document.createElement('button');
            customButton.innerText = 'Custom Play';
            customButton.style.cssText = `
                margin-left: 10px;
                padding: 10px 20px;
                background-color: #ff4500;
                color: white;
                border: none;
                cursor: pointer;
                border-radius: 5px;
            `;

            // Add event listener to open the new link
            customButton.onclick = function() {
                window.open(`https://vidlink.pro/movie/${movieNumber}`, '_blank');
            };

            // Insert our custom button next to the trailer button
            trailerButton.parentElement.appendChild(customButton);

        }
    }

    // Run function after the page has loaded
    window.addEventListener('load', addMovieButton);
})();
