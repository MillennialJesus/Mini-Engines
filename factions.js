const modifier = (text) => {
// factions.js
// Modular Faction Reputation, Alignment, and Membership Manager

function createFactionsEngine({
  initialFactions = [],
  baseAlignment = 0,
  minAlignment = -100,
  maxAlignment = 100
} = {}) {
  // Faction records: { name, alignment, member, hostile, reputation, tags, custom }
  let factions = {};

  // Initialize with starter factions if provided
  initialFactions.forEach(fac => {
    factions[fac.name] = {
      name: fac.name,
      alignment: fac.alignment ?? baseAlignment,
      member: fac.member ?? false,
      hostile: fac.hostile ?? false,
      reputation: fac.reputation ?? 0,
      tags: fac.tags || [],
      custom: fac.custom || {}
    };
  });

  // Add or ensure a faction exists
  function addFaction(name, options = {}) {
    if (!factions[name]) {
      factions[name] = {
        name,
        alignment: options.alignment ?? baseAlignment,
        member: options.member ?? false,
        hostile: options.hostile ?? false,
        reputation: options.reputation ?? 0,
        tags: options.tags || [],
        custom: options.custom || {}
      };
    }
  }

  // Get all faction names
  function getFactionNames() {
    return Object.keys(factions);
  }

  // Get faction object (safe copy)
  function getFaction(name) {
    return factions[name] ? { ...factions[name] } : null;
  }

  // Change alignment (e.g., -100 to 100)
  function changeAlignment(name, amount) {
    if (!factions[name]) return false;
    let f = factions[name];
    f.alignment = Math.max(minAlignment, Math.min(maxAlignment, f.alignment + amount));
    // Optional: auto-update hostile state
    f.hostile = (f.alignment <= -40);
    return f.alignment;
  }

  // Set membership
  function setMember(name, yes = true) {
    if (!factions[name]) return false;
    factions[name].member = !!yes;
    return true;
  }

  // Set hostile (override, e.g. for events)
  function setHostile(name, yes = true) {
    if (!factions[name]) return false;
    factions[name].hostile = !!yes;
    return true;
  }

  // Change reputation (arbitrary use, e.g. for traders)
  function changeReputation(name, amount) {
    if (!factions[name]) return false;
    let f = factions[name];
    f.reputation += amount;
    return f.reputation;
  }

  // Tagging system
  function addTag(name, tag) {
    if (!factions[name]) return false;
    if (!factions[name].tags.includes(tag)) factions[name].tags.push(tag);
    return true;
  }
  function removeTag(name, tag) {
    if (!factions[name]) return false;
    factions[name].tags = factions[name].tags.filter(t => t !== tag);
    return true;
  }
  function hasTag(name, tag) {
    return factions[name] && factions[name].tags.includes(tag);
  }

  // Diplomacy: Set mutual hostility or alliance
  function setMutualHostile(a, b, yes = true) {
    setHostile(a, yes);
    setHostile(b, yes);
  }
  function setMutualAlly(a, b, yes = true) {
    // For alliance system, use tags or a separate structure if needed
    addTag(a, `ally:${b}`);
    addTag(b, `ally:${a}`);
  }

  // Utilities
  function isHostile(name) {
    return factions[name] ? factions[name].hostile : false;
  }
  function isMember(name) {
    return factions[name] ? factions[name].member : false;
  }
  function getAlignment(name) {
    return factions[name] ? factions[name].alignment : null;
  }
  function getReputation(name) {
    return factions[name] ? factions[name].reputation : null;
  }

  // Set/get custom values
  function setCustom(name, key, value) {
    if (!factions[name]) return false;
    factions[name].custom[key] = value;
    return true;
  }
  function getCustom(name, key) {
    return factions[name] ? factions[name].custom[key] : undefined;
  }

  // Faction summary (for display)
  function summary(name) {
    if (!factions[name]) return "Unknown Faction";
    let f = factions[name];
    let out = `[${f.name}] Alignment: ${f.alignment}, Reputation: ${f.reputation}`;
    out += f.member ? " [Member]" : "";
    out += f.hostile ? " [Hostile]" : "";
    if (f.tags.length) out += ` [${f.tags.join(", ")}]`;
    return out;
  }

  // JSON state for save/load
  function toJSON() {
    return JSON.parse(JSON.stringify(factions));
  }
  function fromJSON(data) {
    if (data) factions = JSON.parse(JSON.stringify(data));
  }

  return {
    addFaction,
    getFactionNames,
    getFaction,
    changeAlignment,
    setMember,
    setHostile,
    changeReputation,
    addTag,
    removeTag,
    hasTag,
    setMutualHostile,
    setMutualAlly,
    isHostile,
    isMember,
    getAlignment,
    getReputation,
    setCustom,
    getCustom,
    summary,
    toJSON,
    fromJSON
  };
}

// Export for Node.js/CommonJS
if (typeof module !== "undefined" && module.exports) {
  module.exports = { createFactionsEngine };
}
  return text;
};