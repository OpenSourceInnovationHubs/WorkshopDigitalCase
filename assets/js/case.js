const elementsData = {}

function getDefaultData(type) {
    switch (type) {
        case "house":
            return {
                type: "house",
                people: 1,
                address: { street: "Höchstädtplatz", number: "6", zipcode: "1200", city: "Vienna" },
                roof: null,
                battery: null,
                grid: null
            }
        case "roof":
            return { type: "roof", power: 5, tilt: 30 }
        case "battery":
            return { type: "battery", capacity: 100, percent: 100 }
        case "grid":
            return { type: "grid", importPrice: 0.3, exportPrice: 0.1 }
    }
}

function applyDataToDom(id) {
    const data = elementsData[id]
    if (!data) return
    const el = document.getElementById(id)
    if (!el) return

    switch (data.type) {
        case "house":
            el.setAttribute("data-people", data.people)
            el.querySelector(".body").innerText = data.address.street
            break
        case "roof":
            el.querySelector("p").innerText = `${data.power}kW, ${data.tilt}°`
            break
        case "battery":
            el.setAttribute("data-percent", data.percent)
            el.querySelector("p").innerText = `${data.percent}%`
            break
        case "grid":
            el.querySelector("p").innerText = `Import ${data.importPrice}/Export ${data.exportPrice}`
            break
    }
}

function drag(element, dx, dy) {
    const x = (parseFloat(element.getAttribute("data-x")) || 0) + dx
    const y = (parseFloat(element.getAttribute("data-y")) || 0) + dy

    element.style.transform = "translate(" + x + "px, " + y + "px)"
    element.setAttribute("data-x", x)
    element.setAttribute("data-y", y)
}

// interact.js Setup
function dragMoveListener(event) {
    const target = event.target

    target.style.zIndex = 99
    drag(target, event.dx, event.dy)

    const data = elementsData[target.id]
    if (data && data.type === "house") {
        if (data.roof) {
            const roof = document.getElementById(data.roof)
            if (roof) {
                roof.style.zIndex = 100
                drag(roof, event.dx, event.dy)
            }
        }
        if (data.battery) {
            const battery = document.getElementById(data.battery)
            if (battery) {
                battery.style.zIndex = 100
                drag(battery, event.dx, event.dy)
            }
        }
        if (data.grid) {
            const grid = document.getElementById(data.grid)
            if (grid) {
                grid.style.zIndex = 100
                drag(grid, event.dx, event.dy)
            }
        }
    }
}

function dragEndListener(event) {
    const others = document.querySelectorAll("#playground > div")

    Array.from(others)
        .sort((a, b) => a.style.zIndex - b.style.zIndex)
        .forEach((el, i) => el.style.zIndex = i + 1)
}

interact("#playground > div:not(#delete)")
    .draggable({
        modifiers: [
            interact.modifiers.restrictRect({
                restriction: "parent",
                endOnly: true
            })
        ],
        listeners: {
            move: dragMoveListener,
            end: dragEndListener
        }
    })

// Drop zones
interact(".roof-drop")
    .dropzone({
        accept: ".roof",
        overlap: 0.75,

        ondropactivate: function (event) {
            event.target.classList.add("drop-active");
            event.relatedTarget.classList.remove("dropped")
        },
        ondragenter: function (event) {
            var draggableElement = event.relatedTarget
            var dropzoneElement = event.target
            dropzoneElement.classList.add("drop-target")
            draggableElement.classList.add("can-drop")
        },
        ondragleave: function (event) {
            const roof = event.relatedTarget
            const houseId = event.target.parentElement.id

            event.target.classList.remove("drop-target")
            roof.classList.remove("can-drop")
            roof.classList.remove("dropped")

            if (elementsData[houseId]) {
                elementsData[houseId].roof = null
            }
        },
        ondrop: function (event) {
            const roof = event.relatedTarget
            const houseId = event.target.parentElement.id

            roof.classList.remove("can-drop")
            roof.classList.add("dropped")

            if (elementsData[houseId]) {
                elementsData[houseId].roof = roof.id
            }
        },
        ondropdeactivate: function (event) {
            event.target.classList.remove("drop-active")
            event.target.classList.remove("drop-target")
        }
    })

interact(".battery-drop")
    .dropzone({
        accept: ".battery",
        overlap: 0.75,

        ondropactivate: function (event) {
            event.target.classList.add("drop-active");
            event.relatedTarget.classList.remove("dropped")
        },
        ondragenter: function (event) {
            var draggableElement = event.relatedTarget
            var dropzoneElement = event.target
            dropzoneElement.classList.add("drop-target")
            draggableElement.classList.add("can-drop")
        },
        ondragleave: function (event) {
            const battery = event.relatedTarget
            const houseId = event.target.parentElement.parentElement.id

            event.target.classList.remove("drop-target")
            battery.classList.remove("can-drop")
            battery.classList.remove("dropped")

            if (elementsData[houseId]) {
                elementsData[houseId].battery = null
            }
        },
        ondrop: function (event) {
            const battery = event.relatedTarget
            const houseId = event.target.parentElement.parentElement.id

            battery.classList.remove("can-drop")
            battery.classList.add("dropped")

            if (elementsData[houseId]) {
                elementsData[houseId].battery = battery.id
            }
        },
        ondropdeactivate: function (event) {
            event.target.classList.remove("drop-active")
            event.target.classList.remove("drop-target")
        }
    })

