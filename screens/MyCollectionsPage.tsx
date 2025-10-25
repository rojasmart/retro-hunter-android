import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, TextInput, Modal } from "react-native";
import { useAuth } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL, AUTH_BASE_URL } from "../config";

interface Item {
  _id: string;
  gameTitle: string;
  platform: string;
  condition?: string;
  purchasePrice?: number;
  lowestPrice?: number;
  highestPrice?: number;
  averagePrice?: number;
  notes?: string;
  images?: string[];
  createdAt?: string;
  isWishlist?: boolean;
  completionStatus?: string;
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
      // Try multiple endpoints in order: /gameincollections/{uid}, ?userId=uid, then /gameincollections
      const candidates = [
        `${AUTH_BASE_URL}/gameincollections/${uid}`,
        `${AUTH_BASE_URL}/gameincollections?userId=${uid}`,
        `${AUTH_BASE_URL}/gameincollections`,
        // Some servers expose /collection (singular)
        `${AUTH_BASE_URL}/collection/${uid}`,
        `${AUTH_BASE_URL}/collection?userId=${uid}`,
        `${AUTH_BASE_URL}/collection`,
      ];

      let found: any = null;
      for (const url of candidates) {
        try {
          console.debug("fetchCollections trying:", url, "token?", !!token);
          const res = await fetch(url, {
            headers: token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" },
          });

          console.debug("fetchCollections status for", url, res.status);

          // If server returned HTML (like an HTML 404 page), read text and log it
          const ct = res.headers.get("content-type") || "";
          if (!res.ok) {
            // if 404, continue to next candidate
            if (res.status === 404) {
              const txt = await res.text().catch(() => "<no body>");
              console.warn("fetchCollections 404 body:", txt.slice ? txt.slice(0, 500) : txt);
              continue;
            }
            const txt = await res.text().catch(() => "<no body>");
            console.warn("fetchCollections non-ok response:", res.status, txt.slice ? txt.slice(0, 500) : txt);
            continue;
          }

          // Try to parse JSON only when content-type looks like JSON
          if (ct.includes("application/json") || ct.includes("application/ld+json") || ct.includes("json")) {
            const data = await res.json().catch((e) => {
              console.error("fetchCollections json parse error for", url, e);
              return null;
            });
            console.debug("fetchCollections body for", url, data);
            if (data) {
              found = data;
              break;
            }
          } else {
            // Not JSON (could be HTML) - read text and skip
            const txt = await res.text().catch(() => "<no body>");
            console.warn("fetchCollections unexpected content-type for", url, ct, "body:", txt.slice ? txt.slice(0, 500) : txt);
            continue;
          }
        } catch (e) {
          console.error("fetchCollections fetch error for candidate:", url, e);
          continue;
        }
      }

      if (!found) {
        throw new Error("No valid response from gameincollections endpoints");
      }

      // Normalize the response into an array; some APIs return { games: [...] }
      let list = found.collections || found.items || found.games || found || [];
      if (!Array.isArray(list) && typeof list === "object") {
        // Some APIs return { data: [...] } or an object - attempt to find array values
        const possible = Object.values(list).find((v) => Array.isArray(v));
        if (possible) list = possible as any[];
      }

      // If we requested the general /gameincollections and it returned all items, filter by userId
      if (Array.isArray(list) && list.length > 0) {
        const filtered = list.filter((it: any) => {
          if (!it) return false;
          return (it.userId ?? it.user ?? it.userid ?? it.user_id) === uid;
        });
        setItems(filtered);
      } else {
        setItems(Array.isArray(list) ? list : []);
      }
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

      // Try POST to /gameincollections then fallback to /collection
      const postCandidates = [`${AUTH_BASE_URL}/gameincollections`, `${AUTH_BASE_URL}/collection`];
      let postOk = false;
      for (const postUrl of postCandidates) {
        try {
          console.debug("addItem POST:", postUrl, "body:", body, "token?", !!token);
          const res = await fetch(postUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });
          const data = await res.json().catch(() => ({} as any));
          console.debug("addItem status for", postUrl, res.status, "body:", data);
          if (res.ok) {
            postOk = true;
            break;
          }
        } catch (e) {
          console.error("addItem error for", postUrl, e);
          continue;
        }
      }
      if (!postOk) {
        Alert.alert("Error", "Failed to add item");
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

      // Try DELETE on both candidate endpoints
      const delCandidates = [`${AUTH_BASE_URL}/gameincollections/${id}`, `${AUTH_BASE_URL}/collection/${id}`];
      let delOk = false;
      for (const delUrl of delCandidates) {
        try {
          console.debug("removeItem DELETE:", delUrl, "token?", !!token);
          const res = await fetch(delUrl, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
          console.debug("removeItem status for", delUrl, res.status);
          if (res.ok) {
            delOk = true;
            break;
          }
        } catch (e) {
          console.error("removeItem error for", delUrl, e);
          continue;
        }
      }
      if (!delOk) {
        Alert.alert("Error", "Failed to delete");
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
      <Text style={styles.meta}>
        {item.platform} • {item.condition ?? ""}
      </Text>
      <Text style={styles.price}>Paid: ${item.purchasePrice ?? "-"}</Text>
      <View style={styles.statRow}>
        <View style={[styles.statChip, styles.lowestChip]}>
          <Text style={styles.statLabel}>Lowest</Text>
          <Text style={styles.statValue}>${item.lowestPrice ?? "-"}</Text>
        </View>
        <View style={[styles.statChip, styles.averageChip]}>
          <Text style={styles.statLabel}>Avg</Text>
          <Text style={styles.statValue}>${item.averagePrice ?? "-"}</Text>
        </View>
        <View style={[styles.statChip, styles.highestChip]}>
          <Text style={styles.statLabel}>Highest</Text>
          <Text style={styles.statValue}>${item.highestPrice ?? "-"}</Text>
        </View>
      </View>
      {item.notes ? <Text style={styles.notes}>Notes: {item.notes}</Text> : null}

      {item.createdAt ? <Text style={styles.small}>Added: {new Date(item.createdAt).toLocaleString()}</Text> : null}
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
  small: { color: "#9ca3af", fontSize: 12, marginTop: 6 },
  notes: { color: "#cfefff", fontSize: 13, marginTop: 6 },
  // thumb style removed (images no longer rendered inline)
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  statChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  lowestChip: {
    backgroundColor: "#10b981",
    borderWidth: 1,
    borderColor: "#059669",
  },
  averageChip: {
    backgroundColor: "#3b82f6",
    borderWidth: 1,
    borderColor: "#2563eb",
  },
  highestChip: {
    backgroundColor: "#ef4444",
    borderWidth: 1,
    borderColor: "#dc2626",
  },
  statLabel: {
    fontSize: 11,
    color: "white",
    fontFamily: "monospace",
    fontWeight: "bold",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
    marginTop: 2,
  },
});
