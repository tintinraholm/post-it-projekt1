const REST_API_URL = window.env.REST_API_URL
const API_URL = window.env.API_URL

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
            //document.getElementById("logoutBtn").style.display = "block" 
            document.getElementById("showBoards").style.display = "block"

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
        const res = await fetch(`${REST_API_URL}/boards`, {
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
        dropdown.innerHTML = '<option value="">Välj en board</option>';
        if (data != null) {
            data.forEach(board => {
                const option = document.createElement("option")
                option.value = board.id
                option.textContent = board.name
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
    if (currentBoardId != null) {
        console.log("Vald board:", currentBoardId)
        document.getElementById("myPage").style.display = "block"
        fetchNotes(currentBoardId)
        fetchDrawings(currentBoardId)
        messageOutput.textContent = ""
    } else {
        document.getElementById("myPage").style.display = "none"
    }
})

createBoard.addEventListener("click", async () => {
    const name = newBoardName.value.trim()
    if (!name) {
        messageOutput.textContent = "Skriv ett namn för boarden!"
    return }

    const token = localStorage.getItem("jwtToken")

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
            messageOutput.textContent = "Board skapad"
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
        const res = await fetch(`${REST_API_URL}/notes/${currentBoardId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })

        const data = await res.json()
        const notesContainer = document.getElementById("notesContainer")
        notesContainer.innerHTML = ""

        data.forEach(note => {
            if (!note || !note.note) return
            const noteDiv = document.createElement("div")
            noteDiv.className = "note"
            noteDiv.innerHTML = `
        <div class="note-header">
            <div class="note-buttons">
                <span class="square yellow"></span>
                <span class="square green"></span>
                <span class="square pink"></span>
            </div>
            <button class="remove-btn">&times;</button>
        </div>
        <textarea class="note-content">${note.note}</textarea>
        <button id="saveButton">Spara ändringar</button>
      `;

            noteDiv.querySelector(".remove-btn").addEventListener("click", () => {
                fetch(`${REST_API_URL}/notes/${note.id}`, { method: "DELETE" })
                    .then(res => res.json())
                    .then(delData => {
                        console.log("Deleted note:", delData);
                        noteDiv.remove();
                    })
                    .catch(err => console.error(err));
            });

            noteDiv.querySelector('#saveButton').addEventListener("click", () => {
                const updatedNote = noteDiv.querySelector(".note-content").value;

                fetch(`${REST_API_URL}/notes/${note.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ text: updatedNote })
                })
                    .then(res => res.json())
                    .then(updatedData => {
                        console.log("Note updated: ", updatedData);
                        alert("Din uppdaterade anteckning sparad!");
                    })
                    .catch(err => console.error("Error updating note: ", err));
            });
            noteDiv.querySelectorAll(".square").forEach(square => {
                square.addEventListener("click", () => {
                    noteDiv.classList.remove("yellow", "green", "pink");
                    noteDiv.classList.add(square.classList[1]);
                });
            });
            notesContainer.appendChild(noteDiv);
        });

        console.log("Fetched notes:", data)
    } catch (error) {
        console.error("Fel vid hämtning av notes:", error)
    }
}

async function fetchDrawings(currentBoardId) {
    const token = localStorage.getItem("jwtToken")
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
    } catch (error) {
        console.error("Fel vid hämtning av drawings:", error)
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