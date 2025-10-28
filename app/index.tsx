import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Welcome() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>Aponte</Text>
        <Text style={styles.subtitle}>Um novo encontro, todos os dias.</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primary} onPress={() => router.push("/register")}>
          <Text style={styles.primaryText}>Criar Conta</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.ghost} onPress={() => router.push("/login")}>
          <Text style={styles.ghostText}>Já tenho conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "space-between", padding: 24, backgroundColor: "#6d28d9" },
  hero: { alignItems: "center", marginTop: 60 },
  title: { fontSize: 44, color: "#fff", fontWeight: "800" },
  subtitle: { color: "#c7d2fe", marginTop: 8 },
  actions: { marginBottom: 48 },
  primary: { backgroundColor: "#ffffff", padding: 16, borderRadius: 14, alignItems: "center" },
  primaryText: { color: "#4f46e5", fontWeight: "800" },
  ghost: { marginTop: 12, alignItems: "center" },
  ghostText: { color: "#c7d2fe", fontWeight: "600" },
});