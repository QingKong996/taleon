import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="providers"
        options={{
          headerShown: true,
          title: '供应商',
        }}
      />
      <Stack.Screen
        name="provider"
        options={{
          headerShown: true,
          title: '供应商',
        }}
      />
    </Stack>
  );
}
