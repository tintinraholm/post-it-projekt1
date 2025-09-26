const notesContainer = document.getElementById("notesContainer");
const newNoteBtn = document.getElementById("newNoteBtn")

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

const addBtn = document.getElementById("addBtn");
const noteText = document.getElementById("noteText");

/*document.getElementById("newNoteBtn").addEventListener("click", (e) => {
    e.preventDefault();
    newNoteBtn.style.display = "none";
    loginForm.style.display = "block";
    messageOutput.textContent = "";
});*/

newNoteBtn.addEventListener("click", () => {
    console.log("new note button clicked")
    const editor = document.createElement("div");
    editor.className = "notes-editor";

    editor.innerHTML = `
        <textarea rows="3" cols="40" placeholder="Write your note here"></textarea><br>
        <button class="addBtn">Create</button>
      `;
    notesContainer.appendChild(editor);

    editor.querySelector(".addBtn").addEventListener("click", () => {
        const text = editor.querySelector("textarea").value.trim();
        if (!text) return;

        // POST to backend
        fetch("http://localhost:8080/notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ author_id: 1, text: text })
        })
            .then(res => res.json())
            .then(data => {
                console.log("New note saved: ", data.id);
                const dbId = data.id;
                const newNote = document.createElement("div");
                newNote.id = dbId;
                newNote.dataset.id = dbId;
                newNote.className = "note";
                newNote.setAttribute("draggable", "true");
                newNote.setAttribute("ondragstart", "dragstartHandler(event)");
                newNote.style.position = "absolute";
                newNote.style.top = "10px";
                newNote.style.left = "10px";

                newNote.innerHTML = `
            <div class="note-header">
                <div class="note-buttons">
                    <span class="square yellow"></span>
                    <span class="square green"></span>
                    <span class="square pink"></span>
                </div>
                <button class="remove-btn">&times;</button>
            </div>
            <textarea class="note-content" rows="6">${text}</textarea>
        `;

                // DELETE Back- and frontend
                newNote.querySelector(".remove-btn").addEventListener("click", () => {
                    fetch(`http://localhost:8080/notes/${dbId}`, { method: "DELETE" })
                        .then(res => res.json())
                        .then(delData => {
                            console.log("Deleted note:", delData);
                            newNote.remove();
                        })
                        .catch(err => console.error(err));
                });
                newNote.querySelectorAll(".square").forEach(square => {
                    square.addEventListener("click", () => {
                        newNote.classList.remove("yellow", "green", "pink");
                        newNote.classList.add(square.classList[1]);
                    });
                });

                document.body.appendChild(newNote);
                editor.remove();
            });
    })
})





