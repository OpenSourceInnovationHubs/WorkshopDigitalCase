// ============================================================================
// DATA MODELS
// ============================================================================

class House {
  constructor(id, blueprint = {}) {
    this.id = id;
    this.people = blueprint.people;
    this.address = blueprint.address;
    this.roof = null;
    this.battery = null;
    this.grid = null;
  }

  toJSON() {
    return {
      id: this.id,
      people: this.people,
      address: this.address,
      roof: this.roof,
      battery: this.battery,
      grid: this.grid,
    };
  }
}

class HouseBlueprint {
  constructor(data = {}) {
    this.type = "house";
    this.people = data.people || 1;
    this.address = data.address || {
      street: "Höchstädtplatz",
      number: "6",
      zipcode: "1200",
      city: "Vienna",
    };
  }

  toJSON() {
    return {
      type: this.type,
      people: this.people,
      address: this.address,
    };
  }
}

class RoofBlueprint {
  constructor(data = {}) {
    this.type = "roof";
    this.kilowatts = data.kilowatts || 5;
  }

  toJSON() {
    return {
      type: this.type,
      kilowatts: this.kilowatts,
    };
  }
}

class BatteryBlueprint {
  constructor(data = {}) {
    this.type = "battery";
    this.capacity = data.capacity || 15.0;
  }

  toJSON() {
    return {
      type: this.type,
      capacity: this.capacity,
    };
  }
}

class PoleBlueprint {
  constructor(data = {}) {
    this.type = "pole";
    this.gridId = data.gridId || -1;
  }

  toJSON() {
    return {
      type: this.type,
      gridId: this.gridId,
    };
  }
}

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

class StateManager {
  static STORAGE_KEY = "energy-system-state";

  constructor() {
    this.houses = new Map();
    this.elements = new Map(); // Store element positions and data
    this.blueprints = new Map();
    this.blueprints.set("house", new HouseBlueprint());
    this.blueprints.set("roof", new RoofBlueprint());
    this.blueprints.set("battery", new BatteryBlueprint());
    this.blueprints.set("pole", new PoleBlueprint());
    this.init();
  }

  init() {
    // Try to restore from localStorage first
    if (this.restoreFromStorage()) {
      return;
    }

    // Otherwise, initialize with existing HTML elements
    document.querySelectorAll(".house").forEach((el) => {
      const house = new House(el.id, this.blueprint);
      this.houses.set(el.id, house);
      this.captureElementState(el);
    });
  }

  findHouse(id) {
    return this.houses.get(id) || null;
  }

  addHouse(id) {
    const house = new House(id, this.blueprints.get("house"));
    this.houses.set(id, house);
    this.saveToStorage();
    return house;
  }

  removeHouse(id) {
    this.houses.delete(id);
    this.elements.delete(id);
    this.saveToStorage();
  }

  captureElementState(element) {
    if (!element || !element.id) return;

    const elementData = {
      id: element.id,
      type: this.getElementType(element),
      position: {
        x: parseFloat(element.getAttribute("data-x")) || 0,
        y: parseFloat(element.getAttribute("data-y")) || 0,
      },
      zIndex: element.style.zIndex || 1,
      classes: Array.from(element.classList),
      attributes: {},
    };

    // Capture specific attributes based on element type
    if (element.classList.contains("house")) {
      elementData.attributes.people = element.getAttribute("data-people");
      const bodyEl = element.querySelector(".body");
      if (bodyEl) {
        elementData.attributes.bodyText = bodyEl.innerText;
      }
    } else if (element.classList.contains("battery")) {
      elementData.attributes.percent =
        element.getAttribute("data-percent") || "50";
      const percentEl = element.children[0];
      if (percentEl) {
        elementData.attributes.percentText = percentEl.innerText;
      }
    }

    this.elements.set(element.id, elementData);
  }

  getElementType(element) {
    if (element.classList.contains("house")) return "house";
    if (element.classList.contains("roof")) return "roof";
    if (element.classList.contains("battery")) return "battery";
    if (element.classList.contains("pole")) return "pole";
    return "unknown";
  }

  getAllHouses() {
    return Array.from(this.houses.values()).map((h) => h.toJSON());
  }

  getAllElements() {
    return Array.from(this.elements.values());
  }

  getAllBlueprints() {
    return Object.fromEntries(this.blueprints);
  }

