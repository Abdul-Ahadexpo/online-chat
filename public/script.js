const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const messageContainer = document.getElementById("messageContainer");
const nameInput = document.getElementById("nameInput");
const saveNameButton = document.getElementById("saveNameButton");
const namePrompt = document.getElementById("namePrompt");
const colorPicker = document.getElementById("colorPicker"); // New color picker input
const roomInput = document.getElementById("roomInput"); // Room input
const roomButton = document.getElementById("roomButton"); // Room button
const currentRoomDisplay = document.getElementById("currentRoomDisplay"); // Display for current room
const changeNameButton = document.getElementById("changeNameButton"); // Change name button

const socket = io();

// Check if username and color are set in local storage
let username = localStorage.getItem("username");
let userColor = localStorage.getItem("userColor") || "#000000"; // Default to black if no color is chosen
let currentRoom = localStorage.getItem("currentRoom") || "World Chat"; // Default room

if (username) {
  enableChat();
} else {
  namePrompt.style.display = "block";
}

// Function to enable chat UI
function enableChat() {
  namePrompt.style.display = "none";
  messageContainer.style.display = "block";
  messageInput.style.display = "inline-block";
  sendButton.style.display = "inline-block";
  currentRoomDisplay.textContent = `Current Room: ${currentRoom}`; // Display current room
  changeNameButton.style.display = "block"; // Show change name button
  socket.emit("join room", currentRoom); // Join the default room
}

// Save the name and color, and enable chat
saveNameButton.addEventListener("click", () => {
  username = nameInput.value.trim();
  userColor = colorPicker.value; // Get the selected color
  if (username) {
    localStorage.setItem("username", username);
    localStorage.setItem("userColor", userColor); // Save color to localStorage
    enableChat();
  }
});

// Room change functionality
roomButton.addEventListener("click", () => {
  const roomName = roomInput.value.trim();
  if (roomName) {
    socket.emit("leave room", currentRoom); // Leave the current room
    currentRoom = roomName;
    localStorage.setItem("currentRoom", currentRoom); // Save current room to localStorage
    currentRoomDisplay.textContent = `Current Room: ${currentRoom}`; // Update displayed room
    socket.emit("join room", currentRoom); // Join the new room
    messageContainer.innerHTML = ""; // Clear messages for the new room
  }
});

// Load messages from local storage
function loadMessages() {
  const messages = JSON.parse(localStorage.getItem("messages")) || [];
  messages.forEach((msg) => {
    if (msg.room === currentRoom) {
      displayMessage(msg);
    }
  });
  scrollToBottom();
}

// Function to scroll to the bottom
function scrollToBottom() {
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Function to convert plain URLs into clickable links
function makeLinksClickable(text) {
  const urlRegex =
    /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:*,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  return text.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
}

// Listen for chat messages from the server
socket.on("chat message", (data) => {
  if (data.room === currentRoom) {
    displayMessage(data);
    saveMessageToLocalStorage(data);
    scrollToBottom();
  }
});

// Display message with sender's name in italics, color, and time
function displayMessage(data) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");

  const messageWithLinks = makeLinksClickable(data.message); // Convert links

  // Apply the color to the sender's name and include the time
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

// Save message to local storage
function saveMessageToLocalStorage(data) {
  const messages = JSON.parse(localStorage.getItem("messages")) || [];
  messages.push(data);
  localStorage.setItem("messages", JSON.stringify(messages));
}

// Send message
function sendMessage() {
  const message = messageInput.value.trim();
  if (message && username) {
    const data = {
      sender: username,
      message,
      color: userColor,
      room: currentRoom,
      time: new Date().toLocaleTimeString(), // Add the current time
    }; // Include sender name, color, room, and time
    socket.emit("chat message", data); // Send to server
    saveMessageToLocalStorage(data); // Save to local storage
    messageInput.value = ""; // Clear the input field
    scrollToBottom();
  }
}

// Send message on button click
sendButton.addEventListener("click", sendMessage);

// Send message on Enter key press
messageInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});

// Show name prompt to change the name
changeNameButton.addEventListener("click", () => {
  namePrompt.style.display = "block";
  messageContainer.style.display = "none";
  messageInput.style.display = "none";
  sendButton.style.display = "none";
  changeNameButton.style.display = "none"; // Hide change name button during the name change
});

// Load messages from local storage when the page loads
loadMessages();
