const leftmost = document.querySelector('.left-most-tile')
const modalOverlay = document.querySelector('.modal-overlay')
const focusUsername = document.querySelector('.focus-username')
const focusUserImg = document.querySelector('.focus-user-img')
const chatMessageInput = document.getElementById("chat-message-input")
const chatForm = document.getElementById('chat-form')
const conversationContainer = document.querySelector('.conversation-container')
const chatTilesContainer = document.querySelector('.chat-tiles-container')


const profileImg = document.getElementById('profileimginput').value//the profile image of the currently logged in user
const userId = document.getElementById('inputuserid').value
let focusUser = null

class ChatMessage{
    constructor(message, timestamp, type){
        this.message = message
        this.timestamp= timestamp
        this.type=type
    }
}

class Thread{
    constructor(username, profileImg, lastMessage, userId){
        this.username = username
        this.profileImg = profileImg
        this.lastMessage = lastMessage
        this.userId = userId
    }
}

const chatParam = getParam('chat')
setFocusUser(chatParam)
getUserThreads()

const socket = connectWebsocket()

chatTilesContainer.addEventListener('click', function(e){
    const clickedTile = e.target.closest('.chat-item')

    const userId = clickedTile.getAttribute('data-userid')
    setFocusUser(userId)
})


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

        console.log('ws opened')
    })

    socket.addEventListener('error', function(e){
        console.error('ws error', e)
    })

    socket.addEventListener('close', function(){
        console.log('ws closed')
    })

    return socket
}

function getUserThreads(){
    const csrftoken = Cookies.get('csrftoken')
    fetch('/chat/getuserthreads/', {
        method: 'POST',
        headers : {'X-CSRFToken': csrftoken}
    })
    .then(response => response.json())
    .then(data => {
        if (data.status == 200) populateUserThreads(data.data.user_threads)
    })
}

function populateUserThreads(threads){
    chatTilesContainer.innerHTML = ''
    threads.forEach(function(thread){
        const loaduser = thread.user_one.id == userId ? thread.user_two : thread.user_one
        const profileimg = loaduser.profile.profileImg
        const username = loaduser.username
        const lastmessage = thread.last_message.message

        const userThread = new Thread(username, profileimg, lastmessage, loaduser.id)
        appendUserThread(userThread)
    })
}

function appendUserThread(thread){
    const htmel = `
        <div class="chat-item" id="thread-el-${thread.userId}" data-userid="${thread.userId}">
        <div class="con">
          <div class="image-container">
            <img
              src="${thread.profileImg}"
              alt=""
              style="background-color: #acacad"
            />
          </div>

          <div class="username-msg">
            <h5>${thread.username}</h5>
            <p class="l-message">${thread.lastMessage}</p>
          </div>
        </div>

        <div class="time-num">
          <p class="time">1 min</p>
          <div class="num-container">
            <p class="num">3</p>
          </div>
        </div>
      </div>
        `
        chatTilesContainer.insertAdjacentHTML('beforeend', htmel)
}


function setFocusUser(userid){
    const csrftoken = Cookies.get('csrftoken')
    fetch(`/chat/getchatmessages/${userid}/`, {
        method: 'POST',
        headers: {'X-CSRFToken': csrftoken}
    })
    .then(response => response.json())
    .then(data => {
        const chatUserProfile = data.data.chat_user
        focusUsername.textContent = chatUserProfile.user.username
        focusUserImg.src = chatUserProfile.profileImg
        focusUser = chatUserProfile
        populateChatMessages(data.data.chat_messages)

    })
}

//clears the chate messages container and repopulates it 
function populateChatMessages(chatmessages){
    conversationContainer.innerHTML = ''
    chatmessages.forEach(function(msg){
        const type = msg.sender.id == focusUser.user.id? 'receiver' : 'sender'
        appendChatMessage(new ChatMessage(msg.message,msg.created, type))
    })
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
    scrollToContainerEnd(conversationContainer)
}

function scrollToContainerEnd(container){
    container.scrollTop = container.scrollHeight
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



