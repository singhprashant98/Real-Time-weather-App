const $ = (selector) => document.querySelector(selector);
const weatherCodes = {0:["Clear sky","☀"],1:["Mostly clear","🌤"],2:["Partly cloudy","⛅"],3:["Overcast","☁"],45:["Foggy","🌫"],48:["Rime fog","🌫"],51:["Light drizzle","🌦"],53:["Drizzle","🌦"],55:["Heavy drizzle","🌧"],61:["Light rain","🌦"],63:["Rain","🌧"],65:["Heavy rain","🌧"],71:["Light snow","🌨"],73:["Snow","🌨"],75:["Heavy snow","❄"],80:["Rain showers","🌦"],81:["Rain showers","🌧"],82:["Heavy showers","⛈"],95:["Thunderstorm","⛈"],96:["Thunderstorm with hail","⛈"],99:["Thunderstorm with hail","⛈"]};
let unit = "celsius", lastWeather;

const formatNumber = (number) => Math.round(number);
const conditionFor = (code) => weatherCodes[code] || ["Unknown conditions","◌"];
const temp = (value) => `${formatNumber(unit === "celsius" ? value : (value * 9) / 5 + 32)}°`;
const getTimeIndex = (times) => Math.max(0, times.findIndex((time) => time >= new Date().toISOString().slice(0,13)));

function displayTime(timezone) {
  const now = new Date();
  $("#local-time").textContent = new Intl.DateTimeFormat(undefined,{timeZone:timezone,hour:"2-digit",minute:"2-digit",hour12:true}).format(now).toUpperCase() + " LOCAL TIME";
  $("#date-line").textContent = new Intl.DateTimeFormat(undefined,{timeZone:timezone,weekday:"long",month:"long",day:"numeric"}).format(now);
}

function render(weather, place) {
  lastWeather = weather;
  const current = weather.current, hourly = weather.hourly, daily = weather.daily;
  const [condition, icon] = conditionFor(current.weather_code);
  $("#place-name").textContent = `${place.name}, ${place.country}`;
  $("#temperature").textContent = formatNumber(unit === "celsius" ? current.temperature_2m : current.temperature_2m * 9 / 5 + 32);
  $("#weather-icon").textContent = icon; $("#condition").textContent = condition; $("#weather-detail").textContent = condition;
  $("#feels-like").textContent = temp(current.apparent_temperature);
  $("#humidity").textContent = `${current.relative_humidity_2m}%`;
  $("#wind").textContent = `${formatNumber(current.wind_speed_10m)} km/h`;
  $("#uv-index").textContent = daily.uv_index_max[0].toFixed(1);
  $("#visibility").textContent = `${formatNumber(current.visibility / 1000)} km`;
  displayTime(weather.timezone);
  $("#updated").textContent = `Updated ${new Intl.DateTimeFormat(undefined,{hour:"numeric",minute:"2-digit"}).format(new Date())}`;
  renderHourly(hourly); renderDaily(daily);
}

function renderHourly(hourly) {
  const container = $("#hourly-forecast"), template = $("#hour-template"), start = getTimeIndex(hourly.time);
  container.innerHTML = "";
  for (let offset = 0; offset < 8; offset++) {
    const index = start + offset; if (!hourly.time[index]) break;
    const node = template.content.cloneNode(true), time = new Date(`${hourly.time[index]}:00`);
    node.querySelector(".hour-time").textContent = offset === 0 ? "Now" : new Intl.DateTimeFormat(undefined,{hour:"numeric",hour12:true}).format(time);
    node.querySelector(".hour-icon").textContent = conditionFor(hourly.weather_code[index])[1];
    node.querySelector(".hour-temp").textContent = temp(hourly.temperature_2m[index]);
    node.querySelector(".hour-rain").textContent = `${hourly.precipitation_probability[index] ?? 0}% rain`;
    container.append(node);
  }
}

function renderDaily(daily) {
  const container = $("#daily-forecast"), template = $("#day-template"); container.innerHTML = "";
  const lows = daily.temperature_2m_min, highs = daily.temperature_2m_max, floor = Math.min(...lows), ceiling = Math.max(...highs), span = ceiling - floor || 1;
  daily.time.forEach((date, index) => {
    const node = template.content.cloneNode(true), label = index === 0 ? "Today" : new Intl.DateTimeFormat(undefined,{weekday:"short"}).format(new Date(`${date}T12:00:00`));
    const start = ((lows[index] - floor) / span) * 100, width = ((highs[index] - lows[index]) / span) * 100;
    node.querySelector(".day-name").textContent = label; node.querySelector(".day-icon").textContent = conditionFor(daily.weather_code[index])[1];
    node.querySelector(".day-condition").textContent = conditionFor(daily.weather_code[index])[0]; node.querySelector(".day-low").textContent = temp(lows[index]); node.querySelector(".day-high").textContent = temp(highs[index]);
    const bar = node.querySelector(".range-track i"); bar.style.left = `${start}%`; bar.style.width = `${Math.max(8,width)}%`;
    container.append(node);
  });
}

function error(message) { const el = $("#error-message"); el.textContent = message; el.hidden = false; setTimeout(() => el.hidden = true, 5000); }
async function searchCity(query) {
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);
  const data = await response.json(); if (!data.results?.length) throw new Error("No matching city found. Try a more specific search."); return data.results[0];
}
async function loadPlace(place) {
  $("#place-name").textContent = "Updating weather…";
  const fields = "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,visibility";
  const hourly = "temperature_2m,precipitation_probability,weather_code";
  const daily = "weather_code,temperature_2m_max,temperature_2m_min,uv_index_max";
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=${fields}&hourly=${hourly}&daily=${daily}&timezone=auto&forecast_days=7`;
  const response = await fetch(url); if (!response.ok) throw new Error("Weather service is temporarily unavailable."); render(await response.json(), place);
}
$("#search-form").addEventListener("submit", async (event) => { event.preventDefault(); const query = $("#city-search").value.trim(); if (!query) return; try { await loadPlace(await searchCity(query)); } catch (err) { error(err.message); } });
$("#location-button").addEventListener("click", () => navigator.geolocation?.getCurrentPosition(async ({coords}) => { try { await loadPlace({latitude:coords.latitude,longitude:coords.longitude,name:"Your location",country:""}); } catch (err) { error(err.message); } }, () => error("Location access was unavailable. Search for a city instead.")) || error("Your browser does not support location services."));
$("#unit-toggle").addEventListener("click", () => { unit = unit === "celsius" ? "fahrenheit" : "celsius"; $("#unit-toggle").textContent = unit === "celsius" ? "°C / °F" : "°F / °C"; if (lastWeather) render(lastWeather,{name:$("#place-name").textContent.split(",")[0],country:$("#place-name").textContent.split(",").slice(1).join(",").trim()}); });
(async () => { try { await loadPlace(await searchCity("New Delhi")); } catch (err) { error("Could not load weather. Check your internet connection and try again."); } })();
