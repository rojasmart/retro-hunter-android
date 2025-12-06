import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function MyAccount({ onDone, onBack }: { onDone?: () => void; onBack?: () => void }) {
  const { login, register, logout, user, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const doLogin = async () => {
    try {
      setProcessing(true);
      clearError();
      const ok = await login(email, password);
      if (ok) {
        Alert.alert("Success", "Logged in successfully!");
        if (onDone) onDone();
      }
    } finally {
      setProcessing(false);
    }
  };

  const doRegister = async () => {
    try {
      setProcessing(true);
      clearError();
      const ok = await register(name, email, password);
      if (ok) {
        Alert.alert("Success", "Account created successfully!");
        setIsRegister(false);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          Alert.alert("Success", "Logged out successfully");
          setEmail("");
          setPassword("");
          setName("");
        },
      },
    ]);
  };

  // If user is logged in, show profile view
  if (user) {
    return (
      <View style={styles.container}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{(user.name || user.email || "U").charAt(0).toUpperCase()}</Text>
          </View>

          <Text style={styles.profileTitle}>Account Details</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{user.name || "Not set"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>LOGOUT</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Login/Register form
  return (
    <View style={styles.container}>
      <View style={styles.formCard}>
        <Text style={styles.logo}>RETRO HUNTER</Text>
        <Text style={styles.formTitle}>{isRegister ? "Create Account" : "Welcome Back"}</Text>
        <Text style={styles.formSubtitle}>{isRegister ? "Join the hunt for retro games" : "Login to your account"}</Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {isRegister && (
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput value={name} onChangeText={setName} placeholder="Enter your name" style={styles.input} placeholderTextColor="#6b7280" />
          </View>
        )}

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#6b7280"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            style={styles.input}
            secureTextEntry
            placeholderTextColor="#6b7280"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, processing && styles.buttonDisabled]}
          onPress={isRegister ? doRegister : doLogin}
          disabled={processing}
        >
          {processing ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>{isRegister ? "CREATE ACCOUNT" : "LOGIN"}</Text>}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity onPress={() => setIsRegister((s) => !s)}>
          <Text style={styles.link}>{isRegister ? "Already have an account? Login" : "Don't have an account? Create one"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  formCard: {
    backgroundColor: "rgba(31,41,55,0.8)",
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: "rgba(6,182,212,0.3)",
  },
  profileCard: {
    backgroundColor: "rgba(31,41,55,0.8)",
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: "rgba(6,182,212,0.3)",
    alignItems: "center",
  },
  logo: {
    fontSize: 24,
    fontWeight: "800",
    color: "#10b981",
    fontFamily: "monospace",
    textAlign: "center",
    marginBottom: 8,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#67e8f9",
    marginBottom: 4,
    textAlign: "center",
  },
  formSubtitle: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 24,
    textAlign: "center",
    fontFamily: "monospace",
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    color: "#67e8f9",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: "monospace",
  },
  input: {
    backgroundColor: "rgba(17,24,39,0.8)",
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.3)",
    borderRadius: 6,
    padding: 14,
    color: "white",
    fontSize: 16,
    fontFamily: "monospace",
  },
  button: {
    backgroundColor: "#06d447ff",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: "#6b7280",
    borderColor: "rgba(107,114,128,0.5)",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(6,182,212,0.3)",
  },
  dividerText: {
    color: "#6b7280",
    paddingHorizontal: 12,
    fontFamily: "monospace",
    fontWeight: "bold",
  },
  link: {
    color: "#67e8f9",
    textAlign: "center",
    fontFamily: "monospace",
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: "rgba(239,68,68,0.2)",
    borderWidth: 1,
    borderColor: "#ef4444",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    fontFamily: "monospace",
    textAlign: "center",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#06b6d4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "rgba(6,182,212,0.5)",
  },
  avatarText: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  profileTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#67e8f9",
    marginBottom: 24,
    fontFamily: "monospace",
  },
  infoRow: {
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.2)",
  },
  infoLabel: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
    fontFamily: "monospace",
  },
  infoValue: {
    color: "#67e8f9",
    fontSize: 16,
    fontFamily: "monospace",
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
    width: "100%",
    borderWidth: 2,
    borderColor: "rgba(239,68,68,0.5)",
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
});
