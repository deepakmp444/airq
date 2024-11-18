import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Autocomplete } from "@react-google-maps/api";

const AirQualitySearch = () => {
  const [map, setMap] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const mapsApiKey = "AIzaSyD1u9tqxtffCRYIXcekrL0AliuWnl8_pa8"; // Replace with your Maps API key
  const airQualityApiKey = "AIzaSyD1u9tqxtffCRYIXcekrL0AliuWnl8_pa8"; // Replace with your Air Quality API key

  // Define bounds for Bihar, India (example region)
  const bounds = {
    north: 27.517, // Max latitude
    south: 24.501, // Min latitude
    east: 88.094,  // Max longitude
    west: 83.217,  // Min longitude
  };

  const mapContainerStyle = {
    width: "100%",
    height: "500px",
  };

  const defaultCenter = {
    lat: 25.5941, // Default center (Patna, Bihar)
    lng: 85.1376,
  };

  useEffect(() => {
    if (map && selectedLocation) {
      fetchAndDisplayHeatmap();
    }
  }, [map, selectedLocation]);

  const fetchAndDisplayHeatmap = () => {
    const zoom = map.getZoom();

    const tileLayer = new google.maps.ImageMapType({
      getTileUrl: (coord, zoom) => {
        const tileBounds = tileToBounds(coord.x, coord.y, zoom);

        // Check if the tile is within the defined bounds for Bihar
        if (
          tileBounds.north < bounds.south ||
          tileBounds.south > bounds.north ||
          tileBounds.east < bounds.west ||
          tileBounds.west > bounds.east
        ) {
          return null; // Outside of specified bounds, return no tile
        }

        return `https://airquality.googleapis.com/v1/mapTypes/UAQI_RED_GREEN/heatmapTiles/${zoom}/${coord.x}/${coord.y}?key=${airQualityApiKey}`;
      },
      tileSize: new google.maps.Size(256, 256),
      maxZoom: 15,
      minZoom: 5,
      name: "Air Quality Heatmap",
    });

    map.overlayMapTypes.clear();
    map.overlayMapTypes.insertAt(0, tileLayer);
  };

  // Convert tile coordinates to lat/lng bounds
  const tileToBounds = (x, y, z) => {
    const n = Math.pow(2, z);
    const lonPerTile = 360 / n;
    const latPerTile = 360 / Math.PI / n;

    const west = x * lonPerTile - 180;
    const east = (x + 1) * lonPerTile - 180;
    const north = (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI;
    const south = (Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n))) * 180) / Math.PI;

    return { north, south, east, west };
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();

      if (place.geometry) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setSelectedLocation(location);
        map.panTo(location);
        map.setZoom(12); // Adjust zoom level
      } else {
        alert("Please select a valid location from the dropdown.");
      }
    }
  };

  return (
    <LoadScript googleMapsApiKey={mapsApiKey} libraries={["places"]}>
      <div style={{ marginBottom: "10px" }}>
        <Autocomplete
          onLoad={(auto) => setAutocomplete(auto)}
          onPlaceChanged={onPlaceChanged}
        >
          <input
            type="text"
            placeholder="Search location..."
            style={{
              width: "300px",
              height: "40px",
              padding: "5px",
              fontSize: "16px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </Autocomplete>
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={7}
        onLoad={(mapInstance) => setMap(mapInstance)}
      />
    </LoadScript>
  );
};

export default AirQualitySearch;
