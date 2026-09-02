import { Tabs } from 'expo-router';

import { TabBar } from '@/components/navigation/tab-bar';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="reservations" options={{ title: 'Réservations' }} />
      <Tabs.Screen name="restaurant" options={{ title: 'Restaurant' }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
