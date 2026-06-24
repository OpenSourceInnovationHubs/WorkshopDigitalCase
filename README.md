# Digital FIWARE Workshop Case

An interactive drag-and-drop energy system builder. Spawn houses, solar roofs, batteries, and grid connections onto a canvas, then watch the simulation run. Edit any element's properties via a live JSON editor and see changes instantly.

## How it works

1. **Spawn elements** — click House, PV Roof, Battery, or Grid in the toolbar
2. **Connect them** — drag a roof onto a house's roof slot, a battery into its battery slot, or a grid pole into the share slot
3. **Drag to position** — move elements freely on the canvas; connected parts follow the house
4. **Edit JSON** — click any element to open its JSON in the right panel. Edit values and the canvas updates live
5. **Delete** — drag an element onto the red delete zone in the bottom-right

## Data model

Each element stores its state as JSON. The simulation reads these values every second.

| Element | JSON | Poperties |
|---------|------|-----------|
| **House** | `{ type, people, address, roof, battery, grid }` | `people` controls energy drain. `address.street` is shown on the house body. `roof`, `battery`, `grid` reference connected element IDs |
| **PV Roof** | `{ type, power, tilt }` | `power` (kW) and `tilt` (degrees) determine charging speed. Optimal tilt is ~35° |
| **Battery** | `{ type, capacity, percent }` | `capacity` scales how fast the percentage drains. `percent` is the current charge |
| **Grid** | `{ type, importPrice, exportPrice }` | Display values for energy pricing (visual only) |

## Value interactions

- **People → drain rate:** `drain = people × (100 / battery.capacity)`. More people = faster drain. Higher capacity = slower % drain
- **Roof → charge rate:** `rate = round(power × (1 − |tilt − 35| / 90))`. More power = faster charging. Deviation from 35° reduces efficiency
- **Grid → backup:** keeps the house lit even when the battery is empty

## Tech stack

- Vanilla JavaScript
- [interact.js](https://interactjs.io/) — drag & drop and touch support
- [CodeMirror](https://codemirror.net/) — JSON editor with syntax highlighting
