const modifier = (text) => {
// randomEncounter-fancy.js
// Modular weighted random encounter engine for RPGs/AI scenarios

function createRandomEncounterSystem({
  logEnabled = true,
  allowRepeats = false,
  maxHistory = 25,
} = {}) {
  let encounters = [];
  let encounterHistory = [];

  function log(str) {
    if (logEnabled) encounterHistory.push(`[${new Date().toLocaleString()}] ${str}`);
    if (encounterHistory.length > maxHistory) encounterHistory.shift();
  }

  // Add an encounter
  // Example: { id, label, weight, biome, timeOfDay, unique, trigger, action, data }
  function addEncounter(enc) {
    if (!enc.id) throw new Error("Encounter must have an id");
    enc.weight = enc.weight ?? 1;
    enc.unique = enc.unique ?? false;
    enc.triggered = false;
    encounters.push(enc);
    log(`Added encounter: ${enc.label || enc.id}`);
  }

  // Remove an encounter (by id)
  function removeEncounter(id) {
    const i = encounters.findIndex(e => e.id === id);
    if (i !== -1) {
      log(`Removed encounter: ${encounters[i].label || encounters[i].id}`);
      encounters.splice(i, 1);
      return true;
    }
    return false;
  }

  // Get a filtered, weighted list of eligible encounters
  function getEligible({ biome, timeOfDay, extraFilter = null } = {}) {
    return encounters.filter(enc => {
      if (enc.unique && enc.triggered && !allowRepeats) return false;
      if (biome && enc.biome && enc.biome !== biome) return false;
      if (timeOfDay && enc.timeOfDay && enc.timeOfDay !== timeOfDay) return false;
      if (typeof enc.trigger === "function" && !enc.trigger()) return false;
      if (extraFilter && !extraFilter(enc)) return false;
      return true;
    });
  }

  // Weighted random selection
  function pickEncounter(opts = {}) {
    const pool = getEligible(opts);
    if (!pool.length) return null;
    const totalWeight = pool.reduce((sum, enc) => sum + enc.weight, 0);
    let roll = Math.random() * totalWeight;
    for (let enc of pool) {
      if (roll < enc.weight) return enc;
      roll -= enc.weight;
    }
    return pool[0]; // fallback
  }

  // Trigger an encounter (either random or forced by id)
  function triggerEncounter(opts = {}) {
    let encounter = opts.id
      ? encounters.find(e => e.id === opts.id)
      : pickEncounter(opts);
    if (!encounter) {
      log("No eligible encounters.");
      return null;
    }
    if (encounter.unique) encounter.triggered = true;
    log(`Triggered: ${encounter.label || encounter.id}`);
    if (typeof encounter.action === "function") encounter.action(encounter);
    return encounter;
  }

  function getLog() { return [...encounterHistory]; }
  function getEncounter(id) { return encounters.find(e => e.id === id); }
  function resetHistory() {
    encounters.forEach(enc => { enc.triggered = false; });
    log("Reset all encounter history.");
  }

  // Import/export for saves
  function toJSON() {
    return {
      encounters: JSON.parse(JSON.stringify(encounters)),
      encounterHistory: [...encounterHistory]
    };
  }
  function fromJSON(data) {
    if (!data) return;
    encounters = JSON.parse(JSON.stringify(data.encounters));
    encounterHistory = [...data.encounterHistory];
  }

  return {
    addEncounter,
    removeEncounter,
    triggerEncounter,
    pickEncounter,
    getEligible,
    getEncounter,
    getLog,
    resetHistory,
    toJSON,
    fromJSON,
  };
}

// Export for Node/CommonJS
if (typeof module !== "undefined" && module.exports) {
  module.exports = { createRandomEncounterSystem };
}

  return text;
};