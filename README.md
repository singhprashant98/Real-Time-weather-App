# Skycast – Real-Time Weather App

A responsive real-time weather application that shows current conditions, hourly forecasts, and a 7-day weather forecast for any city.

## Features

- Search weather by city name
- Use the browser’s current location
- Current temperature and “feels like” temperature
- Humidity, wind speed, UV index, and visibility
- Hourly weather forecast
- 7-day forecast
- Celsius and Fahrenheit unit toggle
- Responsive design for mobile and desktop

## Built With

- HTML5
- CSS3
- JavaScript
- [Open-Meteo Weather API](https://open-meteo.com/)
- [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)

## How It Works

1. Enter a city name in the search bar.
2. The app finds its latitude and longitude using the Open-Meteo Geocoding API.
3. It requests live weather data from the Open-Meteo Weather API.
4. The weather dashboard updates with current, hourly, and weekly data.

## Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/real-time-weather-app.git
   ```

2. Open the project folder.

3. Open `index.html` in your browser.

> Internet access is required because the app loads live weather data from Open-Meteo.

## Project Structure

```text
Real-time-Weather-App/
├── index.html      # App layout
├── styles.css      # App styling and responsive design
├── app.js          # Weather API requests and UI updates
└── README.md
```

## API

This project uses Open-Meteo APIs, which do not require an API key for this application.

## Preview

Add a screenshot here after uploading one to your repository:

```md
![Skycast weather dashboard](./screenshot.png)
```

## Author

Your Name  
GitHub: [@your-github-username](https://github.com/your-github-singhprashant98)

