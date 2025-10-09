function fetchSocketIo() {

    const jwtToken = localStorage.getItem("jwtToken")
    const socket = io("https://websocket-projekt2.onrender.com", {
        auth: { token: jwtToken }
    })
    const menu = document.getElementById("menu")
    const pasteBinDiv = document.getElementById("pasteBinDiv")
    const pasteBtn = document.getElementById("pasteBin")
    const backBtn = document.getElementById("backBtn")
    const pasteInput = document.getElementById("paste")
    const pastedValue = document.getElementById("pastedValue")
    const statusText = document.getElementById("status")
    const reconnectBtn = document.getElementById("reconnect")

    pasteBtn.addEventListener("click", () => {
        menu.style.display = "none"
        pasteBinDiv.style.display = "block"
    })

    backBtn.addEventListener("click", () => {
        pasteBinDiv.style.display = "none"
        menu.style.display = "block"
    })

    pasteInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter" && pasteInput.value.trim() !== "") {
            socket.emit("chat message", pasteInput.value)
            pasteInput.value = ""
        }
    })

    socket.on('connect', () => {
        statusText.textContent = "Connected!"
        reconnectBtn.style.display = "none"
        console.log('Connected with JWT:', jwtToken)
    })

    socket.on('chat message', (msg) => {
        pastedValue.textContent = msg.text
    })

    socket.on('disconnect', (reason) => {
        statusText.textContent = `Disconnected (${reason})`
        reconnectBtn.style.display = "inline-block"
        console.log('Disconnected:', reason)
    })

    socket.on("reconnect_attempt", (attemptNumber) => {
        statusText.textContent = `Trying to reconnect... (attempt ${attemptNumber})`
    })

    socket.on('connect_error', (err) => {
        statusText.textContent = `Connection failed: ${err.message}`
        reconnectBtn.style.display = "inline-block"
        console.error('Connection failed:', err.message)
    })

    reconnectBtn.addEventListener("click", () => {
        statusText.textContent = "Trying to reconnect..."
        reconnectBtn.style.display = "none"
        socket.connect()
    })
}