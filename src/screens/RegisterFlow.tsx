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
  Platform, // Essencial para a lógica híbrida
  Alert
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
  const total = 4; // ALTERADO DE 5 PARA 4
  const [loading, setLoading] = useState(false);

  // ESTADO PARA MENSAGEM DE ERRO
  const [errorMessage, setErrorMessage] = useState("");

  // DADOS DO FORMULÁRIO
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [bio, setBio] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  const clearError = () => setErrorMessage("");

  // VALIDAÇÃO DE DATA
  const isValidDate = (dateString: string) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString);
    const timestamp = date.getTime();
    if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) return false;

    // Verifica coerência (evita 30 de fevereiro, etc)
    const [year, month, day] = dateString.split('-').map(Number);
    if (date.getUTCFullYear() !== year || (date.getUTCMonth() + 1) !== month || date.getUTCDate() !== day) {
      return false;
    }
    return true;
  };

  // --- LÓGICA DE NAVEGAÇÃO (STEPS) ---
  function nextStep() {
    setErrorMessage("");

    if (step === 1) {
      if (!email.includes("@")) {
        setErrorMessage("Por favor, insira um e-mail válido.");
        return;
      }
      if (password.length < 6) {
        setErrorMessage("A senha deve ter no mínimo 6 caracteres.");
        return;
      }
    }

    if (step === 2) {
      if (!name.trim()) {
        setErrorMessage("O campo nome é obrigatório.");
        return;
      }
      if (!isValidDate(birthDate)) {
        setErrorMessage("Data inválida. Use o formato AAAA-MM-DD (Ex: 1999-12-31).");
        return;
      }
    }

    if (step === 4) {
      if (!bio.trim()) {
        setErrorMessage("Escreva algo na sua biografia.");
        return;
      }
    }

    if (step < total) {
      setStep(step + 1);
    } else {
      handleFinishRegistration();
    }
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
      quality: 0.8, // Otimizado para upload mais rápido no celular
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      clearError();
    }
  };

  // --- CADASTRO COMPLETO (WEB E MOBILE) ---
  const handleFinishRegistration = async () => {
    if (loading) return;
    setLoading(true);
    setErrorMessage("");

    try {
      // 1. CRIAR USUÁRIO
      console.log("1. Criando usuário...");
      const resUser = await axios.post(`${API_URL}/api/auth/register`, { email, password });
      const userId = resUser.data.id;

      // 2. LOGIN (Para pegar o Token JWT)
      console.log("2. Autenticando...");
      const resLogin = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      const token = resLogin.data.token;

      const authConfig = { headers: { Authorization: `Bearer ${token}` } };

      // 3. CRIAR PERFIL
      console.log("3. Criando perfil...");
      const resProfile = await axios.put(`${API_URL}/api/profiles/user/${userId}`, {
        name,
        birthDate,
        bio,
        lastLocation: "Brasil"
      }, authConfig);

      const profileId = resProfile.data.id;

      // 4. UPLOAD DA FOTO (Lógica Híbrida)
      if (imageUri) {
        console.log("4. Enviando foto...");

        const formData = new FormData();
        formData.append('profileId', String(profileId));

        // --- DIVISOR DE ÁGUAS: WEB vs MOBILE ---
        if (Platform.OS === 'web') {
          // No navegador, precisamos converter a URL em um BLOB (arquivo binário real)
          const response = await fetch(imageUri);
          const blob = await response.blob();
          formData.append('file', blob, 'profile.jpg');
        } else {
          // No Celular (APK), o React Native exige um objeto JSON específico
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

        // ENVIO DO FORM DATA
        await axios.post(`${API_URL}/photos/upload`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            // Deixe o Axios gerar o 'multipart/form-data; boundary=...' automaticamente
          },
          transformRequest: (data) => {
            return data; // Impede conversão para JSON
          }
        });
      }

      console.log("Sucesso total!");

      if (Platform.OS === 'web') {
        alert("Conta criada com sucesso!");
      } else {
        Alert.alert("Sucesso", "Conta criada com sucesso!");
      }

      onNavigate("login");

    } catch (error: any) {
      console.error("Erro completo:", error);
      let msg = "Erro desconhecido.";

      if (error.response) {
        if (error.response.status === 403) {
          msg = "Erro de permissão (403). Falha na autenticação do upload.";
        } else if (error.response.data && error.response.data.message) {
          msg = error.response.data.message;
        } else {
          msg = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        msg = error.message;
      }
      setErrorMessage(`Falha no cadastro: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={prevStep}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.progress}>
          <View style={[styles.progressBar, { width: `${(step / total) * 100}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {step === 1 && (
          <View>
            <Text style={styles.title}>Seus dados de acesso</Text>
            <TextInput
              placeholder="E-mail"
              style={styles.input}
              value={email}
              onChangeText={(t) => { setEmail(t); clearError(); }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              placeholder="Senha (mín 6 caracteres)"
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={(t) => { setPassword(t); clearError(); }}
            />
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.title}>Como podemos chamá-lo?</Text>
            <TextInput
              placeholder="Nome"
              style={styles.input}
              value={name}
              onChangeText={(t) => { setName(t); clearError(); }}
            />
            <Text style={styles.label}>Data de nascimento (AAAA-MM-DD)</Text>
            <TextInput
              placeholder="Ex: 2000-12-25"
              style={styles.input}
              value={birthDate}
              onChangeText={(t) => { setBirthDate(t); clearError(); }}
              keyboardType="numeric"
            />
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.title}>Sua foto de perfil</Text>
            <Text style={styles.subtitle}>Escolha uma foto da sua galeria.</Text>

            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 10 }}
                />
              ) : (
                <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#e5e7eb', marginBottom: 10 }} />
              )}

              <TouchableOpacity onPress={pickImage} style={styles.uploadBtn}>
                <Text style={styles.uploadBtnText}>
                  {imageUri ? "Trocar Foto" : "Selecionar Foto"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 4 && (
          <View>
            <Text style={styles.title}>Fale um pouco sobre si</Text>
            <TextInput
              placeholder="O que você gosta de fazer?"
              style={[styles.input, { height: 160, textAlignVertical: "top" }]}
              multiline
              value={bio}
              onChangeText={(t) => { setBio(t); clearError(); }}
            />
          </View>
        )}

        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
          </View>
        ) : null}

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, loading && { backgroundColor: '#a5b4fc' }]}
          onPress={nextStep}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> :
            <Text style={styles.nextText}>{step < total ? "Continuar" : "Finalizar Cadastro"}</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  header: { paddingTop: 24, paddingHorizontal: 24 },
  back: { position: "absolute", top: 24, left: 24, zIndex: 10, padding: 8 },
  backText: { fontSize: 28, color: "#6b7280" },
  progress: { backgroundColor: "#e5e7eb", borderRadius: 999, height: 6, overflow: "hidden" },
  progressBar: { height: 6, backgroundColor: "#4f46e5", borderRadius: 999 },
  content: { padding: 32, paddingBottom: 100 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 24, color: "#111827" },
  input: { backgroundColor: "#f3f4f6", padding: 16, borderRadius: 8, marginBottom: 16, fontSize: 16, color: "#111827" },
  label: { color: "#6b7280", marginBottom: 8, fontSize: 14 },
  subtitle: { color: "#6b7280", marginBottom: 24, fontSize: 16 },
  footer: { padding: 32, position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff" },
  nextBtn: { backgroundColor: "#4f46e5", paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  nextText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  uploadBtn: { backgroundColor: '#e5e7eb', padding: 12, borderRadius: 8 },
  uploadBtnText: { color: '#374151', fontWeight: '600' },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20
  },
  errorText: {
    color: '#ef4444',
    fontWeight: '600',
    textAlign: 'center'
  }
});