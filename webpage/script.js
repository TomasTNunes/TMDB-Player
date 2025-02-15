function getURLParams() {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    const id = params.get('id');
    const server = params.get('server'); // Get the optional server parameter

    const result = {};

    // Add server to the result if it exists
    if (server) {
        result.server = server;
    }

    if (type === 'movie' && id) {
        result.type = 'movie';
        result.id = id;
    } else if (type === 'tv' && id && params.get('s') && params.get('e')) {
        result.type = 'tv';
        result.id = id;
        result.season = params.get('s');
        result.episode = params.get('e');
    } else {
        return null; // Return null if required parameters are missing
    }

    return result;
}

function getSelectedServerButtonId() {
    // Get all buttons in the server grid
    const buttons = document.querySelectorAll('.server-grid button');

    // Loop through the buttons to find the one with the 'selected' class
    for (const button of buttons) {
        if (button.classList.contains('selected')) {
            const id = button.id.replace('server', '');
            return parseInt(id, 10); // Convert the extracted string to a number
        }
    }

    return null; // Return null if no button is selected
}

function redirectTowebsite() {
    window.location.href = "https://github.com/TomasTNunes/TMDB-Player?tab=readme-ov-file#tmdb-player";
}

function changeServer(serverNumber) {
    const params = getURLParams();
    if (!params) return;

    const iframe = document.getElementById('videoFrame');
    iframe.src = '';

    let src = '';
    if (params.type === 'movie') {
        switch (serverNumber) {
            case 1: src = `https://vidsrc.cc/v3/embed/movie/${params.id}?autoPlay=false`; break; // Rakan
            case 2: src = `https://moviesapi.club/movie/${params.id}`; break; // Bard
            case 3: src = `https://vidsrc.me/embed/movie?tmdb=${params.id}`; break; // Xayah
            case 4: src = `https://player.videasy.net/movie/${params.id}`; break; // Ekko
            case 5: src = `https://vidsrc.su/embed/movie/${params.id}`; break; // Naafiri
            case 6: src = `https://vidlink.pro/movie/${params.id}?title=true&poster=true&autoplay=false`; break; // Ryze
        }
    } else if (params.type === 'tv') {
        switch (serverNumber) {
            case 1: src = `https://vidsrc.cc/v3/embed/tv/${params.id}/${params.season}/${params.episode}?autoPlay=false`; break; // Rakan
            case 2: src = `https://moviesapi.club/tv/${params.id}-${params.season}-${params.episode}`; break; // Bard
            case 3: src = `https://vidsrc.me/embed/tv?tmdb=${params.id}&season=${params.season}&episode=${params.episode}`; break; // Xayah
            case 4: src = `https://player.videasy.net/tv/${params.id}/${params.season}/${params.episode}?nextEpisode=true&episodeSelector=true`; break; // Ekko
            case 5: src = `https://vidsrc.su/embed/tv/${params.id}/${params.season}/${params.episode}`; break; // Naafiri
            case 6: src = `https://vidlink.pro/tv/${params.id}/${params.season}/${params.episode}?title=true&poster=true&autoplay=false&nextbutton=true`; break; // Ryze
        }
    }

    iframe.src = src;

    // Highlight the selected server button
    const buttons = document.querySelectorAll('.server-grid button');
    buttons.forEach(button => button.classList.remove('selected'));
    document.getElementById(`server${serverNumber}`).classList.add('selected');
}

async function fetchTMDBData(params) {
    const result = {};

    try {
        let url;
        const headers = {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYTk1NzRmZDcxMjRkNmI5ZTUyNjA4ZWEzNWQ2NzdiNCIsIm5iZiI6MTczNzU5MDQ2NC4zMjUsInN1YiI6IjY3OTE4NmMwZThiNjdmZjgzM2ZhNjM4OCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kWqK74FSN41PZO7_ENZelydTtX0u2g6dCkAW0vFs4jU`,
            'accept': 'application/json'
        };

        if (params.type === 'movie') {
            url = `https://api.themoviedb.org/3/movie/${params.id}?language=en-US`;
            const response = await fetch(url, { method: 'GET', headers: headers });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            result['title'] = data.original_title;
        } else if (params.type === 'tv') {
            url = `https://api.themoviedb.org/3/tv/${params.id}?language=en-US`;
            const response = await fetch(url, { method: 'GET', headers: headers });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            result['title'] = data.name;
            const seasons = data.seasons;
            for (const season of seasons) {
                result[season.season_number] = season.episode_count;
            }
        } else {
            throw new Error('Invalid type specified');
        }
        return result;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Re-throw the error if you want the caller to handle it
    }
}

function getNextEp(currentSeason, currentEpisode, tmdbData) {
    const currentSeasonEps = tmdbData[currentSeason];
    if (currentEpisode < currentSeasonEps) {
        return [parseInt(currentSeason), parseInt(currentEpisode) + 1];
    }
    const nextSeasonEps = tmdbData[parseInt(currentSeason) + 1];
    if (nextSeasonEps !== undefined) {
        return [parseInt(currentSeason) + 1, 1];
    }
    return [null, null];
}

window.onload = async () => {
    const params = getURLParams();
    if (!params) {
        redirectTowebsite();
        return;
    }

    try {
        const tmdbData = await fetchTMDBData(params);
        const title = document.getElementById('title');

        title.addEventListener('click', () => {
            window.location.href = `https://www.themoviedb.org/${params.type}/${params.id}`;
        });

        if (params.type === 'movie') {
            title.innerText = `${tmdbData.title}`;
        } else {
            title.innerText = `${tmdbData.title} S${params.season} E${params.episode}`;

            // Episode Selection
            const epSelectButton = document.getElementById('epselect-button');
            epSelectButton.style.display = 'flex'; 
            epSelectButton.style.cursor = 'pointer';
            epSelectButton.style.opacity = 1;
            epSelectButton.disabled = false;

            // Next Episode
            const [nextEpS, nextEpE] = getNextEp(params.season, params.episode, tmdbData);
            if (nextEpS !== null) {
                const nextEpButton = document.getElementById('nextep-button');
                nextEpButton.title = `Next Episode: S${nextEpS} E${nextEpE}`;
                nextEpButton.style.display = 'flex'; 
                nextEpButton.style.cursor = 'pointer';
                nextEpButton.style.opacity = 1;
                nextEpButton.disabled = false;
                nextEpButton.addEventListener('click', () => {
                    const currentUrl = new URL(window.location.href);
                    currentUrl.searchParams.set('s', nextEpS);
                    currentUrl.searchParams.set('e', nextEpE);
                    currentUrl.searchParams.set('server', getSelectedServerButtonId());
                    window.location.href = currentUrl.toString();
                });
            }
            else {
                const nextEpButton = document.getElementById('nextep-button');
                nextEpButton.title = `No Next Episode`;
                nextEpButton.style.display = 'flex'; // Ensure the button is visible
                nextEpButton.disabled = true; // Disable the button
            }
        }

    } catch (error) {
        console.error('Error loading data:', error);
        // Optionally, display an error message to the user
        document.getElementById('title').innerText = 'Title';
    }
    if (params.server) {
        changeServer(parseInt(params.server));
    } else {
        changeServer(1);
    }
};