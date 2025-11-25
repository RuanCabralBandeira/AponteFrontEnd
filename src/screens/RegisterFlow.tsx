import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  Alert,
  ActivityIndicator
} from "react-native";
import axios from "axios"; // Importar Axios
import { ScreenKey } from "../../App";

// SEU ENDEREÇO LOCAL (Mesmo do Login)
const API_URL = "http://localhost:8080"; 

export default function RegisterFlow({ onNavigate }: { onNavigate: (s: ScreenKey) => void }) {
  const [step, setStep] = useState(1);
  const total = 5;
  const [loading, setLoading] = useState(false);

  // --- DADOS DO FORMULÁRIO ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState(""); // Formato YYYY-MM-DD
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState(""); // URL da foto

  // Função para avançar ou finalizar
  async function nextStep() {
    if (step < total) {
      setStep(step + 1);
    } else {
      // Se for o último passo, envia tudo para o servidor
      await handleFinishRegistration();
    }
  }

  function prevStep() {
    if (step > 1) setStep(step - 1);
    else onNavigate("welcome");
  }

  // --- A MÁGICA DO CADASTRO (ATUALIZADA) ---
  const handleFinishRegistration = async () => {
    if(loading) return;
    setLoading(true);

    try {
      // 1. CRIAR CONTA (USER)
      console.log("Criando usuário...");
      const resUser = await axios.post(`${API_URL}/api/auth/register`, {
        email: email,
        password: password
      });
      const userId = resUser.data.id;
      console.log("Usuário criado. ID:", userId);

      // --- NOVO PASSO: LOGIN AUTOMÁTICO ---
      // Precisamos do Token para criar o perfil, senão dá erro 403
      console.log("Autenticando para criar perfil...");
      const resLogin = await axios.post(`${API_URL}/api/auth/login`, {
        email: email,
        password: password
      });
      const token = resLogin.data.token;
      
      // Prepara o cabeçalho com o Token
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // 2. CRIAR PERFIL (Enviando o Token)
      console.log("Criando perfil...");
      const resProfile = await axios.put(
        `${API_URL}/api/profiles/user/${userId}`, 
        {
          name: name,
          birthDate: birthDate, 
          bio: bio,
          lastLocation: "Brasil"
        },
        config // <--- AQUI VAI O TOKEN
      );
      const profileId = resProfile.data.id;
      console.log("Perfil criado. ID:", profileId);

      // 3. ADICIONAR FOTO (Enviando o Token)
      if (photoUrl) {
        console.log("Adicionando foto...");
        await axios.post(
          `${API_URL}/api/photos/profile/${profileId}`, 
          {
            url: photoUrl,
            orderIndex: 1
          },
          config // <--- AQUI TAMBÉM
        );
      }

      Alert.alert("Sucesso!", "Cadastro realizado. Faça login para continuar.");
      onNavigate("login");

    } catch (error: any) {
      console.error("Erro no cadastro:", error.response?.data || error.message);
      Alert.alert("Erro", "Não foi possível finalizar o cadastro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={prevStep}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.progress}>
          <View style={[styles.progressBar, { width: `${(step / total) * 100}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* PASSO 1: LOGIN */}
        {step === 1 && (
          <View>
            <Text style={styles.title}>Seus dados de acesso</Text>
            <TextInput
              placeholder="Seu melhor e-mail"
              style={styles.input}
              keyboardType="email-address"
              placeholderTextColor="#6b7280"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
            <TextInput
              placeholder="Crie uma palavra-passe (mín 6 caracteres)"
              style={styles.input}
              secureTextEntry
              placeholderTextColor="#6b7280"
              value={password}
              onChangeText={setPassword}
            />
          </View>
        )}

        {/* PASSO 2: PERFIL */}
        {step === 2 && (
          <View>
            <Text style={styles.title}>Como podemos chamá-lo?</Text>
            <TextInput
              placeholder="Primeiro nome"
              style={styles.input}
              placeholderTextColor="#6b7280"
              value={name}
              onChangeText={setName}
            />
            <Text style={styles.label}>Data de nascimento (AAAA-MM-DD)</Text>
            <TextInput
              placeholder="Ex: 1995-10-25"
              style={styles.input}
              placeholderTextColor="#6b7280"
              value={birthDate}
              onChangeText={setBirthDate}
              keyboardType="numeric" // Ajuda a digitar datas
            />
          </View>
        )}

        {/* PASSO 3: FOTOS */}
        {step === 3 && (
          <View>
            <Text style={styles.title}>Sua foto de perfil</Text>
            <Text style={styles.subtitle}>
              Como o servidor ainda não aceita upload de arquivos, cole um Link (URL) de uma imagem da internet.
            </Text>
            
            <TextInput
              placeholder="Cole aqui o link da imagem (https://...)"
              style={styles.input}
              placeholderTextColor="#6b7280"
              value={photoUrl}
              onChangeText={setPhotoUrl}
              autoCapitalize="none"
            />

            {/* Prévia da imagem se tiver URL válida */}
            {photoUrl.length > 10 && (
               <View style={styles.photoBig}>
                  <Text>📸 Foto carregada</Text>
               </View>
            )}
          </View>
        )}

        {/* PASSO 4: BIO */}
        {step === 4 && (
          <View>
            <Text style={styles.title}>Fale um pouco sobre si</Text>
            <TextInput
              placeholder="O que você gosta de fazer? Seja criativo!"
              style={[styles.input, { height: 160, textAlignVertical: "top" }]} 
              multiline
              placeholderTextColor="#6b7280"
              value={bio}
              onChangeText={setBio}
            />
          </View>
        )}

        {/* PASSO 5: TAGS (Apenas visual por enquanto) */}
        {step === 5 && (
          <View>
            <Text style={styles.title}>Tudo pronto!</Text>
            <Text style={styles.subtitle}>Clique em finalizar para criar sua conta.</Text>
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
      </ScrollView>

      {/* RODAPÉ */}
      <View style={styles.footer}>
        <TouchableOpacity 
            style={[styles.nextBtn, loading && {backgroundColor: '#a5b4fc'}]} 
            onPress={nextStep}
            disabled={loading}
        >
          {loading ? (
             <ActivityIndicator color="#fff" />
          ) : (
             <Text style={styles.nextText}>{step < total ? "Continuar" : "Finalizar Cadastro"}</Text>
          )}
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
  photoBig: { width: "100%", height: 160, backgroundColor: "#e5e7eb", borderRadius: 8, alignItems: "center", justifyContent: "center", marginTop: 10 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tag: { backgroundColor: "#e5e7eb", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999 },
  tagText: { color: "#374151", fontWeight: "600" },
  footer: { padding: 32, position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff" },
  nextBtn: { backgroundColor: "#4f46e5", paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  nextText: { color: "#fff", fontWeight: "700", fontSize: 18 },
});