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
            case 1: src = `https://moviesapi.club/movie/${params.id}`; break;
            case 2: src = `https://vidsrc.me/embed/movie?tmdb=${params.id}`; break;
            case 3: src = `https://vidsrc.cc/v2/embed/movie/${params.id}?autoPlay=false`; break;
            case 4: src = `https://vidlink.pro/movie/${params.id}`; break;
        }
    } else if (params.type === 'tv') {
        switch (serverNumber) {
            case 1: src = `https://moviesapi.club/tv/${params.id}-${params.season}-${params.episode}`; break;
            case 2: src = `https://vidsrc.me/embed/tv?tmdb=${params.id}&season=${params.season}&episode=${params.episode}`; break;
            case 3: src = `https://vidsrc.cc/v2/embed/tv/${params.id}/${params.season}/${params.episode}?autoPlay=false`; break;
            case 4: src = `https://vidlink.pro/tv/${params.id}/${params.season}/${params.episode}`; break;
        }
    }
    document.getElementById('videoFrame').src = src;

    // Highlight the selected server button
    const buttons = document.querySelectorAll('.buttons button');
    buttons.forEach(button => button.classList.remove('selected'));
    document.getElementById(`server${serverNumber}`).classList.add('selected');
}

// Redirect or load default server on page load
window.onload = () => {
    const params = getURLParams();
    if (!params) {
        redirectTowebsite();
    } else {
        changeServer(1);
    }
};
