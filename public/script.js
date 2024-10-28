const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const messageContainer = document.getElementById("messageContainer");

// Connect to the Socket.IO server
const socket = io();

// Function to load messages from local storage
function loadMessages() {
  const messages = JSON.parse(localStorage.getItem("messages")) || [];
  messages.forEach((msg) => displayMessage(msg));
}

// Listen for chat messages from the server
socket.on("chat message", (msg) => {
  displayMessage(msg);
  saveMessageToLocalStorage(msg); // Save the message to local storage
});

// Function to display a message
function displayMessage(message) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  messageDiv.textContent = message;
  messageContainer.appendChild(messageDiv);
}

// Function to save message to local storage
function saveMessageToLocalStorage(message) {
  const messages = JSON.parse(localStorage.getItem("messages")) || [];
  messages.push(message);
  localStorage.setItem("messages", JSON.stringify(messages));
}

// Function to send message
function sendMessage() {
  const message = messageInput.value;
  if (message) {
    socket.emit("chat message", message); // Send message to server
    displayMessage(message); // Display your own message
    saveMessageToLocalStorage(message); // Save the message to local storage
    messageInput.value = ""; // Clear input
  }
}

// Send message on button click
sendButton.addEventListener("click", sendMessage);

// Load messages from local storage when the page loads
loadMessages();
