// Define the elements
const iframe = document.getElementById('videoFrame');
const title = document.getElementById('title');
const nextEpButton = document.getElementById('nextep-button');
const epSelectButton = document.querySelector('.epselect-button');
const popoverContainer = document.querySelector('.popover-container');
const popoverContent = document.querySelector('.popover-content');
const seasonsList = document.querySelector('.seasons-list');
const episodesList = document.querySelector('.episodes-list');
const popoverTitle = document.querySelector('.popover-header-title');
const popoverBackButton = document.querySelector('.popover-back-button');
const popoverCloseButton = document.querySelector('.popover-close-button');
const server_buttons = document.querySelectorAll('.server-grid button');

// Utility Functions
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
    // Loop through the buttons to find the one with the 'selected' class
    for (const button of server_buttons) {
        if (button.classList.contains('selected')) {
            const id = button.id.replace('server', '');
            return parseInt(id, 10); // Convert the extracted string to a number
        }
    }

    return null; // Return null if no button is selected
}

function changeServer(serverNumber) {
    const params = getURLParams();
    if (!params) return;

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
    server_buttons.forEach(button => button.classList.remove('selected'));
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
            result.title = data.name;
            const seasons = data.seasons;
            result.seasons = [];
            for (const season of seasons) {
                result[season.season_number] = season.episode_count;
                // Exclude Season 0 (Specials) from the list
                if (season.season_number !== 0) {
                    result.seasons.push(season.season_number);
                }
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

// Fetch TV show episodes data from TMDB API
async function fetchEpSelectionData(params, tmdbData) {
    const result = {};
    let url;
    const headers = {
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYTk1NzRmZDcxMjRkNmI5ZTUyNjA4ZWEzNWQ2NzdiNCIsIm5iZiI6MTczNzU5MDQ2NC4zMjUsInN1YiI6IjY3OTE4NmMwZThiNjdmZjgzM2ZhNjM4OCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kWqK74FSN41PZO7_ENZelydTtX0u2g6dCkAW0vFs4jU`,
        'accept': 'application/json'
    };

    for (const season of tmdbData.seasons) {
        url = `https://api.themoviedb.org/3/tv/${params.id}/season/${season}?language=en-US`;
        const response = await fetch(url, { method: 'GET', headers: headers });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const seasonData = await response.json();

        result[season] = {};
        result[season].name = seasonData.name;
        result[season].poster_path = seasonData.poster_path;
        result[season].episodes = [];

        for (const ep of seasonData.episodes) {
            const episode = {};
            episode.name = ep.name;
            episode.episode_number = ep.episode_number;
            episode.season_number = ep.season_number;
            episode.air_date = ep.air_date;
            episode.runtime = ep.runtime;
            episode.still_path = ep.still_path;
            result[season].episodes.push(episode);
        }
    }
    return result;
}

// Episode Selection Popover show: seasons list
function showSeasons(tvShowTitle) {
    seasonsList.style.display = 'block';
    episodesList.style.display = 'none';
    popoverBackButton.style.display = 'none';
    popoverTitle.innerText = tvShowTitle;
}

// Episode Selection Popover show: episodes list
function showEpisodes(seasonName) {
    seasonsList.style.display = 'none';
    episodesList.style.display = 'block';
    popoverBackButton.style.display = 'block';
    popoverTitle.innerText = seasonName;
}

// Load Popover container with seasons and episodes 
async function loadPopoverSelectEpisode(params, tmdbData) {
    // Get episode data
    const epSelectionData = await fetchEpSelectionData(params, tmdbData);

    // Populate seasons list
    seasonsList.innerHTML = tmdbData.seasons.map(season => `
        <li data-season="${season}">${epSelectionData[season].name}</li>
    `).join('');

    // Handle season click
    seasonsList.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            const season = e.target.getAttribute('data-season');
            const episodes = epSelectionData[season].episodes;
            episodesList.innerHTML = episodes.map(ep => `
                <li data-season="${season}" data-episode="${ep.episode_number}">
                    E${ep.episode_number} - ${ep.name}
                </li>
            `).join('');
            showEpisodes(epSelectionData[season].name);
        }
    });

    // Handle episode click
    episodesList.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            const season = e.target.getAttribute('data-season');
            const episode = e.target.getAttribute('data-episode');
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('s', season);
            currentUrl.searchParams.set('e', episode);
            currentUrl.searchParams.set('server', getSelectedServerButtonId());
            window.location.href = currentUrl.toString();
        }
    });
    showSeasons(tmdbData.title);
}

// Initialize popover data
window.onload = async () => {
    const params = getURLParams();
    if (!params) {
        window.location.href = "https://github.com/TomasTNunes/TMDB-Player?tab=readme-ov-file#tmdb-player";
        return;
    }

    try {
        const tmdbData = await fetchTMDBData(params);

        title.addEventListener('click', () => {
            window.location.href = `https://www.themoviedb.org/${params.type}/${params.id}`;
        });

        if (params.type === 'movie') {
            title.innerText = `${tmdbData.title}`;
        } else {
            title.innerText = `${tmdbData.title} S${params.season} E${params.episode}`;

            // Next Episode
            const [nextEpS, nextEpE] = getNextEp(params.season, params.episode, tmdbData);
            if (nextEpS !== null) {
                nextEpButton.title = `Next Episode: S${nextEpS} E${nextEpE}`;
                nextEpButton.style.display = 'flex';
                nextEpButton.style.cursor = 'pointer';
                nextEpButton.style.visibility = 'visible';
                nextEpButton.disabled = false;
                nextEpButton.addEventListener('click', () => {
                    const currentUrl = new URL(window.location.href);
                    currentUrl.searchParams.set('s', nextEpS);
                    currentUrl.searchParams.set('e', nextEpE);
                    currentUrl.searchParams.set('server', getSelectedServerButtonId());
                    window.location.href = currentUrl.toString();
                });
            } else {
                nextEpButton.title = `No Next Episode`;
                nextEpButton.style.display = 'flex';
                nextEpButton.style.visibility = 'visible';
                nextEpButton.disabled = true;
            }

            // Episode Selection
            epSelectButton.style.display = 'flex';
            epSelectButton.style.cursor = 'pointer';
            epSelectButton.style.visibility = 'visible';
            epSelectButton.disabled = false;
            // Open popover when clicking the button
            epSelectButton.addEventListener('click', (e) => {
                e.stopPropagation();
                popoverContainer.classList.toggle('active');
            });
            // Close popover when clicking outside
            document.addEventListener('click', (e) => {
                if (!popoverContainer.contains(e.target)) {
                    popoverContainer.classList.remove('active');
                    showSeasons(tmdbData.title);
                }
            });
            // Show seasons list when click Back Button
            popoverBackButton.addEventListener('click', (e) => {
                showSeasons(tmdbData.title);
            });
            loadPopoverSelectEpisode(params, tmdbData); // dont await to not block the page load
            
        }
    } catch (error) {
        console.error('Error loading data:', error);
        title.innerText = 'Title';
    }

    if (params.server) {
        changeServer(parseInt(params.server));
    } else {
        changeServer(1);
    }
};