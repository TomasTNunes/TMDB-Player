// Define the elements
const iframe = document.getElementById('videoFrame');
const title = document.getElementById('title');
const server_buttons = document.querySelectorAll('.server-grid button');
const nextEpButton = document.getElementById('nextep-button');
const epSelectButton = document.querySelector('.epselect-button');
const popoverContainer = document.querySelector('.popover-container');
const popoverContent = document.querySelector('.popover-content');
const seasonsList = document.querySelector('.seasons-list');
const episodesList = document.querySelector('.episodes-list');
const popoverTitle = document.querySelector('.popover-header-title');
const popoverBackButton = document.querySelector('.popover-back-button');
const popoverCloseButton = document.querySelector('.popover-close-button');
const popoverListContainer = document.querySelector('.popover-list-container');
const reviewContainer = document.querySelector('.review-container');
const reviewButton = document.getElementById('review-button');
const reviewList = document.querySelector('.review-list');

// Define headers for TMDB API requests
const headers = {
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYTk1NzRmZDcxMjRkNmI5ZTUyNjA4ZWEzNWQ2NzdiNCIsIm5iZiI6MTczNzU5MDQ2NC4zMjUsInN1YiI6IjY3OTE4NmMwZThiNjdmZjgzM2ZhNjM4OCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kWqK74FSN41PZO7_ENZelydTtX0u2g6dCkAW0vFs4jU`,
        'accept': 'application/json'
    };

// Define Servers
const serverUrlResolvers = {
    //1: (p) => p.type === 'movie' ? `https://vidsrc.cc/v2/embed/movie/${p.id}?autoPlay=false` : `https://vidsrc.cc/v2/embed/tv/${p.id}/${p.season}/${p.episode}?autoPlay=false`, //Rakan (vidsrc.cc)
    1: (p) => p.type === 'movie' ? `https://vixsrc.to/movie/${p.id}?autoPlay=true&lang=en` : `https://vixsrc.to/tv/${p.id}/${p.season}/${p.episode}?autoPlay=true&lang=en`, // Rakan (vixsrc.to)
    2: (p) => p.type === 'movie' ? `https://moviesapi.to/movie/${p.id}` : `https://moviesapi.to/tv/${p.id}-${p.season}-${p.episode}`, // Bard
    3: (p) => p.type === 'movie' ? `https://vidsrc-embed.ru/embed/movie?tmdb=${p.id}&autoplay=1` : `https://vidsrc-embed.ru/embed/tv?tmdb=${p.id}&season=${p.season}&episode=${p.episode}&autoplay=1`, // Xayah
    4: (p) => p.type === 'movie' ? `https://cinesrc.st/embed/movie/${p.id}?autoPlay=true` : `https://cinesrc.st/embed/tv/${p.id}?s=${p.season}&e=${p.episode}&autoPlay=true`, // Ekko
    5: (p) => p.type === 'movie' ? `https://vidfast.vc/movie/${p.id}?autoPlay=true` : `https://vidfast.vc/tv/${p.id}/${p.season}/${p.episode}?autoPlay=true`, // Naafiri
    6: (p) => p.type === 'movie' ? `https://vidlink.pro/movie/${p.id}?title=true&poster=true&autoplay=true` : `https://vidlink.pro/tv/${p.id}/${p.season}/${p.episode}?title=true&poster=true&autoplay=true&nextbutton=true` // Ryze
};
function getServerURL(serverNumber, params) {
    const f = serverUrlResolvers[serverNumber];
    return f ? f(params) : '';
}

// Define Review Sites (in dropdown order)
const reviewSites = {
    movie: ['imdb', 'letterboxd', 'rottentomatoes', 'metacritic', 'trakt', 'tmdb'],
    tv: ['imdb', 'rottentomatoes', 'serializd', 'metacritic', 'trakt', 'tmdb']
};
const reviewSiteInfo = {
    imdb: { name: 'IMDb', icon: './icons/sites/imdb.jpg' },
    letterboxd: { name: 'Letterboxd', icon: './icons/sites/letterboxd.png' },
    rottentomatoes: { name: 'Rotten Tomatoes', icon: './icons/sites/rottentomatoes.png' },
    serializd: { name: 'Serializd', icon: './icons/sites/serializd.png' },
    metacritic: { name: 'Metacritic', icon: './icons/sites/metacritic.png' },
    trakt: { name: 'Trakt', icon: './icons/sites/trakt.png' },
    tmdb: { name: 'TMDB', icon: './icons/sites/themoviedb.png' }
};
// Wikidata properties holding the page path of sites without TMDB/IMDb ID based URLs
const wikidataProperties = {
    rottentomatoes: 'P1258', // e.g. "m/matrix", "tv/breaking_bad"
    metacritic: 'P1712', // e.g. "movie/the-matrix", "tv/breaking-bad"
    trakt: 'P8013' // e.g. "movies/the-matrix-1999", "shows/breaking-bad"
};

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
    const src = getServerURL(serverNumber, params);
    iframe.src = src;

    // Highlight the selected server button
    server_buttons.forEach(button => button.classList.remove('selected'));
    document.getElementById(`server${serverNumber}`).classList.add('selected');
}

