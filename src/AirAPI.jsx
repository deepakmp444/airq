import axios from "axios";
import React, { useEffect, useState } from "react";
// Replace with your actual Google Maps API key
const GOOGLE_MAPS_API_KEY = "AIzaSyD1u9tqxtffCRYIXcekrL0AliuWnl8_pa8";
// const OPEN_API_KEY = "d2414419d3af28d1842e009e01eb2845";

function AirAPI() {
  const [state, setState] = useState([]);
  const lat = 25.611; // Latitude for Bihar, India
  const lon = 85.144; // Longitude for Bihar, India
  const start = 1672531200; // January 1, 2023
  const end = 1675123199; // January 31, 2023
  const apiKey = 'd2414419d3af28d1842e009e01eb2845'; // Replace with your OpenWeatherMap API key

  const url = `http://api.openweathermap.org/data/2.5/air_pollution/history?lat=${lat}&lon=${lon}&start=${start}&end=${end}&appid=${apiKey}`;

  useEffect(() => {
    // getHistoryAir();
    openWeather();
  }, []);

  const getHistoryAir = async () => {
    try {
      const data = await axios.post(
        `https://airquality.googleapis.com/v1/history:lookup?key=${GOOGLE_MAPS_API_KEY}`,
        {
          period: {
            startTime: "2023-06-15T08:00:00Z",
            endTime: "2023-06-15T12:00:00Z",
          },
          pageSize: 2,
          pageToken: "",
          location: {
            latitude: 37.419734,
            longitude: -122.0827784,
          },
        }
      );
      console.log(data);
    } catch (e) {
      console.log("e", e);
    }
  };

  const openWeather = async () => {
    try {
      const response = await axios.get(url);
      const data = response.data;
  
      console.log("Data", data);
  
      if (Array.isArray(data.list)) {
        // Add readable dates
        data.list.forEach((entry) => {
          const date = new Date(entry.dt * 1000);
          entry.readable_date = date.toISOString();
        });
  
        // Calculate averages
        const totalEntries = data.list.length;
        const averages = {
          aqi: 0,
          components: {
            co: 0,
            no: 0,
            no2: 0,
            o3: 0,
            so2: 0,
            pm2_5: 0,
            pm10: 0,
            nh3: 0,
          },
        };
  
        // Sum all values
        data.list.forEach((entry) => {
          averages.aqi += entry.main.aqi;
          Object.keys(averages.components).forEach((key) => {
            averages.components[key] += entry.components[key] || 0;
          });
        });
  
        // Calculate average by dividing sums by total entries
        averages.aqi /= totalEntries;
        Object.keys(averages.components).forEach((key) => {
          averages.components[key] /= totalEntries;
        });
  
        console.log("Averages:", averages);
      } else {
        console.log("No valid data list found:", data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
  return <div>AirAPI</div>;
}

export default AirAPI;
