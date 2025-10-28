import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Login() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={{ position: "absolute", left: 12, top: 12 }}>
        <Text>‹ Voltar</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Bem-vindo de volta!</Text>
        <TextInput placeholder="E-mail" style={styles.input} keyboardType="email-address" />
        <TextInput placeholder="Palavra-passe" style={styles.input} secureTextEntry />
        <TouchableOpacity style={styles.forgot}><Text style={styles.link}>Esqueceu-se da palavra-passe?</Text></TouchableOpacity>
        <TouchableOpacity style={styles.loginBtn} onPress={() => router.replace("/(tabs)/match")}>
          <Text style={styles.loginText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff", padding: 16 },
  content: { flex: 1, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "800", textAlign: "center", marginBottom: 20 },
  input: { backgroundColor: "#f3f4f6", padding: 12, borderRadius: 12, marginBottom: 12 },
  forgot: { alignItems: "flex-end" },
  link: { color: "#4f46e5", fontWeight: "600" },
  loginBtn: { backgroundColor: "#4f46e5", padding: 14, borderRadius: 12, alignItems: "center", marginTop: 10 },
  loginText: { color: "#fff", fontWeight: "700" },
});