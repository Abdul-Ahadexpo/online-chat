const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const messageContainer = document.getElementById("messageContainer");
const nameInput = document.getElementById("nameInput");
const saveNameButton = document.getElementById("saveNameButton");
const namePrompt = document.getElementById("namePrompt");
const colorPicker = document.getElementById("colorPicker");
const roomInput = document.getElementById("roomInput");
const roomButton = document.getElementById("roomButton");
const currentRoomDisplay = document.getElementById("currentRoomDisplay");
const onlineUsersDisplay = document.getElementById("onlineUsersDisplay"); // New element for total users display
const onlineUsersContainer = document.getElementById("onlineUsersContainer");

const changeNameButton = document.getElementById("changeNameButton");
const fileInput = document.getElementById("fileInput");
const sendFileButton = document.getElementById("sendFileButton");
const recordButton = document.getElementById("recordButton");
let mediaRecorder;
let audioChunks = [];

const socket = io();

let username = localStorage.getItem("username");
let userColor = localStorage.getItem("userColor") || "#000000";
let currentRoom = localStorage.getItem("currentRoom") || "World Chat";

if (username) {
  enableChat();
} else {
  namePrompt.style.display = "block";
}

function enableChat() {
  namePrompt.style.display = "none";
  messageContainer.style.display = "block";
  messageInput.style.display = "inline-block";
  sendButton.style.display = "inline-block";
  currentRoomDisplay.textContent = `Current Room: ${currentRoom}`;
  changeNameButton.style.display = "block";
  socket.emit("join room", currentRoom, username);
}

saveNameButton.addEventListener("click", () => {
  username = nameInput.value.trim();
  userColor = colorPicker.value;
  if (username) {
    localStorage.setItem("username", username);
    localStorage.setItem("userColor", userColor);
    enableChat();
  }
});

// Listen for total users update
socket.on("update online users", (totalUsers) => {
  onlineUsersDisplay.textContent = `Online Users: ${totalUsers}`; // Update total users display
});
socket.on("update online users", (users) => {
  onlineUsersContainer.innerHTML = ""; // Clear the container first

  users.forEach((user) => {
    const userItem = document.createElement("div");
    userItem.textContent = `${user.username} - is in Room: ${user.room}`; // Display username and room
    onlineUsersContainer.appendChild(userItem);
  });
});
// Room button click handler
roomButton.addEventListener("click", () => {
  const roomName = roomInput.value.trim();
  if (roomName) {
    socket.emit("leave room", currentRoom);
    currentRoom = roomName;
    localStorage.setItem("currentRoom", currentRoom);
    currentRoomDisplay.textContent = `Current Room: ${currentRoom}`;

    socket.emit("join room", currentRoom, username);
    messageContainer.innerHTML = "";
  }
});

// (Rest of the script.js remains unchanged)















function loadMessages() {
  const messages = JSON.parse(localStorage.getItem("messages")) || [];
  const displayedMessages = new Set();

  messages.forEach((msg) => {
    if (msg.room === currentRoom && !displayedMessages.has(msg.time + msg.sender)) {
      if (msg.audio) {
        displayAudioMessage(msg);
      } else if (msg.fileData) {
        displayFileMessage(msg);
      } else {
        displayMessage(msg);
      }
      displayedMessages.add(msg.time + msg.sender);
    }
  });
  scrollToBottom(); // Ensure the latest messages are visible
}
















function scrollToBottom() {
  messageContainer.scrollTop = messageContainer.scrollHeight; // Scroll to the bottom
}

function makeLinksClickable(text) {
  const urlRegex =
    /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:*,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;

  return text.replace(
    urlRegex,
    '<a href="$1" target="_blank" class="message-link">$1</a>'
  );
}

socket.on("chat message", (data) => {
  if (data.room === currentRoom) {
    if (data.audio) {
      displayAudioMessage(data);
    } else if (data.fileData) {
      displayFileMessage(data);
    } else {
      displayMessage(data);
    }
    saveMessageToLocalStorage(data);
    scrollToBottom();
  }
});

