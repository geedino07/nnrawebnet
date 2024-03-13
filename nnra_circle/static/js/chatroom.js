const leftmost = document.querySelector(".left-most-tile");
const modalOverlay = document.querySelector(".modal-overlay");
const focusUsername = document.querySelector(".focus-username");
const focusPresence = document.querySelector('.focus-presence')
const focusUserImg = document.querySelector(".focus-user-img");
const chatMessageInput = document.getElementById("chat-message-input");
const chatForm = document.getElementById("chat-form");
const conversationContainer = document.querySelector(".conversation-container");
const chatTilesContainer = document.querySelector(".chat-tiles-container");
const miniUserInfo = document.querySelector(".logged-in-user-info");

const profileImg = document.getElementById("profileimginput").value; //the profile image of the currently logged in user
const userId = document.getElementById("inputuserid").value;
const unseenThreadList = []; //a list of threads where at least one message is not seen
let focusUser = null;
let lastMsgDate = null;
let displayingUserId = null; //the id of the user currently displayed in the right profile tile if any

class ChatMessage {
  constructor({
    message,
    timestamp,
    type,
    statusid = null,
    status = "sent",
    id = null,
    senderId = null,
    receiverId = null,
  }) {
    this.message = message;
    this.timestamp = timestamp;
    this.type = type;
    this.statusid = statusid;
    this.status = status;
    this.id = id;
    this.senderId = senderId;
    this.receiverId = receiverId;
  }

  getThreadSuffix(uid) {
    return this.receiverId == uid ? this.senderId : this.receiverId;
  }

  /**returns a version of the chat message that is fit to render in ui
   * This treats new lines in the chat message as html line breaks
   */
  get newLineChatMessage() {
    return this.message.replace(/\n/g, "<br>");
  }
}

class Thread {
  constructor({
    username,
    profileImg,
    lastMessage,
    userId,
    date,
    unreadCount = 0,
    lastSender = -1,
  }) {
    this.username = username;
    this.profileImg = profileImg;
    this.lastMessage = lastMessage;
    this.userId = userId;
    this.date = date;
    this.unreadCount = unreadCount;
    this.lastSender = lastSender;
  }
}

// const chatParam = getParam('chat')
const chatParam = getAndRemoveQueryParam("chat"); //checking if there is a chat parameter in the url
if (chatParam) {
  setFocusUser(chatParam);
} else {
  toggleContainerState("center-right", "idle-con");
}

getUserThreads();

const socket = connectWebsocket();

chatTilesContainer.addEventListener("click", function (e) {
  const clickedTile = e.target.closest(".chat-item");

  const userId = clickedTile.getAttribute("data-userid");
  setFocusUser(userId);
});

miniUserInfo.addEventListener("click", function () {
  if (focusUser?.id) {
    getUser(focusUser.id);
  }
});

//========= FUNCTIONS =========================

/**Establishes a websocket connection to the chat message consumer and returns the websocket instance */
function connectWebsocket() {
  loc = window.location;
  wsprotocol = loc.protocol === "https:" ? "wss://" : "ws://"; //setting the websocket protocol for the connection
  const endpoint = wsprotocol + loc.host + loc.pathname;
  const socket = new WebSocket(endpoint);

  socket.addEventListener("message", function (e) {
    const received = JSON.parse(e.data);

    if (received.action == "re_message") {
      //when this user receives a message
      const chatmessage = new ChatMessage({
        message: received.message,
        timestamp: new Date(received.timestamp),
        type: "receiver",
        id: received.id,
        senderId: received.sender,
        receiverId: userId,
      });
      if (focusUser && received.sender == focusUser.user.id) {
        appendChatMessage(chatmessage);
      }

      reorderThread(chatmessage);
      UnseenChanged(chatmessage.senderId, "+");
    }

    if (received.action == "msg_confirmation") {
      const msgStatus = document.querySelector(`.status-${received.statusid}`);
      msgStatus.textContent = "~ sent";
      msgStatus.classList.replace(
        `status-${received.statusid}`,
        `status-${received.id}`
      );
    }

    if (received.action == "msg_seen") {
      const msgStatus = document.querySelector(`.status-${received.msg_id}`);
      msgStatus.textContent = "~ seen";
    }

    if (received.action == "presence") {
      if (focusUser?.user.id == received.user_id) {
        updateFocusUserPresence(received.status)
      }

      if(displayingUserId && displayingUserId == received.user_id){
        const displayingStatus= document.querySelector(".displaying-status")
        displayingStatus.classList.remove('online')
        displayingStatus.classList.remove('offline')
        displayingStatus.classList.add(received.status)
        document.querySelector('.txt-displaying-status').textContent = received.status
      }
    }
  });

  socket.addEventListener("open", function () {
    chatForm.onsubmit = function (e) {
      e.preventDefault();
      const messagebody = chatMessageInput.value;
      if (messagebody !== ''){
        const uid = generateRandomString();
        const messageStr = JSON.stringify({
          action: "chat_message",
          receiver: focusUser.user.id,
          message_body: messagebody,
          statusid: uid,
        });
        socket.send(messageStr); //send a message
        const chatmessage = new ChatMessage({
          message: messagebody,
          timestamp: new Date(),
          type: "sender",
          statusid: uid,
          status: "pending",
          senderId: Number(userId),
          receiverId: focusUser?.user.id,
        });
        appendChatMessage(chatmessage);
        reorderThread(chatmessage);
        chatMessageInput.value = "";
      }
      else{
        showToast({
          message: 'Message cannot be null', 
          style: 'error',
          duration: 2000
        })
      }
    
    };

    console.log("ws opened");
  });

  socket.addEventListener("error", function (e) {
    console.error("ws error", e);
  });

  socket.addEventListener("close", function () {
    console.log("ws closed");
  });

  return socket;
}

