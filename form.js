const API_URL = "https://login-api-projekt1.onrender.com/users"
const REST_API_URL = "https://rest-api-projekt1.onrender.com"

const authContainer = document.getElementById("authContainer")
const loginForm = document.getElementById("loginForm")
const registerForm = document.getElementById("registerForm")
const messageOutput = document.getElementById("message")

const showRegisterBtn = document.getElementById("showRegister")
const showLoginBtn = document.getElementById("showLogin")

const postItBtn = document.getElementById("postIt")
const menu = document.getElementById("menu")
const logoutBtn = document.getElementById("logout")

const showBoards = document.getElementById("showBoards")
const backToMenuBtn = document.getElementById("backToMenu")

const boardsDropdown = document.getElementById("boardsDropdown")
const createBoardBtn = document.getElementById("createBoard")
const newBoardName = document.getElementById("newBoardName")
const notesContainer = document.getElementById("notesContainer")
const drawingContainer = document.getElementById("drawingContainer")

let token = localStorage.getItem("jwtToken")
let refreshToken = localStorage.getItem("refreshToken")
let currentBoardId = null


// Visa login/register
showRegisterBtn.addEventListener("click", (e) => {
    e.preventDefault()
    loginForm.style.display = "none"
    registerForm.style.display = "block"
    messageOutput.textContent = ""
})

showLoginBtn.addEventListener("click", (e) => {
    e.preventDefault()
    registerForm.style.display = "none"
    loginForm.style.display = "block"
    messageOutput.textContent = ""
})

// Registrering
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const email = document.getElementById("registerEmail").value
    const username = document.getElementById("registerUsername").value
    const password = document.getElementById("registerPassword").value

    try {
        const res = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, username, password }),
        })

        const data = await res.json()
        if (res.ok) {
            messageOutput.textContent = "Registrering lyckades! Du kan logga in."
            registerForm.style.display = "none"
            loginForm.style.display = "block"
        } else {
            messageOutput.textContent = data.msg || "Registrering misslyckades."
        }
    } catch (error) {
        console.error("Fel vid registrering:", error)
        messageOutput.textContent = "Något gick fel. Försök igen."
    }
})

// Inloggning
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const email = document.getElementById("loginEmail").value
    const password = document.getElementById("loginPassword").value

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        })

        const data = await res.json()
        if (res.ok) {
            localStorage.setItem("jwtToken", data.token)
            localStorage.setItem("refreshToken", data.refreshToken)
            token = data.token
            refreshToken = data.refreshToken

            messageOutput.textContent = "Inloggning lyckades!"
            authContainer.style.display = "none"
            menu.style.display = "block"
            logoutBtn.style.display = "block"

            // Starta socket
            initSocket(token)
        } else {
            messageOutput.textContent = "Fel lösenord eller e-post"
        }
    } catch (error) {
        console.error("Fel vid login:", error)
        messageOutput.textContent = "Något gick fel. Försök igen."
    }
})

// Refresha access-token
window.addEventListener("load", async () => {
    refreshToken = localStorage.getItem("refreshToken")
    if (!refreshToken) return

    try {
        const res = await fetch(`${API_URL}/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${refreshToken}`
            }
        })

        if (res.ok) {
            const data = await res.json()
            localStorage.setItem("jwtToken", data.token)
            token = data.token
            console.log("Access-token förnyad!")

            authContainer.style.display = "none"
            document.getElementById("pasteBinDiv").style.display = "block"
            logoutBtn.style.display = "block"

            initSocket(data.token)
        } else {
            console.log("Refresh misslyckades, loggar ut.")
            localStorage.removeItem("refreshToken")
            localStorage.removeItem("jwtToken")
        }
    } catch (error) {
        console.log("Gick inte att refresha")
    }
})

// Tillbaka till menyn
backToMenuBtn.addEventListener("click", () => {
    showBoards.style.display = "none"
    menu.style.display = "block"
})

// Logga ut
logoutBtn.addEventListener("click", async () => {
    refreshToken = localStorage.getItem("refreshToken")

    try {
        const res = await fetch(`${API_URL}/logout`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${refreshToken}` }
        })

        if (!res.ok) {
            const error = await res.json()
            console.error("Logout misslyckades:", error.msg)
            return
        }

        localStorage.removeItem("refreshToken")
        localStorage.removeItem("jwtToken")
        console.log("Utloggad!")
        window.location.href = "/index.html"
    } catch (error) {
        console.error("Kunde inte logga ut:", error)
    }
})

// Hämta boards
async function fetchBoards() {
    if (!token) return
    try {
        const res = await fetch(`${REST_API_URL}/boards`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })

        const response = await res.json()
        const data = response.boards
        boardsDropdown.innerHTML = '<option value="">Välj en board</option>'

        if (data) {
            data.forEach(board => {
                const option = document.createElement("option")
                option.value = board.id
                option.textContent = board.name
                boardsDropdown.appendChild(option)
            })
        }
    } catch (error) {
        console.error("Kunde inte hämta boards:", error)
    }
}

// Hämta notes och drawings
async function fetchNotes(boardId) {
    if (!token) return
    try {
        const res = await fetch(`${REST_API_URL}/notes/${boardId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        const data = await res.json()
        notesContainer.innerHTML = ""
        data.forEach(note => {
            if (note?.note) renderNote(note, notesContainer)
        })
    } catch (error) {
        console.error("Fel vid hämtning av notes:", error)
    }
}

async function fetchDrawings(boardId) {
    if (!token) return
    try {
        const res = await fetch(`${REST_API_URL}/drawings/${boardId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        const data = await res.json()
        drawingContainer.innerHTML = ""
        data.forEach(d => {
            if (d.drawing?.length > 0) createCanvas(d.drawing, d.id, false, drawingContainer)
        })
        initDragAndDrop()
    } catch (error) {
        console.error("Fel vid hämtning av drawings:", error)
    }
}

// Boards-event
boardsDropdown.addEventListener("change", (e) => {
    currentBoardId = e.target.value || null
    document.querySelectorAll(".note, .canvas-container").forEach(el => el.remove())

    if (currentBoardId) {
        console.log("Vald board:", currentBoardId)
        document.getElementById("myPage").style.display = "block"
        fetchNotes(currentBoardId)
        fetchDrawings(currentBoardId)
        messageOutput.textContent = ""
    } else {
        document.getElementById("myPage").style.display = "none"
    }
})

createBoardBtn.addEventListener("click", async () => {
    const name = newBoardName.value.trim()
    if (!name) {
        messageOutput.textContent = "Skriv ett namn för boarden!"
        return
    }

    try {
        const res = await fetch(`${REST_API_URL}/boards`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name })
        })

        const data = await res.json()
        if (res.ok) {
            messageOutput.textContent = "Board skapad!"
            newBoardName.value = ""
            fetchBoards()
        } else {
            alert(data.msg || "Kunde inte skapa board.")
        }
    } catch (error) {
        console.error("Fel vid skapande av board:", error)
    }
})