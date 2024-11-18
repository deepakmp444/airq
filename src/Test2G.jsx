import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, Circle, StandaloneSearchBox, HeatmapLayer } from '@react-google-maps/api';
import { Container, Card, Form, Row, Col, Badge, Spinner } from 'react-bootstrap';

// Replace with your actual Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyD1u9tqxtffCRYIXcekrL0AliuWnl8_pa8';

// Libraries we need to load
const libraries = ['places', 'visualization'];

// Mock air quality data generator with correct LatLng format
const generateMockAirQualityData = (center, numPoints = 50) => {
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

const getAQIStatus = (aqi) => {
  if (aqi < 50) return { text: 'Good', variant: 'success' };
  if (aqi < 100) return { text: 'Moderate', variant: 'warning' };
  return { text: 'Poor', variant: 'danger' };
};

const MapComponent = ({ isLoaded }) => {
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState({ lat: 51.5074, lng: -0.1278 });
  const [searchBox, setSearchBox] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [averageAQI, setAverageAQI] = useState(0);
  const [showHeatmap, setShowHeatmap] = useState(false);
  
  const searchBoxRef = useRef(null);

  const containerStyle = {
    width: '100%',
    height: '400px'
  };

  const onLoad = useCallback((map) => {
    setMap(map);
    // Delay generating heatmap data until Google Maps is fully loaded
    setTimeout(() => {
      const initialData = generateMockAirQualityData(center);
      setHeatmapData(initialData);
      setAverageAQI(
        Math.round(
          initialData.reduce((acc, point) => acc + point.weight, 0) / initialData.length
        )
      );
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

      const newData = generateMockAirQualityData(newCenter);
      setHeatmapData(newData);
      setAverageAQI(
        Math.round(
          newData.reduce((acc, point) => acc + point.weight, 0) / newData.length
        )
      );
    }
  };

  const aqiStatus = getAQIStatus(averageAQI);

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
          <h5 className="d-flex align-items-center">
            Average Air Quality Index: {averageAQI}
            <Badge 
              bg={aqiStatus.variant}
              className="ms-2"
            >
              {aqiStatus.text}
            </Badge>
          </h5>
        </Col>
      </Row>

      <Row>
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

      <Row className="mt-3">
        <Col>
          <Card className="bg-light">
            <Card.Body>
              <h6 className="mb-2">Air Quality Index Legend</h6>
              <div className="d-flex gap-3">
                <Badge bg="success">Good (0-50)</Badge>
                <Badge bg="warning">Moderate (51-100)</Badge>
                <Badge bg="danger">Poor (>100)</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

const AirQualityMap = () => {
  return (
    <Container fluid className="p-3">
      <Card className="shadow-sm">
        <Card.Header as="h5" className="bg-primary text-white">
          Air Quality Map
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

export default AirQualityMap;