function updateFocusUserPresence(presence){
    focusPresence.textContent = presence
}

function newLineChatMessage(messageStr) {
  return messageStr.replace(/\n/g, "<br>");
}

function escapeNewLine(messageStr) {
  return messageStr.replace(/<br>/g, " ");
}

//takes the thread of the chatmessage passed in to the top of the thread container
function reorderThread(chatmessage) {
  const id =
    chatmessage.senderId == userId ? focusUser?.user?.id : chatmessage.senderId;
  if (id) {
    const threadEl = document.getElementById(`thread-el-${id}`);

    if (threadEl) {
      const txtLastMessage = threadEl.querySelector(".l-message");
      const time = threadEl.querySelector(".time");
      threadEl.style.order = -1;
      txtLastMessage.textContent = chatmessage.message;

      time.textContent = `${getFormattedDate(chatmessage.timestamp)}`;
    }
    else{        
        fetch(`/chat/getthread/${chatmessage.senderId}/${chatmessage.receiverId}`,{
            'method': 'GET',
        })
        .then(response => response.json())
        .then(data => {
            if(data.status === 200){
                userThread = cleanseCreateThread(data.data.thread)
                appendUserThread(userThread);
                const threadElement = document.getElementById(`thread-el-${id}`);
                if (threadElement){
                    const txtLastMessage = threadElement.querySelector(".l-message");
                    const time = threadElement.querySelector(".time");
                    threadElement.style.order = -1;
                    txtLastMessage.textContent = chatmessage.message;
                    time.textContent = `${getFormattedDate(chatmessage.timestamp)}`;
                }

            }
        })
        .catch(error => {
            console.error('error', error)
        })
    }
  }
}

function generateRandomString() {
  return Math.random().toString(36).slice(2);
}

/**Makes a fetch request to get all the threads associated with a user
 * if request is successfull, the ui is populated using the fetched threads
 */
function getUserThreads() {
  const csrftoken = Cookies.get("csrftoken");
  fetch("/chat/getuserthreads/", {
    method: "POST",
    headers: { "X-CSRFToken": csrftoken },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status == 200) populateUserThreads(data.data.user_threads);
    });
}

/** Populates the ui with threads */
function populateUserThreads(threads) {
  chatTilesContainer.innerHTML = "";
  threads.sort((a, b) => {
    //sorting the threads in descending order by the created attribute of the last messages
    if (a.last_message.created > b.last_message.created) return -1;
    if (b.last_message.created > a.last_message.created) return 1;
  });
  threads.forEach(function (thread) {
    userThread = cleanseCreateThread(thread)
    appendUserThread(userThread);
  });
}

function cleanseCreateThread(thread){
    const loaduser =
    thread.user_one.id == userId ? thread.user_two : thread.user_one;

    const profileimg = loaduser.profile.profileImg;
    const username = loaduser.username;
    const lastmessage = thread.last_message.message;

    const userThread = new Thread({
        username: username,
        profileImg: profileimg,
        lastMessage: lastmessage,
        userId: loaduser.id,
        date: thread.last_message.created,
        unreadCount: thread.unread_count,
        lastSender: thread.last_message.sender.id,
    });
    return userThread
}