interact(".share-drop")
    .dropzone({
        accept: ".pole",
        overlap: 0.75,

        ondropactivate: function (event) {
            event.target.classList.add("drop-active");
            event.relatedTarget.classList.remove("dropped")
        },
        ondragenter: function (event) {
            var draggableElement = event.relatedTarget
            var dropzoneElement = event.target
            dropzoneElement.classList.add("drop-target")
            draggableElement.classList.add("can-drop")
        },
        ondragleave: function (event) {
            const pole = event.relatedTarget
            const houseId = event.target.parentElement.parentElement.id

            event.target.classList.remove("drop-target")
            pole.classList.remove("can-drop")
            pole.classList.remove("dropped")

            if (elementsData[houseId]) {
                elementsData[houseId].grid = null
            }
        },
        ondrop: function (event) {
            const pole = event.relatedTarget
            const houseId = event.target.parentElement.parentElement.id

            pole.classList.remove("can-drop")
            pole.classList.add("dropped")

            if (elementsData[houseId]) {
                elementsData[houseId].grid = pole.id
            }
        },
        ondropdeactivate: function (event) {
            event.target.classList.remove("drop-active")
            event.target.classList.remove("drop-target")
        }
    })

interact("#delete")
    .dropzone({
        accept: "#playground > div:not(#delete)",
        overlap: 0.75,

        ondropactivate: function (event) {
            event.target.classList.add("drop-active");
            event.relatedTarget.classList.remove("dropped")
        },
        ondragenter: function (event) {
            var draggableElement = event.relatedTarget
            var dropzoneElement = event.target
            dropzoneElement.classList.add("drop-target")
            draggableElement.classList.add("can-drop")
        },
        ondragleave: function (event) {
            const element = event.relatedTarget

            event.target.classList.remove("drop-target")
            element.classList.remove("can-drop")
            element.classList.remove("dropped")
        },
        ondrop: function (event) {
            const el = event.relatedTarget

            for (const id in elementsData) {
                const d = elementsData[id]
                if (d.roof === el.id) d.roof = null
                if (d.battery === el.id) d.battery = null
                if (d.grid === el.id) d.grid = null
            }
            delete elementsData[el.id]
            if (selectedElementId === el.id) {
                selectElement(null)
            }
            el.remove()
        },
        ondropdeactivate: function (event) {
            event.target.classList.remove("drop-active")
            event.target.classList.remove("drop-target")
        }
    })

// Spawn Elements
const playground = document.getElementById("playground")

function onAddElementClick(event) {
    const btn = event.target
    const templateId = btn.getAttribute("data-element")
    const template = document.getElementById(templateId)
    const element = template.content.cloneNode(true)

    const el = element.firstElementChild
    el.style.zIndex = 100
    el.id = Date.now().toString()

    const type = btn.innerText.toLowerCase().includes("pv") ? "roof" : templateId.replace("-template", "")
    const data = getDefaultData(type)
    elementsData[el.id] = data

    playground.appendChild(element)
    applyDataToDom(el.id)
}

document.querySelectorAll(".element").forEach(element => {
    element.addEventListener("click", onAddElementClick)
})

// Selection
let selectedElementId = null

function selectElement(id) {
    document.querySelectorAll(".selected").forEach(el => el.classList.remove("selected"))
    selectedElementId = id
    if (id) {
        const el = document.getElementById(id)
        if (el) el.classList.add("selected")
        const data = elementsData[id]
        if (data) {
            header.innerText = `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} (${id})`
            internalUpdate = true
            editor.setValue(JSON.stringify(data, null, 2))
            internalUpdate = false
        }
    } else {
        header.innerText = "Select an element to edit"
        editor.setValue("")
    }
}

playground.addEventListener("click", event => {
    const el = event.target.closest("#playground > div:not(#delete)")
    if (el) {
        selectElement(el.id)
    }
})

// CodeMirror
const textarea = document.getElementById("json-editor")
const editor = CodeMirror.fromTextArea(textarea, {
    lineNumbers: true,
    mode: { name: "javascript", json: true },
    theme: "monokai",
    autoCloseBrackets: true,
    matchBrackets: true,
    indentUnit: 2,
    tabSize: 2
})

const header = document.getElementById("editor-header")
let internalUpdate = false
let editorTimer = null

editor.on("change", () => {
    if (internalUpdate) return
    clearTimeout(editorTimer)
    editorTimer = setTimeout(() => {
        if (!selectedElementId) return
        try {
            const newData = JSON.parse(editor.getValue())
            elementsData[selectedElementId] = newData
            applyDataToDom(selectedElementId)
        } catch (e) {
            // invalid JSON, skip
        }
    }, 300)
})

// energy management
function loop() {
    for (const id in elementsData) {
        const data = elementsData[id]
        if (data.type !== "house") continue

        const house = document.getElementById(id)
        if (!house) continue

        if (data.battery) {
            const batteryData = elementsData[data.battery]
            if (batteryData) {
                if (batteryData.percent > 0) {
                    house.classList.add("light")
                    const drain = data.people * (100 / batteryData.capacity)
                    batteryData.percent = Math.max(0, +(batteryData.percent - drain).toFixed(1))
                } else {
                    house.classList.remove("light")
                }

                if (data.roof && batteryData.percent < 100) {
                    const roofData = elementsData[data.roof]
                    const rate = roofData ? Math.max(0, Math.round(roofData.power * (1 - Math.abs(roofData.tilt - 35) / 90))) : 2
                    batteryData.percent = Math.min(100, batteryData.percent + rate)
                }

                applyDataToDom(data.battery)
                if (selectedElementId === data.battery) {
                    internalUpdate = true
                    editor.setValue(JSON.stringify(batteryData, null, 2))
                    internalUpdate = false
                }
            }
        } else {
            house.classList.remove("light")
        }

        if (data.roof) {
            const roofData = elementsData[data.roof]
            if (roofData && roofData.power > 0) {
                house.classList.add("light")
            }
        }

        if (data.grid) {
            house.classList.add("light")
        }
    }
}

setInterval(loop, 1000)
