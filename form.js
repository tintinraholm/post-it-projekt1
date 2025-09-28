const messageOutput = document.getElementById("message")

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

    const API_URL = 'https://login-api-projekt1.onrender.com/users'

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

    const API_URL = 'https://login-api-projekt1.onrender.com/users'

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
            //document.getElementById("logoutBtn").style.display = "block" 
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
    const token = localStorage.getItem("jwtToken")
    if (!token) return

    try {
        const res = await fetch("http://localhost:8060/boards", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })

        const response = await res.json();
        const data = response.boards;
        console.log(data)
        const dropdown = document.getElementById("boardsDropdown")
        dropdown.innerHTML = ""

        data.forEach((board, index) => {
            const option = document.createElement("option")
            option.value = board.id
            option.textContent = board.name

            if (index === 0) option.selected = true

            dropdown.appendChild(option)
        })

    } catch (error) {
        console.error("Kunde inte hämta boards")
        return
    }
}

boardsDropdown.addEventListener("change", (e) => {
    currentBoardId = e.target.value || null
    if (currentBoardId) {
        if (!null)
            fetchNotes(currentBoardId)
    } else {
        document.getElementById("myPage").innerHTML = ""
    }
})

createBoard.addEventListener("click", async () => {
    const name = newBoardName.value.trim()
    if (!name) return alert("Skriv ett namn för boarden!")

    const token = localStorage.getItem("jwtToken")

    try {
        const res = await fetch("http://localhost:8060/boards", {
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
    const token = localStorage.getItem("jwtToken")
    if (!token) return

    try {
        const res = await fetch(`http://localhost:8060/notes/${currentBoardId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })

        const data = await res.json()
        const notesContainer = document.getElementById("notesContainer")
        notesContainer.innerHTML = ""

        data.forEach(note => {
            const noteDiv = document.createElement("div")
            noteDiv.className = "note"
            noteDiv.innerHTML = `
        <div class="note-header">
          <button class="remove-btn">&times;</button>
        </div>
        <textarea class="note-content">${note.text}</textarea>
      `;
            notesContainer.appendChild(noteDiv)
        });

        console.log("Fetched notes:", data)
    } catch (error) {
        console.error("Fel vid hämtning av notes:", error)
    }
}



/*
function logout() {
  localStorage.removeItem("jwtToken")
  document.getElementById("appSection").style.display = "none"
  document.getElementById("authSection").style.display = "block"
}

document.getElementById("logoutBtn").addEventListener("click", async (e) => {
    e.preventDefault()
    logout()
}) */


