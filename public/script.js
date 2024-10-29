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
const changeNameButton = document.getElementById("changeNameButton");
const fileInput = document.getElementById("fileInput"); // New input for files
const sendFileButton = document.getElementById("sendFileButton"); // New button for sending files
const recordButton = document.getElementById("recordButton"); // Button for audio recording
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
  socket.emit("join room", currentRoom);
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

roomButton.addEventListener("click", () => {
  const roomName = roomInput.value.trim();
  if (roomName) {
    socket.emit("leave room", currentRoom);
    currentRoom = roomName;
    localStorage.setItem("currentRoom", currentRoom);
    currentRoomDisplay.textContent = `Current Room: ${currentRoom}`;
    socket.emit("join room", currentRoom);
    messageContainer.innerHTML = "";
  }
});

function loadMessages() {
  const messages = JSON.parse(localStorage.getItem("messages")) || [];
  messages.forEach((msg) => {
    if (msg.room === currentRoom) {
      if (msg.audio) {
        displayAudioMessage(msg);
      } else if (msg.fileData) {
        displayFileMessage(msg);
      } else {
        displayMessage(msg);
      }
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
  return text.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
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

function displayFileMessage(data) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");

  if (data.fileType.startsWith("image/")) {
    messageDiv.innerHTML = `
      <b><i style="color: ${data.color};">${data.sender}</i></b>: <br/>
      <img src="${
        data.fileData
      }" alt="Image" style="max-width: 200px; max-height: 200px;">
      <i class="absolute bottom-0 right-0 text-[10px] text-lime-200 time">${
        data.time || new Date().toLocaleTimeString()
      }</i>
    `;
  } else if (data.fileType.startsWith("video/")) {
    messageDiv.innerHTML = `
      <b><i style="color: ${data.color};">${data.sender}</i></b>: <br/>
      <video controls style="max-width: 200px; max-height: 200px;">
        <source src="${data.fileData}" type="${data.fileType}">
        Your browser does not support the video tag.
      </video>
      <i class="absolute bottom-0 right-0 text-[10px] text-lime-200 time">${
        data.time || new Date().toLocaleTimeString()
      }</i>
    `;
  }

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
  recordButton.textContent = "🎙️ Send Voice";
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
      // 800 KB in bytes
      alert("Please select a file smaller than 800 KB.");
      fileInput.value = ""; // Clear the input
      return; // Exit the function
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
