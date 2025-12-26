import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, TextInput, Modal, ScrollView } from "react-native";
import { useAuth } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AUTH_BASE_URL, API_BASE_URL } from "../config";
import PriceHistoryChart from "../components/PriceHistoryChart";
import { ArrowUpCircleIcon, ArrowDownCircleIcon, ArrowRightCircleIcon } from "react-native-heroicons/solid";

import styles from "./MyCollectionsPage.styles";

interface PriceHistoryData {
  date: string;
  loosePrice?: number;
  cibPrice?: number;
  newPrice?: number;
  gradedPrice?: number;
}

interface Folder {
  _id: string;
  name: string;
  description?: string;
  color?: string;
  userId: string;
  createdAt?: string;
}

interface Item {
  _id: string;
  gameTitle: string;
  platform: string;
  condition?: string;
  purchasePrice?: number;
  folderId?: string; // ID da pasta onde o jogo está
  // Old price fields (for backward compatibility)
  lowestPrice?: number;
  highestPrice?: number;
  averagePrice?: number;
  // New PriceCharting fields
  loosePrice?: number;
  cibPrice?: number;
  newPrice?: number;
  gradedPrice?: number;
  boxOnlyPrice?: number;
  priceChartingId?: string;
  genre?: string;
  releaseDate?: string;
  notes?: string;
  images?: string[];
  createdAt?: string;
  isWishlist?: boolean;
  completionStatus?: string;
  priceHistory?: PriceHistoryData[];
}

