import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";

export default function Match() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={{ alignItems: "center", marginTop: 12 }}>
        <Text style={{ color: "#6b7280" }}>Novo Aponte em</Text>
        <Text style={{ fontSize: 22, fontWeight: "800" }}>23:59:59</Text>
      </View>

      <TouchableOpacity style={styles.card} onPress={() => router.push("/match-profile")}>
        <Image source={{ uri: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800" }} style={styles.cardImage} />
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>Juliana, 26</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f8fafc" },
  card: { borderRadius: 16, overflow: "hidden", elevation: 4, backgroundColor: "#fff", marginTop: 20 },
  cardImage: { width: "100%", height: 300 },
  cardInfo: { position: "absolute", left: 16, bottom: 16 },
  cardName: { color: "#fff", fontSize: 26, fontWeight: "800" },
});