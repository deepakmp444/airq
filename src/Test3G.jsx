import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, Circle, StandaloneSearchBox, HeatmapLayer } from '@react-google-maps/api';
import { Container, Card, Form, Row, Col, Badge, Spinner, Table, Tabs, Tab } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const GOOGLE_MAPS_API_KEY = 'AIzaSyD1u9tqxtffCRYIXcekrL0AliuWnl8_pa8';
const libraries = ['places', 'visualization'];

// Mock data generator for monthly averages
const generateMonthlyData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  
  return {
    currentYear: months.map(month => ({
      month,
      aqi: Math.floor(Math.random() * 150 + 30),
      year: currentYear
    })),
    lastYear: months.map(month => ({
      month,
      aqi: Math.floor(Math.random() * 150 + 30),
      year: lastYear
    }))
  };
};

// Mock air quality details generator
const generateAirQualityDetails = () => ({
  localAQI: {
    value: Math.floor(Math.random() * 150 + 30),
    category: 'Moderate',
    color: '#FFA500'
  },
  dominantPollutant: {
    name: 'PM2.5',
    concentration: Math.random() * 50,
    unit: 'µg/m³'
  },
  pollutants: [
    { name: 'PM2.5', concentration: Math.random() * 50, unit: 'µg/m³' },
    { name: 'PM10', concentration: Math.random() * 100, unit: 'µg/m³' },
    { name: 'O3', concentration: Math.random() * 100, unit: 'ppb' },
    { name: 'NO2', concentration: Math.random() * 100, unit: 'ppb' },
    { name: 'SO2', concentration: Math.random() * 100, unit: 'ppb' },
    { name: 'CO', concentration: Math.random() * 10, unit: 'ppm' }
  ],
  healthRecommendations: [
    'Sensitive groups should reduce outdoor exercise',
    'Consider wearing a mask outdoors',
    'Close windows during peak hours',
    'Use air purifiers indoors'
  ],
  additionalInfo: {
    weatherConditions: {
      temperature: Math.random() * 30 + 10,
      humidity: Math.random() * 100,
      windSpeed: Math.random() * 20
    },
    lastUpdated: new Date().toLocaleString()
  }
});

const generateHeatmapData = (center, numPoints = 50) => {
  if (!window.google) return [];
  
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const lat = center.lat + (Math.random() - 0.5) * 0.04;
    const lng = center.lng + (Math.random() - 0.5) * 0.04;
    points.push({
      location: new window.google.maps.LatLng(lat, lng),
      weight: Math.random() * 100
    });
  }
  return points;
};

