import React from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity } from "react-native";

export default function Chat() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=80" }} style={styles.avatar} />
        <Text style={{ marginLeft: 10, fontWeight: "700" }}>Juliana</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.msgLeft}><Text>Olá! Adorei as tuas fotos.</Text></View>
        <View style={styles.msgRight}><Text style={{ color: "#fff" }}>Oi, Juliana! Obrigado 😊</Text></View>
      </View>

      <View style={styles.inputRow}>
        <TextInput placeholder="Escreva uma mensagem..." style={styles.input} />
        <TouchableOpacity style={styles.send}><Text style={{ color: "#fff" }}>Enviar</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  header: { flexDirection: "row", alignItems: "center", padding: 12, borderBottomWidth: 1, borderColor: "#e5e7eb" },
  avatar: { width: 44, height: 44, borderRadius: 44 },
  body: { flex: 1, padding: 12 },
  msgLeft: { alignSelf: "flex-start", backgroundColor: "#e5e7eb", padding: 10, borderRadius: 12, marginBottom: 8, maxWidth: "70%" },
  msgRight: { alignSelf: "flex-end", backgroundColor: "#4f46e5", padding: 10, borderRadius: 12, marginBottom: 8, maxWidth: "70%" },
  inputRow: { flexDirection: "row", padding: 12, borderTopWidth: 1, borderColor: "#e5e7eb", alignItems: "center" },
  input: { flex: 1, backgroundColor: "#f3f4f6", padding: 10, borderRadius: 10 },
  send: { marginLeft: 8, backgroundColor: "#4f46e5", padding: 10, borderRadius: 8 },
});