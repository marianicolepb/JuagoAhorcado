import { Stack } from 'expo-router';

export default function GameLayout() {
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
        name="play" 
        options={{ 
          title: 'Ahorcado',
          headerShown: true,
          headerBackVisible: false
        }} 
      />
    </Stack>
  );
}