function displayMessage(data) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");

  const messageWithLinks = makeLinksClickable(data.message);

  // Message display
  messageDiv.innerHTML = `
  <div class="chat chat-start">
    <div class="chat-image avatar">
      <div class="w-10 rounded-full">
        <!-- Optional: Add an avatar image here -->
      </div>
    </div>
    <div class="chat-bubble">
      ${messageWithLinks}
      <span style="color: ${data.color}; font-weight: bold;"><i>${
    data.sender
  }</i></span>
      <span class="absolute bottom-0 right-0 text-[10px] text-lime-200 time">${
        data.time || new Date().toLocaleTimeString()
      }</span>
    </div>
  </div>
`;

  messageContainer.appendChild(messageDiv);
}

function displayAudioMessage(data) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");

  const audioElement = document.createElement("audio");
  audioElement.controls = true;
  audioElement.src = `data:audio/webm;base64,${data.audio}`;

  messageDiv.innerHTML = `
    <b><i style="color: ${data.color};">${data.sender}</i></b>
    <i class="absolute bottom-0 right-0 text-[10px] text-lime-200 time">${
      data.time || new Date().toLocaleTimeString()
    }</i>
  `;
  messageDiv.appendChild(audioElement);

  messageContainer.appendChild(messageDiv);
}
// ;;
// ;;
// ;;
// ;;
// ;;
// ;;
// ;;
// ;;
// ;;
function displayFileMessage(data) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");

  const fileName = data.fileName || "Download";
  const time = data.time || new Date().toLocaleTimeString();

  if (data.fileType.startsWith("image/")) {
    messageDiv.innerHTML = `
      <b><i style="color: ${data.color};">${data.sender}</i></b>: <br/>
      <a href="${data.fileData}" download="${fileName}" class="flex items-center">
        <img src="${data.fileData}" alt="Image" 
          class="rounded-xl shadow-lg object-contain max-w-full max-h-[500px]" 
          style="max-width: 100%; max-height: 500px;">
      </a>
      <i class="absolute bottom-0 right-0 text-[10px] text-lime-200 time">${time}</i>
    `;
  } else if (data.fileType.startsWith("video/")) {
    messageDiv.innerHTML = `
      <b><i style="color: ${data.color};">${data.sender}</i></b>: <br/>
      <a href="${data.fileData}" download="${fileName}" class="flex items-center">
        <video controls style="max-width: 200px; max-height: 200px;">
          <source src="${data.fileData}" type="${data.fileType}">
          Your browser does not support the video tag.
        </video>
      </a>
      <i class="absolute bottom-0 right-0 text-[10px] text-lime-200 time">${time}</i>
    `;
  } else {
    // Handle other file types (downloadable with Font Awesome icons)
    messageDiv.innerHTML = `
      <b><i style="color: ${data.color};">${data.sender}</i></b>: <br/>
      <a href="${data.fileData}" download="${fileName}" class="flex items-center text-blue-500 hover:underline">
        <i class="fa-solid fa-file-download mr-2"></i> ${fileName}
      </a>
      <i class="absolute bottom-0 right-0 text-[10px] text-lime-200 time">${time}</i>
    `;
  }

  messageContainer.appendChild(messageDiv);
}
// ;;
// ;;
// ;;
// ;;
// ;;
// ;;
// ;;
// ;;
// ;;

function replaceEmoticons(text) {
  const emoticons = {
    ":)": "🙂",
    "B-)": "😎",
    ":(": "🙁",
    ToT: "😭",
    "-_-": "😑",
    ":p": "😋",
    fork: "🖕",
    fuck: "I love you",
    Fuck: "I love you",
    nigga: "🧑🏿",
    Nigga: "🧑🏿",
    Breakup: "💔",
    breakup: "💔",
    sex: "🔞",
    Sex: "🔞",
    SEx: "🔞",
    SeX: "🔞",
    SEX: "🔞",
    sEx: "🔞",
    sEX: "🔞",
    King: "♛",
    shit: "💩",
  };

  return text.replace(
    /:p|shit|Breakup|breakup|King|sEX|sEx|seX|SeX|SEX|SEx|Sex|sex|Fuck|fuck|Nigga|nigga|fork|-_-|:\)|B-\)|:\(|ToT/g,
    (match) => emoticons[match]
  );
}

