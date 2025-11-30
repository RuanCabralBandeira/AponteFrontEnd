import React, { useState } from "react";
import { API_URL } from"./config";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  Alert 
} from "react-native";
import axios, { isAxiosError } from "axios"; 
import AsyncStorage from "@react-native-async-storage/async-storage";



type Props = {
  onNavigate: (s: string) => void; 
};

export default function Login({ onNavigate }: Props) {
  
  // ---
  // 2. ESTADOS DO COMPONENTE
  // ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(""); // Para mensagens de erro

  // ---
  // 3. LÓGICA DE LOGIN (CHAMADA À API)
  // ---
  const handleLogin = async () => {
    if (isLoading) return; // Evita cliques duplos
    setIsLoading(true);
    setError(""); // Limpa erros antigos

    // Validar inputs
    if (!email || !password) {
      setError("Por favor, preencha o e-mail e a palavra-passe.");
      setIsLoading(false);
      return;
    }

   try {
      // Chamar o endpoint /api/auth/login
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: email,
        password: password,
      });

  
      const { token, userId } = response.data; // Agora recebemos os dois

      console.log("Login realizado! Token:", token, "ID:", userId);

      // SALVAR NO CELULAR
      await AsyncStorage.setItem('userToken', token);
      
      // convertemos o ID numérico
      await AsyncStorage.setItem('userId', String(userId));
      
      // Navegar para a tela principal
      onNavigate("main");

    } catch (err) {
      // 4. TRATAMENTO DE ERROS (CORRIGIDO PARA O 'err' unknown)
      // ---
      let errorMsg = "E-mail ou palavra-passe inválidos.";
      
      // 1. Verificamos se é um erro do Axios
      if (isAxiosError(err)) {
        if (err.response) {
          // 2. Erro da API (ex: 401 Não Autorizado, 404, etc.)
          console.error("Erro no login (dados da API):", err.response.data);
          errorMsg = "E-mail ou palavra-passe inválidos.";
        } else if (err.request) {
          // 3. Erro de Rede (A API não respondeu)
          console.error("Erro no login (sem resposta da API):", err.request);
          errorMsg = "Erro de rede. A API está ligada? (Verifique localhost:8080)";
        } else {
          // 4. Outro erro ao montar a requisição do Axios
          console.error("Erro no login (Axios):", err.message);
          errorMsg = "Ocorreu um erro ao tentar o login.";
        }
      } else if (err instanceof Error) {
        // 5. Erro genérico do JavaScript
        console.error("Erro no login (Geral):", err.message);
        errorMsg = "Ocorreu um erro inesperado.";
      } else {
        // 6. Erro desconhecido
        console.error("Erro desconhecido:", err);
        errorMsg = "Ocorreu um erro desconhecido.";
      }
      
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => onNavigate("welcome")}>
        <Text style={styles.backText}>‹</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Bem-vindo de volta!</Text>

        {/* Exibir mensagem de erro */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          placeholder="E-mail"
          style={styles.input}
          keyboardType="email-address"
          placeholderTextColor="#6b7280"
          value={email} // Conecta o input ao estado
          onChangeText={setEmail} // Conecta o input ao estado
          autoCapitalize="none"
          editable={!isLoading}
        />

        <TextInput
          placeholder="Palavra-passe"
          style={styles.input}
          secureTextEntry
          placeholderTextColor="#6b7280"
          value={password} // Conecta o input ao estado
          onChangeText={setPassword} // Conecta o input ao estado
          editable={!isLoading}
        />

        <TouchableOpacity 
          style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]} 
          onPress={handleLogin} // Chama a função de API
          disabled={isLoading} // Desativa o botão durante o loading
        >
          <Text style={styles.loginText}>
            {isLoading ? "A entrar..." : "Entrar"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ---
// 5. ESTILOS 
// ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 24, // p-6
  },
  back: {
    position: "absolute",
    top: 24, // top-6
    left: 24, // left-6
    zIndex: 10,
    padding: 8,
  },
  backText: {
    fontSize: 28,
    color: "#6b7280", // text-gray-500
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16, // px-4
  },
  title: {
    fontSize: 30, // text-3xl
    fontWeight: "700", // font-bold
    textAlign: "center",
    marginBottom: 32, // mb-8
    color: "#111827", // text-gray-900
  },
  input: {
    backgroundColor: "#f3f4f6", // bg-gray-100
    padding: 16, // p-4
    borderRadius: 8, // rounded-lg
    marginBottom: 16, // mb-4
    fontSize: 16,
    color: "#111827",
  },
  forgot: {
    alignItems: "flex-end",
    marginBottom: 24, // mb-6
  },
  forgotText: {
    color: "#4f46e5", // text-indigo-600
    fontWeight: "600", // font-semibold
    fontSize: 14, // text-sm
  },
  loginBtn: {
    backgroundColor: "#4f46e5", // bg-indigo-600
    paddingVertical: 16, // py-4
    borderRadius: 12, // rounded-xl
    alignItems: "center",
    marginTop: 16, // mt-4
  },
  loginBtnDisabled: {
    backgroundColor: "#a5b4fc", // bg-indigo-300
  },
  loginText: {
    color: "#fff",
    fontWeight: "700", // font-bold
    fontSize: 18, // text-lg
  },
  errorText: {
    color: "#ef4444", // text-red-500
    textAlign: "center",
    marginBottom: 16, // mb-4
    fontSize: 14,
    fontWeight: "600",
  }
});
