export const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  '';

if (!GOOGLE_CLIENT_ID) {
  console.warn('Google Client ID no configurado en variables de entorno.');
}
