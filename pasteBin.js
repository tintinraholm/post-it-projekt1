const socket = io("https://websocket-projekt2.onrender.com", {
    auth: { token }
})
const menu = document.getElementById("menu")
const pasteBinDiv = document.getElementById("pasteBinDiv")
const pasteBtn = document.getElementById("pasteBin")
const backBtn = document.getElementById("backBtn")
const pasteInput = document.getElementById("paste")
const pastedValue = document.getElementById("pastedValue")



// Klick på "Paste bin" → visa pastebin, göm meny
pasteBtn.addEventListener("click", () => {
    menu.style.display = "none"
    pasteBinDiv.style.display = "block"
})

// Klick på "Tillbaka" → visa meny, göm pastebin
backBtn.addEventListener("click", () => {
    pasteBinDiv.style.display = "none"
    menu.style.display = "block"
})

// Enkel funktion: visa text från input i visningsrutan
pasteInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter" && pasteInput.value.trim() !== "") {
    socket.emit("chat message", pasteInput.value) 
    pasteInput.value = ""                          
  }
})

socket.on('connect', () => {
    console.log('Connected with JWT:', token)
})

socket.on('chat message', (msg) => {
    pastedValue.textContent = msg.text
})

socket.on('connect_error', (err) => {
    console.error('Connection failed:', err.message)
})