function displayMessage(data) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");

  const messageWithEmojis = replaceEmoticons(data.message);
  const messageWithLinks = makeLinksClickable(messageWithEmojis);

  messageDiv.innerHTML = `
    <b><i style="color: ${data.color};">${
    data.sender
  }</i></b>: ${messageWithLinks} 
    <i class="absolute bottom-0 right-0 text-[10px] text-lime-200 time">${
      data.time || new Date().toLocaleTimeString()
    }</i>
  `;

  messageContainer.appendChild(messageDiv);
}

function saveMessageToLocalStorage(data) {
  const messages = JSON.parse(localStorage.getItem("messages")) || [];
  messages.push(data);
  localStorage.setItem("messages", JSON.stringify(messages));
}

function sendMessage() {
  const message = messageInput.value.trim();
  if (message && username) {
    const data = {
      sender: username,
      message,
      color: userColor,
      room: currentRoom,
      time: new Date().toLocaleTimeString(),
    };
    socket.emit("chat message", data);
    saveMessageToLocalStorage(data);
    messageInput.value = "";
    scrollToBottom();
  }
}

sendButton.addEventListener("click", sendMessage);

messageInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});

changeNameButton.addEventListener("click", () => {
  namePrompt.style.display = "block";
  messageContainer.style.display = "none";
  messageInput.style.display = "none";
  sendButton.style.display = "none";
  changeNameButton.style.display = "none";
});

// Start or stop recording audio
recordButton.addEventListener("click", () => {
  if (!mediaRecorder || mediaRecorder.state === "inactive") {
    startRecording();
  } else if (mediaRecorder.state === "recording") {
    stopRecording();
  }
});

function startRecording() {
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64AudioMessage = reader.result.split(",")[1];
          sendAudioMessage(base64AudioMessage);
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      recordButton.textContent = "⏹️ Stop Recording";
    })
    .catch((error) => console.error("Error accessing microphone:", error));
}

function stopRecording() {
  mediaRecorder.stop();
  recordButton.innerHTML = `<i class="fa-solid fa-microphone"></i> Start`;
}

function sendAudioMessage(base64Audio) {
  const data = {
    sender: username,
    audio: base64Audio,
    color: userColor,
    room: currentRoom,
    time: new Date().toLocaleTimeString(),
  };
  socket.emit("chat message", data);
}

// Handle file sending
sendFileButton.addEventListener("click", () => {
  const file = fileInput.files[0];

// Check if a file is selected and its size is under 800 KB
if (file) {
  if (file.size > 800 * 1024) {
    Swal.fire({
      title: "File too large",
      text: "Please select a file smaller than 800 KB.",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "Cancel",
      confirmButtonText: "Compress Image",
    }).then((result) => {
      if (result.isConfirmed) {
        // Redirect to the image compression page
        window.location.href = "https://doro-press-image-compress.vercel.app/";
      } else {
        // Clear the file input if user cancels
        fileInput.value = "";
      }
    });
    return;
  }



    const reader = new FileReader();
    reader.onload = () => {
      const data = {
        sender: username,
        fileData: reader.result, // Encoded file data
        fileType: file.type,
        color: userColor,
        room: currentRoom,
        time: new Date().toLocaleTimeString(),
      };
      socket.emit("chat message", data);
      saveMessageToLocalStorage(data);
      fileInput.value = ""; // Clear the input
    };

    reader.readAsDataURL(file);
  }
});

// Load messages when the page is loaded
window.addEventListener("load", loadMessages);
