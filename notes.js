
const addBtn = document.getElementById("addBtn");
const noteText = document.getElementById("noteText");
const notesContainer = document.getElementById("notesContainer");

addBtn.addEventListener("click", () => {
    console.log("Button clicked!");
    const text = noteText.value.trim();
    if (text === "") return;

    const newNote = document.createElement("div");
    newNote.className = "note";

    newNote.innerHTML = `
        <div class="note-header">
          <div class="note-buttons">
            <span class="square yellow"></span>
            <span class="square green"></span>
            <span class="square pink"></span>
          </div>
          <button class="remove-btn">&times;</button>
        </div>
        <div class="note-content">${text}</div>
    `;
    newNote.querySelector(".remove-btn").addEventListener("click", () => {
        notesContainer.removeChild(newNote);
    });

    newNote.querySelectorAll(".square").forEach(square => {
        square.addEventListener("click", () => {
            newNote.classList.remove("yellow", "green", "pink");
            newNote.classList.add(square.classList[1]);
        });
    });

    notesContainer.appendChild(newNote);
    noteText.value = "";
});

