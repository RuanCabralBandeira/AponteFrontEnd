import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { ScreenKey } from "../../App";

export default function Login({ onNavigate }: { onNavigate: (s: ScreenKey) => void }) {
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => onNavigate("welcome")}>
        <Text style={styles.backText}>‹</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Bem-vindo de volta!</Text>

        <TextInput
          placeholder="E-mail"
          style={styles.input}
          keyboardType="email-address"
          placeholderTextColor="#6b7280"
        />

        <TextInput
          placeholder="Palavra-passe"
          style={styles.input}
          secureTextEntry
          placeholderTextColor="#6b7280"
        />

        <TouchableOpacity style={styles.forgot}>
          <Text style={styles.forgotText}>Esqueceu-se da palavra-passe?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginBtn} onPress={() => onNavigate("main")}>
          <Text style={styles.loginText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

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
  loginText: {
    color: "#fff",
    fontWeight: "700", // font-bold
    fontSize: 18, // text-lg
  },
});