// Drag and drop funktion för notes och drawings

function dragstartHandler(ev) {
    ev.dataTransfer.setData("text/plain", ev.currentTarget.id)
}

function dragoverHandler(ev) {
    ev.preventDefault()
}

function dropHandler(ev) {
    ev.preventDefault()
    const id = ev.dataTransfer.getData("text/plain")
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
        el.setAttribute("draggable", "true")
        el.addEventListener("dragstart", dragstartHandler)
    })
}

initDragAndDrop()