import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Alert
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
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

  // ESTADO PARA MENSAGEM DE ERRO
  const [errorMessage, setErrorMessage] = useState("");

  // DADOS DO FORMULÁRIO
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState(""); // String formatada YYYY-MM-DD
  const [bio, setBio] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  // ESTADO DO CALENDÁRIO (MOBILE)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateObject, setDateObject] = useState(new Date());

  const clearError = () => setErrorMessage("");

  // FUNÇÃO: Formatar Data (Mobile)
  const onChangeDateMobile = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateObject(selectedDate);
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setBirthDate(`${year}-${month}-${day}`);
      clearError();
    }
  };

  // FUNÇÃO: Formatar Data (Web)
  const onChangeDateWeb = (event: any) => {
    // O input date da web já retorna YYYY-MM-DD
    setBirthDate(event.target.value);
    clearError();
  };

  // ... (NAVEGAÇÃO E UPLOAD IGUAIS AO ANTERIOR) ...
  function nextStep() {
    setErrorMessage("");
    if (step === 1) {
      if (!email.includes("@")) { setErrorMessage("E-mail inválido."); return; }
      if (password.length < 6) { setErrorMessage("Senha min 6 caracteres."); return; }
    }
    if (step === 2) {
      if (!name.trim()) { setErrorMessage("Nome obrigatório."); return; }
      if (!birthDate) { setErrorMessage("Data de nascimento obrigatória."); return; }
    }
    if (step === 4 && !bio.trim()) { setErrorMessage("Biografia obrigatória."); return; }

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
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled) { setImageUri(result.assets[0].uri); clearError(); }
  };

  const handleFinishRegistration = async () => {
    if (loading) return;
    setLoading(true);
    setErrorMessage("");

    try {
      console.log("1. Criando usuário...");
      const resUser = await axios.post(`${API_URL}/api/auth/register`, { email, password });
      const userId = resUser.data.id;

      console.log("2. Autenticando...");
      const resLogin = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      const token = resLogin.data.token;

      console.log("3. Criando perfil...");
      await axios.put(`${API_URL}/api/profiles/user/${userId}`, {
        name, birthDate, bio, lastLocation: "Brasil"
      }, { headers: { Authorization: `Bearer ${token}` } });

      const resProfile = await axios.get(`${API_URL}/api/profiles/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profileId = resProfile.data.id;

      if (imageUri) {
        console.log("4. Enviando foto...");
        const formData = new FormData();
        formData.append('profileId', String(profileId));

        if (Platform.OS === 'web') {
          const response = await fetch(imageUri);
          const blob = await response.blob();
          formData.append('file', blob, 'profile.jpg');
        } else {
          const filename = imageUri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename || '');
          const type = match ? `image/${match[1]}` : `image/jpeg`;
          // @ts-ignore
          formData.append('file', { uri: imageUri, name: filename || 'profile.jpg', type });
        }

        const uploadResponse = await fetch(`${API_URL}/photos/upload`, {
          method: 'POST', body: formData,
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        });

        if (!uploadResponse.ok) throw new Error("Falha no upload da imagem");
      }

      if (Platform.OS === 'web') alert("Conta criada!");
      else Alert.alert("Sucesso", "Conta criada!");

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
            <TextInput placeholder="E-mail" style={styles.input} value={email} onChangeText={(t) => { setEmail(t); clearError(); }} autoCapitalize="none" keyboardType="email-address" />
            <TextInput placeholder="Senha" style={styles.input} secureTextEntry value={password} onChangeText={(t) => { setPassword(t); clearError(); }} />
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.title}>Sobre você</Text>
            <TextInput placeholder="Nome" style={styles.input} value={name} onChangeText={(t) => { setName(t); clearError(); }} />

            <Text style={styles.label}>Data de nascimento</Text>


            {Platform.OS === 'web' ? (

              <View style={[styles.input, { justifyContent: 'center', padding: 0 }]}>
                {React.createElement('input', {
                  type: 'date',
                  value: birthDate,
                  onChange: onChangeDateWeb,
                  style: {
                    border: 'none',
                    background: 'transparent',
                    width: '100%',
                    height: '100%',
                    fontSize: 16,
                    padding: 16,
                    outline: 'none',
                    fontFamily: 'System'
                  }
                })}
              </View>
            ) : (

              <>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.input, { justifyContent: 'center' }]}>
                  <Text style={{ color: birthDate ? "#111827" : "#9ca3af", fontSize: 16 }}>
                    {birthDate || "Selecionar Data "}
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={dateObject}
                    mode="date"
                    display="default"
                    onChange={onChangeDateMobile}
                    maximumDate={new Date()}
                  />
                )}
              </>
            )}
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
            <TextInput placeholder="Sua bio..." style={[styles.input, { height: 100 }]} multiline value={bio} onChangeText={setBio} />
          </View>
        )}

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
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
  input: { backgroundColor: "#f3f4f6", padding: 16, borderRadius: 8, marginBottom: 16, height: 56 },
  label: { color: "#6b7280", marginBottom: 4, fontSize: 12 },
  uploadBtn: { marginTop: 10, padding: 10, backgroundColor: '#eee', borderRadius: 8 },
  footer: { padding: 32, backgroundColor: "#fff" },
  nextBtn: { backgroundColor: "#4f46e5", paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  nextText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  errorText: { color: '#ef4444', textAlign: 'center', marginTop: 10 }
});