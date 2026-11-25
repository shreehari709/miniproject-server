/**
 * Calculate distance between two coordinates in meters using the Haversine formula
 */
export const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  if (
    lat1 === undefined ||
    lon1 === undefined ||
    lat2 === undefined ||
    lon2 === undefined
  ) {
    return null;
  }

  const R = 6371000; // Radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance);
};

/**
 * Determine proximity status based on distance in meters
 * Thresholds:
 * < 50m: Together (Eligible for Pickup Verification)
 * 50m - 200m: Nearby
 * > 200m: Separated / Approaching
 */
export const getProximityStatus = (distanceMeters) => {
  if (distanceMeters === null || distanceMeters === undefined) {
    return {
      status: 'Location Unavailable',
      code: 'UNAVAILABLE',
      canVerifyPickup: false,
      color: 'gray',
    };
  }

  if (distanceMeters <= 50) {
    return {
      status: 'Together - Pickup Verified Eligible',
      code: 'TOGETHER',
      distanceMeters,
      canVerifyPickup: true,
      color: 'emerald',
    };
  } else if (distanceMeters <= 200) {
    return {
      status: 'Nearby',
      code: 'NEARBY',
      distanceMeters,
      canVerifyPickup: false,
      color: 'blue',
    };
  } else if (distanceMeters <= 1000) {
    return {
      status: 'Approaching',
      code: 'APPROACHING',
      distanceMeters,
      canVerifyPickup: false,
      color: 'amber',
    };
  } else {
    return {
      status: 'Separated',
      code: 'SEPARATED',
      distanceMeters,
      canVerifyPickup: false,
      color: 'red',
    };
  }
};
