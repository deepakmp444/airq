import React, { useState } from "react";

const getNearbyPoints = (latitude, longitude, radius = 2) => {
  const kmInLatitudeDegree = 110.574;
  const kmInLongitudeDegree = 111.32 * Math.cos(latitude * (Math.PI / 180));
  const latitudeOffset = radius / kmInLatitudeDegree;
  const longitudeOffset = radius / kmInLongitudeDegree;

  return [
    { lat: latitude + latitudeOffset, lon: longitude }, // North
    { lat: latitude - latitudeOffset, lon: longitude }, // South
    { lat: latitude, lon: longitude + longitudeOffset }, // East
    { lat: latitude, lon: longitude - longitudeOffset }, // West
  ];
};

const AirQuality = ({ apiKey }) => {
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [airQualityData, setAirQualityData] = useState(null);
  const [averageAQI, setAverageAQI] = useState(null);
  const [hoveredData, setHoveredData] = useState(null);
  const [searchInput, setSearchInput] = useState("");

  const fetchAirQualityData = async (latitude, longitude) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/airquality/v1/measurements?location=${latitude},${longitude}&key=${apiKey}`
    );
    const data = await response.json();
    return data;
  };

  const calculateAverageAQI = async () => {
    if (!location.lat || !location.lon) return;

    try {
      const nearbyPoints = getNearbyPoints(location.lat, location.lon);

      const results = await Promise.all(
        [location, ...nearbyPoints].map((point) =>
          fetchAirQualityData(point.lat, point.lon)
        )
      );

      const aqiValues = results.map((result) => result?.current?.aqi);
      const validAQIs = aqiValues.filter((aqi) => aqi != null);
      const average =
        validAQIs.reduce((sum, aqi) => sum + aqi, 0) / validAQIs.length;

      setAirQualityData(results);
      setAverageAQI(average);
    } catch (error) {
      console.error("Error fetching air quality data:", error);
    }
  };

  const handlePlaceSearch = async () => {
    if (!searchInput) return;

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${searchInput}&inputtype=textquery&fields=geometry&key=${apiKey}`
    );
    const data = await response.json();

    if (data?.candidates?.length) {
      const { lat, lng } = data.candidates[0].geometry.location;
      setLocation({ lat, lon: lng });
      setAirQualityData(null);
      setAverageAQI(null);
      calculateAverageAQI();
    }
  };

  return (
    <div>
      <h2>Air Quality Information</h2>
      <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Enter a place"
      />
      <button onClick={handlePlaceSearch}>Search Place</button>
      <button onClick={calculateAverageAQI}>
        Get Air Quality for 2km Radius
      </button>

      {averageAQI !== null && (
        <div>
          <h3>Average AQI within 2km: {averageAQI.toFixed(2)}</h3>
          <ul>
            {airQualityData &&
              airQualityData.map((data, index) => (
                <li
                  key={index}
                  onMouseEnter={() => setHoveredData(data)}
                  onMouseLeave={() => setHoveredData(null)}
                  style={{ cursor: "pointer" }}
                >
                  Location {index + 1}:{" "}
                  {hoveredData === data
                    ? `AQI ${data?.current?.aqi || "N/A"}`
                    : "Hover to view AQI"}
                </li>
              ))}
          </ul>
        </div>
      )}

      {hoveredData && (
        <div
          style={{
            border: "1px solid #ddd",
            padding: "10px",
            marginTop: "10px",
          }}
        >
          <h4>Hovered Location Details</h4>
          <p>AQI: {hoveredData?.current?.aqi}</p>
          <p>PM2.5: {hoveredData?.current?.pm2_5} µg/m³</p>
          <p>PM10: {hoveredData?.current?.pm10} µg/m³</p>
        </div>
      )}
    </div>
  );
};

export default AirQuality;
