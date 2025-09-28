// Drag and drop funktion för notes och drawings

function dragstartHandler(ev) {
    const el = ev.currentTarget
    if (!el.id) {
        el.id = `draggable-${Date.now()}`
    }
    ev.dataTransfer.setData("text/plain", el.id)
}

function dragoverHandler(ev) {
    ev.preventDefault()
}

function dropHandler(ev) {
    ev.preventDefault()
    const id = ev.dataTransfer.getData("text/plain")
    if (!id) return
    const elem = document.getElementById(id)
    if (!elem) return

    elem.style.position = "absolute"
    elem.style.zIndex = 1000
    elem.style.left = ev.pageX - elem.offsetWidth / 2 + "px"
    elem.style.top = ev.pageY - elem.offsetHeight / 2 + "px"

    if (elem.parentElement !== document.body) {
        document.body.appendChild(elem)
    }
}

document.body.addEventListener("dragover", dragoverHandler)
document.body.addEventListener("drop", dropHandler)

function initDragAndDrop() {
    document.querySelectorAll(".note, .canvas-container").forEach(el => {

        if (!el.id) {
            el.id = `draggable-${Date.now()}`
        }

        el.setAttribute("draggable", "true")
        el.removeEventListener("dragstart", dragstartHandler)
        el.addEventListener("dragstart", dragstartHandler)
    })
}

initDragAndDrop()