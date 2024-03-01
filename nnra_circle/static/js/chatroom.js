const leftmost = document.querySelector('.left-most-tile')
const modalOverlay = document.querySelector('.modal-overlay')
const focusUser = null
connectWebsocket()

// const chatParam = getAndRemoveQueryParam('chat')//checking if there is a chat parameter in the url

function connectWebsocket(){
    loc = window.location
    wsprotocol = loc === "https" ? "wss://" : "ws://";//setting the websocket protocol for the connection
    const endpoint = wsprotocol + loc.host + loc.pathname
    // const endpoint = 'ws://localhost:8000/chat/room/?userid=89'

    console.log(endpoint)

    const socket  = new WebSocket(endpoint)

    socket.addEventListener('message', function(e){
        console.log('websocket message')
    })

    socket.addEventListener('open', function(){
        console.log('websocket opened')
    })

    socket.addEventListener('error', function(e){
        console.error('websocket error', e)
    })

    socket.addEventListener('close', function(){
        console.log('websocket closed')
    })
}


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



