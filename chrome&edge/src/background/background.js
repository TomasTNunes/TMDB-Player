// Store the API token in chrome storage (called once, e.g., during installation)
function setApiToken() {
    const apiToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYTk1NzRmZDcxMjRkNmI5ZTUyNjA4ZWEzNWQ2NzdiNCIsIm5iZiI6MTczNzU5MDQ2NC4zMjUsInN1YiI6IjY3OTE4NmMwZThiNjdmZjgzM2ZhNjM4OCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kWqK74FSN41PZO7_ENZelydTtX0u2g6dCkAW0vFs4jU'; // Replace with your actual API key
    chrome.storage.local.set({ TMDB_TOKEN: apiToken }, function() {
        console.log('API Token has been saved.');
    });
}

// Call the function to save the API token (can be triggered on installation or another event)
setApiToken();