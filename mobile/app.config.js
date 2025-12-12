// Expo dynamic config to inject secrets via env
const dotenv = require('dotenv');
dotenv.config();

module.exports = ({ config }) => {
  const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';
  return {
    ...config,
    extra: {
      ...(config.extra || {}),
      googleMapsApiKey,
    },
  };
};
