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
    constructor(message, timestamp, type, statusid=null, status='sent'){
        this.message = message
        this.timestamp= timestamp
        this.type=type
        this.statusid= statusid
        this.status = status
    }
}

class Thread{
    constructor(username, profileImg, lastMessage, userId, date){
        this.username = username
        this.profileImg = profileImg
        this.lastMessage = lastMessage
        this.userId = userId
        this.date = date
    }
}

// const chatParam = getParam('chat')
const chatParam = getAndRemoveQueryParam('chat')//checking if there is a chat parameter in the url
if (chatParam){
    setFocusUser(chatParam)
}
else{
    toggleContainerState('center-right', 'idle-con')
}


getUserThreads()

const socket = connectWebsocket()


chatTilesContainer.addEventListener('click', function(e){
    const clickedTile = e.target.closest('.chat-item')

    const userId = clickedTile.getAttribute('data-userid')
    setFocusUser(userId)
})


/**Establishes a websocket connection to the chat message consumer and returns the websocket instance */
function connectWebsocket(){
    loc = window.location
    wsprotocol = loc === "https" ? "wss://" : "ws://";//setting the websocket protocol for the connection
    const endpoint = wsprotocol + loc.host + loc.pathname
    const socket  = new WebSocket(endpoint)

    socket.addEventListener('message', function(e){
        const received = JSON.parse(e.data)
        if(received.action == 're_message'){
            if (received.sender == focusUser.user.id){
                const chatmessage = new ChatMessage(received.message, received.timestamp, 'received')
                appendChatMessage(chatmessage)        
            }
        }

        if(received.action == 'msg_confirmation'){
            const msgStatus = document.querySelector(`.status-${received.statusid}`)
            msgStatus.textContent = '~ sent'
        }
        

    })

    socket.addEventListener('open', function(){
        chatForm.onsubmit = function(e){
            e.preventDefault()
            const messagebody = chatMessageInput.value
            const uid = generateRandomString()
            const messageStr = JSON.stringify({
                'action': 'chat_message',
                'receiver': focusUser.user.id,
                'message_body': messagebody,
                'statusid': uid
            })
            socket.send(messageStr)
            const chatmessage = new ChatMessage(messagebody, new Date(), 'sender', uid, 'pending')
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

function generateRandomString(){
    return Math.random().toString(36).slice(2)
}

/**Makes a fetch request to get all the threads associated with a user
 * if request is successfull, the ui is populated using the fetched threads
 */
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


/** Populates the ui with threads */
function populateUserThreads(threads){
    chatTilesContainer.innerHTML = ''
    threads.forEach(function(thread){
        const loaduser = thread.user_one.id == userId ? thread.user_two : thread.user_one

        const profileimg = loaduser.profile.profileImg
        const username = loaduser.username
        const lastmessage = thread.last_message.message

        const userThread = new Thread(username, profileimg, lastmessage, loaduser.id, thread.last_message.created)
        appendUserThread(userThread)
    })
}

/** appends a new thread to the ui  
 * @param thread the thread object to be appended
*/
function appendUserThread(thread){
    console.log(thread.date)
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

/** Changes the fouced user, i.e the user we are currently chatting with 
 * also fetches all the messages between the logged in user and the focused user
 * @param userid: the id of the user to be put in focus
 */
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
        toggleContainerState('center-right', 'focused')
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
    const msgStatus = chatmessage.type === 'sender'? `<span class="msg-status status-${chatmessage.statusid}">~ ${chatmessage.status}</span>` : ''
    // const imgSrc = chatmessage.type === 'sender'? profileImg: focusUser.profileImg
    const timestamp = new Date(chatmessage.timestamp)

    const htmlel = `
    <div class="conversation ${convClass}">
    <div class="conv-holder">
      <p class="message">
        ${chatmessage.message}
      </p>

      <p class="date-time">${getFormattedTime(timestamp)} ${msgStatus}</p>
    </div>
  </div>
    `
    conversationContainer.insertAdjacentHTML('beforeend', htmlel)
    scrollToContainerEnd(conversationContainer)
}

/** Forces a scrollable container to scroll to end
 * @param container the container to be scrolled
 */
function scrollToContainerEnd(container){
    container.scrollTop = container.scrollHeight
}

function getFormattedDate(date){

}

/** Returns a formatted time in form of (11:00pm)
 * @param date: A date object 
 */
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


