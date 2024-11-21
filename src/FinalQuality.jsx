import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, useJsApiLoader, Autocomplete, Marker } from "@react-google-maps/api";
import axios from "axios";

// Define libraries as a constant outside the component
const libraries = ["places"];

const AirQualityHeatmap = () => {
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState({ lat: 12.9716, lng: 77.5946 }); // Bangalore, India
  const [marker, setMarker] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const autocompleteRef = useRef(null);

  const mapsApiKey = "AIzaSyD1u9tqxtffCRYIXcekrL0AliuWnl8_pa8";
  const airQualityApiKey = "AIzaSyD1u9tqxtffCRYIXcekrL0AliuWnl8_pa8";

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: mapsApiKey,
    libraries, // Use the constant libraries array here
  });

  useEffect(() => {
    if (isLoaded && map) {
      addHeatmapTileOverlay();
    }
    if (isLoaded) {
      fetchAirQualityData(center.lat, center.lng); // Fetch air quality data for Bangalore by default
    }
  }, [isLoaded, map]);

  const addHeatmapTileOverlay = () => {
    const tileLayer = new window.google.maps.ImageMapType({
      getTileUrl: (coord, zoom) => {
        return `https://airquality.googleapis.com/v1/mapTypes/UAQI_RED_GREEN/heatmapTiles/${zoom}/${coord.x}/${coord.y}?key=${airQualityApiKey}`;
      },
      tileSize: new window.google.maps.Size(256, 256),
      maxZoom: 15,
      minZoom: 1,
      name: "Air Quality Heatmap",
    });

    map.overlayMapTypes.insertAt(0, tileLayer);
  };

  const handlePlaceSelected = () => {
    const place = autocompleteRef.current.getPlace();
    if (place.geometry) {
      const { lat, lng } = place.geometry.location;
      const newCenter = { lat: lat(), lng: lng() };
      setCenter(newCenter);
      setMarker(newCenter);
      fetchAirQualityData(lat(), lng());
    }
  };

  const fetchAirQualityData = async (lat, lng) => {
    try {
      const response = await axios.post(
        `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${airQualityApiKey}`,
        { location: { latitude: lat, longitude: lng } }
      );
      setAirQualityData(response.data);
    } catch (error) {
      console.error("Error fetching air quality data:", error);
    }
  };

  if (!isLoaded) {
    return <div>{loadError ? `Error loading maps: ${loadError.message}` : "Loading..."}</div>;
  }

  return (
    <div>
      <h1>Air Quality Heatmap</h1>
      <Autocomplete
        onLoad={(ref) => (autocompleteRef.current = ref)}
        onPlaceChanged={handlePlaceSelected}
      >
        <input
          type="text"
          placeholder="Search a location"
          style={{
            width: "300px",
            height: "40px",
            padding: "10px",
            fontSize: "16px",
          }}
        />
      </Autocomplete>

      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "500px" }}
        center={center} // Bangalore by default
        zoom={5} // Slightly zoomed-out view
        onLoad={(mapInstance) => setMap(mapInstance)}
      >
        {marker && <Marker position={marker} />}
      </GoogleMap>

      <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc" }}>
        <h3>Air Quality Data</h3>
        {airQualityData ? (
          <div>
            <p>
              <strong>Category:</strong> {airQualityData.indexes[0].category}
            </p>
            <p>
              <strong>AQI:</strong> {airQualityData.indexes[0].aqiDisplay}
            </p>
            <p>
              <strong>Dominant Pollutant:</strong>{" "}
              {airQualityData.indexes[0].dominantPollutant}
            </p>
          </div>
        ) : (
          <p>No air quality data available. Search a location to view data.</p>
        )}
      </div>
    </div>
  );
};

export default AirQualityHeatmap;
