const REST_API_URL = window.env.REST_API_URL
const API_URL = window.env.API_URL

const messageOutput = document.getElementById("message")
const token = localStorage.getItem("jwtToken")
let currentBoardId = null

document.getElementById("showRegister").addEventListener("click", (e) => {
    e.preventDefault()
    loginForm.style.display = "none"
    registerForm.style.display = "block"
    messageOutput.textContent = ""
})

document.getElementById("showLogin").addEventListener("click", (e) => {
    e.preventDefault()
    registerForm.style.display = "none"
    loginForm.style.display = "block"
    messageOutput.textContent = ""
})

document.getElementById("registerForm").addEventListener("submit", async (e) => {
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
        console.log("Register response:", data)
        if (res.ok) {
            messageOutput.textContent = "Registrering lyckades! Du kan logga in."
            registerForm.style.display = "none"
            loginForm.style.display = "block"
        } else {
            messageOutput.textContent = data.msg || "Registrering misslyckades."
        }
    } catch (error) {
        console.error("Fel vid registrering", error)
        messageOutput.textContent = "Något gick fel. Försök igen."
    }

})

document.getElementById("loginForm").addEventListener("submit", async (e) => {
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
            console.log("Login response:", data)
            localStorage.setItem("jwtToken", data.token)
            messageOutput.textContent = "Inloggning lyckades!"

            document.getElementById("authContainer").style.display = "none"
            document.getElementById("showBoards").style.display = "block"
            document.getElementById("myPage").style.display = "block"

            fetchBoards()
        } else {
            messageOutput.textContent = "Fel lösenord eller e-post"
        }
    } catch (error) {
        console.error("Fel vid login:", error)
        messageOutput.textContent = "Något gick fel. Försök igen."
    }
})

async function fetchBoards() {
    if (!token) return

    try {
        const res = await fetch(`${REST_API_URL}/boards`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })

        const response = await res.json()
        const data = response.boards
        const dropdown = document.getElementById("boardsDropdown")
        dropdown.innerHTML = ""
        if (data != null) {
            data.forEach((board, index) => {
                const option = document.createElement("option")
                option.value = board.id
                option.textContent = board.name

                if (index === 0) option.selected = true

                dropdown.appendChild(option)
            })
        }

    } catch (error) {
        console.error("Kunde inte hämta boards")
        return
    }
}

boardsDropdown.addEventListener("change", (e) => {
    currentBoardId = e.target.value || null

    document.querySelectorAll(".note, .canvas-container").forEach(el => el.remove())

    if (currentBoardId) {
        fetchNotes(currentBoardId)
        fetchDrawings(currentBoardId)
    } else {
        document.getElementById("myPage").innerHTML = ""
    }
})

createBoard.addEventListener("click", async () => {
    const name = newBoardName.value.trim()
    if (!name) return alert("Skriv ett namn för boarden!")



    try {
        const res = await fetch(`${REST_API_URL}/boards`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name: name })
        })

        const data = await res.json()
        if (res.ok) {
            alert("Board skapad!")
            newBoardName.value = ""
            fetchBoards()
        } else {
            alert(data.msg || "Kunde inte skapa board.")
        }
    } catch (error) {
        console.error("Fel vid skapande av board:", error)
    }
})

async function fetchNotes(currentBoardId) {
    if (!token) return

    try {
        const res = await fetch(`${REST_API_URL}/notes/${currentBoardId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })

        const data = await res.json()
        const notesContainer = document.getElementById("notesContainer")
        notesContainer.innerHTML = ""

        data.forEach(note => {
            if (!note || !note.note) return
            renderNote(note, notesContainer)
        })

        console.log("Fetched notes:", data)
    } catch (error) {
        console.error("Fel vid hämtning av notes:", error)
    }
}

async function fetchDrawings(currentBoardId) {
    if (!token) return

    try {
        const res = await fetch(`${REST_API_URL}/drawings/${currentBoardId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        const data = await res.json()

        const drawingContainer = document.getElementById("drawingContainer")
        drawingContainer.innerHTML = ""

        data.forEach(d => {
            if (d.drawing && d.drawing.length > 0) {
                createCanvas(d.drawing, d.id, false, drawingContainer)
            }
        })
        initDragAndDrop()
    } catch (error) {
        console.error("Fel vid hämtning av drawings:", error)
    }
}