const modifier = (text) => {
  // worldClock.js
// Fancy Modular World Clock Engine

function createWorldClock({
  initialHour = 8,
  initialMinute = 0,
  initialDay = 1,
  use24Hour = false,
  onAdvance = [],
} = {}) {
  let hour = initialHour;
  let minute = initialMinute;
  let day = initialDay;

  // Hooks for event callbacks
  const advanceHooks = Array.isArray(onAdvance) ? [...onAdvance] : [];

  function advance(hours = 0, minutes = 0) {
    minute += minutes;
    while (minute >= 60) {
      minute -= 60;
      hour += 1;
    }
    hour += hours;
    while (hour >= 24) {
      hour -= 24;
      day += 1;
    }
    // Call hooks after time advances
    advanceHooks.forEach(hook => {
      try { hook(getTime()); } catch (e) {}
    });
  }

  function setTime(newHour, newMinute = minute, newDay = day) {
    hour = newHour;
    minute = newMinute;
    day = newDay;
  }

  function getTime() {
    return { hour, minute, day };
  }

  function getTimeOfDay() {
    // "morning", "afternoon", "evening", "night"
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  function formatTime(opts = {}) {
    const { use24 = use24Hour } = opts;
    if (use24) {
      const padded = minute.toString().padStart(2, '0');
      return `Day ${day}, ${hour.toString().padStart(2, '0')}:${padded}`;
    }
    const hour12 = ((hour + 11) % 12) + 1;
    const ampm = hour < 12 ? 'AM' : 'PM';
    const padded = minute.toString().padStart(2, '0');
    return `Day ${day}, ${hour12}:${padded} ${ampm}`;
  }

  function describe() {
    const t = formatTime();
    const period = getTimeOfDay();
    return `${t} — It’s ${period} in the Mojave.`;
  }

  function addAdvanceHook(hook) {
    if (typeof hook === 'function') advanceHooks.push(hook);
  }

  function toJSON() {
    return { hour, minute, day };
  }

  function fromJSON(obj) {
    if (typeof obj === 'object' && obj) {
      hour = obj.hour ?? hour;
      minute = obj.minute ?? minute;
      day = obj.day ?? day;
    }
  }

  function reset(h = 8, m = 0, d = 1) {
    hour = h;
    minute = m;
    day = d;
  }

  function rewind(hours = 0, minutes = 0) {
    let totalMinutes = hour * 60 + minute - (hours * 60 + minutes);
    while (totalMinutes < 0) {
      if (day > 1) {
        day -= 1;
        totalMinutes += 24 * 60;
      } else {
        totalMinutes = 0;
        break;
      }
    }
    hour = Math.floor(totalMinutes / 60);
    minute = totalMinutes % 60;
  }

  return {
    advance,
    setTime,
    getTime,
    getTimeOfDay,
    formatTime,
    describe,
    addAdvanceHook,
    toJSON,
    fromJSON,
    reset,
    rewind
  };
}

// Export pattern for Node.js/CommonJS
if (typeof module !== "undefined" && module.exports) {
  module.exports = { createWorldClock };
}
  return text;
};