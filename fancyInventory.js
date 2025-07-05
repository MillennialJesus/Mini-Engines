const modifier = (text) => {
// inventory.js
// Fancy Modular Inventory Engine

function createInventory({
  initialItems = [],
  maxSlots = Infinity,
  maxWeight = Infinity,
  getItemWeight = (item) => item.weight ?? 0
} = {}) {
  let items = [...initialItems];

  function findItemIndex(name) {
    return items.findIndex(item => item.name?.toLowerCase() === name.toLowerCase());
  }

  function addItem(newItem, quantity = 1) {
    if (!newItem || !newItem.name) return false;
    const idx = findItemIndex(newItem.name);
    const weight = getItemWeight(newItem) * quantity;
    if (items.length >= maxSlots && idx === -1) return false;
    if (getTotalWeight() + weight > maxWeight) return false;
    if (idx === -1) {
      items.push({ ...newItem, quantity });
    } else {
      items[idx].quantity += quantity;
    }
    return true;
  }

  function removeItem(name, quantity = 1) {
    const idx = findItemIndex(name);
    if (idx === -1) return false;
    items[idx].quantity -= quantity;
    if (items[idx].quantity <= 0) items.splice(idx, 1);
    return true;
  }

  function getItem(name) {
    const idx = findItemIndex(name);
    return idx !== -1 ? { ...items[idx] } : null;
  }

  function hasItem(name, qty = 1) {
    const idx = findItemIndex(name);
    return idx !== -1 && items[idx].quantity >= qty;
  }

  function listItems() {
    // Returns a pretty string for display
    if (items.length === 0) return "Your inventory is empty.";
    return items.map(item => {
      let desc = item.description ? ` — ${item.description}` : "";
      let qty = item.quantity > 1 ? ` x${item.quantity}` : "";
      let w = getItemWeight(item) ? ` [${getItemWeight(item) * item.quantity} lbs]` : "";
      return `${item.name}${qty}${desc}${w}`;
    }).join("\n");
  }

  function getTotalWeight() {
    return items.reduce((sum, item) => sum + getItemWeight(item) * item.quantity, 0);
  }

  function getCapacity() {
    return {
      maxSlots,
      usedSlots: items.length,
      maxWeight,
      currentWeight: getTotalWeight()
    };
  }

  function clear() {
    items = [];
  }

  function toJSON() {
    return items.map(item => ({ ...item }));
  }

  function fromJSON(arr) {
    if (Array.isArray(arr)) items = arr.map(item => ({ ...item }));
  }

  function reset(startingItems = []) {
    items = [...startingItems];
  }

  // For direct access, if you want it
  function getRawItems() {
    return items.map(item => ({ ...item }));
  }

  return {
    addItem,
    removeItem,
    getItem,
    hasItem,
    listItems,
    getTotalWeight,
    getCapacity,
    clear,
    toJSON,
    fromJSON,
    reset,
    getRawItems,
  };
}

// Export for Node.js/CommonJS
if (typeof module !== "undefined" && module.exports) {
  module.exports = { createInventory };
}
  return text;
};