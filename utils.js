// Utility function to extract TMDB ID from the URL
function getTmdbIdFromUrl(type) {
    const regex = new RegExp(`/${type}/(\\d+)(?:-|$)`);
    const match = window.location.pathname.match(regex);
    return match ? match[1] : null;
}