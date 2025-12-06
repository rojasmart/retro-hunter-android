import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useAuth } from "../context/AuthContext";

import { LinearGradient } from "expo-linear-gradient";

import styles from "./MyAccount.styles";

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
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{user.name || "Not set"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
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
        <LinearGradient
          colors={["#34d399", "#ec4899", "#a855f7"]} // Gradiente: verde, rosa, roxo
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.logoGradient}
        >
          <Text style={styles.logoText}>RETRO HUNTER</Text>
        </LinearGradient>

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
