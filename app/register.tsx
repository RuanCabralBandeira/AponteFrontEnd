import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";

export default function Register() {
  const [step, setStep] = useState(1);
  const total = 5;
  const router = useRouter();

  function nextStep() {
    if (step < total) setStep(s => s + 1);
    else router.replace("/(tabs)/match");
  }
  function prevStep() {
    if (step > 1) setStep(s => s - 1);
    else router.back();
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={prevStep} style={{ position: "absolute", left: 12, top: 12 }}><Text>‹ Voltar</Text></TouchableOpacity>
      <View style={styles.progress}><View style={[styles.progressBar, { width: `${(step/total)*100}%` }]} /></View>

      <ScrollView contentContainerStyle={styles.content}>
        {step === 1 && <>
          <Text style={styles.title}>Seus dados de acesso</Text>
          <TextInput placeholder="Seu melhor e-mail" style={styles.input} keyboardType="email-address" />
          <TextInput placeholder="Crie uma palavra-passe segura" style={styles.input} secureTextEntry />
        </>}
        {step === 2 && <>
          <Text style={styles.title}>Como podemos chamá-lo?</Text>
          <TextInput placeholder="Primeiro nome" style={styles.input} />
          <Text style={styles.label}>Data de nascimento</Text>
          <TextInput placeholder="YYYY-MM-DD" style={styles.input} />
        </>}
        {step === 3 && <>
          <Text style={styles.title}>Mostre o seu melhor lado</Text>
          <Text style={styles.subtitle}>Adicione pelo menos 2 fotos.</Text>
          <View style={styles.photoGrid}><View style={styles.photoBig}><Text>+</Text></View><View style={styles.photoSmall}><Text>+</Text></View><View style={styles.photoSmall}><Text>+</Text></View><View style={styles.photoSmall}><Text>+</Text></View></View>
        </>}
        {step === 4 && <>
          <Text style={styles.title}>Fale um pouco sobre si</Text>
          <TextInput placeholder="O que você gosta de fazer?" style={[styles.input, { height: 140 }]} multiline />
        </>}
        {step === 5 && <>
          <Text style={styles.title}>Quais são os seus interesses?</Text>
          <Text style={styles.subtitle}>Escolha pelo menos 3.</Text>
          <View style={styles.tagsRow}><TouchableOpacity style={styles.tag}><Text>Fotografia</Text></TouchableOpacity><TouchableOpacity style={styles.tag}><Text>Viagens</Text></TouchableOpacity><TouchableOpacity style={styles.tag}><Text>Música</Text></TouchableOpacity></View>
        </>}
        <TouchableOpacity style={styles.nextBtn} onPress={nextStep}><Text style={styles.nextText}>{step < total ? "Continuar" : "Finalizar Cadastro"}</Text></TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  progress: { paddingTop: 18, paddingHorizontal: 16 },
  progressBar: { height: 6, backgroundColor: "#6366f1", borderRadius: 6 },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  input: { backgroundColor: "#f3f4f6", padding: 12, borderRadius: 12, marginBottom: 12 },
  label: { color: "#6b7280", marginBottom: 6 },
  subtitle: { color: "#6b7280", marginBottom: 10 },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  photoBig: { width: "100%", height: 160, backgroundColor: "#e5e7eb", borderRadius: 12, marginBottom: 8, alignItems: "center", justifyContent: "center" },
  photoSmall: { width: "30%", height: 80, backgroundColor: "#e5e7eb", borderRadius: 12, marginRight: 8, alignItems: "center", justifyContent: "center" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { backgroundColor: "#e5e7eb", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, marginRight: 8 },
  nextBtn: { backgroundColor: "#4f46e5", padding: 14, borderRadius: 12, alignItems: "center", marginTop: 12 },
  nextText: { color: "#fff", fontWeight: "700" },
});