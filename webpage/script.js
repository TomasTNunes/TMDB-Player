function getURLParams() {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    const id = params.get('id');
    
    if (type === 'movie' && id) {
        return { type: 'movie', id: id };
    } else if (type === 'tv' && id && params.get('s') && params.get('e')) {
        return { 
            type: 'tv', 
            id: id, 
            season: params.get('s'), 
            episode: params.get('e') 
        };
    }
    return null;
}

function redirectTowebsite() {
    window.location.href = "https://github.com/TomasTNunes/TMDB-Player?tab=readme-ov-file#tmdb-player";
}

function changeServer(serverNumber) {
    const params = getURLParams();
    if (!params) return;

    let src = '';
    if (params.type === 'movie') {
        switch (serverNumber) {
            case 1: src = `https://vidsrc.me/embed/movie?tmdb=${params.id}`; break;
            case 2: src = `https://vidsrc.cc/v2/embed/movie/${params.id}?autoPlay=false`; break;
            case 3: src = `https://moviesapi.club/movie/${params.id}`; break;
            case 4: src = `https://player.videasy.net/movie/${params.id}`; break;
            case 5: src = `https://vidsrc.su/embed/movie/${params.id}`; break;
            case 6: src = `https://vidlink.pro/movie/${params.id}`; break;
        }
    } else if (params.type === 'tv') {
        switch (serverNumber) {
            case 1: src = `https://vidsrc.me/embed/tv?tmdb=${params.id}&season=${params.season}&episode=${params.episode}`; break;
            case 2: src = `https://vidsrc.cc/v2/embed/tv/${params.id}/${params.season}/${params.episode}?autoPlay=false`; break;
            case 3: src = `https://moviesapi.club/tv/${params.id}-${params.season}-${params.episode}`; break;
            case 4: src = `https://player.videasy.net/tv/${params.id}/${params.season}/${params.episode}`; break;
            case 5: src = `https://vidsrc.su/embed/tv/${params.id}/${params.season}/${params.episode}`; break;
            case 6: src = `https://vidlink.pro/tv/${params.id}/${params.season}/${params.episode}`; break;
        }
    }
    document.getElementById('videoFrame').src = src;

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
        console.log(tmdbData.title);

        if (params.type === 'movie') {
            document.getElementById('title').innerText = `${tmdbData.title}`;
        } else {
            document.getElementById('title').innerText = `${tmdbData.title} S${params.season} E${params.episode}`;

            const [nextEpS, nextEpE] = getNextEp(params.season, params.episode, tmdbData);
            if (nextEpS !== null) {
                const nextEpButton = document.getElementById('nextep-button');
                nextEpButton.title = `Next Episode: S${nextEpS} E${nextEpE}`;
                nextEpButton.style.display = 'flex'; 
                nextEpButton.disabled = false;
                nextEpButton.addEventListener('click', () => {
                    const nextEpisodeUrl = `https://tmdb.nunesnetwork.com/?type=tv&id=${params.id}&s=${nextEpS}&e=${nextEpE}`;
                    window.location.href = nextEpisodeUrl;
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
    changeServer(1);
};