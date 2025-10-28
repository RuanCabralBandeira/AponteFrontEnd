import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../_layout";

export default function Profile() {
  const router = useRouter();
  const { theme, toggle } = useTheme();

  return (
    <View style={[styles.container, theme === "dark" ? { backgroundColor: "#0f172a" } : {}]}>
      <View style={styles.header}>
        <Image source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400" }} style={styles.avatar} />
        <Text style={styles.name}>Ruan, 28</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.edit} onPress={() => router.push("/edit-profile")}><Text>Editar Perfil</Text></TouchableOpacity>
        <TouchableOpacity style={styles.settings} onPress={() => router.push("/settings")}><Text>⚙️</Text></TouchableOpacity>
      </View>

      <View style={{ marginTop: 20 }}>
        <TouchableOpacity style={styles.toggle} onPress={toggle}><Text>Alternar tema (atual: {theme})</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f8fafc" },
  header: { alignItems: "center", marginTop: 12 },
  avatar: { width: 120, height: 120, borderRadius: 999, borderWidth: 6, borderColor: "#6366f1" },
  name: { fontSize: 22, fontWeight: "800", marginTop: 12 },
  actions: { flexDirection: "row", marginTop: 16, gap: 8 },
  edit: { flex: 1, backgroundColor: "#e5e7eb", padding: 12, borderRadius: 12, alignItems: "center" },
  settings: { width: 56, backgroundColor: "#e5e7eb", padding: 12, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  toggle: { marginTop: 8, backgroundColor: "#e5e7eb", padding: 12, borderRadius: 12, alignItems: "center" }
});