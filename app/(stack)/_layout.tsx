import { Stack } from 'expo-router';

export default function StackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2563eb',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Ahorcado Multijugador',
          headerShown: true
        }} 
      />
      <Stack.Screen 
        name="auth/login" 
        options={{ 
          title: 'Iniciar Sesión',
          headerShown: true
        }} 
      />
      <Stack.Screen 
        name="auth/register" 
        options={{ 
          title: 'Registrarse',
          headerShown: true
        }} 
      />
    <Stack.Screen 
      name="rooms/create" 
      options={{ 
        title: 'Crear Sala',
        headerShown: true
      }} 
    />
    <Stack.Screen 
      name="rooms/join" 
      options={{ 
        title: 'Unirse a Sala',
        headerShown: true
      }} 
    />
    </Stack>
  );
}