<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="styles.css">

  <script src="https://cdn.socket.io/4.0.0/socket.io.min.js"
    integrity="sha384-Z3z0lfCll60hcM+ma4sWUG4K1eoc7ogI+qOQiFlqjA4Jifm+nO/Jt5tHKQl5FQ2" crossorigin="anonymous"></script>
  <script src="https://kit.fontawesome.com/5fc4420cfa.js" crossorigin="anonymous"></script>
  <!-- DaisyUI links -->
  <link href="https://cdn.jsdelivr.net/npm/daisyui@4.12.14/dist/full.min.css" rel="stylesheet" type="text/css" />
  <script src="https://cdn.tailwindcss.com"></script>
  <title>Doro Chat</title>

  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 20px;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 20px;
    }

    h1 {
      text-align: center;
      color: #333;
      font-size: 1.5em;
      /* Adjusted for better scaling */
    }

    .message-container {
      max-height: 400px;
      overflow-y: auto;
      margin-bottom: 10px;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      background-color: #1f2530;
    }

    .message {
      background-color: #4d738f;
      padding: 10px;
      margin: 5px 0;
      position: relative;
      /* Ensures that the time can be positioned absolutely */
      padding: 10px !important;

    }

    .time {
      background-color: #003b532f;
      font-weight: 600;
      text-align: center;
      overflow: hidden;
    }

    input[type="text"] {
      width: calc(100% - 90px);
      /* Adjusted width for mobile view */
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }

    button {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      background-color: #007bff;
      color: white;
      cursor: pointer;
      margin-left: 5px;
      /* Add spacing between input and button */
    }

    button:hover {
      background-color: #0056b3;
    }

    .name-prompt {
      text-align: center;
      margin-bottom: 10px;
    }









    /* Link */
    /* Style clickable links inside messages */
    .message-link {
      color: #1e90ff;
      /* Vibrant blue text for links */
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s ease-in-out;
    }

    /* Hover effect for links */
    .message-link:hover {
      text-decoration: underline;
      color: #63b3ff;
    }


    /* Message component */
    .message {
      cursor: pointer;
      background: linear-gradient(135deg, #2c2f3e, #1f2129);
      color: #f0f0f0;
      border-radius: 12px;
      display: block;
      max-width: 98%;
      padding: 10px 20px;
      margin-bottom: 10px;
      font-size: 16px;
      word-wrap: break-word;
      position: relative;
      font-weight: 500;
      font-family: Arial, sans-serif;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: transform 0.2s ease-in-out, box-shadow 0.3s ease-in-out, background 0.3s ease-in-out;
      line-height: 1.4;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }

    /* Hover effect */
    .message:hover {
      transform: scale(1.03);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
      background: linear-gradient(135deg, #1f2129, #2c2f3e);
    }

    /* Subtle animation */
    .message {
      animation: fadeIn 0.8s ease-in-out;
    }

    /* Keyframes for Fade-in Animation */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(15px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }












    /* Responsive adjustments */
    @media (max-width: 200px) {
      .container {
        padding: 10px;
        /* Less padding on mobile */
      }

      .message-container {
        height: 200px;
        width: 60%;
      }

      #messageInput {
        width: 60%;
      }

      h1 {
        font-size: 1.2em;
        /* Smaller heading for mobile */
      }

      input[type="text"] {
        width: calc(100% - 70px);
        /* Adjust width for smaller screens */
      }

      button {
        padding: 10px 15px;
        /* Slightly smaller button padding */
      }

      #sendButton {
        position: relative;
        left: 180px;
        top: -34px;
      }

      .message-container {
        max-height: 400px;
        /* Reduce height for mobile */
      }
    }

    @media only screen and (max-width: 420px) {
      .message-container {
        height: 110%;
        width: 100%;
        margin: 0 auto;
        align-self: center;
      }

      .down-container {
        padding-bottom: 150px;
      }

      .message {


        /* width: 100vh; */
        overflow-x: auto;
        /* Hide any overflow */
        word-wrap: break-word;
        /* Allow long words to break */
        max-width: 100%;
        /* Optional: Limit the width of messages */
      }

      #whole-container {
        scale: 100% !important;
      }

      .container {
        overflow: visible;
      }
    }

    .down-container {
      padding-bottom: 4px;
    }

    #whole-container {
      scale: 104%;
    }


    #messageContainer,
    #messageInput,
    #sendButton {
      display: none;
    }

    #saveNameButton {
      margin-top: 10px;
    }

    .made-by,
    .made-by a {
      font-size: 12px;
      color: #007bff;
    }
  </style>
