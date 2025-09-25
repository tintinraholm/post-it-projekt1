// Källor för ritfunktionen: W3schools och ChatGPT

const canvas = document.getElementById("drawing")
const ctx = canvas.getContext("2d")
const saveBtn = document.getElementById("saveBtn")
const updateBtn = document.getElementById("updateBtn")
const deleteBtn = document.getElementById("deleteBtn")

const brushColorPicker = document.getElementById("brushColor")
const brushSizeSlider = document.getElementById("brushSize")
const canvasColorPicker = document.getElementById("canvasColor")
const clearBtn = document.getElementById("clearBtn")

let drawing = false
let strokes = []
let currentStroke = []

fetch("http://localhost:8070/drawings/9")
    .then(res => res.json())
    .then(data => {
        const savedStrokes = data.drawing
        renderDrawing(savedStrokes)
    })
    .catch(err => console.error(err))

ctx.fillStyle = canvasColorPicker.value
ctx.fillRect(0, 0, canvas.width, canvas.height)

function startDrawing(e) {
    drawing = true
    currentStroke = [{ x: e.offsetX, y: e.offsetY }]
    ctx.beginPath()
    ctx.moveTo(e.offsetX, e.offsetY)
}

function draw(e) {
    if (!drawing) return
    ctx.strokeStyle = brushColorPicker.value
    ctx.lineWidth = brushSizeSlider.value
    ctx.lineCap = "round"
    ctx.lineTo(e.offsetX, e.offsetY)
    ctx.stroke()
    currentStroke.push({ x: e.offsetX, y: e.offsetY })
}

function stopDrawing() {
    if (!drawing) return
    drawing = false
    ctx.closePath()

    strokes.push({
        color: brushColorPicker.value,
        size: brushSizeSlider.value,
        points: currentStroke
    })
}

function renderDrawing(savedStrokes) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    savedStrokes.forEach(stroke => {
        ctx.beginPath()
        ctx.strokeStyle = stroke.color
        ctx.lineWidth = stroke.size
        ctx.lineCap = "round"

        const points = stroke.points
        if (points.length > 0) {
            ctx.moveTo(points[0].x, points[0].y)
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y)
            }
            ctx.stroke()
            ctx.closePath()
        }
    })
}

canvasColorPicker.addEventListener("input", () => {
    ctx.fillStyle = canvasColorPicker.value
    ctx.fillRect(0, 0, canvas.width, canvas.height)
})

clearBtn.addEventListener("click", () => {
    ctx.fillStyle = canvasColorPicker.value
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    strokes = []
})

canvas.addEventListener("mousedown", startDrawing)
canvas.addEventListener("mousemove", draw)
canvas.addEventListener("mouseup", stopDrawing)
canvas.addEventListener("mouseleave", stopDrawing)

saveBtn.addEventListener("click", () => {
    fetch("http://localhost:8070/drawings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            author_id: 1,
            drawing: strokes
        })
    })
        .then(res => res.json())
        .then(data => console.log("Saved drawing:", data))
        .catch(err => console.error(err))
})

updateBtn.addEventListener("click", () => {
    fetch("http://localhost:8070/drawings/8", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            drawing: strokes
        })
    })
        .then(res => res.json())
        .then(data => console.log("Updated drawing:", data))
        .catch(err => console.error(err))
})

deleteBtn.addEventListener("click", () => {
    fetch("http://localhost:8070/drawings/8", {
        method: "DELETE",
    })
        .then(res => res.json())
        .then(data => console.log("Deleted drawing:", data))
        .catch(err => console.error(err))
})