  setBlueprint(type, data) {
    if ("house" === type) {
      this.blueprints.set(type, new HouseBlueprint(data));
    }
    if ("roof" === type) {
      this.blueprints.set(type, new RoofBlueprint(data));
    }
    if ("battery" === type) {
      this.blueprints.set(type, new BatteryBlueprint(data));
    }
    if ("pole" === type) {
      this.blueprints.set(type, new PoleBlueprint(data));
    }
    this.saveToStorage();
  }

  saveToStorage() {
    try {
      // Capture all current element states
      document
        .querySelectorAll("#playground > div:not(#delete)")
        .forEach((el) => {
          this.captureElementState(el);
        });

      const stateData = {
        houses: this.getAllHouses(),
        elements: this.getAllElements(),
        blueprints: this.getAllBlueprints(),
        savedAt: new Date().toISOString(),
        version: "1.0",
      };

      localStorage.setItem(StateManager.STORAGE_KEY, JSON.stringify(stateData));
    } catch (err) {
      console.error("Failed to save state to localStorage:", err);
    }
  }

  restoreFromStorage() {
    try {
      const stored = localStorage.getItem(StateManager.STORAGE_KEY);
      if (!stored) return false;

      const stateData = JSON.parse(stored);

      // Clear existing playground elements (except delete zone)
      const playground = document.getElementById("playground");
      const deleteZone = document.getElementById("delete");
      playground
        .querySelectorAll(":scope > div:not(#delete)")
        .forEach((el) => el.remove());

      // Restore blueprint
      if (stateData.blueprints) {
        this.blueprints = new Map(Object.entries(stateData.blueprints));
      }

      // Restore houses
      if (stateData.houses && Array.isArray(stateData.houses)) {
        stateData.houses.forEach((houseData) => {
          const house = new House(houseData.id, houseData);
          house.roof = houseData.roof;
          house.battery = houseData.battery;
          house.grid = houseData.grid;
          this.houses.set(house.id, house);
        });
      }

      // Restore elements
      if (stateData.elements && Array.isArray(stateData.elements)) {
        stateData.elements.forEach((elementData) => {
          this.elements.set(elementData.id, elementData);
          this.recreateElement(elementData, playground);
        });
      }

      return true;
    } catch (err) {
      console.error("Failed to restore state from localStorage:", err);
      return false;
    }
  }

  recreateElement(elementData, playground) {
    const templateId = `${elementData.type}-template`;
    const template = document.getElementById(templateId);
    if (!template) {
      console.warn(`Template not found: ${templateId}`);
      return;
    }

    const element = template.content.cloneNode(true);
    const firstChild = element.firstElementChild;

    // Set ID and basic styles
    firstChild.id = elementData.id;
    firstChild.style.zIndex = elementData.zIndex;
    firstChild.style.transform = `translate(${elementData.position.x}px, ${elementData.position.y}px)`;
    firstChild.setAttribute("data-x", elementData.position.x);
    firstChild.setAttribute("data-y", elementData.position.y);

    // Restore classes
    elementData.classes.forEach((cls) => {
      if (!firstChild.classList.contains(cls)) {
        firstChild.classList.add(cls);
      }
    });

    // Restore attributes based on type
    if (elementData.type === "house" && elementData.attributes) {
      if (elementData.attributes.people) {
        firstChild.setAttribute("data-people", elementData.attributes.people);
      }
      const bodyEl = element.querySelector(".body");
      if (bodyEl && elementData.attributes.bodyText) {
        bodyEl.innerText = elementData.attributes.bodyText;
      }
    } else if (elementData.type === "battery" && elementData.attributes) {
      if (elementData.attributes.percent) {
        firstChild.setAttribute("data-percent", elementData.attributes.percent);
      }
      const percentEl = firstChild.children[0];
      if (percentEl && elementData.attributes.percentText) {
        percentEl.innerText = elementData.attributes.percentText;
      }
    }

    playground.appendChild(element);
  }

  clearStorage() {
    try {
      localStorage.removeItem(StateManager.STORAGE_KEY);
    } catch (err) {
      console.error("Failed to clear localStorage:", err);
    }
  }

  exportBlueprint(type) {
    return this.blueprints.get(type);
  }

  exportAllData() {
    return {
      houses: this.getAllHouses(),
      elements: this.getAllElements(),
      blueprint: this.getBlueprint(),
      exportDate: new Date().toISOString(),
      version: "1.0",
    };
  }

  importBlueprint(data) {
    if (data.type) {
      this.setBlueprint(data.type, data);
      return true;
    }
    return false;
  }
}

const state = new StateManager();

// ============================================================================
// DRAG & DROP UTILITIES
// ============================================================================

