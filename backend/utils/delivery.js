const axios = require('axios');

const RESTAURANT_COORDS = {
  lat: 34.1463, // Abbottabad coordinates
  lng: 73.2117
};

const DELIVERY_RADIUS_KM = 10; // Maximum delivery radius in kilometers

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(value) {
  return value * Math.PI / 180;
}

async function validateDeliveryZone(deliveryLocation) {
  const distance = calculateDistance(
    RESTAURANT_COORDS.lat,
    RESTAURANT_COORDS.lng,
    deliveryLocation.lat,
    deliveryLocation.lng
  );

  return {
    isValid: distance <= DELIVERY_RADIUS_KM,
    message: distance <= DELIVERY_RADIUS_KM 
      ? "Delivery location is within service area"
      : "Delivery location is outside service area"
  };
}

async function calculateDeliveryFee(deliveryLocation) {
  const distance = calculateDistance(
    RESTAURANT_COORDS.lat,
    RESTAURANT_COORDS.lng,
    deliveryLocation.lat,
    deliveryLocation.lng
  );

  // Base delivery fee
  let fee = 50; // Rs. 50 base fee

  // Add distance-based fee (Rs. 10 per km)
  fee += Math.ceil(distance * 10);

  return fee;
}

async function estimateDeliveryTime(deliveryLocation) {
  try {
    // Get current traffic conditions from Google Maps API
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${RESTAURANT_COORDS.lat},${RESTAURANT_COORDS.lng}&destinations=${deliveryLocation.lat},${deliveryLocation.lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    if (response.data.status === 'OK') {
      const duration = response.data.rows[0].elements[0].duration.value;
      // Add 15 minutes for preparation time
      return duration + 900; // duration in seconds + 15 minutes
    }

    // Fallback estimation if API fails
    const distance = calculateDistance(
      RESTAURANT_COORDS.lat,
      RESTAURANT_COORDS.lng,
      deliveryLocation.lat,
      deliveryLocation.lng
    );
    
    // Assume average speed of 30 km/h
    const estimatedTime = (distance / 30) * 3600; // Convert to seconds
    return estimatedTime + 900; // Add 15 minutes preparation time
  } catch (error) {
    console.error('Error estimating delivery time:', error);
    // Fallback to simple estimation
    const distance = calculateDistance(
      RESTAURANT_COORDS.lat,
      RESTAURANT_COORDS.lng,
      deliveryLocation.lat,
      deliveryLocation.lng
    );
    return (distance / 30) * 3600 + 900;
  }
}

async function optimizeDeliveryRoute(orders) {
  // Simple implementation - can be enhanced with more sophisticated algorithms
  return orders.sort((a, b) => {
    const distA = calculateDistance(
      RESTAURANT_COORDS.lat,
      RESTAURANT_COORDS.lng,
      a.deliveryLocation.lat,
      a.deliveryLocation.lng
    );
    const distB = calculateDistance(
      RESTAURANT_COORDS.lat,
      RESTAURANT_COORDS.lng,
      b.deliveryLocation.lat,
      b.deliveryLocation.lng
    );
    return distA - distB;
  });
}

module.exports = {
  validateDeliveryZone,
  calculateDeliveryFee,
  estimateDeliveryTime,
  optimizeDeliveryRoute
}; 