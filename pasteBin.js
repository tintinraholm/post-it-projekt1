let socket = null

// Funktion för att initiera socket + event handlers
function initSocket(jwtToken) {
    if (!jwtToken) return

    socket = io("https://websocket-projekt2.onrender.com", {
        auth: { token: jwtToken },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    })

    const menu = document.getElementById("menu")
    const pasteBinDiv = document.getElementById("pasteBinDiv")
    const pasteBtn = document.getElementById("pasteBin")
    const backBtn = document.getElementById("backBtn")
    const pasteInput = document.getElementById("paste")
    const pastedValue = document.getElementById("pastedValue")
    const statusText = document.getElementById("status")
    const reconnectBtn = document.getElementById("reconnect")

    // Visa/hide pastebin
    pasteBtn.addEventListener("click", () => {
        menu.style.display = "none"
        pasteBinDiv.style.display = "block"
    })

    backBtn.addEventListener("click", () => {
        pasteBinDiv.style.display = "none"
        menu.style.display = "block"
    })

    // Enter → skicka meddelande
    pasteInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter" && pasteInput.value.trim() !== "") {
            socket.emit("chat message", pasteInput.value)
            pasteInput.value = ""
        }
    })

    // Socket.IO events
    socket.on("connect", () => {
        statusText.textContent = "✅ Connected"
        reconnectBtn.style.display = "none"
        console.log("Connected with JWT:", jwtToken)
    })

    socket.on("disconnect", (reason) => {
        statusText.textContent = `❌ Disconnected (${reason})`
        reconnectBtn.style.display = "inline-block"
    })

    socket.on("reconnect_attempt", (attempt) => {
        statusText.textContent = `🔄 Trying to reconnect... (attempt ${attempt})`
    })

    socket.on("connect_error", (err) => {
        statusText.textContent = `⚠️ Connection failed: ${err.message}`
        reconnectBtn.style.display = "inline-block"
        console.error("Connection failed:", err.message)
    })

    // Ta emot meddelanden från andra clients
    socket.on("chat message", (msg) => {
        pastedValue.textContent = msg.text
    })

    // Reconnect-knapp
    reconnectBtn.addEventListener("click", () => {
        if (!socket.connected) {
            statusText.textContent = "🔄 Trying to reconnect..."
            reconnectBtn.style.display = "none"
            socket.connect()
        }
    })
}

// Initiera socket direkt om JWT finns
const jwtToken = localStorage.getItem("jwtToken")
if (jwtToken) {
    initSocket(jwtToken)
}
