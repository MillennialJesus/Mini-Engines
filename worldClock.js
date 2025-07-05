const modifier = (text) => {
  // worldClock.js
  // Modular World Clock Engine for AI Dungeon / Game Scripting

  function createWorldClock(initialHour = 8, initialDay = 1) {
    let hour = initialHour;
    let day = initialDay;

    // Advances the clock by N hours
    function advance(hours = 1) {
      hour += hours;
      while (hour >= 24) {
        hour -= 24;
        day += 1;
      }
    }

    // Set the clock to a specific time
    function setTime(newHour, newDay) {
      hour = newHour;
      day = newDay || day;
    }

    // Get the current time object
    function getTime() {
      return { hour, day };
    }

    // Nicely formatted time string (customize as needed)
    function formatTime() {
      const hour12 = ((hour + 11) % 12) + 1;
      const ampm = hour < 12 ? 'AM' : 'PM';
      return `Day ${day}, ${hour12}:00 ${ampm}`;
    }

    // Expose the API
    return {
      advance,
      setTime,
      getTime,
      formatTime
    };
  }

  // Example usage (uncomment to use for debugging):
  // const clock = createWorldClock();
  // clock.advance(5);
  // console.log(clock.formatTime()); // Day 1, 1:00 PM

  // In an AID modifier, you'd probably want to return `text` at the end.
  return text;
};