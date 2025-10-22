import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function MyAccount({ onDone, onBack }: { onDone?: () => void; onBack?: () => void }) {
  const { login, register, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const doLogin = async () => {
    try {
      setProcessing(true);
      const ok = await login(email, password);
      if (ok) {
        if (onDone) onDone();
      }
    } finally {
      setProcessing(false);
    }
  };

  const doRegister = async () => {
    try {
      setProcessing(true);
      const ok = await register(email, password, name);
      if (ok) {
        Alert.alert("Registered", "Account created, please log in");
        setIsRegister(false);
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isRegister ? "Create account" : "Login"}</Text>
      {isRegister && <TextInput value={name} onChangeText={setName} placeholder="Name" style={styles.input} />}
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" style={styles.input} keyboardType="email-address" autoCapitalize="none" />
      <TextInput value={password} onChangeText={setPassword} placeholder="Password" style={styles.input} secureTextEntry />

      <TouchableOpacity style={styles.button} onPress={isRegister ? doRegister : doLogin} disabled={processing}>
        {processing ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>{isRegister ? "Create" : "Login"}</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsRegister((s) => !s)}>
        <Text style={styles.link}>{isRegister ? "Have an account? Login" : "Create a new account"}</Text>
      </TouchableOpacity>

      {user && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ color: "#67e8f9" }}>Signed in as {user.email ?? user.name}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "bold", color: "#67e8f9", marginBottom: 12 },
  input: { backgroundColor: "#111827", color: "white", padding: 12, borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: "#06b6d4", padding: 12, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "bold" },
  link: { color: "#67e8f9", marginTop: 12, textAlign: "center" },
});
