const notesContainer = document.getElementById("notesContainer")
const newNoteBtn = document.getElementById("newNoteBtn")

const addBtn = document.getElementById("addBtn")
const noteText = document.getElementById("noteText")

/*document.getElementById("newNoteBtn").addEventListener("click", (e) => {
    e.preventDefault()
    newNoteBtn.style.display = "none"
    loginForm.style.display = "block"
    messageOutput.textContent = ""
})*/

newNoteBtn.addEventListener("click", () => {
    console.log("new note button clicked")
    const editor = document.createElement("div")
    editor.className = "notes-editor"

    editor.innerHTML = `
        <textarea rows="3" cols="40" placeholder="Skriv din nya anteckning här"></textarea><br>
        <button class="addBtn">Skapa</button>
      `
    notesContainer.appendChild(editor)

    const token = localStorage.getItem("jwtToken")


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
                console.log("New note saved: ", data.id)
                const dbId = data.id
                const newNote = document.createElement("div")
                newNote.id = dbId
                newNote.dataset.id = dbId
                newNote.className = "note"
                newNote.style.position = "relative"
                newNote.style.display = "inline-block"
                newNote.style.margin = "10px"

                newNote.innerHTML = `
            <div class="note-header">
                <div class="note-buttons">
                    <span class="square yellow"></span>
                    <span class="square green"></span>
                    <span class="square pink"></span>
                </div>
                <button class="remove-btn">&times;</button>
            </div>
            <textarea class="note-content">${text}</textarea>
            <button id="saveButton">Spara ändringar</button>
        `
        notesContainer.appendChild(newNote)

                // DELETE Back- and frontend
                newNote.querySelector(".remove-btn").addEventListener("click", () => {
                    fetch(`${REST_API_URL}/notes/${dbId}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } })
                        .then(res => res.json())
                        .then(delData => {
                            console.log("Deleted note:", delData)
                            newNote.remove()
                        })
                        .catch(err => console.error(err))
                })
                // Uppdatera en existerande note
                newNote.querySelector('#saveButton').addEventListener("click", () => {
                    const updatedNote = newNote.querySelector(".note-content").value

                    fetch(`${REST_API_URL}/notes/${dbId}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({ text: updatedNote })
                    })
                        .then(res => res.json())
                        .then(updatedData => {
                            console.log("Note updated: ", updatedData)
                            alert("Din uppdaterade anteckning sparad!")
                        })
                        .catch(err => console.error("Error updating note: ", err))
                })
                newNote.querySelectorAll(".square").forEach(square => {
                    square.addEventListener("click", () => {
                        newNote.classList.remove("yellow", "green", "pink")
                        newNote.classList.add(square.classList[1])
                    })
                })

                initDragAndDrop()
                editor.remove()
            })
    })
})