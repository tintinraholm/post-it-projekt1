const newNoteBtn = document.getElementById("newNoteBtn")

const addBtn = document.getElementById("addBtn")
const noteText = document.getElementById("noteText")

newNoteBtn.addEventListener("click", () => {
    const editor = document.createElement("div")
    editor.className = "notes-editor"

    editor.innerHTML = `
        <textarea rows="3" cols="40" placeholder="Skriv din nya anteckning här"></textarea><br>
        <button class="addBtn">Skapa</button>
      `
    notesContainer.appendChild(editor)

    editor.querySelector(".addBtn").addEventListener("click", () => {

        const text = editor.querySelector("textarea").value.trim()
        if (!text) return

        // POST to backend
        fetch(`${REST_API_URL}/notes/${currentBoardId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ text: text })
        })
            .then(res => res.json())
            .then(data => {
                renderNote(data, notesContainer)
                editor.remove()
            })
            .catch(err => console.error("Error creating note:", err))
    })
})

function renderNote(noteData, container) {
    const token = localStorage.getItem("jwtToken")

    const noteDiv = document.createElement("div")
    noteDiv.id = `note-${noteData.id || Date.now()}`
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
        <textarea class="note-content">${noteData.note}</textarea>
        <button class="saveButton">Spara ändringar</button>
    `

    // DELETE
    noteDiv.querySelector(".remove-btn").addEventListener("click", () => {
        fetch(`${REST_API_URL}/notes/${noteData.id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(() => noteDiv.remove())
            .catch(err => console.error(err))
    })

    // UPDATE
    noteDiv.querySelector(".saveButton").addEventListener("click", () => {
        const updatedNote = noteDiv.querySelector(".note-content").value

        fetch(`${REST_API_URL}/notes/${noteData.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ text: updatedNote })
        })
            .then(res => res.json())
            .then(() => alert("Din uppdaterade anteckning sparad!"))
            .catch(err => console.error("Error updating note:", err))
    })

    // COLOR PICKER
    noteDiv.querySelectorAll(".square").forEach(square => {
        square.addEventListener("click", () => {
            noteDiv.classList.remove("yellow", "green", "pink")
            noteDiv.classList.add(square.classList[1])
        })
    })

    container.appendChild(noteDiv)
    initDragAndDrop()
}
