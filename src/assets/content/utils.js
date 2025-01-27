// Utility function to extract TMDB ID from the URL
function getTmdbIdFromUrl(type) {
    const regex = new RegExp(`/${type}/(\\d+)(?:-|$)`);
    const match = window.location.pathname.match(regex);
    return match ? match[1] : null;
}

// Function to fetch TV show data by ID
async function fetchTvShowData(tvId) {
    return new Promise((resolve, reject) => {
        // Get the API token from chrome storage
        chrome.storage.local.get(['TMDB_TOKEN'], async function(result) {
            const apiToken = result.TMDB_TOKEN;

            if (!apiToken) {
                console.error('API Token not found!');
                reject('API Token not found!');
                return;
            }

            const url = `https://api.themoviedb.org/3/tv/${tvId}?language=en-US`;
            const headers = {
                'Authorization': `Bearer ${apiToken}`,
                'accept': 'application/json'
            };

            try {
                const response = await fetch(url, { method: 'GET', headers: headers });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();

                // Extract the number of seasons and episode count per season
                const seasons = data.seasons;
                const seasonEpisodes = {};

                // Loop through the seasons and get the number of episodes per season
                for (const season of seasons) {
                    seasonEpisodes[season.season_number] = season.episode_count;
                }
                resolve(seasonEpisodes);
            } catch (error) {
                console.error('Error fetching TV show data:', error);
                reject(error);
            }
        });
    });
}