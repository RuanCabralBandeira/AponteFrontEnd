import React, { useState } from "react";
import { API_URL } from"./config";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  ActivityIndicator,
  Platform // Para saber se é Web ou Celular
} from "react-native";
import axios from "axios";
import { ScreenKey } from "../../App";



export default function RegisterFlow({ onNavigate }: { onNavigate: (s: ScreenKey) => void }) {
  const [step, setStep] = useState(1);
  const total = 5;
  const [loading, setLoading] = useState(false);
  
  // ESTADO PARA MENSAGEM DE ERRO
  const [errorMessage, setErrorMessage] = useState("");

  // DADOS
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  // LIMPAR ERRO AO DIGITAR
  const clearError = () => setErrorMessage("");

  const isValidDate = (dateString: string) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString);
    const timestamp = date.getTime();
    if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) return false;
    const [year, month, day] = dateString.split('-').map(Number);
    if (date.getUTCFullYear() !== year || (date.getUTCMonth() + 1) !== month || date.getUTCDate() !== day) {
      return false;
    }
    return true;
  };

  // --- LÓGICA DE AVANÇAR (CATRACA) ---
  function nextStep() {
    setErrorMessage(""); // Limpa erros anteriores

    // VALIDAÇÃO PASSO 1
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

    // VALIDAÇÃO PASSO 2
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

    // VALIDAÇÃO PASSO 4
    if (step === 4) {
      if (!bio.trim()) {
        setErrorMessage("Escreva algo na sua biografia.");
        return;
      }
    }

    // Se passou, avança
    if (step < total) {
      setStep(step + 1);
    } else {
      handleFinishRegistration();
    }
  }

  function prevStep() {
    setErrorMessage(""); // Limpa erro ao voltar
    if (step > 1) setStep(step - 1);
    else onNavigate("welcome");
  }

  const handleFinishRegistration = async () => {
    if(loading) return;
    setLoading(true);
    setErrorMessage("");

    try {
      console.log("Criando usuário...");
      const resUser = await axios.post(`${API_URL}/api/auth/register`, { email, password });
      const userId = resUser.data.id;

      console.log("Autenticando...");
      const resLogin = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      const token = resLogin.data.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      console.log("Criando perfil...");
      const resProfile = await axios.put(`${API_URL}/api/profiles/user/${userId}`, {
        name, birthDate, bio, lastLocation: "Brasil"
      }, config);
      
      if (photoUrl) {
        console.log("Adicionando foto...");
        await axios.post(`${API_URL}/api/photos/profile/${resProfile.data.id}`, {
          url: photoUrl, orderIndex: 1
        }, config);
      }

      // Sucesso!
      if (Platform.OS === 'web') {
        alert("Conta criada com sucesso!");
      } 
      onNavigate("login");

    } catch (error: any) {
      console.error("Erro:", error.response?.data || error.message);
      // Mostra o erro do backend na tela (ex: Email já em uso)
      setErrorMessage("Erro ao criar conta. Verifique os dados ou tente outro e-mail.");
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
            <Text style={styles.subtitle}>Cole o link de uma foto sua.</Text>
            <TextInput
              placeholder="https://..."
              style={styles.input}
              value={photoUrl}
              onChangeText={setPhotoUrl}
              autoCapitalize="none"
            />
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

        {step === 5 && (
          <View>
            <Text style={styles.title}>Tudo pronto!</Text>
            <Text style={styles.subtitle}>Clique abaixo para finalizar.</Text>
            <View style={styles.tagsRow}>
              <TouchableOpacity style={[styles.tag, {backgroundColor: '#4f46e5'}]}>
                <Text style={[styles.tagText, {color: '#fff'}]}>Fotografia</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tag}>
                <Text style={styles.tagText}>Viagens</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* --- AQUI ESTÁ A MÁGICA: MENSAGEM DE ERRO NA TELA --- */}
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
          </View>
        ) : null}

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
            style={[styles.nextBtn, loading && {backgroundColor: '#a5b4fc'}]} 
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
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tag: { backgroundColor: "#e5e7eb", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999 },
  tagText: { color: "#374151", fontWeight: "600" },
  footer: { padding: 32, position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff" },
  nextBtn: { backgroundColor: "#4f46e5", paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  nextText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  
  // ESTILOS DE ERRO
  errorContainer: {
    backgroundColor: '#fee2e2', // Fundo vermelho claro
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20
  },
  errorText: {
    color: '#ef4444', // Texto vermelho
    fontWeight: '600',
    textAlign: 'center'
  }
});