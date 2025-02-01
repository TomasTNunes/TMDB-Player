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
                buttonDiv.style.marginBottom = '8px';
                buttonDiv.style.textAlign = 'center'; 
        
                // Append the custom play button into this container.
                customButton.style.marginLeft = '0px';
                buttonDiv.appendChild(customButton);
        
                // Insert the container below the referenceElement.
                referenceElement.parentElement.insertBefore(buttonDiv, referenceElement.nextSibling);
            } else {
                // Non-mobile: simply append the play button next to the reference button.
                referenceButton.parentElement.appendChild(customButton);
            }
        }
    }

    // Run function after the page has loaded
    window.addEventListener('load', addMovieButton);
})();
