document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('goToTmdb').addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://www.themoviedb.org/' });
    });
});
