import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Settings() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={{ position: "absolute", left: 12, top: 12 }}><Text>‹ Voltar</Text></TouchableOpacity>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "700" }}>Configurações</Text>
        <TouchableOpacity style={styles.signout} onPress={() => router.replace("/")}>
          <Text style={{ color: "#ef4444" }}>Terminar Sessão</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  signout: { marginTop: 20, padding: 12, borderRadius: 12, backgroundColor: "rgba(239,68,68,0.08)" }
});