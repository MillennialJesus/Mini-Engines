const modifier = (text) => {
// companions.js
// Modular Companions/Party Manager

function createCompanions({
  initialParty = [],
  initialReserve = [],
  maxPartySize = 2 // Default: 2 active companions in party
} = {}) {
  let party = [...initialParty];
  let reserve = [...initialReserve];

  function getCompanionIndex(name, arr = party) {
    return arr.findIndex(c =>
      (c.name && c.name.toLowerCase() === name.toLowerCase()) ||
      (c.uniqueTag && c.uniqueTag === name)
    );
  }

  function recruit(companion) {
    if (!companion || !companion.name) return false;
    // Prevent duplicate
    if (hasCompanion(companion.name)) return false;
    if (party.length < maxPartySize) {
      party.push({ ...companion });
      return "party";
    } else {
      reserve.push({ ...companion });
      return "reserve";
    }
  }

  function remove(name) {
    let idx = getCompanionIndex(name, party);
    if (idx !== -1) { party.splice(idx, 1); return true; }
    idx = getCompanionIndex(name, reserve);
    if (idx !== -1) { reserve.splice(idx, 1); return true; }
    return false;
  }

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

  function hasCompanion(name) {
    return (
      getCompanionIndex(name, party) !== -1 ||
      getCompanionIndex(name, reserve) !== -1
    );
  }

  function getParty() {
    return party.map(c => ({ ...c }));
  }

  function getReserve() {
    return reserve.map(c => ({ ...c }));
  }

  function swapPartyMembers(name1, name2) {
    const idx1 = getCompanionIndex(name1, party);
    const idx2 = getCompanionIndex(name2, party);
    if (idx1 === -1 || idx2 === -1) return false;
    [party[idx1], party[idx2]] = [party[idx2], party[idx1]];
    return true;
  }

  function updateCompanion(name, updates) {
    let idx = getCompanionIndex(name, party);
    if (idx !== -1) {
      party[idx] = { ...party[idx], ...updates };
      return true;
    }
    idx = getCompanionIndex(name, reserve);
    if (idx !== -1) {
      reserve[idx] = { ...reserve[idx], ...updates };
      return true;
    }
    return false;
  }

  function clear() {
    party = [];
    reserve = [];
  }

  function toJSON() {
    return {
      party: party.map(c => ({ ...c })),
      reserve: reserve.map(c => ({ ...c }))
    };
  }

  function fromJSON(data) {
    if (data && data.party && Array.isArray(data.party)) party = data.party.map(c => ({ ...c }));
    if (data && data.reserve && Array.isArray(data.reserve)) reserve = data.reserve.map(c => ({ ...c }));
  }

  return {
    recruit,
    remove,
    moveToParty,
    moveToReserve,
    hasCompanion,
    getParty,
    getReserve,
    swapPartyMembers,
    updateCompanion,
    clear,
    toJSON,
    fromJSON,
  };
}

// Export for Node.js/CommonJS
if (typeof module !== "undefined" && module.exports) {
  module.exports = { createCompanions };
}
  return text;
};