const AirQualityDetails = ({ data }) => (
  <Card className="mb-3">
    <Card.Body>
      <h6>Current Air Quality Details</h6>
      <Row>
        <Col md={6}>
          <Table striped bordered hover size="sm">
            <tbody>
              <tr>
                <td>Local AQI</td>
                <td>
                  <Badge bg={data.localAQI.value < 50 ? 'success' : 
                           data.localAQI.value < 100 ? 'warning' : 'danger'}>
                    {data.localAQI.value}
                  </Badge>
                </td>
              </tr>
              <tr>
                <td>Dominant Pollutant</td>
                <td>{data.dominantPollutant.name} ({data.dominantPollutant.concentration.toFixed(1)} {data.dominantPollutant.unit})</td>
              </tr>
            </tbody>
          </Table>
        </Col>
        <Col md={6}>
          <h6>Health Recommendations</h6>
          <ul className="small">
            {data.healthRecommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </Col>
      </Row>

      <h6 className="mt-3">Pollutant Concentrations</h6>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Pollutant</th>
            <th>Concentration</th>
            <th>Unit</th>
          </tr>
        </thead>
        <tbody>
          {data.pollutants.map((pollutant, index) => (
            <tr key={index}>
              <td>{pollutant.name}</td>
              <td>{pollutant.concentration.toFixed(2)}</td>
              <td>{pollutant.unit}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="mt-3 small text-muted">
        Last updated: {data.additionalInfo.lastUpdated}
      </div>
    </Card.Body>
  </Card>
);

const MonthlyTrendChart = ({ data }) => (
  <Card className="mb-3">
    <Card.Body>
      <h6>Monthly AQI Trends</h6>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data.currentYear}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="aqi" stroke="#8884d8" name="AQI" />
        </LineChart>
      </ResponsiveContainer>
    </Card.Body>
  </Card>
);

const MapComponent = ({ isLoaded }) => {
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState({ lat: 51.5074, lng: -0.1278 });
  const [searchBox, setSearchBox] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [airQualityData, setAirQualityData] = useState(generateAirQualityDetails());
  const [monthlyData, setMonthlyData] = useState(generateMonthlyData());
  
  const searchBoxRef = useRef(null);

  const containerStyle = {
    width: '100%',
    height: '400px'
  };

  const onLoad = useCallback((map) => {
    setMap(map);
    setTimeout(() => {
      const initialData = generateHeatmapData(center);
      setHeatmapData(initialData);
      setShowHeatmap(true);
    }, 100);
  }, [center]);

  const onSearchBoxLoad = (ref) => {
    setSearchBox(ref);
  };

  const onPlacesChanged = () => {
    if (searchBox) {
      const places = searchBox.getPlaces();
      if (places.length === 0) return;

      const place = places[0];
      if (!place.geometry || !place.geometry.location) return;

      const newCenter = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };

      setCenter(newCenter);
      map?.panTo(newCenter);

      // Update all data for new location
      setHeatmapData(generateHeatmapData(newCenter));
      setAirQualityData(generateAirQualityDetails());
      setMonthlyData(generateMonthlyData());
    }
  };

  if (!isLoaded) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <>
      <Row className="mb-3">
        <Col>
          <StandaloneSearchBox
            onLoad={onSearchBoxLoad}
            onPlacesChanged={onPlacesChanged}
          >
            <Form.Control
              ref={searchBoxRef}
              type="text"
              placeholder="Search for a location"
              className="form-control-lg"
            />
          </StandaloneSearchBox>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Card className="map-container">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={14}
              onLoad={onLoad}
            >
              <Circle
                center={center}
                radius={2000}
                options={{
                  strokeColor: '#FF0000',
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                  fillColor: '#FF0000',
                  fillOpacity: 0.1,
                }}
              />
              
              {showHeatmap && heatmapData.length > 0 && (
                <HeatmapLayer
                  data={heatmapData}
                  options={{
                    radius: 20,
                    opacity: 0.7,
                    gradient: [
                      'rgba(0, 255, 0, 0)',
                      'rgba(0, 255, 0, 1)',
                      'rgba(255, 255, 0, 1)',
                      'rgba(255, 0, 0, 1)'
                    ]
                  }}
                />
              )}
            </GoogleMap>
          </Card>
        </Col>
      </Row>

      <AirQualityDetails data={airQualityData} />
      
      <Tabs defaultActiveKey="current" className="mb-3">
        <Tab eventKey="current" title="Current Year">
          <MonthlyTrendChart data={monthlyData} />
        </Tab>
        <Tab eventKey="previous" title="Previous Year">
          <MonthlyTrendChart data={{ currentYear: monthlyData.lastYear }} />
        </Tab>
      </Tabs>
    </>
  );
};

const AirQualityDashboard = () => {
  return (
    <Container fluid className="p-3">
      <Card className="shadow-sm">
        <Card.Header as="h5" className="bg-primary text-white">
          Air Quality Dashboard
        </Card.Header>
        <Card.Body>
          <LoadScript
            googleMapsApiKey={GOOGLE_MAPS_API_KEY}
            libraries={libraries}
          >
            <MapComponent isLoaded={true} />
          </LoadScript>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AirQualityDashboard;