class DragManager {
  static updatePosition(element, dx, dy) {
    const x = (parseFloat(element.getAttribute("data-x")) || 0) + dx;
    const y = (parseFloat(element.getAttribute("data-y")) || 0) + dy;

    element.style.transform = `translate(${x}px, ${y}px)`;
    element.setAttribute("data-x", x);
    element.setAttribute("data-y", y);
  }

  static moveWithAttachments(target, dx, dy) {
    const house = state.findHouse(target.id);
    if (!house) return;

    const attachments = [
      { id: house.roof, zIndex: 100 },
      { id: house.battery, zIndex: 100 },
      { id: house.grid, zIndex: 100 },
    ];

    attachments.forEach(({ id, zIndex }) => {
      if (id) {
        const element = document.getElementById(id);
        if (element) {
          element.style.zIndex = zIndex;
          this.updatePosition(element, dx, dy);
        }
      }
    });
  }

  static reorderZIndex() {
    const elements = document.querySelectorAll("#playground > div");
    Array.from(elements)
      .sort((a, b) => (a.style.zIndex || 0) - (b.style.zIndex || 0))
      .forEach((el, i) => (el.style.zIndex = i + 1));
  }
}

// ============================================================================
// INTERACT.JS CONFIGURATION
// ============================================================================

class InteractConfig {
  static init() {
    this.setupDraggable();
    this.setupDropzones();
  }

  static setupDraggable() {
    // Unset any existing interact instances first
    interact("#playground > div:not(#delete)").unset();

    interact("#playground > div:not(#delete)").draggable({
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: "parent",
          endOnly: true,
        }),
      ],
      listeners: {
        move: (event) => {
          const target = event.target;
          target.style.zIndex = 99;
          DragManager.updatePosition(target, event.dx, event.dy);
          DragManager.moveWithAttachments(target, event.dx, event.dy);
        },
        end: () => {
          DragManager.reorderZIndex();
          state.saveToStorage();
        },
      },
    });
  }

  static refresh() {
    // Refresh interact.js bindings after DOM changes
    this.setupDraggable();
  }

  static setupDropzones() {
    this.createDropzone(
      ".roof-drop",
      ".roof",
      "roof",
      (target) => target.parentElement.id
    );
    this.createDropzone(
      ".battery-drop",
      ".battery",
      "battery",
      (target) => target.parentElement.parentElement.id
    );
    this.createDropzone(
      ".share-drop",
      ".pole",
      "grid",
      (target) => target.parentElement.parentElement.id
    );
    this.setupDeleteZone();
  }

  static createDropzone(selector, accept, property, getHouseId) {
    interact(selector).dropzone({
      accept: accept,
      overlap: 0.75,
      ondropactivate: (event) => {
        event.target.classList.add("drop-active");
        event.relatedTarget.classList.remove("dropped");
      },
      ondragenter: (event) => {
        event.target.classList.add("drop-target");
        event.relatedTarget.classList.add("can-drop");
      },
      ondragleave: (event) => {
        const element = event.relatedTarget;
        const houseId = getHouseId(event.target);

        event.target.classList.remove("drop-target");
        element.classList.remove("can-drop", "dropped");

        const house = state.findHouse(houseId);
        if (house) {
          house[property] = null;
          state.saveToStorage();
        }
      },
      ondrop: (event) => {
        const element = event.relatedTarget;
        const houseId = getHouseId(event.target);

        element.classList.remove("can-drop");
        element.classList.add("dropped");

        const house = state.findHouse(houseId);
        if (house) {
          house[property] = element.id;
          state.saveToStorage();
        }
      },
      ondropdeactivate: (event) => {
        event.target.classList.remove("drop-active", "drop-target");
      },
    });
  }

  static setupDeleteZone() {
    interact("#delete").dropzone({
      accept: "#playground > div:not(#delete)",
      overlap: 0.75,
      ondropactivate: (event) => {
        event.target.classList.add("drop-active");
        event.relatedTarget.classList.remove("dropped");
      },
      ondragenter: (event) => {
        event.target.classList.add("drop-target");
        event.relatedTarget.classList.add("can-drop");
      },
      ondragleave: (event) => {
        event.target.classList.remove("drop-target");
        event.relatedTarget.classList.remove("can-drop", "dropped");
      },
      ondrop: (event) => {
        const element = event.relatedTarget;
        element.remove();
        state.removeHouse(element.id);
      },
      ondropdeactivate: (event) => {
        event.target.classList.remove("drop-active", "drop-target");
      },
    });
  }
}

// ============================================================================
// ELEMENT SPAWNING
// ============================================================================