/** appends a new thread to the ui
 * @param thread the thread object to be appended
 */
function appendUserThread(thread) {
  const htmel = `
        <div class="chat-item" id="thread-el-${thread.userId}" data-userid="${
    thread.userId
  }">
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
          <p class="time">${getFormattedDate(new Date(thread.date))}</p>
          <div class="num-container ${
            thread.lastSender == userId || thread.unreadCount < 1
              ? ""
              : "visible"
          }">
                <p class="num">${thread.unreadCount}</p>
            </div>
        </div>
      </div>
        `;
  chatTilesContainer.insertAdjacentHTML("beforeend", htmel);
}

/** Changes the fouced user, i.e the user we are currently chatting with
 * also fetches all the messages between the logged in user and the focused user
 * @param userid: the id of the user to be put in focus
 */
function setFocusUser(userid) {
  const csrftoken = Cookies.get("csrftoken");
  fetch(`/chat/getchatmessages/${userid}/`, {
    method: "POST",
    headers: { "X-CSRFToken": csrftoken },
  })
    .then((response) => response.json())
    .then((data) => {
      const chatUserProfile = data.data.chat_user;
      updateFocusUserPresence(chatUserProfile.is_online? 'online': 'offline')
      focusUsername.textContent = chatUserProfile.user.username;
      focusUserImg.src = chatUserProfile.profileImg;
      focusUser = chatUserProfile;
      toggleContainerState("center-right", "focused");
      populateChatMessages(data.data.chat_messages);
    });
}

//clears the chate messages container and repopulates it
function populateChatMessages(chatmessages) {
  conversationContainer.innerHTML = "";
  lastMsgDate = null;
  chatmessages.forEach(function (msg) {
    const type = msg.sender.id == focusUser.user.id ? "receiver" : "sender";
    const status = msg.seen ? "seen" : "sent";
    appendChatMessage(
      new ChatMessage({
        message: msg.message,
        timestamp: msg.created,
        type: type,
        statusid: `status-${msg.id}`,
        status: status,
        id: msg.id,
        senderId: msg.sender.id,
        receiverId: msg.receiver.id,
      })
    );
  });
}

//apends a new chat message to the conversations container container
function appendChatMessage(chatmessage) {
  const convClass = chatmessage.type === "sender" ? "conv-right" : "conv-left";
  const msgStatus =
    chatmessage.type === "sender"
      ? `<span class="msg-status status-${chatmessage.statusid}">~ ${chatmessage.status}</span>`
      : "";
  // const imgSrc = chatmessage.type === 'sender'? profileImg: focusUser.profileImg
  const timestamp = new Date(chatmessage.timestamp);
  const htmlel = `
    <div class="conversation ${convClass}">
    <div class="conv-holder">
      <p class="message">
        ${chatmessage.newLineChatMessage}
      </p>

      <p class="date-time">${getFormattedTime(timestamp)} ${msgStatus}</p>
    </div>
  </div>
    `;
  if (lastMsgDate == null || timestamp.getDate() - lastMsgDate.getDate() >= 1) {
    lastMsgDate = timestamp;
    const dayCon = `
        <div class="day-con">
              <span class="hor-line"></span>
              <p class="day">${getFormattedDate(
                timestamp,
                (astime = false)
              )}</p>
              <span class="hor-line"></span>
        </div>
        `;
    conversationContainer.insertAdjacentHTML("beforeend", dayCon);
  }

  conversationContainer.insertAdjacentHTML("beforeend", htmlel);

  markAsSeen(chatmessage);
  scrollToContainerEnd(conversationContainer);
}

function UnseenChanged(senderId, operation) {
  const threadEl = document.getElementById(`thread-el-${senderId}`);

  if (threadEl) {
    const numEl = threadEl.querySelector(".num");
    let num = Number(numEl.textContent);
    num = operation == "+" ? num + 1 : num - 1;
    if (num < 1) {
      //    numEl.parentNode.style.display= 'none'
      numEl.parentNode.classList.remove("visible");
    } else {
      numEl.parentNode.classList.add("visible");
    }
    numEl.textContent = num + "";
  }
}

/**sends a reqeust to the server to indicate the message is seen
 * also updates the websocket about the seen message
 */
