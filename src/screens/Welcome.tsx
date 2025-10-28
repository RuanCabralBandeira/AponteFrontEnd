import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ScreenKey } from "../../App";
// NOTA: Para o gradiente funcionar, você precisa do 'expo-linear-gradient' ou similar.
// A sintaxe "as any" é um paliativo.
import { LinearGradient } from "expo-linear-gradient"; // Exemplo de import

export default function Welcome({ onNavigate }: { onNavigate: (s: ScreenKey) => void }) {
  return (
    <LinearGradient
      colors={["#4f46e5", "#7e22ce"]} // from-indigo-600 to-purple-700
      style={styles.container}
    >
      <View style={styles.top}>
        {/* O ícone de relógio do HTML */}
        <Text style={styles.icon}>⏰</Text>
        <Text style={styles.logo}>Aponte</Text>
        <Text style={styles.subtitle}>Um novo encontro, todos os dias.</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => onNavigate("register")}>
          <Text style={styles.primaryText}>Criar Conta</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.ghostBtn} onPress={() => onNavigate("login")}>
          <Text style={styles.ghostText}>Já tenho conta</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32, // p-8
    justifyContent: "space-between",
  },
  top: {
    alignItems: "center",
    marginTop: 64, // mt-16
  },
  icon: {
    fontSize: 72,
    marginBottom: 8,
  },
  logo: {
    fontSize: 48, // text-5xl
    fontWeight: "700", // font-bold
    color: "#ffffff",
    marginTop: 16, // mt-4
  },
  subtitle: {
    marginTop: 8, // mt-2
    color: "#c7d2fe", // text-indigo-200
    fontSize: 16,
  },
  footer: {
    width: "100%",
  },
  primaryBtn: {
    backgroundColor: "#ffffff",
    paddingVertical: 16, // py-4
    paddingHorizontal: 24, // px-6
    borderRadius: 12, // rounded-xl
    alignItems: "center",
  },
  primaryText: {
    color: "#4f46e5", // text-indigo-600
    fontWeight: "700", // font-bold
    fontSize: 18, // text-lg
  },
  ghostBtn: {
    marginTop: 16, // mt-4
    paddingVertical: 8, // py-2
    paddingHorizontal: 24, // px-6
    borderRadius: 12, // rounded-xl
    alignItems: "center",
  },
  ghostText: {
    color: "#c7d2fe", // text-indigo-200
    fontWeight: "600", // font-semibold
    fontSize: 16,
  },
});