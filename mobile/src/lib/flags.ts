/** PLAN §1/G4: push stays behind a flag until the backend sends pushes. Set EXPO_PUBLIC_PUSH_ENABLED=true to turn it on. */
export const PUSH_ENABLED = process.env.EXPO_PUBLIC_PUSH_ENABLED === 'true';
