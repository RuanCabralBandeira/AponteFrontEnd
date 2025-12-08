import React, { useState, useEffect, useRef } from "react";
import { API_URL } from "./config";
import * as ImagePicker from 'expo-image-picker';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, TextInput,
  ScrollView, SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, Modal
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenKey } from "../../App";

type Tab = "match" | "chat" | "profile";

export default function MainApp({ onNavigate }: { onNavigate: (s: ScreenKey) => void }) {
  const [tab, setTab] = useState<Tab>("match");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [matchData, setMatchData] = useState<any>(null);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [imageHash, setImageHash] = useState(Date.now());
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const [timeLeft, setTimeLeft] = useState("Calculando...");

  // EDIÇÃO
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editImageUri, setEditImageUri] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("userToken");
        const storedId = await AsyncStorage.getItem("userId");
        if (!token || !storedId) { onNavigate("login"); return; }
        setUserToken(token);
        setUserId(Number(storedId));
        await loadInitialData(token, storedId);
      } catch (e) { onNavigate("login"); } finally { setLoading(false); }
    }
    init();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (tab === "chat" && matchData?.id && userToken) loadMessages();
      if (matchData?.expiresAt) calculateTimeLeft();
    }, 1000);
    return () => clearInterval(interval);
  }, [tab, matchData, userToken]);

  const calculateTimeLeft = () => {
    if (!matchData?.expiresAt) return;
    const now = new Date().getTime();
    const expirationDate = new Date(matchData.expiresAt).getTime();
    const distance = expirationDate - now;
    if (distance < 0) { setTimeLeft("EXPIRADO"); } else {
      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`);
    }
  };

  const getProfileImage = (profileId: number | undefined, isMyProfile = false) => {
    if (!profileId) return { uri: "https://via.placeholder.com/400" };
    const timestamp = isMyProfile ? `?t=${imageHash}` : '';
    return {
      uri: `${API_URL}/photos/profile/${profileId}${timestamp}`,
      headers: { Authorization: `Bearer ${userToken}` }
    };
  };

  const loadInitialData = async (token: string, id: string) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const resMatch = await axios.get(`${API_URL}/api/matches/today`, config);
      setMatchData(resMatch.data);
    } catch (error) { setMatchData(null); }
    try {
      const resProfile = await axios.get(`${API_URL}/api/profiles/user/${id}`, config);
      setMyProfile(resProfile.data);
      setImageHash(Date.now());
    } catch (error) { console.log("Erro perfil:", error); }
  };

  const loadMessages = async () => {
    if (!matchData?.id || !userToken) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userToken}` } };
      const res = await axios.get(`${API_URL}/api/messages/match/${matchData.id}`, config);
      if (res.data.length !== messages.length) {
        setMessages(res.data);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      }
    } catch (error) { }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !matchData || !userId || !userToken) return;
    try {
      await axios.post(`${API_URL}/api/messages/match/${matchData.id}`,
        { text: newMessage, senderId: userId, receiverId: matchData.matchedProfile.userId },
        { headers: { Authorization: `Bearer ${userToken}` } });
      setNewMessage("");
      loadMessages();
    } catch (error) { Alert.alert("Erro", "Falha ao enviar."); }
  };

  const openEditModal = () => {
    if (myProfile) {
      setEditName(myProfile.name);
      setEditBio(myProfile.bio || "");
      setEditLocation(myProfile.lastLocation || "");
      // Salva a URL atual. Se for http, sabemos que não precisa subir de novo.
      setEditImageUri(`${API_URL}/photos/profile/${myProfile.id}?t=${imageHash}`);
      setIsEditing(true);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled) {
      setEditImageUri(result.assets[0].uri);
    }
  };

  // --- FUNÇÃO CORRIGIDA BASEADA NO REGISTER FLOW ---
  const saveProfile = async () => {
    if (!userToken || !userId || !myProfile) return;

    try {
      // 1. Atualiza texto (Axios funciona bem pra JSON)
      await axios.put(`${API_URL}/api/profiles/user/${userId}`, {
        name: editName, bio: editBio, lastLocation: editLocation, birthDate: myProfile.birthDate
      }, { headers: { Authorization: `Bearer ${userToken}` } });

      // 2. Atualiza foto (SÓ SE FOR NOVA)
      // A lógica é: se o URI NÃO contém "http", é um arquivo local novo.
      if (editImageUri && !editImageUri.includes('http')) {

        const formData = new FormData();
        formData.append('profileId', String(myProfile.id));

        if (Platform.OS === 'web') {
          const res = await fetch(editImageUri);
          const blob = await res.blob();
          formData.append('file', blob, 'profile.jpg');
        } else {
          // Lógica Android IGUAL AO REGISTER FLOW
          const filename = editImageUri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename || '');
          const type = match ? `image/${match[1]}` : `image/jpeg`;

          // @ts-ignore
          formData.append('file', {
            uri: editImageUri,
            name: filename || 'profile.jpg',
            type: type,
          });
        }

        // FETCH NATIVO (Sem header Content-Type)
        const uploadRes = await fetch(`${API_URL}/photos/upload`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Accept': 'application/json',
          }
        });

        if (!uploadRes.ok) {
          const errText = await uploadRes.text();
          console.log("Erro Upload:", errText);
          throw new Error("Falha ao subir foto.");
        }
      }

      Alert.alert("Sucesso", "Perfil atualizado!");
      setIsEditing(false);
      setImageHash(Date.now());
      loadInitialData(userToken, String(userId));

    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar.");
      console.error(error);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#4f46e5" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {tab === "match" && (
          <ScrollView style={styles.page} contentContainerStyle={{ flexGrow: 1 }}>
            <View style={{ alignItems: "center", marginVertical: 16 }}>
              <Text style={{ color: "#6b7280" }}>O seu match expira em</Text>
              <Text style={{ fontSize: 32, fontWeight: "700", color: "#4f46e5" }}>{matchData ? timeLeft : "--:--:--"}</Text>
            </View>
            {matchData ? (
              <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => setTab("chat")}>
                <Image source={getProfileImage(matchData.matchedProfile.id)} style={styles.cardImage} />
                <LinearGradient colors={["transparent", "rgba(0,0,0,0.9)"]} style={styles.cardInfoContainer}>
                  <Text style={styles.cardName}>{matchData.matchedProfile.name}</Text>
                  <Text style={{ color: '#e5e7eb' }}>{matchData.matchedProfile.bio || "Sem biografia."}</Text>
                  <View style={styles.tagRow}><View style={styles.tag}><Text style={styles.tagText}>📍 {matchData.matchedProfile.lastLocation}</Text></View></View>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={[styles.card, styles.noMatchCard]}>
                <Text style={{ fontSize: 50 }}>😴</Text>
                <Text style={{ color: 'white' }}>Sem matches disponíveis.</Text>
                <TouchableOpacity onPress={() => loadInitialData(userToken!, String(userId))} style={styles.retryBtn}><Text>Atualizar</Text></TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
        {tab === "chat" && (
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
            {matchData ? (
              <>
                <View style={styles.chatHeader}>
                  <Image source={getProfileImage(matchData.matchedProfile.id)} style={styles.chatAvatar} />
                  <Text style={styles.chatName}>{matchData.matchedProfile.name}</Text>
                </View>
                <ScrollView style={styles.chatBody} ref={scrollViewRef}>
                  {messages.map((msg) => (
                    <View key={msg.id} style={[styles.messageRow, { justifyContent: msg.senderId === userId ? "flex-end" : "flex-start" }]}>
                      <View style={[styles.messageBubble, msg.senderId === userId ? styles.messageSent : styles.messageReceived]}>
                        <Text style={{ color: msg.senderId === userId ? '#fff' : '#374151' }}>{msg.text}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.chatInputContainer}>
                  <TextInput style={styles.chatInput} value={newMessage} onChangeText={setNewMessage} placeholder="Escreva..." />
                  <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}><Text style={styles.sendButtonText}>➤</Text></TouchableOpacity>
                </View>
              </>
            ) : <View style={styles.center}><Text>Sem chat.</Text></View>}
          </KeyboardAvoidingView>
        )}
        {tab === "profile" && (
          <ScrollView style={styles.page}>
            <Text style={styles.profileTitle}>Meu Perfil</Text>
            {myProfile ? (
              <View style={styles.profileHeader}>
                <Image source={getProfileImage(myProfile.id, true)} style={styles.profileAvatar} />
                <Text style={styles.profileName}>{myProfile.name}</Text>
                <Text style={{ color: '#6b7280' }}>{myProfile.bio}</Text>
                <TouchableOpacity style={styles.editBtn} onPress={openEditModal}><Text>✏️ Editar Perfil</Text></TouchableOpacity>
              </View>
            ) : <ActivityIndicator />}
            <TouchableOpacity style={styles.logoutBtn} onPress={() => { AsyncStorage.clear(); onNavigate("welcome"); }}><Text style={styles.logoutBtnText}>Sair</Text></TouchableOpacity>
          </ScrollView>
        )}
      </View>
      <Modal animationType="slide" transparent={true} visible={isEditing} onRequestClose={() => setIsEditing(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            <TouchableOpacity onPress={pickImage} style={{ alignItems: 'center' }}>
              <Image source={{ uri: editImageUri || "", headers: editImageUri?.includes("http") ? { Authorization: `Bearer ${userToken}` } : undefined }} style={{ width: 100, height: 100, borderRadius: 50 }} />
              <Text style={{ color: 'blue', margin: 10 }}>Alterar Foto</Text>
            </TouchableOpacity>
            <Text>Nome</Text><TextInput style={styles.input} value={editName} onChangeText={setEditName} />
            <Text>Bio</Text><TextInput style={styles.input} value={editBio} onChangeText={setEditBio} multiline />
            <Text>Local</Text><TextInput style={styles.input} value={editLocation} onChangeText={setEditLocation} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setIsEditing(false)}><Text>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={saveProfile}><Text style={{ color: 'white' }}>Salvar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => setTab("match")}><Text style={{ fontSize: 24, color: tab === "match" ? "blue" : "gray" }}>🏠</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setTab("chat")}><Text style={{ fontSize: 24, color: tab === "chat" ? "blue" : "gray" }}>💬</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setTab("profile")}><Text style={{ fontSize: 24, color: tab === "profile" ? "blue" : "gray" }}>👤</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  content: { flex: 1 },
  page: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { height: 500, borderRadius: 16, backgroundColor: "#000", marginBottom: 20 },
  noMatchCard: { backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center' },
  cardImage: { width: "100%", height: "100%", resizeMode: "cover", borderRadius: 16 },
  cardInfoContainer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 24 },
  cardName: { color: "#fff", fontSize: 30, fontWeight: "700" },
  tagRow: { marginTop: 12 },
  tag: { backgroundColor: "rgba(255,255,255,0.3)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  tagText: { color: "#fff" },
  retryBtn: { marginTop: 20, backgroundColor: 'white', padding: 10, borderRadius: 8 },
  chatHeader: { flexDirection: "row", padding: 16, backgroundColor: "#fff", alignItems: "center" },
  chatAvatar: { width: 40, height: 40, borderRadius: 20 },
  chatName: { marginLeft: 12, fontWeight: "600" },
  chatBody: { flex: 1, padding: 16 },
  messageRow: { flexDirection: "row", marginBottom: 12 },
  messageBubble: { padding: 12, borderRadius: 12, maxWidth: "80%" },
  messageSent: { backgroundColor: "#6366f1" },
  messageReceived: { backgroundColor: "#e5e7eb" },
  chatInputContainer: { flexDirection: "row", padding: 12, backgroundColor: "#fff" },
  chatInput: { flex: 1, backgroundColor: "#f3f4f6", padding: 12, borderRadius: 8 },
  sendButton: { backgroundColor: "#4f46e5", padding: 12, borderRadius: 8, marginLeft: 8 },
  sendButtonText: { color: "#fff" },
  profileTitle: { fontSize: 30, fontWeight: "700", textAlign: "center", marginBottom: 16 },
  profileHeader: { alignItems: "center" },
  profileAvatar: { width: 128, height: 128, borderRadius: 64 },
  profileName: { fontSize: 24, fontWeight: "700", marginTop: 16 },
  editBtn: { backgroundColor: "#e5e7eb", padding: 10, borderRadius: 8, marginTop: 10 },
  logoutBtn: { marginTop: 40, backgroundColor: "#fee2e2", padding: 12, borderRadius: 12, alignItems: "center" },
  logoutBtnText: { color: "#ef4444", fontWeight: "700" },
  bottomNav: { height: 60, flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: "#fff" },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '90%', backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, marginBottom: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  modalBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#e5e7eb' },
  saveBtn: { backgroundColor: '#4f46e5' }
});