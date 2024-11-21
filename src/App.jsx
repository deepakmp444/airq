import React from "react";
import AirQuality from "./AirQuality";
import AirQualityMap from "./AirQualityMap";
import AirAPI from "./AirAPI";
import AirQualityHeatmap from "./AirQualityHeatmap";
import MapComponent from "./FinalQuality";

function App() {
  return (
    <div>
      {/* <AirQuality /> */}
      {/* <AirQualityMap/> */}
      {/* <AirAPI/> */}
      {/* <AirQualityHeatmap/>? */}
      <MapComponent/>
    </div>
  );
}

export default App;
