document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('tmdb-button').addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://www.themoviedb.org/' });
    });
});

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('git-button').addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://github.com/TomasTNunes/TMDB-Player/tree/master?tab=readme-ov-file#tmdb-player' });
    });
});

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('bug-button').addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://github.com/TomasTNunes/TMDB-Player/issues' });
    });
});