import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function MatchProfile() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={{ position: "absolute", left: 12, top: 12 }}><Text>‹ Voltar</Text></TouchableOpacity>
      <Image source={{ uri: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800" }} style={styles.image} />
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "800" }}>Juliana, 26</Text>
        <Text style={{ color: "#6b7280", marginTop: 6 }}>Rio de Janeiro, RJ</Text>
        <Text style={{ marginTop: 12 }}>Apaixonada por explorar novos lugares...</Text>
      </View>
      <View style={{ padding: 16 }}>
        <TouchableOpacity style={styles.chatBtn}><Text style={{ color: "#fff" }}>Iniciar Conversa</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  image: { width: "100%", height: 360 },
  chatBtn: { backgroundColor: "#4f46e5", padding: 14, borderRadius: 12, alignItems: "center" }
});