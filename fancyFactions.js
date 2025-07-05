const modifier = (text) => {
// factions-fancy.js
// Advanced Modular Faction & Reputation Engine

function createFancyFactionsEngine({
  initialFactions = [],
  baseAlignment = 0,
  minAlignment = -100,
  maxAlignment = 100
} = {}) {
  // Faction records
  let factions = {};
  let relations = {}; // "A|B" => "ally" | "hostile" | etc.
  let territory = {}; // { locationName: factionName }
  let eventLog = []; // logs all major changes/events

  // --- Faction Core Setup ---
  initialFactions.forEach(fac => {
    factions[fac.name] = {
      name: fac.name,
      alignment: fac.alignment ?? baseAlignment,
      member: fac.member ?? false,
      hostile: fac.hostile ?? false,
      reputation: fac.reputation ?? 0,
      standing: fac.standing ?? "neutral", // e.g., friendly, hated
      betrayals: 0,
      tags: fac.tags || [],
      custom: fac.custom || {},
      events: [] // Custom event hooks for this faction
    };
  });

  function ensureFaction(name) {
    if (!factions[name]) {
      factions[name] = {
        name,
        alignment: baseAlignment,
        member: false,
        hostile: false,
        reputation: 0,
        standing: "neutral",
        betrayals: 0,
        tags: [],
        custom: {},
        events: []
      };
    }
  }

  // --- Alliance, Hostility, Diplomacy ---
  function setRelation(a, b, status) {
    ensureFaction(a); ensureFaction(b);
    relations[[a, b].sort().join("|")] = status;
    eventLog.push(`[${a} ↔ ${b}] set to '${status}' (${nowString()})`);
  }
  function getRelation(a, b) {
    return relations[[a, b].sort().join("|")] || "neutral";
  }
  function setAlly(a, b) { setRelation(a, b, "ally"); }
  function setHostile(a, b) { setRelation(a, b, "hostile"); }
  function setTruce(a, b) { setRelation(a, b, "truce"); }
  function areAllied(a, b) { return getRelation(a, b) === "ally"; }
  function areHostile(a, b) { return getRelation(a, b) === "hostile"; }

  // --- Territory/Control ---
  function setTerritory(loc, faction) {
    ensureFaction(faction);
    territory[loc] = faction;
    eventLog.push(`[${loc}] is now controlled by [${faction}] (${nowString()})`);
  }
  function getTerritory(loc) { return territory[loc] || null; }
  function allTerritory(fac) {
    return Object.keys(territory).filter(loc => territory[loc] === fac);
  }

  // --- Alignment, Reputation, Standing ---
  function changeAlignment(name, amt) {
    ensureFaction(name);
    let f = factions[name];
    let old = f.alignment;
    f.alignment = Math.max(minAlignment, Math.min(maxAlignment, f.alignment + amt));
    if (f.alignment !== old) {
      eventLog.push(`[${name}] alignment changed: ${old} → ${f.alignment} (${nowString()})`);
      fireEvents(name, "alignment", { before: old, after: f.alignment });
    }
    // Hostile threshold (adjust as needed)
    if (f.alignment <= -40 && !f.hostile) setHostileFlag(name, true);
    else if (f.alignment > -40 && f.hostile) setHostileFlag(name, false);
    return f.alignment;
  }

  function setHostileFlag(name, val) {
    ensureFaction(name);
    let old = factions[name].hostile;
    factions[name].hostile = !!val;
    if (old !== val) eventLog.push(`[${name}] hostile status: ${val ? "Hostile" : "Not Hostile"} (${nowString()})`);
  }
  function setMember(name, val = true) {
    ensureFaction(name);
    factions[name].member = !!val;
    eventLog.push(`[${name}] membership: ${val ? "Member" : "Not Member"} (${nowString()})`);
  }
  function changeReputation(name, amt) {
    ensureFaction(name);
    let f = factions[name];
    let old = f.reputation;
    f.reputation += amt;
    if (f.reputation !== old) {
      eventLog.push(`[${name}] reputation changed: ${old} → ${f.reputation} (${nowString()})`);
      fireEvents(name, "reputation", { before: old, after: f.reputation });
    }
    return f.reputation;
  }
  function setStanding(name, val) {
    ensureFaction(name);
    let old = factions[name].standing;
    factions[name].standing = val;
    if (old !== val) eventLog.push(`[${name}] standing: ${val} (${nowString()})`);
  }

  // --- Betrayal Tracking ---
  function betrayFaction(name) {
    ensureFaction(name);
    factions[name].betrayals += 1;
    setStanding(name, "betrayed");
    eventLog.push(`[${name}] has been betrayed! (${nowString()})`);
    fireEvents(name, "betrayal", {});
  }

  // --- Tagging & Custom Data ---
  function addTag(name, tag) { ensureFaction(name); if (!factions[name].tags.includes(tag)) factions[name].tags.push(tag); }
  function removeTag(name, tag) { ensureFaction(name); factions[name].tags = factions[name].tags.filter(t => t !== tag); }
  function hasTag(name, tag) { ensureFaction(name); return factions[name].tags.includes(tag); }
  function setCustom(name, key, val) { ensureFaction(name); factions[name].custom[key] = val; }
  function getCustom(name, key) { ensureFaction(name); return factions[name].custom[key]; }

  // --- Events/Callbacks ---
  // Example: factions.on("NCR", "alignment", (details) => {...})
  function on(fac, type, fn) {
    ensureFaction(fac);
    factions[fac].events.push({ type, fn });
  }
  function fireEvents(fac, type, data) {
    factions[fac].events.forEach(ev => {
      if (ev.type === type) ev.fn({ ...data, faction: fac, type });
    });
  }

  // --- Utility Functions ---
  function getFaction(name) { ensureFaction(name); return { ...factions[name] }; }
  function getFactionNames() { return Object.keys(factions); }
  function getAlignment(name) { ensureFaction(name); return factions[name].alignment; }
  function getReputation(name) { ensureFaction(name); return factions[name].reputation; }
  function isHostile(name) { ensureFaction(name); return factions[name].hostile; }
  function isMember(name) { ensureFaction(name); return factions[name].member; }
  function getStanding(name) { ensureFaction(name); return factions[name].standing; }
  function getBetrayals(name) { ensureFaction(name); return factions[name].betrayals; }

  // --- Logs & Display ---
  function getLog() { return [...eventLog]; }
  function summary(name) {
    ensureFaction(name);
    let f = factions[name];
    let out = `[${f.name}] Alignment: ${f.alignment}, Reputation: ${f.reputation}, Standing: ${f.standing}`;
    out += f.member ? " [Member]" : "";
    out += f.hostile ? " [Hostile]" : "";
    out += f.tags.length ? ` [${f.tags.join(", ")}]` : "";
    out += f.betrayals ? ` [Betrayals: ${f.betrayals}]` : "";
    return out;
  }

  // --- Save/Load ---
  function toJSON() {
    return {
      factions: JSON.parse(JSON.stringify(factions)),
      relations: JSON.parse(JSON.stringify(relations)),
      territory: JSON.parse(JSON.stringify(territory)),
      eventLog: [...eventLog]
    };
  }
  function fromJSON(data) {
    if (!data) return;
    factions = JSON.parse(JSON.stringify(data.factions));
    relations = JSON.parse(JSON.stringify(data.relations));
    territory = JSON.parse(JSON.stringify(data.territory));
    eventLog = [...data.eventLog];
  }

  // Timestamp helper
  function nowString() {
    return (new Date()).toLocaleString();
  }

  return {
    // Factions
    getFaction, getFactionNames,
    changeAlignment, setMember, setHostileFlag, changeReputation, setStanding,
    getAlignment, getReputation, isHostile, isMember, getStanding, getBetrayals,
    addTag, removeTag, hasTag, setCustom, getCustom,
    // Alliances & Hostility
    setAlly, setHostile, setTruce, areAllied, areHostile,
    setRelation, getRelation,
    // Territory
    setTerritory, getTerritory, allTerritory,
    // Betrayals & Events
    betrayFaction,
    on, // event subscriptions
    fireEvents, // manual trigger
    // Logging, Summary, Save/Load
    getLog, summary, toJSON, fromJSON
  };
}

// Export for Node.js/CommonJS
if (typeof module !== "undefined" && module.exports) {
  module.exports = { createFancyFactionsEngine };
}

  return text;
};