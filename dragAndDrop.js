// Drag and drop funktion för notes och drawings

function dragstartHandler(ev) {
    ev.dataTransfer.setData("text", ev.currentTarget.id)
}

function dragoverHandler(ev) {
    ev.preventDefault()
}

function dropHandler(ev) {
    ev.preventDefault()
    const id = ev.dataTransfer.getData("text")
    const elem = document.getElementById(id)

    const rect = ev.currentTarget.getBoundingClientRect()
    elem.style.position = "absolute"
    elem.style.left = (ev.clientX - rect.left) + "px"
    elem.style.top = (ev.clientY - rect.top) + "px"

    ev.currentTarget.appendChild(elem)
}