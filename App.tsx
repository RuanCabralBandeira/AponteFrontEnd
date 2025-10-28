import React, { useState, ReactNode } from "react";
import { SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import Welcome from "./src/screens/Welcome";
import Login from "./src/screens/Login";
import RegisterFlow from "./src/screens/RegisterFlow";
import MainApp from "./src/screens/MainApp";

export type ScreenKey = "welcome" | "login" | "register" | "main";

export default function App() {
  const [screen, setScreen] = useState<ScreenKey>("welcome");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.frame}>
        {screen === "welcome" && <Welcome onNavigate={setScreen} />}
        {screen === "login" && <Login onNavigate={setScreen} />}
        {screen === "register" && <RegisterFlow onNavigate={setScreen} />}
        {screen === "main" && <MainApp onNavigate={setScreen} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  frame: {
    flex: 1,
    alignSelf: "center",
    width: "100%",
    maxWidth: 420,
    minHeight: 600,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    elevation: 6,
  },
});