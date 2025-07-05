const modifier = (text) => {
// locationHandler-fancy.js
// Modular, extensible location engine for RPGs/AI Dungeon

function createLocationHandler({
  logEnabled = true,
  maxHistory = 25,
} = {}) {
  let locations = [];
  let locationMap = new Map();
  let history = [];
  let currentLocation = null;

  function log(str) {
    if (logEnabled) history.push(`[${new Date().toLocaleString()}] ${str}`);
    if (history.length > maxHistory) history.shift();
  }

  // Add/register a location
  // { id, name, description, keywords, biome, hidden, locked, entryHook, exitHook, requirement }
  function addLocation(loc) {
    if (!loc.id) throw new Error("Location must have an id");
    if (!loc.name) loc.name = loc.id;
    if (!Array.isArray(loc.keywords)) loc.keywords = [loc.name];
    loc.hidden = loc.hidden ?? false;
    loc.locked = loc.locked ?? false;
    locationMap.set(loc.id, loc);
    locations.push(loc);
    log(`Added location: ${loc.name}`);
  }

  // Find a location by id or keyword (case-insensitive)
  function findLocation(query) {
    if (!query) return null;
    let byId = locationMap.get(query);
    if (byId) return byId;
    const norm = q => q.toLowerCase();
    return locations.find(loc =>
      loc.keywords.some(k => norm(k) === norm(query)) ||
      norm(loc.name) === norm(query)
    ) || null;
  }

  // Get all available locations (filter hidden/locked)
  function getAvailable({ showHidden = false, showLocked = false, biome = null } = {}) {
    return locations.filter(loc => {
      if (!showHidden && loc.hidden) return false;
      if (!showLocked && loc.locked) return false;
      if (biome && loc.biome !== biome) return false;
      return true;
    });
  }

  // Move to a new location (by id/keyword)
  function travelTo(query, player = null) {
    const loc = findLocation(query);
    if (!loc) {
      log(`Location not found: ${query}`);
      return { success: false, error: "Location not found." };
    }
    if (loc.locked && (!loc.requirement || !loc.requirement(player))) {
      log(`Location locked: ${loc.name}`);
      return { success: false, error: "Location is locked." };
    }
    if (currentLocation && typeof currentLocation.exitHook === "function") {
      currentLocation.exitHook(player, loc);
    }
    currentLocation = loc;
    if (typeof loc.entryHook === "function") loc.entryHook(player, loc);
    log(`Traveled to ${loc.name}`);
    return { success: true, location: loc };
  }

  // Lock/unlock/hide/unhide a location
  function lockLocation(id)   { let l = findLocation(id); if(l) l.locked = true; }
  function unlockLocation(id) { let l = findLocation(id); if(l) l.locked = false; }
  function hideLocation(id)   { let l = findLocation(id); if(l) l.hidden = true; }
  function unhideLocation(id) { let l = findLocation(id); if(l) l.hidden = false; }

  // Get/set current location
  function getCurrentLocation() { return currentLocation; }
  function setCurrentLocation(idOrKeyword, player = null) {
    return travelTo(idOrKeyword, player);
  }

  // Location history
  function getHistory() { return [...history]; }

  // For saving/loading
  function toJSON() {
    return {
      locations: JSON.parse(JSON.stringify(locations)),
      currentLocation: currentLocation ? currentLocation.id : null,
      history: [...history]
    };
  }
  function fromJSON(data) {
    if (!data) return;
    locations = JSON.parse(JSON.stringify(data.locations));
    locationMap = new Map(locations.map(loc => [loc.id, loc]));
    history = [...data.history];
    currentLocation = data.currentLocation ? findLocation(data.currentLocation) : null;
  }

  return {
    addLocation,
    findLocation,
    getAvailable,
    travelTo,
    lockLocation,
    unlockLocation,
    hideLocation,
    unhideLocation,
    getCurrentLocation,
    setCurrentLocation,
    getHistory,
    toJSON,
    fromJSON,
  };
}

// Export for Node/CommonJS
if (typeof module !== "undefined" && module.exports) {
  module.exports = { createLocationHandler };
}

  return text;
};