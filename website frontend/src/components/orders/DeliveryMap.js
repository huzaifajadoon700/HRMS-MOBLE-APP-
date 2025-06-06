// src/components/DeliveryMap.js
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import PropTypes from 'prop-types';

mapboxgl.accessToken =
  'pk.eyJ1IjoiaHV6YWlmYXQiLCJhIjoiY203bTQ4bW1oMGphYjJqc2F3czdweGp2MCJ9.w5qW_qWkNoPipYyb9MsWUw';

const DeliveryMap = ({ deliveryLocation, initialCenter, onLoad }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const routeCoordinates = useRef([]); // To record the traveled path
  const [styleLoaded, setStyleLoaded] = useState(false);

  // Initialize the Mapbox map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: initialCenter, // [lng, lat]
      zoom: 12,
    });

    mapRef.current.on('load', () => {
      setStyleLoaded(true);
      if (onLoad) onLoad();

      // Create and add a custom pickup marker (🏠) at the initial center
      const pickupEl = document.createElement('div');
      pickupEl.className = 'pickup-marker';
      pickupEl.style.fontSize = '28px';
      pickupEl.innerHTML = '🏠';
      new mapboxgl.Marker({ element: pickupEl })
        .setLngLat(initialCenter)
        .addTo(mapRef.current);

      // Create and add a custom destination marker (🎯) at fixed destination coordinates
      const destinationEl = document.createElement('div');
      destinationEl.className = 'destination-marker';
      destinationEl.style.fontSize = '28px';
      destinationEl.innerHTML = '🎯';
      new mapboxgl.Marker({ element: destinationEl })
        .setLngLat([73.2215, 34.1688])
        .addTo(mapRef.current);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initialCenter, onLoad]);

  // Update the driver marker and draw/update the route line
  useEffect(() => {
    if (!mapRef.current || !deliveryLocation) return;

    const lngLat = [deliveryLocation.lng, deliveryLocation.lat];

    // Create or update the driver marker (🚚) with a custom element
    if (!driverMarkerRef.current) {
      const driverEl = document.createElement('div');
      driverEl.className = 'driver-marker';
      driverEl.style.fontSize = '32px';
      driverEl.style.transform = 'translate(-50%, -50%)';
      driverEl.innerHTML = '🚚';
      driverMarkerRef.current = new mapboxgl.Marker({ element: driverEl })
        .setLngLat(lngLat)
        .addTo(mapRef.current);
    } else {
      driverMarkerRef.current.setLngLat(lngLat);
    }

    // Animate the map to fly to the driver's current location
    mapRef.current.flyTo({
      center: lngLat,
      speed: 0.8,
      essential: true,
    });

    // Record route coordinates if they differ from the last coordinate
    if (
      routeCoordinates.current.length === 0 ||
      (routeCoordinates.current[routeCoordinates.current.length - 1][0] !== lngLat[0] ||
        routeCoordinates.current[routeCoordinates.current.length - 1][1] !== lngLat[1])
    ) {
      routeCoordinates.current.push(lngLat);
    }

    // Function to update or add the route line source/layer
    const updateRoute = () => {
      if (mapRef.current.getSource('route')) {
        mapRef.current.getSource('route').setData({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates.current,
          },
        });
      } else {
        mapRef.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: routeCoordinates.current,
            },
          },
        });
        mapRef.current.addLayer({
          id: 'routeLine',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#ff7e00',
            'line-width': 5,
          },
        });
      }
    };

    // Ensure the style is loaded before updating the route
    if (!mapRef.current.isStyleLoaded()) {
      mapRef.current.once('style.load', updateRoute);
    } else {
      updateRoute();
    }
  }, [deliveryLocation]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: '100%',
        height: '500px',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      }}
    />
  );
};

DeliveryMap.propTypes = {
  deliveryLocation: PropTypes.object,
  initialCenter: PropTypes.array.isRequired,
  onLoad: PropTypes.func, // Callback when the map has finished loading
};

export default DeliveryMap;