export default function MyCollectionsPage({ onBack }: { onBack?: () => void }) {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null); // null = "All Games"
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPlatform, setNewPlatform] = useState("");
  const [newGameFolderId, setNewGameFolderId] = useState<string | null>(null); // Folder for new game
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [updatingPrices, setUpdatingPrices] = useState(false);

  // Folder management states
  const [isFolderModalVisible, setIsFolderModalVisible] = useState(false);
  const [isEditingFolder, setIsEditingFolder] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState("");
  const [folderDescription, setFolderDescription] = useState("");
  const [folderColor, setFolderColor] = useState("#a855f7");

  // Move game to folder modal
  const [isMoveToFolderVisible, setIsMoveToFolderVisible] = useState(false);
  const [gameToMove, setGameToMove] = useState<Item | null>(null);

  useEffect(() => {
    fetchCollections();
    fetchFolders();
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

        // Map backend field names to frontend field names
        const mappedItems = filtered.map((item: any) => ({
          ...item,
          // Backend saves as completePrice, we display as cibPrice
          cibPrice: item.cibPrice ?? item.completePrice,
          // Backend might not save boxOnlyPrice at all, so it stays undefined
          boxOnlyPrice: item.boxOnlyPrice ?? item.boxPrice,
        }));

        setItems(mappedItems);

        // Fetch and update daily prices for items with priceChartingId
        await fetchAndUpdateDailyPrices(mappedItems, token);
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

  // Fetch folders from backend
  const fetchFolders = async () => {
    try {
      const uid = (user as any)?.id ?? (user as any)?._id ?? (user as any)?.userId;
      if (!uid) {
        setFolders([]);
        return;
      }

      const token = await AsyncStorage.getItem("auth_token");
      const candidates = [`${AUTH_BASE_URL}/folders/${uid}`, `${AUTH_BASE_URL}/folders?userId=${uid}`, `${AUTH_BASE_URL}/collection-folders/${uid}`];

      for (const url of candidates) {
        try {
          const res = await fetch(url, {
            headers: token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" },
          });

          if (res.ok) {
            const data = await res.json();
            let list = data.folders || data.items || data || [];
            if (Array.isArray(list)) {
              setFolders(list);
              break;
            }
          }
        } catch (e) {
          console.error("fetchFolders error for", url, e);
          continue;
        }
      }
    } catch (error) {
      console.error("fetchFolders", error);
    }
  };

  // Create or update folder
  const saveFolder = async () => {
    if (!folderName.trim()) {
      Alert.alert("Validation", "Folder name is required");
      return;
    }

    try {
      setLoading(true);
      const uid = (user as any)?.id ?? (user as any)?._id ?? (user as any)?.userId;
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) throw new Error("Not authenticated");

      const body = {
        name: folderName,
        description: folderDescription,
        color: folderColor,
        userId: uid,
      };

      const url = isEditingFolder && currentFolderId ? `${AUTH_BASE_URL}/folders?id=${currentFolderId}` : `${AUTH_BASE_URL}/folders`;

      const method = isEditingFolder ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        Alert.alert("Success", isEditingFolder ? "Folder updated" : "Folder created");
        setFolderName("");
        setFolderDescription("");
        setFolderColor("#a855f7");
        setIsFolderModalVisible(false);
        setIsEditingFolder(false);
        setCurrentFolderId(null);
        fetchFolders();
      } else {
        Alert.alert("Error", "Failed to save folder");
      }
    } catch (e) {
      console.error("saveFolder", e);
      Alert.alert("Error", "Failed to save folder");
    } finally {
      setLoading(false);
    }
  };

  // Delete folder
  const deleteFolder = async (folderId: string) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        Alert.alert("Error", "Not authenticated");
        return;
      }

      console.log(`[DELETE FOLDER] Attempting to delete folder: ${folderId}`);

      const res = await fetch(`${AUTH_BASE_URL}/folders?id=${folderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log(`[DELETE FOLDER] Response status: ${res.status}`);

      // Read response text to see what the backend is returning
      const responseText = await res.text();
      console.log(`[DELETE FOLDER] Response body: ${responseText}`);

      if (res.ok || res.status === 204) {
        // Success - folder deleted
        Alert.alert("Success", "Folder deleted");
        if (selectedFolder === folderId) {
          setSelectedFolder(null);
        }
        // Update local state immediately
        setFolders((prevFolders) => prevFolders.filter((f) => f._id !== folderId));
        // Also update items to remove folderId from games that were in this folder
        setItems((prevItems) => prevItems.map((item) => (item.folderId === folderId ? { ...item, folderId: undefined } : item)));
      } else {
        const errorMsg = responseText || `Failed with status ${res.status}`;
        console.error(`[DELETE FOLDER] Error: ${errorMsg}`);
        Alert.alert("Error", `Failed to delete folder: ${errorMsg}`);
      }
    } catch (e) {
      console.error("[DELETE FOLDER] Exception:", e);
      Alert.alert("Error", `Failed to delete folder: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  // Move game to folder
  const moveGameToFolder = async (gameId: string, folderId: string | null) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        Alert.alert("Error", "Not authenticated");
        return;
      }

      const body = { folderId };

      console.log(`[MOVE GAME] Moving game ${gameId} to folder ${folderId}`);

      // Use o mesmo endpoint do backend Next.js
      const url = `${AUTH_BASE_URL}/collection?id=${gameId}`;

      console.log(`[MOVE GAME] Trying: ${url}`);
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const responseText = await res.text();
      console.log(`[MOVE GAME] Response (${res.status}): ${responseText}`);

      if (res.ok) {
        Alert.alert("Success", "Game moved to folder");
        setIsMoveToFolderVisible(false);
        setGameToMove(null);
        // Update local state immediately
        setItems((prevItems) => prevItems.map((item) => (item._id === gameId ? { ...item, folderId: folderId || undefined } : item)));
      } else {
        const errorMsg = responseText || `Failed with status ${res.status}`;
        console.error(`[MOVE GAME] Error: ${errorMsg}`);
        Alert.alert("Error", `Failed to move game: ${errorMsg}`);
      }
    } catch (e) {
      console.error("[MOVE GAME] Exception:", e);
      Alert.alert("Error", `Failed to move game: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch and update daily prices from PriceCharting and update the backend
  const fetchAndUpdateDailyPrices = async (items: Item[], token: string | null) => {
    try {
      setUpdatingPrices(true);
      // Filter items that have priceChartingId
      const itemsWithPriceId = items.filter((item) => item.priceChartingId);

      console.log(`[PRICE UPDATE] Starting update for ${itemsWithPriceId.length} items...`);

      let successCount = 0;
      let failCount = 0;

      for (const item of itemsWithPriceId) {
        try {
          // Fetch current prices from PriceCharting via your backend
          const priceResponse = await fetch(`${API_BASE_URL}/price-charting/${item.priceChartingId}`);

          if (priceResponse.ok) {
            const priceData = await priceResponse.json();

            // Create price history entry for today
            const today = new Date().toISOString().split("T")[0];
            const historyEntry = {
              date: today,
              loosePrice: priceData.prices?.loose,
              cibPrice: priceData.prices?.cib,
              newPrice: priceData.prices?.new,
              gradedPrice: priceData.prices?.graded,
            };

            console.log(`[PRICE UPDATE] ${item.gameTitle} - Today: ${today}`, historyEntry);

            // Update the item in the backend with today's prices
            const updateCandidates = [
              `${AUTH_BASE_URL}/gameincollections/${item._id}/price-history`,
              `${AUTH_BASE_URL}/collection/${item._id}/price-history`,
            ];

            let updated = false;
            for (const url of updateCandidates) {
              try {
                const updateRes = await fetch(url, {
                  method: "POST",
                  headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(historyEntry),
                });

                const responseText = await updateRes.text();
                console.log(`[PRICE UPDATE] POST ${url} - Status: ${updateRes.status}, Response: ${responseText}`);

                if (updateRes.ok) {
                  console.log(`✅ Updated price history for ${item.gameTitle}`);
                  successCount++;
                  updated = true;
                  break;
                } else {
                  console.warn(`⚠️ Failed to update ${item.gameTitle} at ${url}: ${updateRes.status} - ${responseText}`);
                }
              } catch (e) {
                console.error(`❌ Error updating ${item.gameTitle} at ${url}:`, e);
                continue;
              }
            }

            if (!updated) {
              failCount++;
              console.error(`❌ All endpoints failed for ${item.gameTitle}`);
            }
          } else {
            failCount++;
            console.error(`❌ Failed to fetch prices for ${item.gameTitle}: ${priceResponse.status}`);
          }
        } catch (e) {
          failCount++;
          console.error(`❌ Exception fetching prices for ${item.gameTitle}:`, e);
        }
      }

      console.log(`[PRICE UPDATE] Complete: ${successCount} success, ${failCount} failed`);

      if (successCount > 0) {
        Alert.alert("Price Update", `Updated ${successCount} game(s) successfully!${failCount > 0 ? `\n${failCount} failed.` : ""}`);
      } else if (failCount > 0) {
        Alert.alert("Price Update Failed", `Failed to update ${failCount} game(s). Check console for details.`);
      }

      // Refresh collections to get updated price history
      const uid = (user as any)?.id ?? (user as any)?._id ?? (user as any)?.userId;
      const candidates = [`${AUTH_BASE_URL}/gameincollections/${uid}`, `${AUTH_BASE_URL}/collection/${uid}`];

      for (const url of candidates) {
        try {
          const res = await fetch(url, {
            headers: token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" },
          });

          if (res.ok) {
            const data = await res.json();
            let list = data.collections || data.items || data.games || data || [];

            if (Array.isArray(list)) {
              const filtered = list.filter((it: any) => {
                if (!it) return false;
                return (it.userId ?? it.user ?? it.userid ?? it.user_id) === uid;
              });

              const mappedItems = filtered.map((item: any) => ({
                ...item,
                cibPrice: item.cibPrice ?? item.completePrice,
                boxOnlyPrice: item.boxOnlyPrice ?? item.boxPrice,
              }));

              setItems(mappedItems);
              break;
            }
          }
        } catch (e) {
          continue;
        }
      }
    } catch (error) {
      console.error("fetchAndUpdateDailyPrices error:", error);
      Alert.alert("Error", "Failed to update prices. Check console for details.");
    } finally {
      setUpdatingPrices(false);
    }
  };

  // Manual price update function
  const manualPriceUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      await fetchAndUpdateDailyPrices(items, token);
      // Refresh collections after update
      await fetchCollections();
    } catch (error) {
      console.error("manualPriceUpdate error:", error);
    }
  };

  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Calculate price trend based on history
  const getPriceTrend = (currentPrice: number | undefined, priceHistory: PriceHistoryData[] | undefined, priceType: keyof PriceHistoryData) => {
    if (!currentPrice || !priceHistory || priceHistory.length < 1) {
      return {
        trend: "neutral",
        icon: <ArrowRightCircleIcon size={18} color="#9ca3af" />,
        color: "#9ca3af",
      }; // neutral gray
    }

    // Sort history by date (oldest first, then most recent)
    const sortedHistory = [...priceHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Filter to only entries that have this price type
    const validHistory = sortedHistory.filter((entry) => {
      const price = entry[priceType];
      return typeof price === "number" && price > 0;
    });

    // Need at least 2 valid entries to calculate trend
    if (validHistory.length < 2) {
      return {
        trend: "neutral",
        icon: <ArrowRightCircleIcon size={18} color="#9ca3af" />,
        color: "#9ca3af",
      };
    }

    // Compare OLDEST entry with MOST RECENT entry (full period trend)
    const oldestPrice = validHistory[0][priceType] as number;
    const oldestDate = validHistory[0].date;
    const mostRecentPrice = validHistory[validHistory.length - 1][priceType] as number;
    const mostRecentDate = validHistory[validHistory.length - 1].date;

    console.log(
      `[TREND] ${priceType}: oldest=${oldestPrice} (${oldestDate}), mostRecent=${mostRecentPrice} (${mostRecentDate}), current=${currentPrice}`
    );

    const difference = mostRecentPrice - oldestPrice;
    const percentageChange = (difference / oldestPrice) * 100;

    console.log(`[TREND] ${priceType}: diff=${difference.toFixed(2)}, %=${percentageChange.toFixed(2)}%`);

    // Any price change is significant (no threshold)
    if (difference === 0) {
      return {
        trend: "neutral",
        icon: <ArrowRightCircleIcon size={18} color="#9ca3af" />,
        color: "#9ca3af",
      };
    }

    if (difference > 0) {
      return {
        trend: "up",
        icon: <ArrowUpCircleIcon size={18} color="#10b981" />,
        color: "#10b981",
      }; // green
    } else {
      return {
        trend: "down",
        icon: <ArrowDownCircleIcon size={18} color="#ef4444" />,
        color: "#ef4444",
      }; // red
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

      const body = {
        gameTitle: newTitle,
        platform: newPlatform,
        userId: uid,
        folderId: newGameFolderId, // Include folder if selected
      };

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
      setNewGameFolderId(null);
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

  const renderItem = ({ item }: { item: Item }) => {
    // Check if we have new PriceCharting data
    const hasNewPrices = !!(item.loosePrice || item.cibPrice || item.newPrice || item.gradedPrice || item.boxOnlyPrice);
    const isExpanded = expandedItems.has(item._id);

    // Calculate trends for each price type
    const looseTrend = getPriceTrend(item.loosePrice, item.priceHistory, "loosePrice");
    const cibTrend = getPriceTrend(item.cibPrice, item.priceHistory, "cibPrice");
    const newTrend = getPriceTrend(item.newPrice, item.priceHistory, "newPrice");
    const gradedTrend = getPriceTrend(item.gradedPrice, item.priceHistory, "gradedPrice");

    // Debug: Log the item to see what prices we have
    console.log("Rendering item:", item.gameTitle, {
      loosePrice: item.loosePrice,
      cibPrice: item.cibPrice,
      newPrice: item.newPrice,
      gradedPrice: item.gradedPrice,
      boxOnlyPrice: item.boxOnlyPrice,
      hasNewPrices,
      priceHistory: item.priceHistory,
    });

    return (
      <View style={styles.card}>
        {/* Top row: Title/Platform on left, Paid price on right */}
        <View style={styles.cardTopRow}>
          <View style={styles.cardLeft}>
            <Text style={styles.title}>{item.gameTitle}</Text>
            <Text style={styles.meta}>
              {item.platform} {item.condition ? `• ${item.condition}` : ""}
            </Text>
            {item.genre && <Text style={styles.small}>Genre: {item.genre}</Text>}
            {item.createdAt ? <Text style={styles.small}>{new Date(item.createdAt).toLocaleDateString()}</Text> : null}
          </View>
          <View style={styles.cardRight}>
            <Text style={styles.paidLabel}>My Price:</Text>
            <Text style={styles.paidPrice}>${item.purchasePrice ?? "-"}</Text>
          </View>
        </View>

        {/* Price stats row - Show new prices if available, otherwise show old */}
        {hasNewPrices ? (
          <View style={styles.priceGrid}>
            {item.loosePrice && (
              <View style={[styles.statChip, styles.looseChip]}>
                <View style={styles.statLabelRow}>
                  <Text style={styles.statLabel}>Loose</Text>
                  <View style={styles.trendBadge}>{looseTrend.icon}</View>
                </View>
                <Text style={styles.statValue}>${item.loosePrice.toFixed(2)}</Text>
              </View>
            )}
            {item.cibPrice && (
              <View style={[styles.statChip, styles.cibChip]}>
                <View style={styles.statLabelRow}>
                  <Text style={styles.statLabel}>Complete</Text>
                  <View style={styles.trendBadge}>{cibTrend.icon}</View>
                </View>
                <Text style={styles.statValue}>${item.cibPrice.toFixed(2)}</Text>
              </View>
            )}
            {item.newPrice && (
              <View style={[styles.statChip, styles.newChip]}>
                <View style={styles.statLabelRow}>
                  <Text style={styles.statLabel}>New</Text>
                  <View style={styles.trendBadge}>{newTrend.icon}</View>
                </View>
                <Text style={styles.statValue}>${item.newPrice.toFixed(2)}</Text>
              </View>
            )}
            {item.gradedPrice && (
              <View style={[styles.statChip, styles.gradedChip]}>
                <View style={styles.statLabelRow}>
                  <Text style={styles.statLabel}>Graded</Text>
                  <View style={styles.trendBadge}>{gradedTrend.icon}</View>
                </View>
                <Text style={styles.statValue}>${item.gradedPrice.toFixed(2)}</Text>
              </View>
            )}
          </View>
        ) : (
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
        )}

        {/* Notes if available */}
        {item.notes ? <Text style={styles.notes}>Notes: {item.notes}</Text> : null}

        {/* Price History Chart - Show if has price history */}
        {hasNewPrices && (
          <>
            <TouchableOpacity style={styles.historyToggle} onPress={() => toggleItemExpansion(item._id)}>
              <Text style={styles.historyToggleText}>{isExpanded ? "Hide" : "Show"} Price History</Text>
            </TouchableOpacity>

            {isExpanded && <PriceHistoryChart data={item.priceHistory || []} gameTitle={item.gameTitle} />}
          </>
        )}

        {/* Delete button */}
        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
          <TouchableOpacity
            style={[styles.deleteButton, { flex: 1, backgroundColor: "#8b5cf6" }]}
            onPress={() => {
              setGameToMove(item);
              setIsMoveToFolderVisible(true);
            }}
          >
            <Text style={styles.deleteButtonText}>Move to Folder</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteButton, { flex: 1 }]}
            onPress={() =>
              Alert.alert("Delete", `Remove "${item.gameTitle}"?`, [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => removeItem(item._id) },
              ])
            }
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Filter items by selected folder
  const filteredItems = selectedFolder ? items.filter((item) => item.folderId === selectedFolder) : items;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>&lt; Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>My Collections</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() => {
              setFolderName("");
              setFolderDescription("");
              setFolderColor("#a855f7");
              setIsEditingFolder(false);
              setCurrentFolderId(null);
              setIsFolderModalVisible(true);
            }}
          >
            <Text style={styles.back}>📁+</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={manualPriceUpdate} disabled={updatingPrices} style={{ opacity: updatingPrices ? 0.5 : 1 }}>
            <Text style={styles.back}>{updatingPrices ? "⏳" : "🔄"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Folders horizontal scroll */}
      {folders.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={[styles.folderChip, { backgroundColor: selectedFolder === null ? "#67e8f9" : "rgba(103, 232, 249, 0.2)" }]}
              onPress={() => setSelectedFolder(null)}
            >
              <Text style={[styles.folderChipText, { color: selectedFolder === null ? "#111827" : "#67e8f9" }]}>All Games ({items.length})</Text>
            </TouchableOpacity>

            {folders.map((folder) => {
              const gameCount = items.filter((item) => item.folderId === folder._id).length;
              return (
                <TouchableOpacity
                  key={folder._id}
                  style={[
                    styles.folderChip,
                    { backgroundColor: selectedFolder === folder._id ? folder.color || "#a855f7" : `${folder.color || "#a855f7"}33` },
                  ]}
                  onPress={() => setSelectedFolder(folder._id)}
                  onLongPress={() => {
                    Alert.alert(folder.name, folder.description || "No description", [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Edit",
                        onPress: () => {
                          setFolderName(folder.name);
                          setFolderDescription(folder.description || "");
                          setFolderColor(folder.color || "#a855f7");
                          setIsEditingFolder(true);
                          setCurrentFolderId(folder._id);
                          setIsFolderModalVisible(true);
                        },
                      },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => {
                          Alert.alert("Delete Folder", `Delete "${folder.name}"? Games will not be deleted.`, [
                            { text: "Cancel", style: "cancel" },
                            { text: "Delete", style: "destructive", onPress: () => deleteFolder(folder._id) },
                          ]);
                        },
                      },
                    ]);
                  }}
                >
                  <Text style={[styles.folderChipText, { color: selectedFolder === folder._id ? "#fff" : "#fff" }]}>
                    📁 {folder.name} ({gameCount})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color="#67e8f9" />
      ) : filteredItems.length === 0 ? (
        <View style={styles.emptyCentered}>
          <Text style={{ color: "#67e8f9" }}>{selectedFolder ? "No games in this folder yet." : "No items in your collection yet."}</Text>
        </View>
      ) : (
        <FlatList data={filteredItems} keyExtractor={(i) => i._id ?? i.gameTitle} renderItem={renderItem} />
      )}

      {/* Add Game Modal */}
      <Modal visible={isAdding} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Game</Text>
            <TextInput placeholder="Title" placeholderTextColor="#666" value={newTitle} onChangeText={setNewTitle} style={styles.input} />
            <TextInput placeholder="Platform" placeholderTextColor="#666" value={newPlatform} onChangeText={setNewPlatform} style={styles.input} />

            {/* Folder selection */}
            {folders.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ color: "#67e8f9", marginBottom: 8, fontSize: 14 }}>Select Folder (optional):</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={[styles.folderChip, { backgroundColor: newGameFolderId === null ? "#67e8f9" : "rgba(103, 232, 249, 0.2)" }]}
                    onPress={() => setNewGameFolderId(null)}
                  >
                    <Text style={[styles.folderChipText, { color: newGameFolderId === null ? "#111827" : "#67e8f9" }]}>No Folder</Text>
                  </TouchableOpacity>

                  {folders.map((folder) => (
                    <TouchableOpacity
                      key={folder._id}
                      style={[
                        styles.folderChip,
                        { backgroundColor: newGameFolderId === folder._id ? folder.color || "#a855f7" : `${folder.color || "#a855f7"}33` },
                      ]}
                      onPress={() => setNewGameFolderId(folder._id)}
                    >
                      <Text style={[styles.folderChipText, { color: "#fff" }]}>📁 {folder.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setIsAdding(false);
                  setNewTitle("");
                  setNewPlatform("");
                  setNewGameFolderId(null);
                }}
              >
                <Text style={{ color: "#ccc" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { marginLeft: 12 }]} onPress={addItem}>
                <Text style={{ color: "white" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Folder Management Modal */}
      <Modal visible={isFolderModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isEditingFolder ? "Edit Folder" : "Create Folder"}</Text>
            <TextInput placeholder="Folder Name (e.g., SNES Games)" value={folderName} onChangeText={setFolderName} style={styles.input} />
            <TextInput
              placeholder="Description (optional)"
              value={folderDescription}
              onChangeText={setFolderDescription}
              style={styles.input}
              multiline
            />
            <Text style={{ color: "#67e8f9", marginBottom: 8 }}>Color:</Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
              {["#a855f7", "#ef4444", "#10b981", "#3b82f6", "#f59e0b", "#ec4899"].map((color) => (
                <TouchableOpacity
                  key={color}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: color,
                    borderWidth: folderColor === color ? 3 : 0,
                    borderColor: "#fff",
                  }}
                  onPress={() => setFolderColor(color)}
                />
              ))}
            </View>
            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setIsFolderModalVisible(false);
                  setIsEditingFolder(false);
                  setCurrentFolderId(null);
                }}
              >
                <Text style={{ color: "#ccc" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { marginLeft: 12 }]} onPress={saveFolder}>
                <Text style={{ color: "white" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Move to Folder Modal */}
      <Modal visible={isMoveToFolderVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Move "{gameToMove?.gameTitle}" to:</Text>

            <TouchableOpacity
              style={[styles.folderOption, { backgroundColor: "rgba(103, 232, 249, 0.2)" }]}
              onPress={() => {
                if (gameToMove) moveGameToFolder(gameToMove._id, null);
              }}
            >
              <Text style={{ color: "#67e8f9", fontSize: 16 }}>📂 No Folder (All Games)</Text>
            </TouchableOpacity>

            {folders.map((folder) => (
              <TouchableOpacity
                key={folder._id}
                style={[styles.folderOption, { backgroundColor: `${folder.color || "#a855f7"}33` }]}
                onPress={() => {
                  if (gameToMove) moveGameToFolder(gameToMove._id, folder._id);
                }}
              >
                <Text style={{ color: "#fff", fontSize: 16 }}>📁 {folder.name}</Text>
                {folder.description && <Text style={{ color: "#ccc", fontSize: 12, marginTop: 4 }}>{folder.description}</Text>}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.modalButton, { marginTop: 16, alignSelf: "center" }]}
              onPress={() => {
                setIsMoveToFolderVisible(false);
                setGameToMove(null);
              }}
            >
              <Text style={{ color: "#ccc" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
