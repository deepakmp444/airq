import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";

const AirQualityHeatmap = () => {
  const [map, setMap] = useState(null);
  const mapsApiKey = "AIzaSyD1u9tqxtffCRYIXcekrL0AliuWnl8_pa8"; // Replace with your Maps API key
  const airQualityApiKey = "AIzaSyD1u9tqxtffCRYIXcekrL0AliuWnl8_pa8"; // Replace with your Air Quality API key

  const mapContainerStyle = {
    width: "100%",
    height: "500px",
  };

  const center = {
    lat: 37.7749, // Default center (San Francisco)
    lng: -122.4194,
  };

  useEffect(() => {
    if (map) {
      addHeatmapTileOverlay();
    }
  }, [map]);

  const addHeatmapTileOverlay = () => {
    const tileLayer = new google.maps.ImageMapType({
      getTileUrl: (coord, zoom) => {
        return `https://airquality.googleapis.com/v1/mapTypes/UAQI_RED_GREEN/heatmapTiles/${zoom}/${coord.x}/${coord.y}?key=${airQualityApiKey}`;
      },
      tileSize: new google.maps.Size(256, 256),
      maxZoom: 15,
      minZoom: 1,
      name: "Air Quality Heatmap",
    });

    map.overlayMapTypes.insertAt(0, tileLayer);
  };

  return (
    <LoadScript googleMapsApiKey={mapsApiKey}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={5}
        onLoad={(mapInstance) => setMap(mapInstance)}
      />
    </LoadScript>
  );
};

export default AirQualityHeatmap;