async function fetchTMDBData(params) {
    const result = {};

    try {
        let url;

        if (params.type === 'movie') {
            url = `https://api.themoviedb.org/3/movie/${params.id}?language=en-US&append_to_response=external_ids`;
            const response = await fetch(url, { method: 'GET', headers: headers });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            result['title'] = data.original_title;
            result.searchTitle = data.title;
            result.externalIds = data.external_ids || {};
        } else if (params.type === 'tv') {
            url = `https://api.themoviedb.org/3/tv/${params.id}?language=en-US&append_to_response=external_ids`;
            const response = await fetch(url, { method: 'GET', headers: headers });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            result.title = data.name;
            result.searchTitle = data.name;
            result.originalLanguage = data.original_language;
            result.externalIds = data.external_ids || {};
            result.seasonIds = {};
            const seasons = data.seasons;
            result.seasons = [];
            for (const season of seasons) {
                result[season.season_number] = season.episode_count;
                result.seasonIds[season.season_number] = season.id;
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

    for (const season of tmdbData.seasons) {
        url = `https://api.themoviedb.org/3/tv/${params.id}/season/${season}?language=en-US`;
        const response = await fetch(url, { method: 'GET', headers: headers });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const seasonData = await response.json();

        result[season] = {};
        result[season].name = seasonData.name;
        result[season].air_date = seasonData.air_date;
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
    popoverListContainer.scrollTop = 0;
}

// Episode Selection Popover show: episodes list
function showEpisodes(seasonName) {
    seasonsList.style.display = 'none';
    episodesList.style.display = 'block';
    popoverBackButton.style.display = 'block';
    popoverTitle.innerText = seasonName;
    popoverListContainer.scrollTop = 0;
}

// Load Popover container with seasons and episodes 
async function loadPopoverSelectEpisode(params, tmdbData) {
    // Get episode data
    const epSelectionData = await fetchEpSelectionData(params, tmdbData);

    // Populate seasons list
    seasonsList.innerHTML = tmdbData.seasons.map(season => `
        <li data-season="${season}">
            <div class="season-name">${epSelectionData[season].name}</div>
            <div class="season-details">${epSelectionData[season].air_date ? epSelectionData[season].air_date : ""}</div>
        </li>
    `).join('');

    // Handle season click
    seasonsList.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (li) {
            const season = li.getAttribute('data-season');
            const episodes = epSelectionData[season].episodes;
            episodesList.innerHTML = episodes.map(ep => `
                <li data-season="${season}" data-episode="${ep.episode_number}">
                    <div class="episode-name">E${ep.episode_number} - ${ep.name}</div>
                    <div class="episode-details">${ep.air_date ? ep.air_date : ""}&nbsp;&nbsp;&nbsp;${ep.runtime ? `(${ep.runtime}m)` : ""}</div>
                </li>
            `).join('');
            showEpisodes(epSelectionData[season].name);
        }
    });

    // Handle episode click
    episodesList.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (li) {
            const season = li.getAttribute('data-season');
            const episode = li.getAttribute('data-episode');
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('s', season);
            currentUrl.searchParams.set('e', episode);
            currentUrl.searchParams.set('server', getSelectedServerButtonId());
            window.location.href = currentUrl.toString();
        }
    });
    showSeasons(tmdbData.title);
}

// Fetch TV episode name and IMDb ID from TMDB API
async function fetchEpisodeData(params) {
    const url = `https://api.themoviedb.org/3/tv/${params.id}/season/${params.season}/episode/${params.episode}?language=en-US&append_to_response=external_ids`;
    const response = await fetch(url, { method: 'GET', headers: headers });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return { name: data.name, imdbId: data.external_ids && data.external_ids.imdb_id };
}

