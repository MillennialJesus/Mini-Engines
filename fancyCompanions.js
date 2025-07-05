const modifier = (text) => {
// companionsFancy.js
// Modular Advanced Companions/Party Manager

function createFancyCompanions({
  initialParty = [],
  initialReserve = [],
  maxPartySize = 2
} = {}) {
  let party = [...initialParty];
  let reserve = [...initialReserve];

  // Helper to find companion by tag or name
  function getCompanionIndex(name, arr = party) {
    return arr.findIndex(c =>
      (c.name && c.name.toLowerCase() === name.toLowerCase()) ||
      (c.uniqueTag && c.uniqueTag === name)
    );
  }

  // Add new companion (to party if room, else reserve)
  function recruit(companion) {
    if (!companion || !companion.name) return false;
    if (hasCompanion(companion.name)) return false;
    const template = {
      uniqueTag: companion.uniqueTag || companion.name.toLowerCase().replace(/\s+/g, "_"),
      name: companion.name,
      level: companion.level || 1,
      xp: companion.xp || 0,
      affinity: companion.affinity || 50,
      affinityType: companion.affinityType || "neutral", // "friend", "rival", "romance", etc.
      romanceable: !!companion.romanceable,
      rival: !!companion.rival,
      statuses: companion.statuses || [],
      inventory: companion.inventory || [],
      dialogue: companion.dialogue || [],
      tags: companion.tags || [],
      custom: companion.custom || {},
    };
    if (party.length < maxPartySize) {
      party.push(template);
      return "party";
    } else {
      reserve.push(template);
      return "reserve";
    }
  }

  // Remove companion from party/reserve
  function remove(name) {
    let idx = getCompanionIndex(name, party);
    if (idx !== -1) { party.splice(idx, 1); return true; }
    idx = getCompanionIndex(name, reserve);
    if (idx !== -1) { reserve.splice(idx, 1); return true; }
    return false;
  }

  // Move companion between party & reserve
  function moveToParty(name) {
    if (party.length >= maxPartySize) return false;
    const idx = getCompanionIndex(name, reserve);
    if (idx === -1) return false;
    party.push(reserve[idx]);
    reserve.splice(idx, 1);
    return true;
  }
  function moveToReserve(name) {
    const idx = getCompanionIndex(name, party);
    if (idx === -1) return false;
    reserve.push(party[idx]);
    party.splice(idx, 1);
    return true;
  }

  // XP/Level system
  function addXP(name, amount) {
    let idx = getCompanionIndex(name, party);
    if (idx === -1) idx = getCompanionIndex(name, reserve);
    if (idx === -1) return false;
    let c = party[idx] || reserve[idx];
    c.xp += amount;
    // Auto-level up (customize threshold as needed)
    let levelUp = false;
    while (c.xp >= xpToLevel(c.level)) {
      c.xp -= xpToLevel(c.level);
      c.level++;
      levelUp = true;
      if (c.dialogue) c.dialogue.push(`[Level up to ${c.level}!]`);
    }
    return levelUp ? c.level : false;
  }
  function xpToLevel(level) { return 50 + 25 * (level - 1); }

  // Affinity system (friendship, romance, rival)
  function changeAffinity(name, amount) {
    let idx = getCompanionIndex(name, party);
    if (idx === -1) idx = getCompanionIndex(name, reserve);
    if (idx === -1) return false;
    let c = party[idx] || reserve[idx];
    c.affinity = Math.max(0, Math.min(100, c.affinity + amount));
    return c.affinity;
  }
  function setAffinityType(name, type) {
    let idx = getCompanionIndex(name, party);
    if (idx === -1) idx = getCompanionIndex(name, reserve);
    if (idx === -1) return false;
    let c = party[idx] || reserve[idx];
    c.affinityType = type;
    return true;
  }

  // Add/remove/get statuses (e.g. "wounded", "tired", "inspired")
  function addStatus(name, status) {
    let idx = getCompanionIndex(name, party);
    if (idx === -1) idx = getCompanionIndex(name, reserve);
    if (idx === -1) return false;
    let c = party[idx] || reserve[idx];
    if (!c.statuses.includes(status)) c.statuses.push(status);
    return true;
  }
  function removeStatus(name, status) {
    let idx = getCompanionIndex(name, party);
    if (idx === -1) idx = getCompanionIndex(name, reserve);
    if (idx === -1) return false;
    let c = party[idx] || reserve[idx];
    c.statuses = c.statuses.filter(s => s !== status);
    return true;
  }
  function hasStatus(name, status) {
    let idx = getCompanionIndex(name, party);
    if (idx === -1) idx = getCompanionIndex(name, reserve);
    if (idx === -1) return false;
    let c = party[idx] || reserve[idx];
    return c.statuses.includes(status);
  }

  // Per-companion inventory
  function addItem(name, item) {
    let idx = getCompanionIndex(name, party);
    if (idx === -1) idx = getCompanionIndex(name, reserve);
    if (idx === -1) return false;
    let c = party[idx] || reserve[idx];
    c.inventory.push(item);
    return true;
  }
  function removeItem(name, item) {
    let idx = getCompanionIndex(name, party);
    if (idx === -1) idx = getCompanionIndex(name, reserve);
    if (idx === -1) return false;
    let c = party[idx] || reserve[idx];
    let index = c.inventory.indexOf(item);
    if (index !== -1) {
      c.inventory.splice(index, 1);
      return true;
    }
    return false;
  }

  // Dialogue system (add flavor, barks, etc.)
  function addDialogue(name, line) {
    let idx = getCompanionIndex(name, party);
    if (idx === -1) idx = getCompanionIndex(name, reserve);
    if (idx === -1) return false;
    let c = party[idx] || reserve[idx];
    c.dialogue.push(line);
    return true;
  }
  function getDialogue(name) {
    let idx = getCompanionIndex(name, party);
    if (idx === -1) idx = getCompanionIndex(name, reserve);
    if (idx === -1) return [];
    let c = party[idx] || reserve[idx];
    return [...c.dialogue];
  }

  // Add/remove/get tags (like “quest-relevant”, “romanceable”)
  function addTag(name, tag) {
    let idx = getCompanionIndex(name, party);
    if (idx === -1) idx = getCompanionIndex(name, reserve);
    if (idx === -1) return false;
    let c = party[idx] || reserve[idx];
    if (!c.tags.includes(tag)) c.tags.push(tag);
    return true;
  }
  function removeTag(name, tag) {
    let idx = getCompanionIndex(name, party);
    if (idx === -1) idx = getCompanionIndex(name, reserve);
    if (idx === -1) return false;
    let c = party[idx] || reserve[idx];
    c.tags = c.tags.filter(t => t !== tag);
    return true;
  }
  function hasTag(name, tag) {
    let idx = getCompanionIndex(name, party);
    if (idx === -1) idx = getCompanionIndex(name, reserve);
    if (idx === -1) return false;
    let c = party[idx] || reserve[idx];
    return c.tags.includes(tag);
  }

  // Custom event hooks (call on events—placeholder)
  let events = {};
  function on(eventName, handler) {
    if (!events[eventName]) events[eventName] = [];
    events[eventName].push(handler);
  }
  function trigger(eventName, data) {
    if (!events[eventName]) return;
    for (const fn of events[eventName]) fn(data);
  }

  // Party management
  function hasCompanion(name) {
    return (
      getCompanionIndex(name, party) !== -1 ||
      getCompanionIndex(name, reserve) !== -1
    );
  }
  function getParty() { return party.map(c => ({ ...c })); }
  function getReserve() { return reserve.map(c => ({ ...c })); }
  function clear() { party = []; reserve = []; }

  // JSON serialization (for state saves)
  function toJSON() { return { party, reserve }; }
  function fromJSON(data) {
    if (data && data.party && Array.isArray(data.party)) party = data.party.map(c => ({ ...c }));
    if (data && data.reserve && Array.isArray(data.reserve)) reserve = data.reserve.map(c => ({ ...c }));
  }

  return {
    recruit, remove,
    moveToParty, moveToReserve,
    hasCompanion,
    getParty, getReserve,
    addXP, changeAffinity, setAffinityType,
    addStatus, removeStatus, hasStatus,
    addItem, removeItem,
    addDialogue, getDialogue,
    addTag, removeTag, hasTag,
    on, trigger,
    clear, toJSON, fromJSON,
  };
}

// Export for Node.js/CommonJS
if (typeof module !== "undefined" && module.exports) {
  module.exports = { createFancyCompanions };
}
  return text;
};