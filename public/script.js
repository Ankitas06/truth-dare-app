const socket = io();

let room = "";
let username = "";
let myTurn = false;
let currentLevel = "Easy & Fun 🟢";

let usedTruths = {};
let usedDares = {};

const levels = {
  "Easy & Fun 🟢": {
    truths: [
      "What was your first impression of me?",
      "What’s one random thing that makes you smile?",
      "What’s your favorite way to spend free time?",
      "What kind of people do you usually vibe with?",
      "What’s your biggest pet peeve?"
    ],
    dares: [
      "Send a funny selfie right now",
      "Describe me using only emojis",
      "Give me a random nickname instantly",
      "React dramatically to my last message",
      "Type something weird without explanation"
    ]
  },

  "Cute & Bonding 🌷": {
    truths: [
      "What reminds you of me?",
      "Do you enjoy talking to me?",
      "When do you think about me?",
      "What nickname would you give me?"
    ],
    dares: [
      "Send a message like I’m your favorite person",
      "Plan a cute imaginary hangout",
      "Say a genuine compliment"
    ]
  },

  "Flirty 🔥": {
    truths: [
      "Have you imagined us together?",
      "Do I make you nervous?",
      "What would you do if we were alone?"
    ],
    dares: [
      "Send a flirty text",
      "Tell me what you’d whisper",
      "Give me a private nickname"
    ]
  }
};

// POPUP
function nextPopup() {
  document.getElementById("popup1").style.display = "none";
  document.getElementById("popup2").style.display = "block";
}

function joinRoom() {
  room = document.getElementById("roomInput").value;
  username = document.getElementById("nameInput").value;

  socket.emit("join_room", { room, username });

  document.getElementById("main").style.display = "block";
}

// USERS
socket.on("room_users", (users) => {
  document.getElementById("users").innerText =
    "Players: " + users.map(u => u.name).join(", ");
});

// TURN
socket.on("turn_update", (name) => {
  myTurn = (name === username);

  document.getElementById("turn").innerText =
    myTurn ? "Your Turn 💖" : name + "'s turn";

  document.getElementById("truthBtn").disabled = !myTurn;
  document.getElementById("dareBtn").disabled = !myTurn;
});

// CHAT
function sendMessage() {
  const msg = document.getElementById("msg").value;
  if (!msg) return;

  socket.emit("send_message", {
    room,
    user: username,
    text: msg,
    type: "normal"
  });

  socket.emit("stop_typing", { room });

  document.getElementById("msg").value = "";

  
}

socket.on("receive_message", (data) => {
  const chat = document.getElementById("chat");

  const div = document.createElement("div");
  div.classList.add("message");

  if (data.user === username) div.classList.add("my-message");
  else div.classList.add("other-message");

  if (data.type === "truth") div.classList.add("truth-msg");
  if (data.type === "dare") div.classList.add("dare-msg");

  div.innerHTML = `<b>${data.user}</b><br>${data.text}`;

  chat.appendChild(div);

  // smooth scroll
  chat.scrollTo({
    top: chat.scrollHeight,
    behavior: "smooth"
  });
});

// TRUTH
function chooseTruth() {
  if (!myTurn) return;

  let all = levels[currentLevel].truths;
  if (!usedTruths[currentLevel]) usedTruths[currentLevel] = [];

  let available = all.filter(q => !usedTruths[currentLevel].includes(q));
  if (!available.length) return alert("No more truths");

  let q = available[Math.floor(Math.random() * available.length)];
  usedTruths[currentLevel].push(q);

  socket.emit("send_message", {
    room,
    user: username,
    text: "chose Truth 💭<br>👉 " + q,
    type: "truth"
  });
  socket.emit("next_turn", room);
}

// DARE
function chooseDare() {
  if (!myTurn) return;

  let all = levels[currentLevel].dares;
  if (!usedDares[currentLevel]) usedDares[currentLevel] = [];

  let available = all.filter(q => !usedDares[currentLevel].includes(q));
  if (!available.length) return alert("No more dares");

  let q = available[Math.floor(Math.random() * available.length)];
  usedDares[currentLevel].push(q);

  socket.emit("send_message", {
    room,
    user: username,
    text: "chose Dare 😏<br>👉 " + q,
    type: "dare"
  });
  socket.emit("next_turn", room);
}

// LEVEL
function changeLevel(level) {
  currentLevel = level;

  socket.emit("send_message", {
    room,
    user: "🌈 System",
    text: username + " switched to " + level
  });
}

// TYPING
function typing() {
  socket.emit("typing", { room, user: username });

  setTimeout(() => {
    socket.emit("stop_typing", { room });
  }, 1000);
}

socket.on("show_typing", (user) => {
  document.getElementById("typing").innerText = user + " is typing...";
});

socket.on("hide_typing", () => {
  document.getElementById("typing").innerText = "";
});
document.getElementById("msg").addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    sendMessage();
  }
});