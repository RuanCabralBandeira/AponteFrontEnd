import React, { useState, useEffect, useRef } from "react";
import { API_URL } from "./config";
import * as ImagePicker from 'expo-image-picker';
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
  Modal
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenKey } from "../../App";

type Tab = "match" | "chat" | "profile";

export default function MainApp({ onNavigate }: { onNavigate: (s: ScreenKey) => void }) {
  const [tab, setTab] = useState<Tab>("match");
  const [loading, setLoading] = useState(false);

  // DADOS
  const [userId, setUserId] = useState<number | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [matchData, setMatchData] = useState<any>(null);
  const [myProfile, setMyProfile] = useState<any>(null);

  // ESTADO PARA FORÇAR RECARREGAMENTO DE IMAGEM (CACHE BUSTING)
  const [imageHash, setImageHash] = useState(Date.now());

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


  // IMGANES
  const [editImageUri, setEditImageUri] = useState<string | null>(null);
  const [editImageType, setEditImageType] = useState<string | null>(null);
  const [editImageName, setEditImageName] = useState<string | null>(null);
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

  // 2. ATUALIZADORES
  useEffect(() => {
    const interval = setInterval(() => {
      if (tab === "chat" && matchData?.id && userToken) {
        loadMessages();
      }
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
    } else {
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      const h = hours < 10 ? `0${hours}` : hours;
      const m = minutes < 10 ? `0${minutes}` : minutes;
      const s = seconds < 10 ? `0${seconds}` : seconds;
      setTimeLeft(`${h}:${m}:${s}`);
    }
  };

  // --- FUNÇÃO AUXILIAR PARA MONTAR A IMAGEM ---
  // Essa função resolve o problema de não carregar a imagem do banco
  const getProfileImage = (profileId: number | undefined, isMyProfile = false) => {
    if (!profileId) return { uri: "https://via.placeholder.com/400" };

    // Monta a URL apontando para o endpoint do PhotoController
    // Adiciona o imageHash se for meu perfil para atualizar quando editar
    const timestamp = isMyProfile ? `?t=${imageHash}` : '';

    return {
      uri: `${API_URL}/photos/profile/${profileId}${timestamp}`,
      headers: { Authorization: `Bearer ${userToken}` } // Passa o token caso a imagem seja protegida
    };
  };

  // --- DADOS ---
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
      setImageHash(Date.now()); // Força atualização da imagem ao carregar dados
    } catch (error) {
      console.log("Erro ao carregar perfil:", error);
    }
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
      // Para edição, pegamos a URL construída ou a atual se não tiver
      const currentUrl = `${API_URL}/photos/profile/${myProfile.id}?t=${imageHash}`;
      setEditImageUri(currentUrl);
      setIsEditing(true);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Isso ajuda MUITO, pois o Expo cria uma cópia local cacheada .jpg ou .png
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setEditImageUri(asset.uri);

      // --- LÓGICA BLINDADA PARA O NOME ---
      let safeName = asset.fileName;

      // Se não veio nome (comum no Android), cria um genérico com timestamp
      if (!safeName) {
        // Tenta pegar do final da URI
        const uriName = asset.uri.split('/').pop();
        // Se o nome da URI não tiver ponto (ex: content://.../12345), cria um novo
        if (uriName && uriName.includes('.')) {
          safeName = uriName;
        } else {
          safeName = `foto_perfil_${Date.now()}.jpg`;
        }
      }
      setEditImageName(safeName);

      // --- LÓGICA BLINDADA PARA O TIPO (MIME TYPE) ---
      // Tenta extrair a extensão do nome seguro que acabamos de definir
      const extension = safeName.split('.').pop()?.toLowerCase();

      let safeType = "image/jpeg"; // FALLBACK PADRÃO (Se tudo der errado, vai como JPG)

      if (extension === 'png') safeType = "image/png";
      else if (extension === 'jpg' || extension === 'jpeg') safeType = "image/jpeg";

      setEditImageType(safeType);
    }
  };

  const saveProfile = async () => {
    if (!userToken || !userId || !myProfile) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userToken}` } };

      await axios.put(`${API_URL}/api/profiles/user/${userId}`, {
        name: editName,
        bio: editBio,
        lastLocation: editLocation,
        birthDate: myProfile.birthDate
      }, config);

      // Verifica se a imagem mudou (se não contém a URL da API, é um arquivo local novo)
      if (editImageUri && !editImageUri.includes(API_URL)) {
        const profileId = myProfile.id;
        const formData = new FormData();
        formData.append('profileId', String(profileId));

        // Nome do arquivo (ou um gerado com timestamp se estiver vazio)
        let fileNameToSend = editImageName || `upload_${Date.now()}.jpg`;

        if (Platform.OS === 'web') {
          // --- WEB ---
          const res = await fetch(editImageUri);
          const blob = await res.blob();

          // Se o nome não tiver extensão, pegamos do tipo do blob (ex: image/png -> png)
          if (!fileNameToSend.includes('.')) {
            const ext = blob.type.split('/')[1] || 'jpg';
            fileNameToSend = `${fileNameToSend}.${ext}`;
          }

          // Envia com o nome correto
          formData.append('file', blob, fileNameToSend);

        } else {

          const nameToSend = editImageName || `upload_${Date.now()}.jpg`;
          const typeToSend = editImageType || 'image/jpeg';

          formData.append('file', {
            uri: editImageUri,
            name: nameToSend,
            type: typeToSend,
          } as any);
        }

        await axios.post(`${API_URL}/photos/upload`, formData, {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Accept': 'application/json',
          },
          transformRequest: (data) => data,
        });
      }

      Alert.alert("Sucesso", "Perfil atualizado!");
      setIsEditing(false);
      setImageHash(Date.now()); // ISSO FAZ A FOTO ATUALIZAR NA TELA
      loadInitialData(userToken, String(userId));

    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
      console.error(error);
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
          <ScrollView style={styles.page} contentContainerStyle={{ flexGrow: 1 }}>
            <View style={{ alignItems: "center", marginVertical: 16 }}>
              <Text style={{ color: "#6b7280", fontSize: 14 }}>O seu match expira em</Text>
              <Text style={{ fontSize: 32, fontWeight: "700", color: "#4f46e5", fontVariant: ['tabular-nums'] }}>
                {matchData ? timeLeft : "--:--:--"}
              </Text>
            </View>

            {matchData ? (
              <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => setTab("chat")}>
                {/* AQUI ESTÁ A MUDANÇA: Usando getProfileImage */}
                <Image
                  source={getProfileImage(matchData.matchedProfile.id)}
                  style={styles.cardImage}
                />
                <LinearGradient colors={["transparent", "rgba(0,0,0,0.9)"]} style={styles.cardInfoContainer}>
                  <Text style={styles.cardName}>{matchData.matchedProfile.name}</Text>
                  <Text style={{ color: '#e5e7eb', fontSize: 16, marginTop: 4 }}>
                    {matchData.matchedProfile.bio || "Sem biografia."}
                  </Text>
                  <View style={styles.tagRow}>
                    <View style={styles.tag}><Text style={styles.tagText}>📍 {matchData.matchedProfile.lastLocation || "Brasil"}</Text></View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={[styles.card, styles.noMatchCard]}>
                <Text style={{ fontSize: 50 }}>😴</Text>
                <Text style={{ color: 'white', textAlign: 'center', marginTop: 10 }}>Sem matches disponíveis.</Text>
                <TouchableOpacity onPress={() => loadInitialData(userToken!, String(userId))} style={styles.retryBtn}>
                  <Text style={{ fontWeight: 'bold' }}>Atualizar</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}

        {/* ABA CHAT */}
        {tab === "chat" && (
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
            {matchData ? (
              <>
                <View style={styles.chatHeader}>
                  {/* AQUI ESTÁ A MUDANÇA: Usando getProfileImage */}
                  <Image
                    source={getProfileImage(matchData.matchedProfile.id)}
                    style={styles.chatAvatar}
                  />
                  <Text style={styles.chatName}>{matchData.matchedProfile.name}</Text>
                </View>
                <ScrollView style={styles.chatBody} ref={scrollViewRef}>
                  {messages.length === 0 && <Text style={{ textAlign: 'center', color: '#9ca3af', marginTop: 20 }}>Diga olá! 👋</Text>}
                  {messages.map((msg) => {
                    const isMe = msg.senderId === userId;
                    return (
                      <View key={msg.id} style={[styles.messageRow, { justifyContent: isMe ? "flex-end" : "flex-start" }]}>
                        <View style={[styles.messageBubble, isMe ? styles.messageSent : styles.messageReceived]}>
                          <Text style={{ color: isMe ? '#fff' : '#374151' }}>{msg.text}</Text>
                        </View>
                      </View>
                    );
                  })}
                  <View style={{ height: 20 }} />
                </ScrollView>
                <View style={styles.chatInputContainer}>
                  <TextInput placeholder="Escreva..." style={styles.chatInput} value={newMessage} onChangeText={setNewMessage} placeholderTextColor="#6b7280" />
                  <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}><Text style={styles.sendButtonText}>➤</Text></TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.center}><Text style={{ color: '#6b7280' }}>Encontre um match primeiro.</Text></View>
            )}
          </KeyboardAvoidingView>
        )}

        {/* ABA PERFIL */}
        {tab === "profile" && (
          <ScrollView style={styles.page}>
            <Text style={styles.profileTitle}>Meu Perfil</Text>
            {myProfile ? (
              <View style={styles.profileHeader}>
                {/* AQUI ESTÁ A MUDANÇA: Usando getProfileImage com isMyProfile=true */}
                <Image
                  source={getProfileImage(myProfile.id, true)}
                  style={styles.profileAvatar}
                  onError={(e) => console.log("Erro ao carregar imagem:", e.nativeEvent.error)}
                />
                <Text style={styles.profileName}>{myProfile.name}</Text>
                <Text style={{ color: '#6b7280', marginTop: 8, textAlign: 'center', paddingHorizontal: 20 }}>
                  {myProfile.bio || "Sem biografia."}
                </Text>
                <Text style={{ color: '#4f46e5', marginTop: 4, fontWeight: '600' }}>
                  📍 {myProfile.lastLocation || "Localização não definida"}
                </Text>

                <View style={styles.profileButtonRow}>
                  <TouchableOpacity style={styles.editBtn} onPress={openEditModal}>
                    <Text style={styles.editBtnText}>✏️ Editar Perfil</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text style={{ textAlign: 'center' }}>Carregando...</Text>
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

            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <TouchableOpacity onPress={pickImage}>
                <Image
                  source={{
                    // Aqui usamos editImageUri direto, mas se for URL da API passamos o header
                    uri: editImageUri || "https://github.com/github.png",
                    headers: editImageUri?.includes("http") ? { Authorization: `Bearer ${userToken}` } : undefined
                  }}
                  style={{ width: 100, height: 100, borderRadius: 50 }}
                />
                <Text style={{ color: '#4f46e5', marginTop: 8, fontWeight: '600' }}>Alterar Foto</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Nome</Text>
            <TextInput style={styles.input} value={editName} onChangeText={setEditName} />

            <Text style={styles.label}>Localização</Text>
            <TextInput style={styles.input} value={editLocation} onChangeText={setEditLocation} placeholder="Ex: Lisboa, Portugal" />

            <Text style={styles.label}>Biografia</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
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
        <TouchableOpacity onPress={() => setTab("match")} style={styles.navBtn}><Text style={[styles.navIcon, { color: tab === "match" ? "#4f46e5" : "#9ca3af" }]}>🏠</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setTab("chat")} style={styles.navBtn}><Text style={[styles.navIcon, { color: tab === "chat" ? "#4f46e5" : "#9ca3af" }]}>💬</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setTab("profile")} style={styles.navBtn}><Text style={[styles.navIcon, { color: tab === "profile" ? "#4f46e5" : "#9ca3af" }]}>👤</Text></TouchableOpacity>
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