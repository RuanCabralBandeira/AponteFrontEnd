import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ScreenKey } from "../../App";

export default function Welcome({ onNavigate }: { onNavigate: (s: ScreenKey) => void }) {
  return (
    <View style={styles.container}>
      <View style={styles.top}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "linear-gradient(180deg,#6366f1,#7c3aed)" as any, padding: 28, justifyContent: "space-between" },
  top: { alignItems: "center", marginTop: 20 },
  logo: { fontSize: 40, fontWeight: "800", color: "#ffffff" },
  subtitle: { marginTop: 8, color: "#dbeafe" },
  footer: { width: "100%" },
  primaryBtn: { backgroundColor: "#ffffff", paddingVertical: 14, borderRadius: 16, alignItems: "center" },
  primaryText: { color: "#4f46e5", fontWeight: "700", fontSize: 16 },
  ghostBtn: { marginTop: 12, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  ghostText: { color: "#c7d2fe", fontWeight: "600" },
});