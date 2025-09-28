const messageOutput = document.getElementById("message");

function dragstartHandler(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function dragoverHandler(ev) {
    ev.preventDefault();
}

function dropHandler(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const note = document.getElementById(data);
    const rect = ev.target.getBoundingClientRect();
    //note.style.position = "absolute";
    note.style.left = (ev.clientX - rect.left) + "px";
    note.style.top = (ev.clientY - rect.top) + "px";
    //ev.target.appendChild(note);
}

document.getElementById("showRegister").addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.style.display = "none";
    registerForm.style.display = "block";
    messageOutput.textContent = "";
});

document.getElementById("showLogin").addEventListener("click", (e) => {
    e.preventDefault();
    registerForm.style.display = "none";
    loginForm.style.display = "block";
    messageOutput.textContent = "";
});

document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("registerEmail").value;
    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;

    const API_URL = window.env.API_URL

    try {
        const res = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, username, password }),
        });
        console.log("Status:", res.status);
        const data = await res.json();
        console.log("Register response:", data);
        if (res.ok) {
            messageEl.textContent = "Registrering lyckades! Du kan logga in.";
            registerForm.style.display = "none";
            loginForm.style.display = "block";
        } else {
            messageOutput.textContent = data.msg || "Registrering misslyckades.";
        }
    } catch (error) {
        console.error("Fel vid registrering", error)
        messageOutput.textContent = "Något gick fel. Försök igen.";
    }

});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const API_URL = window.env.API_URL

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (res.ok) {
            console.log("Login response:", data);
            localStorage.setItem("jwtToken", data.token);
            messageOutput.textContent = "Inloggning lyckades!";

            document.getElementById("authContainer").style.display = "none";
            //oardsContainer.style.display = "block";
            document.getElementById("myPage").style.display = "block";

            // Hämta notes från backend
            fetchNotes();

            //fetchBoards();
        } else {
            messageOutput.textContent = "Fel lösenord eller e-post";
        }
    } catch (error) {
        console.error("Fel vid login:", error);
        messageOutput.textContent = "Något gick fel. Försök igen.";
    }
});

/** async function fetchBoards() {
    // Hämta JWT från localStorage
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        messageOutput = "Du måste logga in först!"
        return;
    }

    const API_URL = 'http://localhost:8080/users';

    try {
        const res = await fetch(`${API_URL}/boards`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        });

        const data = await res.json();

        if (res.ok) {
            const boardsList = document.getElementById("boardsList");
            boardsList.innerHTML = "";

            // Loop genom alla boards och skapa list-items
            data.forEach(board => {
                const li = document.createElement("li");
                li.textContent = board.boardName;
                boardsList.appendChild(li);
            });

            console.log("Boards hämtade:", data);
        } else {
            messageOutput.textContent = data.msg || "Kunde inte hämta boards.";
        }
    } catch (error) {
        console.error("Fel vid hämtning av boards:", error);
        messageOutput.textContent = "Något gick fel. Försök igen.";  
    }
} */

async function fetchNotes() {
    const token = localStorage.getItem("jwtToken");
    if (!token) return;

    try {
        const res = await fetch("http://localhost:8080/notes", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await res.json();
        const notesContainer = document.getElementById("notesContainer");
        notesContainer.innerHTML = "";

        data.forEach(note => {
            const noteDiv = document.createElement("div");
            noteDiv.className = "note";
            noteDiv.id = `note-${note.id}`;
            noteDiv.setAttribute("draggable", "true");
            noteDiv.setAttribute("ondragstart", "dragstartHandler(event)");
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
                fetch(`http://localhost:8080/notes/${note.id}`, { method: "DELETE" })
                    .then(res => res.json())
                    .then(delData => {
                        console.log("Deleted note:", delData);
                        noteDiv.remove();
                    })
                    .catch(err => console.error(err));
            });

            noteDiv.querySelector('#saveButton').addEventListener("click", () => {
                    const updatedNote = noteDiv.querySelector(".note-content").value;

                    fetch(`http://localhost:8080/notes/${note.id}`, {
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

            notesContainer.appendChild(noteDiv);
        });

        console.log("Fetched notes:", data);
    } catch (error) {
        console.error("Fel vid hämtning av notes:", error);
    }
}




