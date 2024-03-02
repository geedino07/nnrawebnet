const leftmost = document.querySelector('.left-most-tile')
const modalOverlay = document.querySelector('.modal-overlay')
const focusUsername = document.querySelector('.focus-username')
const focusUserImg = document.querySelector('.focus-user-img')
const chatMessageInput = document.getElementById("chat-message-input")
const chatForm = document.getElementById('chat-form')
const conversationContainer = document.querySelector('.conversation-container')

const profileImg = document.getElementById('profileimginput').value//the profile image of the currently logged in user
let focusUser = null

const now = new Date()
console.log(now)

class ChatMessage{
    constructor(message, timestamp, type){
        this.message = message
        this.timestamp= timestamp
        this.type=type
    }
}

const chatParam = getParam('chat')
setFocusUser(chatParam)

const socket = connectWebsocket()

// const chatParam = getAndRemoveQueryParam('chat')//checking if there is a chat parameter in the url

function connectWebsocket(){
    loc = window.location
    wsprotocol = loc === "https" ? "wss://" : "ws://";//setting the websocket protocol for the connection
    const endpoint = wsprotocol + loc.host + loc.pathname
    const socket  = new WebSocket(endpoint)

    socket.addEventListener('message', function(e){
        const received = JSON.parse(e.data)
        if (received.sender == focusUser.user.id){
            const chatmessage = new ChatMessage(received.message, received.timestamp, 'received')
            appendChatMessage(chatmessage)        
        }

    })

    socket.addEventListener('open', function(){
        chatForm.onsubmit = function(e){
            e.preventDefault()
            const messagebody = chatMessageInput.value

            const messageStr = JSON.stringify({
                'action': 'chat_message',
                'receiver': focusUser.user.id,
                'message_body': messagebody
            })
            socket.send(messageStr)
            const chatmessage = new ChatMessage(messagebody, new Date(), 'sender')
            appendChatMessage(chatmessage)
            chatMessageInput.value = ''
        }

        console.log('websocket opened')
    })

    socket.addEventListener('error', function(e){
        console.error('websocket error', e)
    })

    socket.addEventListener('close', function(){
        console.log('websocket closed')
    })

    return socket
}



function setFocusUser(userid){
    const csrftoken = Cookies.get('csrftoken')
    fetch(`/chat/getchatmessages/${userid}/`, {
        method: 'POST',
        headers: {'X-CSRFToken': csrftoken}
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        const chatUserProfile = data.data.chat_user
        focusUsername.textContent = chatUserProfile.user.username
        focusUserImg.src = chatUserProfile.profileImg
        populateChatMessages(data.data.chat_messages)
        focusUser = chatUserProfile
    })
}

//clears the chate messages container and repopulates it 
function populateChatMessages(chatMessages){
    
}


//apends a new chat message to the messages container
function appendChatMessage(chatmessage){
    const convClass = chatmessage.type === 'sender'? 'conv-right': 'conv-left'
    const imgSrc = chatmessage.type === 'sender'? profileImg: focusUser.profileImg
    const timestamp = new Date(chatmessage.timestamp)

    const htmlel = `
    <div class="conversation ${convClass}">
    <img
      src="${imgSrc}"
      alt=""
      style="background-color: #acacad"
      class="u-profile-photo"
    />
    <div class="conv-holder">
      <p class="message">
        ${chatmessage.message}
      </p>

      <p class="date-time">${getFormattedTime(timestamp)}</p>
    </div>
  </div>
    `
    conversationContainer.insertAdjacentHTML('beforeend', htmlel)
}

function getFormattedTime(date){
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
}

//==========
function toggleLeftMostTile(){
    modalOverlay.classList.toggle('visible')
    leftmost.classList.toggle('visible')
}

function getParam(paramName){
    const urlParams = new URLSearchParams(window.location.search)
    if(urlParams.has(paramName)){
        const paramValue = urlParams.get(paramName)
        return paramValue
    }

    return null
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