function markAsSeen(chatmessage) {
  if (chatmessage.status !== "seen" && chatmessage.type === "receiver") {
    //notify the database of message seen
    fetch(`/chat/markasseen/${chatmessage.id}/`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status == 200) {
          if (chatmessage.senderId) {
            //notify the websocket of message seen
            const payload = JSON.stringify({
              msg_id: chatmessage.id,
              sender_id: chatmessage.senderId,
              action: "msg_seen",
            });
            socket.send(payload); //send a message
          }
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    UnseenChanged(chatmessage.senderId, "-");
  }
}

/** Forces a scrollable container to scroll to end
 * @param container the container to be scrolled
 */
function scrollToContainerEnd(container) {
  container.scrollTop = container.scrollHeight;
}

function getFormattedDate(date, astime = true) {
  const now = new Date();
  const dayDiff = now.getDate() - date.getDate();

  if (dayDiff === 1) {
    return "Yesterday";
  } else if (dayDiff > 1) {
    return date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "2-digit",
    });
  } else {
    if (astime) return getFormattedTime(date);
    return "Today";
  }
}

function getUser(userId) {
  toggleContainerState("right-profile-tile", "loading");
  const csrftoken = Cookies.get("csrftoken");

  fetch(`/accounts/getprofile/${userId}/`, {
    method: "POST",
    headers: { "X-CSRFToken": csrftoken },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status == 200) {
        showProfile(data.profile);
      }
    })
    .catch((error) => {
      if (window.innerWidth > 865) {
        toggleContainerState("right-profile-tile", "idle");
      }
      showToast({
        message: "Error: Couldn't load profile",
        style: "error",
      });
    });
}

function showProfile(profile) {
  const profileTile = makeProfileTile(profile);
  const profileTileContainer = document.querySelector(".profile-container");
  profileTileContainer.innerHTML = "";
  profileTileContainer.insertAdjacentHTML("afterbegin", profileTile);
  toggleContainerState("right-profile-tile", "profile");
  displayingUserId = profile.user.id
}

function makeProfileTile(profile) {
  const profileTile = `
    <div class="profile-tile profile">
    <div class="top-info">
      <div class="left-con">
        <h4 class="profile-username">${profile.user.username}</h4>
        <p class="profile-fullname">${profile.user.first_name} ${
    profile.user.last_name
  }</p>
      </div>

      <i class="ri-close-line" onclick="closeRightProfileContent()"></i>
    </div>

    <div class="profile-img-status-con">
      <div class="con">
        <img
          src="${profile.profileImg}"
          alt=""
          style="background-color: #acacad"
        />
        <div class="status ${profile.is_online?'online':'offline'} displaying-status">
          <div class="circle"></div>
          <p class="txt-displaying-status">${profile.is_online?'Online':'Offline'}</p>
        </div>
      </div>
    </div>

    <div class="profile-information">
      <p class="username">${profile.user.username}</p>
      ${
        profile.about == "" || !profile.about
          ? ""
          : `
      <p class="about">
        ${profile.about}
    </p>
      `
      }

      <div class="extras-container">
        <div class="extra">
          <i class="ri-mail-fill"></i>
          <div class="extra-info">
            <p class="extra-description">Email Address</p>
            <p class="extra-content">${profile.user.email}</p>
          </div>
        </div>

        <div class="extra">
        <i class="ri-home-3-fill"></i>
            <div class="extra-info">
                <p class="extra-description">Department</p>
                <p class="extra-content">${profile.office.office_name} </p>
            </div>
         </div>

        ${
          profile.phone
            ? `  <div class="extra">
        <i class="ri-phone-fill"></i>
        <div class="extra-info">
          <p class="extra-description">Phone</p>
          <p class="extra-content">${profile.phone}</p>
        </div>
      </div>`
            : ""
        }
      </div>
    </div>
  </div>
    `;
  return profileTile;
}

/** Returns a formatted time in form of (11:00pm)
 * @param date: A date object
 */
function getFormattedTime(date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}

//==========
function toggleLeftMostTile() {
  modalOverlay.classList.toggle("visible");
  leftmost.classList.toggle("visible");
}

function getParam(paramName) {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has(paramName)) {
    const paramValue = urlParams.get(paramName);
    return paramValue;
  }

  return null;
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
    const newUrl = window.location.pathname + "?" + urlParams.toString();
    window.history.replaceState({}, document.title, newUrl);

    // Return the parameter value
    return paramValue;
  }

  // Return null if the parameter doesn't exist
  return null;
}
