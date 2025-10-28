import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function EditProfile() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={{ position: "absolute", left: 12, top: 12 }}><Text>‹ Voltar</Text></TouchableOpacity>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "700" }}>Editar Perfil</Text>
      </View>
      <View style={{ padding: 16 }}>
        <TouchableOpacity style={styles.save} onPress={() => router.back()}><Text style={{ color: "#fff" }}>Salvar Alterações</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  save: { backgroundColor: "#4f46e5", padding: 14, borderRadius: 12, alignItems: "center" }
});