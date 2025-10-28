import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, SafeAreaView } from "react-native";
import { ScreenKey } from "../../App";
import { LinearGradient } from "expo-linear-gradient"; // Para o card

type Tab = "match" | "chat" | "profile";

export default function MainApp({ onNavigate }: { onNavigate: (s: ScreenKey) => void }) {
  const [tab, setTab] = useState<Tab>("match");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* TELA DE MATCH */}
        {tab === "match" && (
          <ScrollView style={styles.page}>
            <View style={{ alignItems: "center", marginVertical: 16 }}>
              <Text style={{ color: "#6b7280", fontSize: 14 }}>Novo Aponte em</Text>
              <Text style={{ fontSize: 24, fontWeight: "700", color: "#374151" }}>23:59:59</Text>
            </View>

            <TouchableOpacity style={styles.card} onPress={() => {}}>
              <Image source={{ uri: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800" }} style={styles.cardImage} />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.8)"]}
                style={styles.cardInfoContainer}
              >
                <Text style={styles.cardName}>Juliana, 26</Text>
                <View style={styles.tagRow}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>Fotografia</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* TELA DE CHAT */}
        {tab === "chat" && (
          <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
            <View style={styles.chatHeader}>
              <Image source={{ uri: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=80" }} style={styles.chatAvatar} />
              <Text style={styles.chatName}>Juliana</Text>
            </View>
            <ScrollView style={styles.chatBody}>
              <View style={styles.messageRow}>
                <View style={styles.messageReceived}>
                  <Text style={styles.messageReceivedText}>Olá! Adorei as tuas fotos.</Text>
                </View>
              </View>
              <View style={[styles.messageRow, { justifyContent: "flex-end" }]}>
                <View style={styles.messageSent}>
                  <Text style={styles.messageSentText}>Oi, Juliana! Obrigado 😊</Text>
                </View>
              </View>
            </ScrollView>
            <View style={styles.chatInputContainer}>
              <TextInput
                placeholder="Escreva uma mensagem..."
                style={styles.chatInput}
                placeholderTextColor="#6b7280"
              />
              <TouchableOpacity style={styles.sendButton}>
                <Text style={styles.sendButtonText}>➤</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TELA DE PERFIL */}
        {tab === "profile" && (
          <ScrollView style={styles.page}>
            <Text style={styles.profileTitle}>Meu Perfil</Text>
            <View style={styles.profileHeader}>
              <Image source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400" }} style={styles.profileAvatar} />
              <Text style={styles.profileName}>Ruan, 28</Text>
              <View style={styles.profileButtonRow}>
                <TouchableOpacity style={styles.editBtn}>
                  <Text style={styles.editBtnText}>✏️ Editar Perfil</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingsBtn}>
                  <Text style={styles.editBtnText}>⚙️</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Botão de Logout da tela de Configurações */}
            <TouchableOpacity style={styles.logoutBtn} onPress={() => onNavigate("welcome")}>
              <Text style={styles.logoutBtnText}>Terminar Sessão</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

      {/* BARRA DE NAVEGAÇÃO INFERIOR */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => setTab("match")} style={styles.navBtn}>
          <Text style={[styles.navIcon, { color: tab === "match" ? "#4f46e5" : "#9ca3af" }]}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab("chat")} style={styles.navBtn}>
          <Text style={[styles.navIcon, { color: tab === "chat" ? "#4f46e5" : "#9ca3af" }]}>💬</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab("profile")} style={styles.navBtn}>
          <Text style={[styles.navIcon, { color: tab === "profile" ? "#4f46e5" : "#9ca3af" }]}>👤</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb", // bg-gray-50
  },
  content: { flex: 1 },
  page: {
    flex: 1,
    padding: 16, // p-4
  },
  // Card (Match)
  card: {
    borderRadius: 16, // rounded-2xl
    overflow: "hidden",
    elevation: 4,
    backgroundColor: "#000",
    aspectRatio: 3 / 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cardInfoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24, // p-6
    paddingTop: 48,
  },
  cardName: {
    color: "#fff",
    fontSize: 30, // text-3xl
    fontWeight: "700", // font-bold
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8, // mt-2
  },
  tag: {
    backgroundColor: "rgba(255,255,255,0.2)", // bg-white/20
    paddingHorizontal: 10, // px-2.5
    paddingVertical: 4, // py-1
    borderRadius: 999,
  },
  tagText: {
    color: "#fff",
    fontSize: 12, // text-xs
    fontWeight: "600", // font-semibold
  },
  // Chat
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16, // p-4
    borderBottomWidth: 1,
    borderColor: "#e5e7eb", // border-gray-200
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chatAvatar: {
    width: 40, // w-10
    height: 40, // h-10
    borderRadius: 20, // rounded-full
  },
  chatName: {
    marginLeft: 12, // ml-3
    fontWeight: "600", // font-semibold
    color: "#374151", // text-gray-800
    fontSize: 16,
  },
  chatBody: {
    flex: 1,
    padding: 24, // p-6
    backgroundColor: "#f9fafb", // bg-gray-50
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 16, // gap-4
  },
  messageReceived: {
    backgroundColor: "#e5e7eb", // bg-gray-200
    padding: 12, // p-3
    borderRadius: 12, // rounded-lg
    maxWidth: "80%",
  },
  messageReceivedText: {
    color: "#374151", // text-gray-800
  },
  messageSent: {
    backgroundColor: "#6366f1", // bg-indigo-500
    padding: 12, // p-3
    borderRadius: 12, // rounded-lg
    maxWidth: "80%",
    marginLeft: "auto",
  },
  messageSentText: {
    color: "#fff",
  },
  chatInputContainer: {
    flexDirection: "row",
    padding: 16, // p-4
    borderTopWidth: 1,
    borderColor: "#e5e7eb", // border-gray-200
    backgroundColor: "#fff",
    alignItems: "center",
    gap: 8, // gap-2
  },
  chatInput: {
    flex: 1,
    backgroundColor: "#f3f4f6", // bg-gray-100
    padding: 12, // p-3
    borderRadius: 8, // rounded-lg
    color: "#111827",
  },
  sendButton: {
    backgroundColor: "#4f46e5", // bg-indigo-600
    padding: 12, // p-3
    borderRadius: 8, // rounded-lg
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    transform: [{ rotate: "-45deg" }],
  },
  // Profile
  profileTitle: {
    fontSize: 30, // text-3xl
    fontWeight: "700", // font-bold
    color: "#374151", // text-gray-800
    marginBottom: 16,
  },
  profileHeader: {
    alignItems: "center",
    paddingBottom: 24, // pb-6
  },
  profileAvatar: {
    width: 128, // w-32
    height: 128, // h-32
    borderRadius: 64, // rounded-full
    borderWidth: 4, // ring-4
    borderColor: "#6366f1", // ring-indigo-500
  },
  profileName: {
    fontSize: 24, // text-2xl
    fontWeight: "700", // font-bold
    textAlign: "center",
    marginTop: 16, // mt-4
    color: "#374151", // text-gray-800
  },
  profileButtonRow: {
    flexDirection: "row",
    marginTop: 24, // mt-6
    gap: 16, // gap-4
    width: "100%",
  },
  editBtn: {
    flex: 1,
    backgroundColor: "#e5e7eb", // bg-gray-200
    paddingVertical: 12, // py-3
    borderRadius: 12, // rounded-xl
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  editBtnText: {
    fontWeight: "700", // font-bold
    color: "#374151",
    fontSize: 16,
  },
  settingsBtn: {
    backgroundColor: "#e5e7eb", // bg-gray-200
    padding: 12, // p-3
    borderRadius: 12, // rounded-xl
    alignItems: "center",
    justifyContent: "center",
  },
  logoutBtn: {
    marginTop: 32, // mt-8
    backgroundColor: "rgba(239, 68, 68, 0.1)", // bg-red-500/10
    paddingVertical: 12, // py-3
    borderRadius: 12, // rounded-xl
    alignItems: "center",
  },
  logoutBtnText: {
    color: "#ef4444", // text-red-500
    fontWeight: "700", // font-bold
    fontSize: 16,
  },
  // Bottom Nav
  bottomNav: {
    height: 80, // h-20
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#e5e7eb", // border-gray-200
    backgroundColor: "rgba(255,255,255,0.9)", // bg-white/80 (simulação)
  },
  navBtn: {
    padding: 8, // p-2
  },
  navIcon: {
    fontSize: 28, // w-7 h-7
  },
});