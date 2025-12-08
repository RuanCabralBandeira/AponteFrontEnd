import React, { useState } from "react";
import {
  View, Text, Image, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, ActivityIndicator, Platform, Alert
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import axios from "axios";
import { API_URL } from "./config";
import { ScreenKey } from "../../App";

interface RegisterFlowProps {
  onNavigate: (screen: ScreenKey) => void;
}

export default function RegisterFlow({ onNavigate }: RegisterFlowProps) {
  const [step, setStep] = useState(1);
  const total = 4;
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [bio, setBio] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  const clearError = () => setErrorMessage("");

  const isValidDate = (dateString: string) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    const [year, month, day] = dateString.split('-').map(Number);
    if (date.getUTCFullYear() !== year || (date.getUTCMonth() + 1) !== month || date.getUTCDate() !== day) return false;
    return true;
  };

  function nextStep() {
    setErrorMessage("");
    if (step === 1) {
      if (!email.includes("@")) { setErrorMessage("E-mail inválido."); return; }
      if (password.length < 6) { setErrorMessage("Senha min 6 caracteres."); return; }
    }
    if (step === 2) {
      if (!name.trim()) { setErrorMessage("Nome obrigatório."); return; }
      if (!isValidDate(birthDate)) { setErrorMessage("Data inválida (AAAA-MM-DD)."); return; }
    }
    if (step === 4 && !bio.trim()) { setErrorMessage("Escreva uma biografia."); return; }

    if (step < total) setStep(step + 1);
    else handleFinishRegistration();
  }

  function prevStep() {
    setErrorMessage("");
    if (step > 1) setStep(step - 1);
    else onNavigate("welcome");
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      clearError();
    }
  };

  // --- AQUI ESTÁ A CORREÇÃO PRINCIPAL ---
  const handleFinishRegistration = async () => {
    if (loading) return;
    setLoading(true);
    setErrorMessage("");

    try {
      // 1. CRIAR USUÁRIO
      const resUser = await axios.post(`${API_URL}/api/auth/register`, { email, password });
      const userId = resUser.data.id;

      // 2. LOGIN
      const resLogin = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      const token = resLogin.data.token;

      // 3. CRIAR PERFIL
      const resProfile = await axios.put(`${API_URL}/api/profiles/user/${userId}`, {
        name, birthDate, bio, lastLocation: "Brasil"
      }, { headers: { Authorization: `Bearer ${token}` } });

      const profileId = resProfile.data.id;

      // 4. UPLOAD DA FOTO (USANDO FETCH PARA ANDROID)
      if (imageUri) {
        console.log("Iniciando upload via FETCH...");
        const formData = new FormData();
        formData.append('profileId', String(profileId));

        if (Platform.OS === 'web') {
          const response = await fetch(imageUri);
          const blob = await response.blob();
          formData.append('file', blob, 'profile.jpg');
        } else {
          // Lógica Android
          const filename = imageUri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename || '');
          const type = match ? `image/${match[1]}` : `image/jpeg`;

          // @ts-ignore
          formData.append('file', {
            uri: imageUri,
            name: filename || 'profile.jpg',
            type: type,
          });
        }

        // --- TROCA DE AXIOS POR FETCH ---
        const uploadResponse = await fetch(`${API_URL}/photos/upload`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            // IMPORTANTE: NÃO coloque 'Content-Type': 'multipart/form-data' aqui!
            // O fetch adiciona automaticamente com o boundary correto.
          },
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.log("Erro no upload:", errorText);
          throw new Error("Falha ao enviar a foto (Servidor rejeitou).");
        }
      }

      Alert.alert("Sucesso", "Conta criada!");
      onNavigate("login");

    } catch (error: any) {
      console.error(error);
      let msg = "Erro desconhecido.";
      if (error.response?.data?.message) msg = error.response.data.message;
      else if (error.message) msg = error.message;
      setErrorMessage(`Erro: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={prevStep}><Text style={styles.backText}>‹</Text></TouchableOpacity>
        <View style={styles.progress}><View style={[styles.progressBar, { width: `${(step / total) * 100}%` }]} /></View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {step === 1 && (
          <View>
            <Text style={styles.title}>Acesso</Text>
            <TextInput placeholder="E-mail" style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            <TextInput placeholder="Senha" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />
          </View>
        )}
        {step === 2 && (
          <View>
            <Text style={styles.title}>Sobre você</Text>
            <TextInput placeholder="Nome" style={styles.input} value={name} onChangeText={setName} />
            <Text style={styles.label}>Nascimento (AAAA-MM-DD)</Text>
            <TextInput placeholder="Ex: 2000-12-25" style={styles.input} value={birthDate} onChangeText={setBirthDate} keyboardType="numeric" />
          </View>
        )}
        {step === 3 && (
          <View>
            <Text style={styles.title}>Foto</Text>
            <View style={{ alignItems: 'center' }}>
              {imageUri ? <Image source={{ uri: imageUri }} style={{ width: 120, height: 120, borderRadius: 60 }} /> : <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#eee' }} />}
              <TouchableOpacity onPress={pickImage} style={styles.uploadBtn}><Text>{imageUri ? "Trocar" : "Escolher"}</Text></TouchableOpacity>
            </View>
          </View>
        )}
        {step === 4 && (
          <View>
            <Text style={styles.title}>Bio</Text>
            <TextInput placeholder="Escreva algo..." style={[styles.input, { height: 100 }]} multiline value={bio} onChangeText={setBio} />
          </View>
        )}
        {errorMessage ? <Text style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</Text> : null}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextBtn} onPress={nextStep} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.nextText}>{step < total ? "Continuar" : "Finalizar"}</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { paddingTop: 24, paddingHorizontal: 24 },
  back: { position: "absolute", top: 24, left: 24, zIndex: 10, padding: 8 },
  backText: { fontSize: 28, color: "#6b7280" },
  progress: { backgroundColor: "#e5e7eb", borderRadius: 999, height: 6, width: '100%' },
  progressBar: { height: 6, backgroundColor: "#4f46e5", borderRadius: 999 },
  content: { padding: 32 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 24 },
  input: { backgroundColor: "#f3f4f6", padding: 16, borderRadius: 8, marginBottom: 16 },
  label: { color: "#6b7280", marginBottom: 4, fontSize: 12 },
  uploadBtn: { marginTop: 10, padding: 10, backgroundColor: '#eee', borderRadius: 8 },
  footer: { padding: 32, backgroundColor: "#fff" },
  nextBtn: { backgroundColor: "#4f46e5", paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  nextText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  errorContainer: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, marginTop: 10 },
  errorText: { color: '#ef4444', textAlign: 'center' }
});