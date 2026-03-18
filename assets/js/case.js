// data
var house = {
    "people": 1,
    "address": {
        "street": "Höchstädtplatz",
        "number": "6",
        "zipcode": "1200",
        "city": "Vienna"
    }
}

const houses = []
document.querySelectorAll('.house')
    .forEach(el => {
        const id = el.id

        houses.push(createHouse(id))
    })

function findHouse(id) {
    const house = houses.find(item => item.id === id)
    return house || null;
}

function createHouse(id) {
    let newHouse = {
        'id': id,
        'roof': null,
        'battery': null,
        'grid': null
    }
    return {...house, ...newHouse}
}

function drag(element, dx, dy) {
    const x = (parseFloat(element.getAttribute('data-x')) || 0) + dx
    const y = (parseFloat(element.getAttribute('data-y')) || 0) + dy

    // translate the element
    element.style.transform = 'translate(' + x + 'px, ' + y + 'px)'

    // update the position attributes
    element.setAttribute('data-x', x)
    element.setAttribute('data-y', y)
}

// interact.js Setup
function dragMoveListener(event) {
    const target = event.target

    // move element to top
    target.style.zIndex = 99
    drag(target, event.dx, event.dy)

    // move elements with house
    const house = findHouse(target.id)
    if (house && house.roof) {
        const roofId = house.roof
        const roof = document.getElementById(roofId)
        roof.style.zIndex = 100
        drag(roof, event.dx, event.dy)
    }

    if (house && house.battery) {
        const batteryId = house.battery
        const battery = document.getElementById(batteryId)
        battery.style.zIndex = 100
        drag(battery, event.dx, event.dy)
    }

    if (house && house.grid) {
        const poleId = house.grid
        const pole = document.getElementById(poleId)
        pole.style.zIndex = 100
        drag(pole, event.dx, event.dy)
    }
}

function dragEndListener(event) {
    const others = document.querySelectorAll('#playground > div')

    // sort z-index 
    Array.from(others)
        .sort((a, b) => a.style.zIndex - b.style.zIndex)
        .forEach((el, i) => el.style.zIndex = i + 1) 
}

interact('#playground > div:not(#delete)')
    .draggable({
        modifiers: [
            interact.modifiers.restrictRect({
                restriction: 'parent',
                endOnly: true
            })
        ], 

        listeners: {
            move: dragMoveListener,
            end: dragEndListener
        }
    })

interact('.roof-drop')
    .dropzone({
        accept: '.roof',
        overlap: 0.75,

        ondropactivate: function (event) {
            event.target.classList.add('drop-active');
            event.relatedTarget.classList.remove('dropped')
        },
        ondragenter: function (event) {
            var draggableElement = event.relatedTarget
            var dropzoneElement = event.target
            dropzoneElement.classList.add('drop-target')
            draggableElement.classList.add('can-drop')
        },
        ondragleave: function (event) {
            const roof = event.relatedTarget
            const houseId = event.target.parentElement.id

            event.target.classList.remove('drop-target')
            roof.classList.remove('can-drop')
            roof.classList.remove('dropped')

            const house = findHouse(houseId)
            house.roof = null
        },
        ondrop: function (event) {
            const roof = event.relatedTarget
            const houseId = event.target.parentElement.id
            
            roof.classList.remove('can-drop')
            roof.classList.add('dropped')

            const house = findHouse(houseId)
            house.roof = roof.id
        },
        ondropdeactivate: function (event) {
            event.target.classList.remove('drop-active')
            event.target.classList.remove('drop-target')
        }
    })

interact('.battery-drop')
    .dropzone({
        accept: '.battery',
        overlap: 0.75,

        ondropactivate: function (event) {
            event.target.classList.add('drop-active');
            event.relatedTarget.classList.remove('dropped')
        },
        ondragenter: function (event) {
            var draggableElement = event.relatedTarget
            var dropzoneElement = event.target
            dropzoneElement.classList.add('drop-target')
            draggableElement.classList.add('can-drop')
        },
        ondragleave: function (event) {
            const battery = event.relatedTarget
            const houseId = event.target.parentElement.parentElement.id

            event.target.classList.remove('drop-target')
            battery.classList.remove('can-drop')
            battery.classList.remove('dropped')

            const house = findHouse(houseId)
            house.battery = null
        },
        ondrop: function (event) {
            const battery = event.relatedTarget
            const houseId = event.target.parentElement.parentElement.id
            
            battery.classList.remove('can-drop')
            battery.classList.add('dropped')

            const house = findHouse(houseId)
            house.battery = battery.id
        },
        ondropdeactivate: function (event) {
            event.target.classList.remove('drop-active')
            event.target.classList.remove('drop-target')
        }
    })

