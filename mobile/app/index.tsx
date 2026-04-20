import { Redirect } from 'expo-router';

export default function Index() {
  // Simulando que no hay sesión por defecto en el inicio de la app.
  // En un entorno real leeríamos de un AuthProvider o AsyncStorage.
  const hasSession = false;

  if (hasSession) {
    return <Redirect href="/(app)/dashboard" />;
  } else {
    return <Redirect href="/(auth)/login" />;
  }
}
