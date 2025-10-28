import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput } from "react-native";
import { ScreenKey } from "../../App";

type Tab = "match" | "chat" | "profile";

export default function MainApp({ onNavigate }: { onNavigate: (s: ScreenKey) => void }) {
  const [tab, setTab] = useState<Tab>("match");

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {tab === "match" && (
          <View style={{ padding: 16 }}>
            <View style={{ alignItems: "center", marginBottom: 12 }}>
              <Text style={{ color: "#6b7280" }}>Novo Aponte em</Text>
              <Text style={{ fontSize: 22, fontWeight: "800" }}>23:59:59</Text>
            </View>

            <TouchableOpacity style={styles.card} onPress={() => setTab("profile")}>
              <Image source={{ uri: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800" }} style={styles.cardImage} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>Juliana, 26</Text>
                <View style={styles.tag}><Text style={{ color: "#fff", fontSize: 12 }}>Fotografia</Text></View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {tab === "chat" && (
          <View style={{ flex: 1 }}>
            <View style={styles.chatHeader}>
              <Image source={{ uri: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=80" }} style={styles.chatAvatar} />
              <Text style={{ marginLeft: 10, fontWeight: "700" }}>Juliana</Text>
            </View>
            <View style={styles.chatBody}>
              <View style={{ alignSelf: "flex-start", backgroundColor: "#e5e7eb", padding: 10, borderRadius: 12, marginBottom: 8, maxWidth: "70%" }}>
                <Text>Olá! Adorei as tuas fotos.</Text>
              </View>
              <View style={{ alignSelf: "flex-end", backgroundColor: "#4f46e5", padding: 10, borderRadius: 12, marginBottom: 8, maxWidth: "70%" }}>
                <Text style={{ color: "#fff" }}>Oi, Juliana! Obrigado 😊</Text>
              </View>
            </View>
            <View style={styles.chatInput}>
              <TextInput placeholder="Escreva uma mensagem..." style={{ flex: 1, backgroundColor: "#f3f4f6", padding: 10, borderRadius: 10 }} />
              <TouchableOpacity style={{ marginLeft: 8, backgroundColor: "#4f46e5", padding: 10, borderRadius: 8 }}>
                <Text style={{ color: "#fff" }}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {tab === "profile" && (
          <View style={{ padding: 16 }}>
            <Image source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400" }} style={styles.profileAvatar} />
            <Text style={{ fontSize: 22, fontWeight: "800", marginTop: 12 }}>Ruan, 28</Text>

            <View style={{ flexDirection: "row", marginTop: 16, gap: 8 }}>
              <TouchableOpacity style={styles.editBtn}><Text>Editar Perfil</Text></TouchableOpacity>
              <TouchableOpacity style={styles.settingsBtn}><Text>⚙️</Text></TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => setTab("match")} style={styles.navBtn}><Text style={{ color: tab === "match" ? "#4f46e5" : "#9ca3af" }}>🏠</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setTab("chat")} style={styles.navBtn}><Text style={{ color: tab === "chat" ? "#4f46e5" : "#9ca3af" }}>💬</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setTab("profile")} style={styles.navBtn}><Text style={{ color: tab === "profile" ? "#4f46e5" : "#9ca3af" }}>👤</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { flex: 1 },
  card: { borderRadius: 16, overflow: "hidden", elevation: 4, backgroundColor: "#fff" },
  cardImage: { width: "100%", height: 300 },
  cardInfo: { position: "absolute", left: 16, bottom: 16 },
  cardName: { color: "#fff", fontSize: 26, fontWeight: "800" },
  tag: { backgroundColor: "rgba(0,0,0,0.4)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, marginTop: 8 },
  chatHeader: { flexDirection: "row", alignItems: "center", padding: 12, borderBottomWidth: 1, borderColor: "#e5e7eb" },
  chatAvatar: { width: 44, height: 44, borderRadius: 44 },
  chatBody: { flex: 1, padding: 12 },
  chatInput: { flexDirection: "row", padding: 12, borderTopWidth: 1, borderColor: "#e5e7eb", alignItems: "center" },
  profileAvatar: { width: 120, height: 120, borderRadius: 999, borderWidth: 6, borderColor: "#6366f1" },
  editBtn: { flex: 1, backgroundColor: "#e5e7eb", padding: 12, borderRadius: 12, alignItems: "center" },
  settingsBtn: { width: 56, backgroundColor: "#e5e7eb", padding: 12, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  bottomNav: { height: 72, flexDirection: "row", justifyContent: "space-around", alignItems: "center", borderTopWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#ffffff" },
  navBtn: { padding: 8 },
});