</head>

<body class="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
  <!-- ddddddddddddddddddddddddddddddddd -->










  <!-- Navbar -->
  <div class="navbar bg-transparent fixed top-0 left-1/2 w-full z-[9999]">
    <div class="flex items-center justify-end px-4 py-2">
      <!-- Avatar with Dropdown -->
      <div class="dropdown dropdown-end">
        <label tabindex="0" class="cursor-pointer">
          <div class="avatar flex flex-col items-center justify-center">
            <div class="ring-primary ring-offset-base-100 w-14 md:w-20 rounded-full ring ring-offset-2">
              <img id="profile-pic" src="./sun.gif" alt="Avatar" />
            </div>
          </div>
        </label>
        <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
          <li><a href="#" onclick="openProfileModal()">Change Profile</a></li>
          <li><a href="https://doro-press-image-compress.vercel.app/" target="_blank">Compress your images</a></li>
          <li><a href="https://spinstrike.vercel.app/" target="_blank">Shop For Anime Collectibles</a></li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Content Wrapper -->
  <div class="pt-16">
    <!-- Replace this with your page content -->
    <div class="p-4">
      <h1 class="text-3xl font-bold text-white">Welcome to DOro-Chat</h1>

    </div>
  </div>

  <!-- Profile Modal -->
  <div id="profile-modal" class="hidden fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-10">
    <div class="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 class="text-lg font-bold mb-4">Change Profile Picture</h2>


      <input id="profile-input" type="file" accept="image/*"
        class="file-input file-input-bordered file-input-lg w-full max-w-xs mb-3" />



      <button onclick="saveProfilePicture()" class="btn btn-primary w-full">Save</button>
      <button onclick="closeProfileModal()" class="btn btn-secondary w-full mt-2">Cancel</button>
    </div>
  </div>






  <!-- ddddddddddddddddddddddddddddddddd -->

  <!-- ddddddddddddddddddddddddddddddddd -->

  <!-- ddddddddddddddddddddddddddddddddd -->



  <script>
    // Function to open the modal
    function openProfileModal() {
      document.getElementById('profile-modal').classList.remove('hidden');
    }

    // Function to close the modal
    function closeProfileModal() {
      document.getElementById('profile-modal').classList.add('hidden');
    }

    // Function to save the new profile picture
    function saveProfilePicture() {
      const fileInput = document.getElementById('profile-input');
      const file = fileInput.files[0];

      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const profilePicUrl = e.target.result;
          // Save to local storage
          localStorage.setItem('profilePicture', profilePicUrl);
          // Update the avatar image
          document.getElementById('profile-pic').src = profilePicUrl;
          // Close the modal
          closeProfileModal();
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please select an image file.');
      }
    }

    // Load the profile picture from local storage on page load
    window.onload = function () {
      const savedProfilePic = localStorage.getItem('profilePicture');
      if (savedProfilePic) {
        document.getElementById('profile-pic').src = savedProfilePic;
      }
    };
  </script>



  <!-- ddddddddddddddddddddddddddddddddd -->

  <!-- ddddddddddddddddddddddddddddddddd -->

  <!-- ddddddddddddddddddddddddddddddddd -->




  <!-- eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee -->
  <div id="whole-container" class="container bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg scale-x-105">

    <h1 class="text-2xl font-bold text-emerald-400 flex justify-between items-center">
      Doro Chat
      <a href="./info.html" class="text-emerald-300 hover:text-emerald-500 transition">
        <i class="fa-regular fa-circle-question"></i>
      </a>
    </h1>
    <small class="text-sm text-gray-400">><a href="https://www.facebook.com/Nazim.AbdulAhad"
        class="text-gray-300 hover:text-gray-200">Nazim</a>
      < </small>
        <button id="changeNameButton"
          class="mt-2 w-full bg-blue-500 hover:bg-blue-400 text-white p-2 rounded transition">
          Change Name
        </button>

        <!-- Name input field -->
        <div id="namePrompt" class="mt-4">
          <input type="text" id="nameInput" placeholder="Enter a name to use it in Chat"
            class="w-full p-2 rounded bg-gray-700 placeholder-gray-500 text-white" />
          <div class="flex items-center mt-2">
            <span class="text-sm mr-2">Set Name Color:</span>
            <input type="color" id="colorPicker" value="#82ffb2" class="border-none" /> <!-- Default color: black -->
          </div>
          <button id="saveNameButton"
            class="mt-2 w-full bg-emerald-500 hover:bg-emerald-400 text-white p-2 rounded transition">Set Name</button>
        </div>

        <!-- Room input field -->
        <div class="room-prompt mt-4">
          <input type="text" id="roomInput" placeholder="Enter room name..."
            class="w-full p-2 rounded bg-gray-700 placeholder-gray-500 text-white" />
          <button id="roomButton"
            class="mt-2 w-full bg-emerald-500 hover:bg-emerald-400 text-white p-2 rounded transition">Join Room</button>
          <div id="currentRoomDisplay" class="mt-2 text-center">Current Room: <span class="text-emerald-300">World
              Chat</span></div> <!-- Display for current room -->
        </div>
        <!-- Online Users Section -->
        <div id="onlineUsersDisplay" class="hidden">Online Users: 0</div> <!-- New element to display total users -->


        <div class="message-container mt-4 max-h-[30rem] overflow-auto border border-gray-600 rounded p-2"
          id="messageContainer"></div>


        <!-- aaaaaaaaaaaaaaaaaaa -->
        <!-- aaaaaaaaaaaaaaaaaaa -->
        <!-- aaaaaaaaaaaaaaaaaaa -->
        <!-- aaaaaaaaaaaaaaaaaaa -->
        <!-- aaaaaaaaaaaaaaaaaaa -->
        <!-- aaaaaaaaaaaaaaaaaaa -->
        <!-- aaaaaaaaaaaaaaaaaaa -->
        <!-- aaaaaaaaaaaaaaaaaaa -->
        <!-- aaaaaaaaaaaaaaaaaaa -->
        <!-- aaaaaaaaaaaaaaaaaaa -->
        <!-- aaaaaaaaaaaaaaaaaaa -->
        <!-- aaaaaaaaaaaaaaaaaaa -->


        <div class="mt-4 down-container flex flex-col space-y-4">
          <!-- Input for typing message -->
          <div class="relative flex items-center">
            <input type="text" id="messageInput" placeholder="Type your message..."
              class="p-3 rounded-full bg-gray-700 placeholder-gray-500 text-white w-full max-w-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" />
            <button id="sendButton"
              class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-emerald-500 hover:bg-emerald-400 text-white p-4 w-12 h-12 rounded-full flex items-center justify-center transition duration-300 ease-in-out shadow-md">
              <i class="fa-regular fa-paper-plane justify-center flex"></i>
            </button>



          </div>

          <!-- Button to start and stop recording -->
          <button
            class="btn btn-primary p-3 rounded-full w-full max-w-xs shadow-lg transition duration-300 ease-in-out hover:scale-105 transform"
            id="recordButton"><i class="fa-solid fa-microphone"></i> Start</button>

          <!-- File Input for image -->
          <div class="flex items-center space-x-2">
            <input type="file"
              class="file-input file-input-bordered w-full max-w-xs rounded-full focus:ring-2 focus:ring-emerald-500"
              id="fileInput" placeholder="Select a File under 800 KB" />
            <button
              class="btn btn-neutral p-3 rounded-full shadow-lg hover:bg-neutral-600 transition duration-300 ease-in-out"
              id="sendFileButton">Send File</button>
          </div>
        </div>

        <!-- aaaaaaaaaaaaaaaaaaa -->
        <!-- aaaaaaaaaaaaaaaaaaa -->
        <!-- aaaaaaaaaaaaaaaaaaa -->
        <!-- aaaaaaaaaaaaaaaaaaa -->
        <!-- aaaaaaaaaaaaaaaaaaa -->
        <!-- aaaaaaaaaaaaaaaaaaa -->
        <!-- aaaaaaaaaaaaaaaaaaa -->
        <!-- aaaaaaaaaaaaaaaaaaa -->
        <!-- aaaaaaaaaaaaaaaaaaa -->
        <!-- aaaaaaaaaaaaaaaaaaa -->
        <!-- aaaaaaaaaaaaaaaaaaa -->
        <!-- aaaaaaaaaaaaaaaaaaa -->
        <div class="text-center">
          <h2 class="mb-2">Online Users:</h2>
          <div id="onlineUsersContainer" class="bg-indigo-400 text-center rounded-3xl text-black"></div>
        </div>
  </div>
  </div>

  <script src="/socket.io/socket.io.js"></script>
  <script src="script.js"></script>
</body>

</html>
