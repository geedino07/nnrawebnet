const leftmost = document.querySelector('.left-most-tile')
const modalOverlay = document.querySelector('.modal-overlay')
const focusUser = null

const chatParam = getAndRemoveQueryParam('chat')//checking if there is a chat parameter in the url


console.log(chatParam)



function toggleLeftMostTile(){
    modalOverlay.classList.toggle('visible')
    leftmost.classList.toggle('visible')
}

function getAndRemoveQueryParam(paramName) {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check if the parameter exists
    if (urlParams.has(paramName)) {
        // Get the parameter value
        const paramValue = urlParams.get(paramName);
        
        // Remove the parameter from the URL
        urlParams.delete(paramName);

        // Update the URL without refreshing the page
        const newUrl = window.location.pathname + '?' + urlParams.toString();
        window.history.replaceState({}, document.title, newUrl);

        // Return the parameter value
        return paramValue;
    }

    // Return null if the parameter doesn't exist
    return null;
}