class ElementSpawner {
  static init() {
    document.querySelectorAll(".element").forEach((element) => {
      element.addEventListener("click", this.onAddElement.bind(this));
    });
  }

  static onAddElement(event) {
    const btn = event.target;
    const templateId = btn.getAttribute("data-element");
    const template = document.getElementById(templateId);
    const element = template.content.cloneNode(true);
    const firstChild = element.firstElementChild;

    firstChild.style.zIndex = 100;
    firstChild.id = Date.now().toString();

    if (templateId.includes("house")) {
      const house = state.addHouse(firstChild.id);
      firstChild.setAttribute("data-people", house.people);
      const bodyEl = element.querySelector(".body");
      if (bodyEl) {
        bodyEl.innerText = house.address.street;
      }
    }

    document.getElementById("playground").appendChild(element);
    state.captureElementState(firstChild);
    state.saveToStorage();

    // Refresh interact.js bindings for new element
    InteractConfig.refresh();
  }
}

// ============================================================================
// FILE I/O
// ============================================================================

class FileManager {
  static init() {
    this.setupDownload();
    this.setupUpload();
  }

  static setupDownload() {
    document.querySelectorAll(".download").forEach((element) => {
      element.addEventListener("click", this.downloadJSON.bind(this));
    });
  }

  static downloadJSON(event) {
    let btn = event.target;
    if (btn.tagName === "SPAN") {
      btn = btn.parentElement;
    }

    const dataType = btn.getAttribute("data-json");
    let data, filename;

    if ((data = state.exportBlueprint(dataType))) {
      // Download blueprint
      filename = `${dataType}-blueprint.json`;
    } else {
      console.warn(`${dataType} blueprint not found`);
      return;
    }

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static setupUpload() {
    const dropZone = document.getElementById("upload");
    if (!dropZone) return;

    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      dropZone.addEventListener(eventName, (e) => e.preventDefault());
      document.body.addEventListener(eventName, (e) => e.preventDefault());
    });

    ["dragenter", "dragover"].forEach((eventName) => {
      dropZone.addEventListener(eventName, () =>
        dropZone.classList.add("dragover")
      );
    });

    ["dragleave", "drop"].forEach((eventName) => {
      dropZone.addEventListener(eventName, () =>
        dropZone.classList.remove("dragover")
      );
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

        if (state.importBlueprint(jsonData)) {
          alert(
            "Blueprint loaded successfully! New houses will use this configuration."
          );
        } else {
          alert("Invalid blueprint format!");
        }
      } catch (err) {
        alert("Error reading JSON file: " + err.message);
      }
    });
  }
}

// ============================================================================
// ENERGY MANAGEMENT
// ============================================================================

class EnergyManager {
  static BATTERY_DRAIN = 1;
  static BATTERY_CHARGE = 2;
  static UPDATE_INTERVAL = 1000;

  static init() {
    setInterval(() => this.update(), this.UPDATE_INTERVAL);
  }

  static update() {
    state.houses.forEach((house, id) => {
      const element = document.getElementById(id);
      if (!element) return;

      this.updateBattery(house, element);
      this.updateLighting(house, element);
    });
  }

  static updateBattery(house, element) {
    if (!house.battery) return;

    const battery = document.getElementById(house.battery);
    if (!battery) return;

    let percent = parseInt(battery.getAttribute("data-percent")) || 0;

    // Drain battery if it has charge
    if (percent > 0) {
      percent = Math.max(0, percent - this.BATTERY_DRAIN);
      battery.setAttribute("data-percent", percent);
      battery.children[0].innerText = `${percent}%`;
    }

    // Charge battery from roof if available
    if (house.roof && percent < 100) {
      percent = Math.min(100, percent + this.BATTERY_CHARGE);
      battery.setAttribute("data-percent", percent);
      battery.children[0].innerText = `${percent}%`;
    }
  }

  static updateLighting(house, element) {
    const hasPower = house.battery || house.roof || house.grid;

    if (hasPower) {
      // Check if battery exists and has charge
      if (house.battery) {
        const battery = document.getElementById(house.battery);
        const percent = parseInt(battery?.getAttribute("data-percent")) || 0;
        if (percent > 0 || house.roof || house.grid) {
          element.classList.add("light");
        } else {
          element.classList.remove("light");
        }
      } else {
        element.classList.add("light");
      }
    } else {
      element.classList.remove("light");
    }
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  InteractConfig.init();
  ElementSpawner.init();
  FileManager.init();
  EnergyManager.init();

  // Refresh interact.js bindings after state restoration
  if (state.elements.size > 0) {
    InteractConfig.refresh();
  }
});
