const modifier = (text) => {
// weather.js
// Fancy Weather Engine for Modular RPG/AI Scripting

function createWeatherSystem({
  initialWeather = "clear",
  initialBiome = "desert",
  supportedBiomes = ["desert", "wasteland", "mountain", "coast", "forest", "swamp", "urban", "plains"],
  logEnabled = false,
  rng = Math.random, // For custom seeding/testing
} = {}) {
  let weather = initialWeather;
  let biome = initialBiome;
  let log = [];
  let day = 1;
  let hour = 8;
  let weatherHistory = [];
  let overrideNext = null; // For story events/quests

  // Weather table: biome -> probabilities (sum to 1)
  const WEATHER_TABLE = {
    desert: {
      clear: 0.7, windy: 0.15, cloudy: 0.10, rain: 0.03, storm: 0.01, sandstorm: 0.01,
    },
    wasteland: {
      clear: 0.5, cloudy: 0.20, rain: 0.15, storm: 0.05, radstorm: 0.04, fog: 0.03, dusty: 0.03,
    },
    mountain: {
      clear: 0.4, cloudy: 0.25, rain: 0.15, snow: 0.10, storm: 0.06, fog: 0.04,
    },
    coast: {
      clear: 0.4, cloudy: 0.25, rain: 0.18, storm: 0.07, fog: 0.07, windy: 0.03,
    },
    forest: {
      clear: 0.45, cloudy: 0.22, rain: 0.20, storm: 0.06, fog: 0.04, snow: 0.03,
    },
    swamp: {
      clear: 0.2, cloudy: 0.18, rain: 0.33, fog: 0.17, storm: 0.09, humid: 0.03,
    },
    urban: {
      clear: 0.6, cloudy: 0.15, rain: 0.10, fog: 0.05, storm: 0.03, radstorm: 0.03, acidrain: 0.04,
    },
    plains: {
      clear: 0.55, cloudy: 0.20, rain: 0.12, storm: 0.05, fog: 0.03, snow: 0.03, windy: 0.02,
    },
  };

  // Weather descriptions (feel free to customize for your world flavor)
  const WEATHER_DESC = {
    clear: "The sky is clear and the air feels still.",
    cloudy: "Clouds gather overhead, casting shifting shadows.",
    rain: "A gentle rain falls, soaking the ground.",
    storm: "Thunder rumbles as a storm lashes the area.",
    fog: "A thick fog rolls in, muffling sound and sight.",
    snow: "Flakes of snow drift down, blanketing the land.",
    windy: "A gusty wind howls, carrying dust and debris.",
    sandstorm: "A blinding sandstorm sweeps through.",
    radstorm: "A greenish radioactive storm sweeps the area, crackling with energy.",
    dusty: "The wind stirs up a haze of dust.",
    humid: "The air is thick, hot, and oppressively humid.",
    acidrain: "Corrosive rain spatters from a sickly sky.",
  };

  // Roll for next weather (weighted random)
  function randomWeather(biomeType = biome) {
    const table = WEATHER_TABLE[biomeType] || WEATHER_TABLE.desert;
    const entries = Object.entries(table);
    let r = rng();
    for (let i = 0; i < entries.length; i++) {
      let [type, chance] = entries[i];
      if (r < chance) return type;
      r -= chance;
    }
    return entries[0][0]; // fallback
  }

  // Advance time and roll for new weather (by hour or by day)
  function advance(hours = 1, newBiome = null, currentTime = null) {
    if (currentTime) {
      day = currentTime.day ?? day;
      hour = currentTime.hour ?? hour;
    } else {
      hour += hours;
      while (hour >= 24) { hour -= 24; day++; }
    }
    if (newBiome) biome = newBiome;
    let prev = weather;
    let next = overrideNext || randomWeather(biome);
    overrideNext = null;
    weather = next;
    weatherHistory.push({ day, hour, biome, weather });
    if (logEnabled) log.push(`Day ${day}, ${hour}:00 - Weather changed: ${prev} → ${next} [${biome}]`);
    return weather;
  }

  // Manually set weather (for story beats, etc)
  function setWeather(type, options = {}) {
    weather = type;
    if (options.overrideNext) overrideNext = type;
    if (options.addToLog && logEnabled) log.push(`Weather manually set: ${type}`);
  }

  function getWeather() {
    return { weather, biome, day, hour };
  }

  function getWeatherDescription() {
    return WEATHER_DESC[weather] || `The weather is... ${weather}?`;
  }

  // Optionally: short-term forecast (peek at possible next weather)
  function getForecast(hoursAhead = 3, b = biome) {
    let forecasts = [];
    let fakeWeather = weather;
    let fakeBiome = b;
    for (let i = 0; i < hoursAhead; i++) {
      fakeWeather = randomWeather(fakeBiome);
      forecasts.push(fakeWeather);
    }
    return forecasts;
  }

  // For player/world modifiers: (simple example)
  function getPlayerEffect(player) {
    switch (weather) {
      case "radstorm": return "player_radiation";
      case "acidrain": return "player_armor_damaged";
      case "snow": return "player_cold";
      case "sandstorm": return "player_blindness";
      default: return null;
    }
  }

  function getHistory({ recent = 24 } = {}) {
    return weatherHistory.slice(-recent);
  }

  return {
    advance,
    setWeather,
    getWeather,
    getWeatherDescription,
    getForecast,
    getPlayerEffect,
    getHistory,
    // Optional: biome support
    setBiome: (b) => { biome = b; },
    getBiome: () => biome,
    log: () => logEnabled ? [...log] : [],
  };
}

// Node/CommonJS export
if (typeof module !== "undefined" && module.exports) {
  module.exports = { createWeatherSystem };
}
  return text;
};