// Källor för ritfunktionen: W3Schools och ChatGPT
function createCanvas(strokes, id, isNew, container) {
    const canvasDiv = document.createElement("div")
    canvasDiv.className = "canvas-container"

    canvasDiv.innerHTML = `
        <div class="canvas-controls">
            <label>Brush Size:
                <select class="brushSize">
                    <option value="3">S</option>
                    <option value="6">M</option>
                    <option value="10">L</option>
                </select>
            </label>
            <label>Brush Color:
                <select class="brushColor">
                    <option value="#000000">Black</option>
                    <option value="#ff0000">Red</option>
                    <option value="#0000ff">Blue</option>
                </select>
            </label>
            <button class="clearBtn">Clear</button>
        </div>
        <canvas width="250" height="150" class="board"></canvas>
        <div class="canvas-actions">
            ${isNew ? '<button class="saveBtn" title="Save">💾</button>' : `
            <button class="updateBtn" title="Update">✏️</button>
            <button class="deleteBtn" title="Delete">🗑️</button>
            `}
        </div>
    `

    container.appendChild(canvasDiv)

    const canvas = canvasDiv.querySelector("canvas")
    const ctx = canvas.getContext("2d")
    const brushSize = canvasDiv.querySelector(".brushSize")
    const brushColor = canvasDiv.querySelector(".brushColor")
    const clearBtn = canvasDiv.querySelector(".clearBtn")
    const saveBtn = canvasDiv.querySelector(".saveBtn")
    const updateBtn = canvasDiv.querySelector(".updateBtn")
    const deleteBtn = canvasDiv.querySelector(".deleteBtn")

    let drawing = false
    let currentStroke = []
    strokes = [...strokes]

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        strokes.forEach(s => {
            ctx.beginPath()
            ctx.strokeStyle = s.color
            ctx.lineWidth = s.size
            if (s.points.length > 0) {
                ctx.moveTo(s.points[0].x, s.points[0].y)
                s.points.forEach(p => ctx.lineTo(p.x, p.y))
                ctx.stroke()
            }
        })
    }

    render()

    canvas.addEventListener("mousedown", e => {
        drawing = true
        currentStroke = [{ x: e.offsetX, y: e.offsetY }]
    })
    canvas.addEventListener("mousemove", e => {
        if (!drawing) return
        ctx.strokeStyle = brushColor.value
        ctx.lineWidth = brushSize.value
        ctx.lineTo(e.offsetX, e.offsetY)
        ctx.stroke()
        currentStroke.push({ x: e.offsetX, y: e.offsetY })
    })
    canvas.addEventListener("mouseup", () => {
        if (!drawing) return
        drawing = false
        strokes.push({ color: brushColor.value, size: brushSize.value, points: currentStroke })
    })
    canvas.addEventListener("mouseleave", () => { drawing = false })

    clearBtn.addEventListener("click", () => {
        strokes = []
        render()
    })

    // POST
    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            fetch("http://localhost:8070/drawings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ author_id: 1, drawing: strokes })
            }).then(res => res.json())
              .then(data => {
                  console.log("Saved:", data)
                  canvasDiv.remove()
                  createCanvas(strokes, data.id, false, boardsContainer)
              })
        })
    }

    // PUT
    if (updateBtn) {
        updateBtn.addEventListener("click", () => {
            fetch(`http://localhost:8070/drawings/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ drawing: strokes })
            }).then(res => res.json()).then(data => console.log("Updated:", data))
        })
    }

    // DELETE
    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
            fetch(`http://localhost:8070/drawings/${id}`, { method: "DELETE" })
                .then(res => res.json())
                .then(() => canvasDiv.remove())
        })
    }
}

// GET
fetch("http://localhost:8070/drawings")
    .then(res => res.json())
    .then(data => {
        data.forEach(d => {
            if (d.drawing && d.drawing.length > 0) {
                createCanvas(d.drawing, d.id, false, boardsContainer)
            }
        })
    })

// New drawing
newDrawingBtn.addEventListener("click", () => {
    createCanvas([], null, true, newDrawingContainer)
})
