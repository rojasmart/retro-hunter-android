import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, TextInput, Modal } from "react-native";
import { useAuth } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";

interface Item {
  _id: string;
  gameTitle: string;
  platform: string;
  purchasePrice?: number;
}

export default function MyCollectionsPage({ onBack }: { onBack?: () => void }) {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPlatform, setNewPlatform] = useState("");

  useEffect(() => {
    fetchCollections();
  }, [user]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const uid = (user as any)?.id ?? (user as any)?._id ?? (user as any)?.userId;
      if (!uid) {
        setItems([]);
        return;
      }

      const token = await AsyncStorage.getItem("auth_token");

      const res = await fetch(`${API_BASE_URL}/collections/${uid}`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          : { "Content-Type": "application/json" },
      });

      const data = await res.json();
      const list = data.collections || data.items || data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("fetchCollections", error);
      Alert.alert("Error", "Failed to fetch collections");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    if (!newTitle || !newPlatform) {
      Alert.alert("Validation", "Title and platform are required");
      return;
    }
    try {
      setLoading(true);
      const uid = (user as any)?.id ?? (user as any)?._id ?? (user as any)?.userId;
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) throw new Error("Not authenticated");

      const body = { gameTitle: newTitle, platform: newPlatform, userId: uid };

      const res = await fetch(`${API_BASE_URL}/collections`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        Alert.alert("Error", data?.error || "Failed to add item");
        return;
      }

      // refresh
      setNewTitle("");
      setNewPlatform("");
      setIsAdding(false);
      fetchCollections();
    } catch (e) {
      console.error("addItem", e);
      Alert.alert("Error", "Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (id: string) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`${API_BASE_URL}/collections/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any));
        Alert.alert("Error", data?.error || "Failed to delete");
        return;
      }

      setItems((prev) => prev.filter((it) => it._id !== id));
    } catch (e) {
      console.error("removeItem", e);
      Alert.alert("Error", "Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.gameTitle}</Text>
      <Text style={styles.meta}>{item.platform}</Text>
      <Text style={styles.price}>Paid: {item.purchasePrice ?? "-"}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>&lt; Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>My Collections</Text>
        <View style={{ width: 64 }} />
      </View>

      <TouchableOpacity style={styles.addButton} onPress={() => setIsAdding(true)}>
        <Text style={{ color: "white", fontWeight: "bold" }}>Add Game</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator color="#67e8f9" />
      ) : items.length === 0 ? (
        <View style={styles.emptyCentered}>
          <Text style={{ color: "#67e8f9" }}>No items in your collection yet.</Text>
        </View>
      ) : (
        <FlatList data={items} keyExtractor={(i) => i._id ?? i.gameTitle} renderItem={renderItem} />
      )}

      <Modal visible={isAdding} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Game</Text>
            <TextInput placeholder="Title" value={newTitle} onChangeText={setNewTitle} style={styles.input} />
            <TextInput placeholder="Platform" value={newPlatform} onChangeText={setNewPlatform} style={styles.input} />
            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setIsAdding(false)}>
                <Text style={{ color: "#ccc" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { marginLeft: 12 }]} onPress={addItem}>
                <Text style={{ color: "white" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  back: { color: "#67e8f9" },
  heading: { fontSize: 18, fontWeight: "bold", color: "#67e8f9" },
  card: { backgroundColor: "rgba(31,41,55,0.8)", borderRadius: 8, padding: 12, marginBottom: 8 },
  title: { color: "#e6f7ff", fontWeight: "bold" },
  meta: { color: "#9ca3af" },
  price: { color: "#10b981", fontWeight: "bold", marginTop: 6 },
  emptyCentered: { padding: 24, alignItems: "center" },
  addButton: { backgroundColor: "#7c3aed", padding: 10, borderRadius: 8, alignItems: "center", marginBottom: 12 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "90%", backgroundColor: "#0f172a", padding: 16, borderRadius: 8, borderWidth: 1, borderColor: "rgba(103,232,249,0.06)" },
  modalTitle: { color: "#67e8f9", fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  input: {
    backgroundColor: "#0b1220",
    color: "#cfefff",
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(103,232,249,0.08)",
    marginBottom: 8,
  },
  modalButton: { padding: 10 },
});
