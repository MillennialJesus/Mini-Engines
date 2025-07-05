const modifier = (text) => {
// eventSystem-fancy.js
// Modular, extensible event system for RPGs/sims

function createEventSystem({ autoAdvance = false, logEnabled = true } = {}) {
  let events = [];
  let eventLog = [];
  let currentTime = { hour: 8, day: 1 }; // For time-based triggers (if needed)

  // --- Internal: Logging ---
  function log(str) {
    if (logEnabled) eventLog.push(`[${nowString()}] ${str}`);
  }

  // --- Event Definition ---
  // Each event: { id, label, trigger, action, repeat, category, dependencies, data, priority, onFire, onFail, onComplete, active, ... }
  function addEvent(event) {
    if (!event.id) throw new Error("Event must have an id");
    event.active = event.active ?? true;
    event.done = event.done ?? false;
    event.failed = event.failed ?? false;
    events.push(event);
    log(`Added event: ${event.label || event.id}`);
  }

  // --- Time Advancement (optional, for time-based events) ---
  function setTime({ hour, day }) {
    currentTime.hour = hour ?? currentTime.hour;
    currentTime.day = day ?? currentTime.day;
  }

  function advanceTime(hours = 1) {
    currentTime.hour += hours;
    while (currentTime.hour >= 24) {
      currentTime.hour -= 24;
      currentTime.day += 1;
    }
    log(`Time advanced: Day ${currentTime.day}, ${currentTime.hour}:00`);
    if (autoAdvance) checkAll();
  }

  // --- Event Firing/Checking ---
  function canFire(event) {
    if (!event.active || event.done || event.failed) return false;
    // Dependencies met?
    if (event.dependencies && event.dependencies.length) {
      for (let depId of event.dependencies) {
        const dep = events.find(e => e.id === depId);
        if (!dep || !dep.done) return false;
      }
    }
    // Trigger function? (should return true/false)
    if (typeof event.trigger === "function") {
      return !!event.trigger({ time: currentTime, event });
    }
    // Else: always fire
    return true;
  }

  function fireEvent(eventId, context = {}) {
    const event = events.find(e => e.id === eventId);
    if (!event || !canFire(event)) return false;
    // Run the action
    if (typeof event.action === "function") event.action(context, event);
    event.done = true;
    event.active = false;
    log(`Event triggered: ${event.label || event.id}`);
    if (typeof event.onFire === "function") event.onFire(context, event);

    // Auto-repeat if allowed
    if (event.repeat) {
      event.done = false;
      event.active = true;
    } else if (typeof event.onComplete === "function") {
      event.onComplete(context, event);
    }
    return true;
  }

  // --- Mass Check/Firing ---
  function checkAll(context = {}) {
    // Priority sort: lowest fires first
    events
      .filter(ev => canFire(ev))
      .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
      .forEach(ev => fireEvent(ev.id, context));
  }

  // --- Manual Failure/Reset ---
  function failEvent(eventId, context = {}) {
    const event = events.find(e => e.id === eventId);
    if (!event || event.failed || event.done) return false;
    event.failed = true;
    event.active = false;
    log(`Event failed: ${event.label || event.id}`);
    if (typeof event.onFail === "function") event.onFail(context, event);
    return true;
  }

  function resetEvent(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return false;
    event.active = true;
    event.done = false;
    event.failed = false;
    log(`Event reset: ${event.label || event.id}`);
    return true;
  }

  // --- Event Inspection/Query ---
  function getEvent(id) { return events.find(ev => ev.id === id); }
  function getActive() { return events.filter(ev => ev.active && !ev.done && !ev.failed); }
  function getDone() { return events.filter(ev => ev.done); }
  function getFailed() { return events.filter(ev => ev.failed); }
  function getLog() { return [...eventLog]; }
  function nowString() { return (new Date()).toLocaleString(); }

  // --- Bulk Import/Export for Save/Load ---
  function toJSON() {
    return {
      events: JSON.parse(JSON.stringify(events)),
      eventLog: [...eventLog],
      currentTime: { ...currentTime }
    };
  }
  function fromJSON(data) {
    if (!data) return;
    events = JSON.parse(JSON.stringify(data.events));
    eventLog = [...data.eventLog];
    currentTime = { ...data.currentTime };
  }

  return {
    addEvent, fireEvent, failEvent, resetEvent,
    checkAll, canFire,
    getEvent, getActive, getDone, getFailed,
    advanceTime, setTime,
    getLog, toJSON, fromJSON
  };
}

// Node/CommonJS export
if (typeof module !== "undefined" && module.exports) {
  module.exports = { createEventSystem };
}

  return text;
};