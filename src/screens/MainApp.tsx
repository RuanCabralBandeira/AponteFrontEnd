import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal // <--- Importante para a edição
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenKey } from "../../App";

const API_URL = "http://localhost:8080"; 

type Tab = "match" | "chat" | "profile";

export default function MainApp({ onNavigate }: { onNavigate: (s: ScreenKey) => void }) {
  const [tab, setTab] = useState<Tab>("match");
  const [loading, setLoading] = useState(false);
  
  // DADOS
  const [userId, setUserId] = useState<number | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [matchData, setMatchData] = useState<any>(null);
  const [myProfile, setMyProfile] = useState<any>(null);

  // CHAT
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  // TIMER DO MATCH
  const [timeLeft, setTimeLeft] = useState("Calculando...");

  // EDIÇÃO DE PERFIL
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");

  // 1. AO INICIAR
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("userToken");
        const storedId = await AsyncStorage.getItem("userId");

        if (!token || !storedId) {
          onNavigate("login");
          return;
        }

        setUserToken(token);
        setUserId(Number(storedId));
        await loadInitialData(token, storedId);

      } catch (e) {
        onNavigate("login");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // 2. ATUALIZA CHAT (1s) E TIMER (1s)
  useEffect(() => {
    const interval = setInterval(() => {
      // Atualiza Chat se estiver na aba
      if (tab === "chat" && matchData?.id && userToken) {
        loadMessages();
      }
      // Atualiza o Timer se tiver match
      if (matchData?.expiresAt) {
        calculateTimeLeft();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tab, matchData, userToken]);


  // --- LÓGICA DO TIMER ---
  const calculateTimeLeft = () => {
    if (!matchData?.expiresAt) return;
    
    const now = new Date().getTime();
    const expirationDate = new Date(matchData.expiresAt).getTime();
    const distance = expirationDate - now;

    if (distance < 0) {
      setTimeLeft("EXPIRADO");
      // Se quiser forçar recarregamento quando expirar:
      // loadInitialData(userToken!, String(userId!)); 
    } else {
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      // Formata para ficar bonito (ex: 09:05:02)
      const h = hours < 10 ? `0${hours}` : hours;
      const m = minutes < 10 ? `0${minutes}` : minutes;
      const s = seconds < 10 ? `0${seconds}` : seconds;
      
      setTimeLeft(`${h}:${m}:${s}`);
    }
  };

  // --- FUNÇÕES DE DADOS ---
  const loadInitialData = async (token: string, id: string) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const resMatch = await axios.get(`${API_URL}/api/matches/today`, config);
      setMatchData(resMatch.data);
    } catch (error) {
      setMatchData(null);
    }
    try {
      const resProfile = await axios.get(`${API_URL}/api/profiles/user/${id}`, config);
      setMyProfile(resProfile.data);
    } catch (error) {
      console.log("Erro perfil");
    }
  };

  const loadMessages = async () => {
    if (!matchData?.id || !userToken) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userToken}` } };
      const res = await axios.get(`${API_URL}/api/messages/match/${matchData.id}`, config);
      // Só atualiza se tiver mudado algo para evitar render desnecessário (opcional, mas bom)
      if (res.data.length !== messages.length) {
        setMessages(res.data);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      }
    } catch (error) { }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !matchData || !userId || !userToken) return;
    const receiverId = matchData.matchedProfile.userId;
    const config = { headers: { Authorization: `Bearer ${userToken}` } };
    try {
      await axios.post(`${API_URL}/api/messages/match/${matchData.id}`, 
        { text: newMessage, senderId: userId, receiverId: receiverId }, config);
      setNewMessage(""); 
      loadMessages();
    } catch (error) {
      Alert.alert("Erro", "Falha ao enviar.");
    }
  };

  // --- EDIÇÃO DE PERFIL ---
  const openEditModal = () => {
    if (myProfile) {
      setEditName(myProfile.name);
      setEditBio(myProfile.bio || "");
      setEditLocation(myProfile.lastLocation || "");
      setIsEditing(true);
    }
  };

  const saveProfile = async () => {
    if (!userToken || !userId || !myProfile) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userToken}` } };
      
      // O Backend exige Data de Nascimento, então reenviamos a original
      await axios.put(`${API_URL}/api/profiles/user/${userId}`, {
        name: editName,
        bio: editBio,
        lastLocation: editLocation,
        birthDate: myProfile.birthDate // Mantém a data original
      }, config);

      Alert.alert("Sucesso", "Perfil atualizado!");
      setIsEditing(false);
      loadInitialData(userToken, String(userId)); // Recarrega os dados na tela

    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    onNavigate("welcome");
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#4f46e5" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* ABA MATCH */}
        {tab === "match" && (
          <ScrollView style={styles.page} contentContainerStyle={{flexGrow: 1}}>
            <View style={{ alignItems: "center", marginVertical: 16 }}>
              <Text style={{ color: "#6b7280", fontSize: 14 }}>O seu match expira em</Text>
              {/* AQUI ESTÁ O TIMER REAL */}
              <Text style={{ fontSize: 32, fontWeight: "700", color: "#4f46e5", fontVariant: ['tabular-nums'] }}>
                {matchData ? timeLeft : "--:--:--"}
              </Text>
            </View>

            {matchData ? (
              <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => setTab("chat")}>
                <Image source={{ uri: matchData.matchedProfile.photos?.[0]?.url || "https://via.placeholder.com/400" }} style={styles.cardImage} />
                <LinearGradient colors={["transparent", "rgba(0,0,0,0.9)"]} style={styles.cardInfoContainer}>
                  <Text style={styles.cardName}>{matchData.matchedProfile.name}</Text>
                  <Text style={{color: '#e5e7eb', fontSize: 16, marginTop: 4}}>
                    {matchData.matchedProfile.bio || "Sem biografia."}
                  </Text>
                  <View style={styles.tagRow}>
                    <View style={styles.tag}><Text style={styles.tagText}>📍 {matchData.matchedProfile.lastLocation || "Brasil"}</Text></View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={[styles.card, styles.noMatchCard]}>
                <Text style={{fontSize: 50}}>😴</Text>
                <Text style={{color: 'white', textAlign: 'center', marginTop: 10}}>Sem matches disponíveis.</Text>
                <TouchableOpacity onPress={() => loadInitialData(userToken!, String(userId))} style={styles.retryBtn}>
                  <Text style={{fontWeight: 'bold'}}>Atualizar</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}

        {/* ABA CHAT */}
        {tab === "chat" && (
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{flex: 1}}>
            {matchData ? (
              <>
                <View style={styles.chatHeader}>
                  <Image source={{ uri: matchData.matchedProfile.photos?.[0]?.url || "https://via.placeholder.com/50" }} style={styles.chatAvatar} />
                  <Text style={styles.chatName}>{matchData.matchedProfile.name}</Text>
                </View>
                <ScrollView style={styles.chatBody} ref={scrollViewRef}>
                  {messages.length === 0 && <Text style={{textAlign: 'center', color: '#9ca3af', marginTop: 20}}>Diga olá! 👋</Text>}
                  {messages.map((msg) => {
                    const isMe = msg.senderId === userId;
                    return (
                      <View key={msg.id} style={[styles.messageRow, { justifyContent: isMe ? "flex-end" : "flex-start" }]}>
                        <View style={[styles.messageBubble, isMe ? styles.messageSent : styles.messageReceived]}>
                          <Text style={{color: isMe ? '#fff' : '#374151'}}>{msg.text}</Text>
                        </View>
                      </View>
                    );
                  })}
                  <View style={{height: 20}} />
                </ScrollView>
                <View style={styles.chatInputContainer}>
                  <TextInput placeholder="Escreva..." style={styles.chatInput} value={newMessage} onChangeText={setNewMessage} placeholderTextColor="#6b7280" />
                  <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}><Text style={styles.sendButtonText}>➤</Text></TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.center}><Text style={{color: '#6b7280'}}>Encontre um match primeiro.</Text></View>
            )}
          </KeyboardAvoidingView>
        )}

        {/* ABA PERFIL */}
        {tab === "profile" && (
          <ScrollView style={styles.page}>
            <Text style={styles.profileTitle}>Meu Perfil</Text>
            {myProfile ? (
              <View style={styles.profileHeader}>
                <Image source={{ uri: myProfile.photos?.[0]?.url || "https://github.com/github.png" }} style={styles.profileAvatar} />
                <Text style={styles.profileName}>{myProfile.name}</Text>
                <Text style={{color: '#6b7280', marginTop: 8, textAlign: 'center', paddingHorizontal: 20}}>
                  {myProfile.bio || "Sem biografia."}
                </Text>
                <Text style={{color: '#4f46e5', marginTop: 4, fontWeight: '600'}}>
                  📍 {myProfile.lastLocation || "Localização não definida"}
                </Text>
                
                <View style={styles.profileButtonRow}>
                  {/* BOTÃO DE EDITAR AGORA FUNCIONA */}
                  <TouchableOpacity style={styles.editBtn} onPress={openEditModal}>
                    <Text style={styles.editBtnText}>✏️ Editar Perfil</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
               <Text style={{textAlign: 'center'}}>Carregando...</Text>
            )}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutBtnText}>Sair</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

      {/* MODAL DE EDIÇÃO */}
      <Modal animationType="slide" transparent={true} visible={isEditing} onRequestClose={() => setIsEditing(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            
            <Text style={styles.label}>Nome</Text>
            <TextInput style={styles.input} value={editName} onChangeText={setEditName} />
            
            <Text style={styles.label}>Localização</Text>
            <TextInput style={styles.input} value={editLocation} onChangeText={setEditLocation} placeholder="Ex: Lisboa, Portugal" />
            
            <Text style={styles.label}>Biografia</Text>
            <TextInput 
              style={[styles.input, {height: 80, textAlignVertical: 'top'}]} 
              value={editBio} 
              onChangeText={setEditBio} 
              multiline 
              placeholder="Fale sobre você..."
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setIsEditing(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={saveProfile}>
                <Text style={styles.saveBtnText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => setTab("match")} style={styles.navBtn}><Text style={[styles.navIcon, {color: tab==="match"?"#4f46e5":"#9ca3af"}]}>🏠</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setTab("chat")} style={styles.navBtn}><Text style={[styles.navIcon, {color: tab==="chat"?"#4f46e5":"#9ca3af"}]}>💬</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setTab("profile")} style={styles.navBtn}><Text style={[styles.navIcon, {color: tab==="profile"?"#4f46e5":"#9ca3af"}]}>👤</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  content: { flex: 1 },
  page: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { height: 500, borderRadius: 16, overflow: "hidden", backgroundColor: "#000", marginBottom: 20 },
  noMatchCard: { backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center' },
  cardImage: { width: "100%", height: "100%", resizeMode: "cover" },
  cardInfoContainer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 24, paddingTop: 60 },
  cardName: { color: "#fff", fontSize: 30, fontWeight: "700" },
  tagRow: { marginTop: 12 },
  tag: { backgroundColor: "rgba(255,255,255,0.3)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, alignSelf: 'flex-start' },
  tagText: { color: "#fff", fontWeight: "600" },
  retryBtn: { marginTop: 20, backgroundColor: 'white', padding: 10, borderRadius: 8 },
  chatHeader: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderColor: "#e5e7eb" },
  chatAvatar: { width: 40, height: 40, borderRadius: 20 },
  chatName: { marginLeft: 12, fontWeight: "600", fontSize: 16 },
  chatBody: { flex: 1, padding: 16 },
  messageRow: { flexDirection: "row", marginBottom: 12 },
  messageBubble: { padding: 12, borderRadius: 12, maxWidth: "80%" },
  messageSent: { backgroundColor: "#6366f1" },
  messageReceived: { backgroundColor: "#e5e7eb" },
  chatInputContainer: { flexDirection: "row", padding: 12, backgroundColor: "#fff", borderTopWidth: 1, borderColor: "#e5e7eb", gap: 8 },
  chatInput: { flex: 1, backgroundColor: "#f3f4f6", padding: 12, borderRadius: 8 },
  sendButton: { backgroundColor: "#4f46e5", padding: 12, borderRadius: 8, justifyContent: 'center' },
  sendButtonText: { color: "#fff", fontWeight: 'bold' },
  profileTitle: { fontSize: 30, fontWeight: "700", textAlign: "center", marginBottom: 16 },
  profileHeader: { alignItems: "center" },
  profileAvatar: { width: 128, height: 128, borderRadius: 64, borderWidth: 4, borderColor: "#6366f1" },
  profileName: { fontSize: 24, fontWeight: "700", marginTop: 16 },
  profileButtonRow: { flexDirection: "row", marginTop: 24, gap: 16, width: "100%", paddingHorizontal: 20 },
  editBtn: { flex: 1, backgroundColor: "#e5e7eb", paddingVertical: 12, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  editBtnText: { fontWeight: "700", color: "#374151", fontSize: 16 },
  logoutBtn: { marginTop: 40, backgroundColor: "#fee2e2", padding: 12, borderRadius: 12, alignItems: "center", marginHorizontal: 20, marginBottom: 40 },
  logoutBtnText: { color: "#ef4444", fontWeight: "700" },
  bottomNav: { height: 60, flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: "#fff", borderTopWidth: 1, borderColor: "#e5e7eb" },
  navBtn: { padding: 10 },
  navIcon: { fontSize: 24 },
  // Modal Styles
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '90%', backgroundColor: '#fff', borderRadius: 16, padding: 24, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4 },
  input: { backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, marginBottom: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  modalBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#e5e7eb' },
  saveBtn: { backgroundColor: '#4f46e5' },
  cancelBtnText: { color: '#374151', fontWeight: 'bold' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' }
});