// Metacritic episode slug, e.g. "...And the Bag's in the River" -> "and-the-bags-in-the-river"
function metacriticSlug(name) {
    return name
        .normalize('NFD').replace(/[̀-ͯ]/g, '') // Remove accents
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove punctuation
        .replace(/[\s-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

async function fetchWikidata(apiParams) {
    const url = `https://www.wikidata.org/w/api.php?${new URLSearchParams({ ...apiParams, format: 'json', origin: '*' })}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

// Get Wikidata item ID from TMDB, or find it by IMDb ID
async function getWikidataId(externalIds) {
    if (externalIds.wikidata_id) return externalIds.wikidata_id;
    if (!externalIds.imdb_id) return null;
    const data = await fetchWikidata({ action: 'query', list: 'search', srsearch: `haswbstatement:P345=${externalIds.imdb_id}`, srlimit: 1 });
    const item = data.query && data.query.search[0];
    return item ? item.title : null;
}

// Get the best ranked value of a Wikidata item property (ignoring deprecated values)
async function fetchWikidataClaim(entityId, property) {
    const data = await fetchWikidata({ action: 'wbgetclaims', entity: entityId, property: property });
    const claims = ((data.claims && data.claims[property]) || []).filter(c => c.rank !== 'deprecated' && c.mainsnak.datavalue);
    const claim = claims.find(c => c.rank === 'preferred') || claims[0];
    return claim ? claim.mainsnak.datavalue.value.replace(/^\/+|\/+$/g, '') : null;
}

// Fetch the IDs needed for exact review pages. Failed lookups are left out so their links fall back to search.
async function fetchReviewIds(params, tmdbData) {
    const ids = { wikidata: {} };

    const episodeTask = params.type === 'tv'
        ? fetchEpisodeData(params).then(episode => {
            ids.episodeName = episode.name;
            ids.episodeImdbId = episode.imdbId;
        })
        : Promise.resolve();

    const wikidataTask = getWikidataId(tmdbData.externalIds).then(entityId => {
        if (!entityId) return;
        return Promise.all(Object.entries(wikidataProperties).map(([site, property]) =>
            fetchWikidataClaim(entityId, property)
                .then(value => { ids.wikidata[site] = value; })
                .catch(error => console.error(`Error fetching Wikidata ${property}:`, error))
        ));
    });

    const results = await Promise.allSettled([episodeTask, wikidataTask]);
    results.filter(r => r.status === 'rejected').forEach(r => console.error('Error fetching review IDs:', r.reason));
    return ids;
}

// Build review site links: { url, level }. Level tells which page the link opens (shown in the dropdown).
function getReviewLinks(params, tmdbData, ids) {
    const query = encodeURIComponent(tmdbData.searchTitle || tmdbData.title);
    const wikidata = ids.wikidata || {};
    const page = (value, prefix) => value && value.startsWith(prefix) ? value : null; // Ignore paths of the wrong type
    const search = (url) => ({ url: url, level: 'Search' });
    const imdbSearch = search(`https://www.imdb.com/find/?q=${query}`);
    const rottenTomatoesSearch = search(`https://www.rottentomatoes.com/search?search=${query}`);
    const metacriticSearch = search(`https://www.metacritic.com/search/${query}/`);
    const traktSearch = search(`https://app.trakt.tv/search?query=${query}`);

    if (params.type === 'movie') {
        const imdbId = tmdbData.externalIds.imdb_id;
        const rottenTomatoesPage = page(wikidata.rottentomatoes, 'm/');
        const metacriticPage = page(wikidata.metacritic, 'movie/');
        const traktPage = page(wikidata.trakt, 'movies/');
        return {
            imdb: imdbId ? { url: `https://www.imdb.com/title/${imdbId}/` } : imdbSearch,
            letterboxd: { url: `https://letterboxd.com/tmdb/${params.id}/` },
            rottentomatoes: rottenTomatoesPage ? { url: `https://www.rottentomatoes.com/${rottenTomatoesPage}` } : rottenTomatoesSearch,
            metacritic: metacriticPage ? { url: `https://www.metacritic.com/${metacriticPage}/` } : metacriticSearch,
            trakt: traktPage ? { url: `https://app.trakt.tv/${traktPage}` } : traktSearch,
            tmdb: { url: `https://www.themoviedb.org/movie/${params.id}` }
        };
    }

    const season = parseInt(params.season);
    const episode = parseInt(params.episode);
    const pad = (n) => String(n).padStart(2, '0');
    const showImdbId = tmdbData.externalIds.imdb_id;
    const seasonId = tmdbData.seasonIds[season];
    const rottenTomatoesPage = page(wikidata.rottentomatoes, 'tv/');
    const metacriticPage = page(wikidata.metacritic, 'tv/');
    const traktPage = page(wikidata.trakt, 'shows/');

    const links = {};
    if (ids.episodeImdbId) {
        links.imdb = { url: `https://www.imdb.com/title/${ids.episodeImdbId}/`, level: 'Episode' };
    } else {
        links.imdb = showImdbId ? { url: `https://www.imdb.com/title/${showImdbId}/`, level: 'Show' } : imdbSearch;
    }
    if (!rottenTomatoesPage) {
        links.rottentomatoes = rottenTomatoesSearch;
    } else if (season > 0) {
        links.rottentomatoes = { url: `https://www.rottentomatoes.com/${rottenTomatoesPage}/s${pad(season)}/e${pad(episode)}`, level: 'Episode' };
    } else {
        links.rottentomatoes = { url: `https://www.rottentomatoes.com/${rottenTomatoesPage}`, level: 'Show' };
    }
    links.serializd = seasonId
        ? { url: `https://www.serializd.com/show/${params.id}/season/${seasonId}/${season}/episode/${episode}`, level: 'Episode' }
        : { url: `https://www.serializd.com/show/${params.id}`, level: 'Show' };
    // Metacritic episode URLs include the episode name, which only matches TMDB's English name for English shows
    const metacriticEpisodeSlug = ids.episodeName && tmdbData.originalLanguage === 'en' ? metacriticSlug(ids.episodeName) : '';
    if (!metacriticPage) {
        links.metacritic = metacriticSearch;
    } else if (season > 0 && metacriticEpisodeSlug) {
        links.metacritic = { url: `https://www.metacritic.com/${metacriticPage}/season-${season}/episode-${episode}-${metacriticEpisodeSlug}/`, level: 'Episode' };
    } else if (season > 0) {
        links.metacritic = { url: `https://www.metacritic.com/${metacriticPage}/season-${season}/`, level: 'Season' };
    } else {
        links.metacritic = { url: `https://www.metacritic.com/${metacriticPage}/`, level: 'Show' };
    }
    links.trakt = traktPage
        ? { url: `https://app.trakt.tv/${traktPage}/seasons/${season}/episodes/${episode}`, level: 'Episode' }
        : traktSearch;
    links.tmdb = { url: `https://www.themoviedb.org/tv/${params.id}/season/${season}/episode/${episode}`, level: 'Episode' };
    return links;
}

function updateReviewMenu(links) {
    for (const a of reviewList.querySelectorAll('a[data-site]')) {
        const link = links[a.dataset.site];
        a.href = link.url;
        a.querySelector('.review-site-level').textContent = link.level || '';
    }
}

function closeReviewMenu() {
    reviewContainer.classList.remove('active');
    reviewButton.setAttribute('aria-expanded', 'false');
}

// Load Review dropdown: show search fallbacks right away, then switch to exact pages once IDs are fetched
async function loadReviewMenu(params, tmdbData) {
    reviewList.innerHTML = reviewSites[params.type].map(site => `
        <li>
            <a data-site="${site}" target="_blank" rel="noopener noreferrer">
                <img class="review-site-icon" src="${reviewSiteInfo[site].icon}" alt="">
                <span class="review-site-name">${reviewSiteInfo[site].name}</span>
                <span class="review-site-level"></span>
            </a>
        </li>
    `).join('');
    updateReviewMenu(getReviewLinks(params, tmdbData, {}));

    reviewButton.style.cursor = 'pointer';
    reviewButton.style.visibility = 'visible';
    reviewButton.addEventListener('click', (e) => {
        e.stopPropagation();
        popoverContainer.classList.remove('active'); // Close Episode Selection popover
        const isOpen = reviewContainer.classList.toggle('active');
        reviewButton.setAttribute('aria-expanded', isOpen);
    });
    // Close dropdown when clicking outside (capture phase, since other buttons stop propagation)
    document.addEventListener('click', (e) => {
        if (!reviewContainer.contains(e.target)) {
            closeReviewMenu();
        }
    }, true);
    // Close dropdown when clicking a site, pressing Escape or clicking into the player iframe
    reviewList.addEventListener('click', (e) => {
        if (e.target.closest('a')) {
            closeReviewMenu();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeReviewMenu();
        }
    });
    window.addEventListener('blur', closeReviewMenu);

    const ids = await fetchReviewIds(params, tmdbData);
    updateReviewMenu(getReviewLinks(params, tmdbData, ids));
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

        loadReviewMenu(params, tmdbData); // dont await to not block the page load

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
            popoverContainer.style.display = 'inline-block';
            epSelectButton.style.display = 'flex';
            epSelectButton.style.cursor = 'pointer';
            epSelectButton.style.visibility = 'visible';
            epSelectButton.disabled = false;
            // Open popover in current season when clicking the button
            epSelectButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const currentSeasonLi = seasonsList.querySelector(`li[data-season="${params.season}"]`);
                if (currentSeasonLi) {
                    currentSeasonLi.click();
                }
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