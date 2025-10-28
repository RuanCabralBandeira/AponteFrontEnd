import React, { createContext, useState, useContext } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ColorSchemeName, View } from "react-native";

type ThemeContextType = {
  theme: ColorSchemeName | "light" | "dark";
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

export default function RootLayout(props: any) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const toggle = () => setTheme(t => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style={theme === "dark" ? "light" : "dark"} />
      </View>
    </ThemeContext.Provider>
  );
}