interact('.share-drop')
    .dropzone({
        accept: '.pole',
        overlap: 0.75,

        ondropactivate: function (event) {
            event.target.classList.add('drop-active');
            event.relatedTarget.classList.remove('dropped')
        },
        ondragenter: function (event) {
            var draggableElement = event.relatedTarget
            var dropzoneElement = event.target
            dropzoneElement.classList.add('drop-target')
            draggableElement.classList.add('can-drop')
        },
        ondragleave: function (event) {
            const pole = event.relatedTarget
            const houseId = event.target.parentElement.parentElement.id

            event.target.classList.remove('drop-target')
            pole.classList.remove('can-drop')
            pole.classList.remove('dropped')

            const house = findHouse(houseId)
            house.grid = null
        },
        ondrop: function (event) {
            const pole = event.relatedTarget
            const houseId = event.target.parentElement.parentElement.id
            
            pole.classList.remove('can-drop')
            pole.classList.add('dropped')

            const house = findHouse(houseId)
            house.grid = pole.id
        },
        ondropdeactivate: function (event) {
            event.target.classList.remove('drop-active')
            event.target.classList.remove('drop-target')
        }
    })

interact('#delete')
    .dropzone({
        accept: '#playground > div:not(#delete)',
        overlap: 0.75,

        ondropactivate: function (event) {
            event.target.classList.add('drop-active');
            event.relatedTarget.classList.remove('dropped')
        },
        ondragenter: function (event) {
            var draggableElement = event.relatedTarget
            var dropzoneElement = event.target
            dropzoneElement.classList.add('drop-target')
            draggableElement.classList.add('can-drop')
        },
        ondragleave: function (event) {
            const element = event.relatedTarget

            event.target.classList.remove('drop-target')
            element.classList.remove('can-drop')
            element.classList.remove('dropped')
        },
        ondrop: function (event) {
            const element = event.relatedTarget

            element.remove()
        },
        ondropdeactivate: function (event) {
            event.target.classList.remove('drop-active')
            event.target.classList.remove('drop-target')
        }
    })

// Spawn Elements
const playground = document.getElementById('playground')

function onAddElementClick(event) {
    const btn = event.target
    const templateId = btn.getAttribute('data-element')
    const template = document.getElementById(templateId)
    const element = template.content.cloneNode(true)

    // set initial high z-index
    element.firstElementChild.style.zIndex = 100
    element.firstElementChild.id = Date.now().toString()

    if (templateId.includes('house')) {
        const house = createHouse(element.firstElementChild.id)
        houses.push(house)
        element.firstElementChild.setAttribute('data-people', house.people)
        element.querySelector('.body').innerText = house.address.street
    }
    
    playground.appendChild(element)
}

document.querySelectorAll('.element').forEach(element => {
    element.addEventListener('click', onAddElementClick)
});

// Download JSON
function onDownloadClick(event) {
    let btn = event.target
    if (btn.tagName === "SPAN") {
        btn = btn.parentElement
    }
    const json = btn.getAttribute('data-json')

    // Convert JSON object to string
    const jsonStr = JSON.stringify(house, null, 2);

    // Create a Blob from the string
    const blob = new Blob([jsonStr], { type: "application/json" });

    // Create a temporary link
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "house.json";

    // Append link, trigger click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log(json)
}

document.querySelectorAll('.download').forEach(element => {
    element.addEventListener('click', onDownloadClick)
});

// Upload JSON
const dropZone = document.getElementById("upload");

["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    dropZone.addEventListener(eventName, e => e.preventDefault());
    document.body.addEventListener(eventName, e => e.preventDefault());
});

// Highlight when dragging over
["dragenter", "dragover"].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add("dragover"));
});

["dragleave", "drop"].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove("dragover"));
});

dropZone.addEventListener("drop", async (e) => {
    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (file.type !== "application/json") {
        alert("Please drop a valid JSON file!");
        return;
    }

    try {
        const text = await file.text();
        const jsonData = JSON.parse(text);

        house = jsonData
    } catch (err) {
        alert("Error reading JSON file: " + err.message);
    }
});

// energy management
function loop() {
    houses.forEach(element => {
        const house = document.getElementById(element.id)

        if (element.battery) {
            const batteryId = element.battery
            const battery = document.getElementById(batteryId)

            let percent = parseInt(battery.getAttribute('data-percent'))
            if (percent > 0) {
                house.classList.add('light')
                battery.setAttribute('data-percent', percent - 1)     
                battery.children[0].innerText = (percent - 1) + '%'
            } else {
                house.classList.remove('light')
            }

            if (element.roof && percent < 100) {
                percent = parseInt(battery.getAttribute('data-percent'))
                battery.setAttribute('data-percent', Math.min(100, (percent + 2)))
                battery.children[0].innerText = (Math.min(100, (percent + 2))) + '%'
            }
        } else {
            house.classList.remove('light')
        }

        if (element.roof) {
            house.classList.add('light')
        }

        if (element.grid) {
            house.classList.add('light')
        }
    })
}

setInterval(loop, 1000);
