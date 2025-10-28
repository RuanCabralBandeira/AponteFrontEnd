import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { ScreenKey } from "../../App";

export default function Login({ onNavigate }: { onNavigate: (s: ScreenKey) => void }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => onNavigate("welcome")}>
        <Text style={{ fontSize: 18 }}>‹ Voltar</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Bem-vindo de volta!</Text>

        <TextInput placeholder="E-mail" style={styles.input} keyboardType="email-address" />

        <TextInput placeholder="Palavra-passe" style={styles.input} secureTextEntry />

        <TouchableOpacity style={styles.forgot}>
          <Text style={styles.forgotText}>Esqueceu-se da palavra-passe?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginBtn} onPress={() => onNavigate("main")}>
          <Text style={styles.loginText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff", padding: 16 },
  back: { position: "absolute", top: 16, left: 12 },
  content: { flex: 1, justifyContent: "center", paddingHorizontal: 12 },
  title: { fontSize: 28, fontWeight: "800", textAlign: "center", marginBottom: 24 },
  input: { backgroundColor: "#f3f4f6", padding: 14, borderRadius: 12, marginBottom: 12 },
  forgot: { alignItems: "flex-end", marginBottom: 12 },
  forgotText: { color: "#4f46e5", fontWeight: "600" },
  loginBtn: { backgroundColor: "#4f46e5", padding: 14, borderRadius: 12, alignItems: "center", marginTop: 6 },
  loginText: { color: "#fff", fontWeight: "700" },
});