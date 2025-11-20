import React from 'react';
import UnifiedLogin from './screens/Login/RoleSelect';

// Thin wrapper to expose unified login component as a route for expo-router.
export default function LoginRoute() {
  return <UnifiedLogin />;
}