import React from "react";
import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="match" options={{ href: "/(tabs)/match" }} />
      <Tabs.Screen name="chat" options={{ href: "/(tabs)/chat" }} />
      <Tabs.Screen name="profile" options={{ href: "/(tabs)/profile" }} />
    </Tabs>
  );
}