import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  Linking,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import CameraCapture from "./components/CameraCapture";
import MyAccount from "./screens/MyAccount";
import MyCollectionsPage from "./screens/MyCollectionsPage";
import { AuthProvider } from "./context/AuthContext";

import { API_BASE_URL, AUTH_BASE_URL } from "./config";
import { useAuth } from "./context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface GameResult {
  title: string;
  price: number;
  link: string;
  image?: string;
  tags?: string[];
}

// Platform types matching your webapp
type Platform =
  | "all"
  | "ps2"
  | "ps3"
  | "ps4"
  | "xbox"
  | "xbox360"
  | "nintendo-switch"
  | "nintendo-wii"
  | "nintendo-ds"
  | "dreamcast"
  | "master-system"
  | "genesis";

// Copy your exact platform normalization logic
const PLATFORM_ALIASES: Record<string, Platform> = {
  ps2: "ps2",
  "playstation 2": "ps2",
  ps3: "ps3",
  "playstation 3": "ps3",
  ps4: "ps4",
  "playstation 4": "ps4",
  xbox: "xbox",
  "xbox 360": "xbox360",
  switch: "nintendo-switch",
  "nintendo switch": "nintendo-switch",
  wii: "nintendo-wii",
  ds: "nintendo-ds",
  dreamcast: "dreamcast",
  "sega dreamcast": "dreamcast",
  masterSystem: "master-system",
  "master system": "master-system",
  genesis: "genesis",
  megadrive: "genesis",
  "mega drive": "genesis",
  all: "all",
};

function normalizePlatform(input?: string): Platform {
  if (!input) return "all";
  const s = input.toLowerCase().trim();
  if (PLATFORM_ALIASES[s]) return PLATFORM_ALIASES[s];

  for (const [k, v] of Object.entries(PLATFORM_ALIASES)) {
    if (k !== "all" && s.includes(k)) return v;
  }
  return "all";
}

function AppContent() {
  const [nome, setNome] = useState("");
  const [platform, setPlatform] = useState<Platform>("all");
  const [condition, setCondition] = useState<string>("all");
  const [resultados, setResultados] = useState<GameResult[]>([]);
  const [searchNameState, setSearchNameState] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState<"home" | "account" | "collections">("home");
  const [showSearchExtras, setShowSearchExtras] = useState<boolean>(false);
  const { user } = useAuth();

  // Add-to-collection modal state
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [purchasePriceInput, setPurchasePriceInput] = useState<string>("");
  const [addConditionInput, setAddConditionInput] = useState<string>("used");
  const [addingToCollection, setAddingToCollection] = useState(false);

  // Price filters (matching your webapp)
  const prices = resultados.map((item) => item.price).filter((price) => price > 0);
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const highestPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const averagePrice = prices.length > 0 ? (prices.reduce((sum, price) => sum + price, 0) / prices.length).toFixed(2) : "0.00";

  const [minPrice, setMinPrice] = useState(lowestPrice);
  const [maxPrice, setMaxPrice] = useState(highestPrice);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currency, setCurrency] = useState<"USD" | "EUR">("USD");
  const [exchangeRate, setExchangeRate] = useState(0.86);
  const [isLoadingRate, setIsLoadingRate] = useState(false);

  // Add this useEffect to log the API URL
  useEffect(() => {
    console.log("API_BASE_URL:", API_BASE_URL);
  }, []);

  // Fetch exchange rate from API (same as webapp)
  const fetchExchangeRate = async () => {
    try {
      setIsLoadingRate(true);
      const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      const data = await response.json();

      if (data.rates && data.rates.EUR) {
        setExchangeRate(data.rates.EUR);
        console.log("Exchange rate updated:", data.rates.EUR);
      }
    } catch (error) {
      console.error("Failed to fetch exchange rate, using fallback 0.86:", error);
      setExchangeRate(0.86); // Fallback rate
    } finally {
      setIsLoadingRate(false);
    }
  };

  // Fetch exchange rate on component mount
  useEffect(() => {
    fetchExchangeRate();
  }, []);

  // Function to convert price based on selected currency
  const convertPrice = (price: number) => {
    return currency === "EUR" ? (price * exchangeRate).toFixed(2) : price.toFixed(2);
  };

  // Function to get currency symbol
  const getCurrencySymbol = () => {
    return currency === "EUR" ? "€" : "$";
  };

  // Update min/max when results change
  useEffect(() => {
    setMinPrice(lowestPrice);
    setMaxPrice(highestPrice);
  }, [lowestPrice, highestPrice]);

  const searchEbayOnly = async (searchName?: string, platformParam?: string) => {
    setLoading(true);
    const platformToSend = normalizePlatform(platformParam ?? platform);
    const finalSearchName = searchName ?? nome;
    setSearchNameState(finalSearchName);

    console.log("[SEARCH] searchName:", finalSearchName);
    console.log("[SEARCH] platformParam:", platformParam);
    console.log("[SEARCH] current platform state:", platform);
    console.log("[SEARCH] normalized platform to send:", platformToSend);
    console.log("[SEARCH] condition:", condition);

    try {
      const params = new URLSearchParams({
        game_name: finalSearchName,
        platform: platformToSend,
        condition: condition,
      });

      // Debug: build and log the full URL before fetching - usar FastAPI para eBay
      const url = `${API_BASE_URL}/ebay-search?${params.toString()}`;
      console.log("[SEARCH] fetching:", url);

      const res = await fetch(url);
      console.log("[SEARCH] status:", res.status);
      const data = await res.json();
      console.log("[SEARCH] data:", data);
      console.log("[SEARCH] results count:", data.resultados?.length || 0);

      setResultados(data.resultados || []);
    } catch (error) {
      console.error("Search failed:", error);
      Alert.alert("Error", "Failed to search. Check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OCR extraction results (matching your webapp logic)
  const handleOCRExtraction = (titles: string | string[], plataforma?: string, ebayResults?: GameResult[]) => {
    // Build list of titles from the argument
    let arr: string[] = [];
    if (Array.isArray(titles)) {
      arr = titles
        .slice(0, 3)
        .map((t) => t.trim())
        .filter(Boolean);
    } else if (typeof titles === "string" && titles.trim()) {
      arr = [titles.trim()];
    }

    // Determine platform to use (priority: platform passed > state.platform)
    let platformToUse: Platform = platform;
    console.log("[handleOCRExtraction] received plataforma from OCR:", plataforma);
    if (typeof plataforma === "string" && plataforma.trim() && plataforma.toLowerCase() !== "all") {
      const normalized = normalizePlatform(plataforma);
      console.log("[handleOCRExtraction] normalized plataforma:", normalized);
      setPlatform(normalized);
      platformToUse = normalized;
    }

    setNome(arr[0] || "");
    setSearchNameState(arr[0] || "");

    // If we already have eBay results, use them directly
    if (ebayResults && ebayResults.length > 0) {
      console.log("[handleOCRExtraction] Using provided eBay results:", ebayResults.length);
      setResultados(ebayResults);
      setLoading(false);
    } else if (arr[0]) {
      // Otherwise, make a normal search
      console.log("[handleOCRExtraction] No eBay results provided, making search");
      searchEbayOnly(arr[0], platformToUse);
    }
  };

  const handleImageCaptured = async (imageUri: string) => {
    setLoading(true);
    try {
      // Ensure proper file:// prefix for Android
      let localUri = imageUri;
      if (!localUri.startsWith("file://")) {
        localUri = "file://" + localUri;
      }

      const formData = new FormData();

      // Use the React Native way to append files to FormData
      formData.append("file", {
        uri: localUri,
        type: "image/jpeg",
        name: "game_image.jpg",
      } as any);

      // Add the prompt parameter that your backend expects
      formData.append("prompt", "return the name and platform of this game with comma separated");

      // Use FastAPI for combined OCR + eBay search
      const ocrUrl = `${API_BASE_URL}/ask-agent-image-with-ebay`;
      console.log("[OCR] posting to:", ocrUrl, "imageUri:", imageUri);

      const ocrResponse = await fetch(ocrUrl, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("[OCR] status:", ocrResponse.status);

      if (!ocrResponse.ok) {
        const errorText = await ocrResponse.text();
        console.log("[OCR] error response:", errorText);
        const message = `Server returned ${ocrResponse.status}`;
        Alert.alert("Server Error", message);
        return;
      }

      const data = await ocrResponse.json();
      console.log("[OCR] data:", data);

      // Handle the combined OCR + eBay response
      if (data.titulo && data.titulo.trim()) {
        const gameName = data.titulo;
        const detectedPlatform = data.plataforma;
        const ebayResults = data.ebay_results || [];

        console.log("[OCR] Detected game name:", gameName);
        console.log("[OCR] Detected platform:", detectedPlatform);
        console.log("[OCR] eBay results count:", ebayResults.length);

        // Use the handleOCRExtraction logic from your webapp
        handleOCRExtraction(gameName, detectedPlatform, ebayResults);
      } else if (data.raw) {
        // Fallback: try to parse the raw response
        const message = "Raw result: " + data.raw;
        Alert.alert("Partial Detection", message);
      } else {
        Alert.alert("No Game Detected", "Could not identify any game in the image. Try a clearer photo.");
      }
    } catch (error) {
      console.error("OCR processing failed:", error);
      Alert.alert("Error", "Failed to process image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add to collection network call
  const addToCollection = async () => {
    // basic validation
    if (!searchNameState && !nome) {
      Alert.alert("Validation", "No game title to add");
      return;
    }

    const priceNum = purchasePriceInput ? Number(purchasePriceInput) : undefined;
    if (purchasePriceInput && (isNaN(priceNum as number) || priceNum! < 0)) {
      Alert.alert("Validation", "Enter a valid purchase price");
      return;
    }

    try {
      setAddingToCollection(true);
      const uid = (user as any)?.id ?? (user as any)?._id ?? (user as any)?.userId;
      const token = await AsyncStorage.getItem("auth_token");

      const body: any = {
        gameTitle: (searchNameState && searchNameState.trim()) || nome || "",
        platform: String(platform || ""),
        condition: addConditionInput || undefined,
        purchasePrice: typeof priceNum === "number" ? priceNum : undefined,
        lowestPrice: lowestPrice || undefined,
        highestPrice: highestPrice || undefined,
        averagePrice: Number(averagePrice) || undefined,
        notes: "",
        images: [],
        isWishlist: false,
        completionStatus: "not-started",
        userId: uid,
      };

      const postCandidates = [`${AUTH_BASE_URL}/gameincollections`, `${AUTH_BASE_URL}/collection`];
      let posted = false;
      for (const url of postCandidates) {
        try {
          console.debug("addToCollection POST", url, body, "token?", !!token);
          const res = await fetch(url, {
            method: "POST",
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });
          const data = await res.json().catch(() => ({} as any));
          console.debug("addToCollection status for", url, res.status, data);
          if (res.ok) {
            posted = true;
            break;
          }
        } catch (e) {
          console.error("addToCollection error for", url, e);
          continue;
        }
      }

      if (!posted) {
        Alert.alert("Error", "Failed to add to collection");
        return;
      }

      Alert.alert("Success", "Added to collection");
      setIsAddModalVisible(false);
      setPurchasePriceInput("");
      setAddConditionInput("used");
    } catch (e) {
      console.error("addToCollection", e);
      Alert.alert("Error", "Failed to add to collection");
    } finally {
      setAddingToCollection(false);
    }
  };

  // Filter and sort results (matching your webapp)
  const filteredItems = resultados
    .filter((item) => item.price >= minPrice && item.price <= maxPrice)
    .sort((a, b) => (sortOrder === "asc" ? a.price - b.price : b.price - a.price));

  const renderGameItem = ({ item, index }: { item: GameResult; index: number }) => (
    <TouchableOpacity style={styles.gameCard} onPress={() => Linking.openURL(item.link)}>
      {item.image && <Image source={{ uri: item.image }} style={styles.gameImage} resizeMode="cover" />}

      <Text style={styles.gameTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.gamePrice}>
        {getCurrencySymbol()} {convertPrice(item.price)}
      </Text>
      {item.tags && item.tags.length > 0 && <Text style={styles.gameTag}>{item.tags[0]}</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <LinearGradient colors={["#111827", "#1f2937", "#374151"]} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {/* Top header removed per UI request - branding and search will be centered on Home */}

          <View style={styles.mainContent}>
            {page === "home" && (
              <>
                {/* Centered branding */}
                <View style={styles.homeHeaderCenter}>
                  <Text style={styles.logo}>RETRO HUNTER</Text>
                  <Text style={styles.tagline}>Hunt, Decide, Sell</Text>
                </View>

                {/* Centered search section - extras appear when input is focused */}
                <View style={styles.searchWrapper}>
                  <View style={styles.searchSectionCentered}>
                    {/* Input stays visible; when focused we show CameraCapture and Hunt button */}
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        value={nome}
                        onChangeText={setNome}
                        placeholder="Enter the game name (e.g., Action Fighter)"
                        placeholderTextColor="#67e8f9"
                        onFocus={() => setShowSearchExtras(true)}
                        onBlur={() => setShowSearchExtras(false)}
                      />
                      {nome.trim() && (
                        <TouchableOpacity
                          style={styles.clearButton}
                          onPress={() => {
                            setNome("");
                            setResultados([]);
                            setSearchNameState("");
                          }}
                        >
                          <Text style={styles.clearButtonText}>✕</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {showSearchExtras && (
                      <>
                        <CameraCapture onImageCaptured={handleImageCaptured} isProcessing={loading} />

                        <TouchableOpacity
                          style={[styles.searchButton, loading && styles.disabledButton]}
                          onPress={() => searchEbayOnly()}
                          disabled={loading || !nome.trim()}
                        >
                          <Text style={styles.searchButtonText}>{loading ? "🔍 SCANNING..." : "HUNT FOR PRICES"}</Text>
                        </TouchableOpacity>

                        {/* extras hide automatically on input blur */}
                      </>
                    )}

                    {/* Show hunt button below input when game name exists but extras are collapsed */}
                    {!showSearchExtras && nome.trim() && (
                      <TouchableOpacity
                        style={[styles.searchButton, loading && styles.disabledButton, { marginTop: 12 }]}
                        onPress={() => searchEbayOnly()}
                        disabled={loading}
                      >
                        <Text style={styles.searchButtonText}>{loading ? "🔍 SCANNING..." : "HUNT FOR PRICES"}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Results section matching your webapp's right panel */}
                <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
                  {resultados.length > 0 && (
                    <View style={styles.resultsSection}>
                      {/* Stats section matching your exact 3-column grid */}
                      <View style={styles.statsContainer}>
                        <Text style={styles.resultsTitle}>{searchNameState}</Text>
                        <View style={styles.statsGrid}>
                          <View style={[styles.statCard, styles.lowestCard]}>
                            <Text style={styles.statLabel}>LOWEST</Text>
                            <Text style={styles.statValue}>
                              {getCurrencySymbol()} {convertPrice(lowestPrice)}
                            </Text>
                          </View>
                          <View style={[styles.statCard, styles.highestCard]}>
                            <Text style={styles.statLabel}>HIGHEST</Text>
                            <Text style={styles.statValue}>
                              {getCurrencySymbol()} {convertPrice(highestPrice)}
                            </Text>
                          </View>
                          <View style={[styles.statCard, styles.averageCard]}>
                            <Text style={styles.statLabel}>AVERAGE</Text>
                            <Text style={styles.statValue}>
                              {getCurrencySymbol()} {convertPrice(Number(averagePrice))}
                            </Text>
                          </View>
                        </View>

                        {/* Currency Controls - matching webapp */}
                        <View style={styles.currencyContainer}>
                          <View style={styles.currencyRow}>
                            <Text style={styles.currencyLabel}>Currency:</Text>
                            <TouchableOpacity style={styles.refreshButton} onPress={fetchExchangeRate} disabled={isLoadingRate}>
                              <Text style={styles.refreshButtonText}>{isLoadingRate ? "⟳" : "Refresh"}</Text>
                            </TouchableOpacity>
                          </View>
                          <View style={styles.currencySelector}>
                            <TouchableOpacity
                              style={[styles.currencyOption, currency === "USD" && styles.currencyOptionActive]}
                              onPress={() => setCurrency("USD")}
                            >
                              <Text style={[styles.currencyOptionText, currency === "USD" && styles.currencyOptionTextActive]}>USD ($)</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.currencyOption, currency === "EUR" && styles.currencyOptionActive]}
                              onPress={() => setCurrency("EUR")}
                            >
                              <Text style={[styles.currencyOptionText, currency === "EUR" && styles.currencyOptionTextActive]}>
                                EUR (€) - {exchangeRate.toFixed(4)}
                              </Text>
                            </TouchableOpacity>
                          </View>
                          {isLoadingRate && <Text style={styles.loadingText}>Updating...</Text>}
                        </View>

                        {/* Add to Collection Button */}
                        <TouchableOpacity
                          style={styles.collectionButton}
                          onPress={() => {
                            // Open modal to collect purchase price and optional condition
                            setPurchasePriceInput("");
                            setAddConditionInput("used");
                            setIsAddModalVisible(true);
                          }}
                        >
                          <Text style={styles.collectionButtonText}>ADD TO COLLECTION</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Grid matching your md:grid-cols-2 lg:grid-cols-4 */}
                      <FlatList
                        data={filteredItems}
                        renderItem={renderGameItem}
                        numColumns={2} // Mobile: 2 columns (your lg:grid-cols-4 becomes 2 on mobile)
                        key={2}
                        columnWrapperStyle={styles.row}
                        contentContainerStyle={styles.resultsGrid}
                        scrollEnabled={false}
                      />
                    </View>
                  )}

                  {/* Loading State */}
                  {loading && (
                    <View style={styles.loadingContainer}>
                      <Text style={styles.loadingTitle}>🔍 SEARCHING...</Text>
                      <ActivityIndicator size="large" color="#06b6d4" style={{ marginVertical: 20 }} />
                      <View style={styles.loadingBarContainer}>
                        <View style={styles.loadingBar}>
                          <View style={styles.loadingBarFill} />
                        </View>
                      </View>
                      <Text style={styles.loadingText}>Finding the best prices for you</Text>
                    </View>
                  )}

                  {!loading && resultados.length === 0 && nome.trim() && (
                    <View style={styles.noResults}>
                      <Text style={styles.noResultsTitle}>😕 NO DATA FOUND</Text>
                      <Text style={styles.noResultsText}>
                        &gt; No results for "<Text style={styles.noResultsHighlight}>{nome}</Text>"
                      </Text>
                      <Text style={styles.noResultsSubtext}>Try different search terms or filters</Text>
                    </View>
                  )}
                </ScrollView>
              </>
            )}

            {page === "collections" && <MyCollectionsPage onBack={() => setPage("home")} />}
            {page === "account" && <MyAccount onBack={() => setPage("home")} />}
          </View>

          {/* Bottom menu with centered icons for Collections and Account */}
          <View style={styles.bottomMenu}>
            <TouchableOpacity style={styles.bottomButton} onPress={() => setPage("collections")}>
              <Text style={styles.bottomIcon}>📁</Text>
              <Text style={styles.bottomLabel}>Collections</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomButton} onPress={() => setPage("account")}>
              <Text style={styles.bottomIcon}>👤</Text>
              <Text style={styles.bottomLabel}>Account</Text>
            </TouchableOpacity>
          </View>
          {/* Add-to-collection Modal */}
          <Modal visible={isAddModalVisible} animationType="slide" transparent>
            <View style={styles.modalBackdrop}>
              <View style={styles.modalContentSmall}>
                <Text style={styles.modalTitle}>Add "{searchNameState || nome}" to collection</Text>
                <TextInput
                  placeholder="Purchase price (optional)"
                  value={purchasePriceInput}
                  onChangeText={(t) => setPurchasePriceInput(t)}
                  keyboardType="numeric"
                  style={styles.input}
                />
                <TextInput
                  placeholder="Condition (e.g., used, new)"
                  value={addConditionInput}
                  onChangeText={setAddConditionInput}
                  style={styles.input}
                />
                <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 8 }}>
                  <TouchableOpacity style={styles.modalButton} onPress={() => setIsAddModalVisible(false)}>
                    <Text style={{ color: "#ccc" }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, { marginLeft: 12 }]} onPress={addToCollection} disabled={addingToCollection}>
                    <Text style={{ color: "white" }}>{addingToCollection ? "Adding..." : "Save"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </LinearGradient>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

// Add-to-collection handler and modal are implemented inside the component; to keep file organized we add helper here

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(31,41,55,0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  headerLeft: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  logo: {
    fontSize: 22,
    fontWeight: "800",
    color: "#10b981",
    fontFamily: "monospace",
    marginTop: 6,
  },
  tagline: {
    fontSize: 11,
    color: "#9ae6ff",
    fontFamily: "monospace",
    lineHeight: 14,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    backgroundColor: "#374151",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4b5563",
  },
  headerButtonText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  mainContent: {
    flex: 1,
  },
  searchSection: {
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(6,182,212,0.3)",
  },
  input: {
    backgroundColor: "rgba(17,24,39,0.8)",
    borderWidth: 2,
    borderColor: "#06b6d4",
    borderRadius: 12,
    padding: 16,
    color: "#67e8f9",
    fontSize: 16,
    marginVertical: 16,
    fontFamily: "monospace",
  },
  searchButton: {
    backgroundColor: "#ec4899", // pink-500
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(236,72,153,0.5)",
  },
  disabledButton: {
    backgroundColor: "#6b7280",
    borderColor: "rgba(107,114,128,0.5)",
  },
  searchButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  resultsSection: {
    marginTop: 8,
  },
  statsContainer: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "rgba(6,182,212,0.5)",
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#67e8f9",
    textAlign: "center",
    marginBottom: 16,
    fontFamily: "monospace",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  lowestCard: {
    backgroundColor: "#10b981", // green-500
    borderWidth: 1,
    borderColor: "#059669", // green-600
  },
  highestCard: {
    backgroundColor: "#ef4444", // red-500
    borderWidth: 1,
    borderColor: "#dc2626", // red-600
  },
  averageCard: {
    backgroundColor: "#3b82f6", // blue-500
    borderWidth: 1,
    borderColor: "#2563eb", // blue-600
  },
  statLabel: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 4,
    fontFamily: "monospace",
  },
  statValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  resultsGrid: {
    gap: 16,
  },
  row: {
    justifyContent: "space-between",
  },
  gameCard: {
    backgroundColor: "rgba(31,41,55,0.8)",
    borderWidth: 2,
    borderColor: "rgba(6,182,212,0.3)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: "48%",
  },
  gameImage: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.3)",
  },
  gameTitle: {
    color: "#67e8f9",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: "monospace",
  },
  gamePrice: {
    color: "#10b981", // green-400
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    fontFamily: "monospace",
  },
  gameTag: {
    color: "#a855f7", // purple-500
    fontSize: 12,
    fontFamily: "monospace",
  },
  noResults: {
    alignItems: "center",
    padding: 32,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.4)",
    marginTop: 24,
  },
  noResultsTitle: {
    fontSize: 20,
    color: "#ef4444",
    marginBottom: 8,
    fontFamily: "monospace",
  },
  noResultsText: {
    color: "#67e8f9",
    fontSize: 16,
    marginBottom: 4,
    fontFamily: "monospace",
  },
  noResultsHighlight: {
    color: "#ec4899", // pink-400
  },
  noResultsSubtext: {
    color: "#6b7280",
    fontSize: 12,
    fontFamily: "monospace",
  },
  // Currency converter styles
  currencyContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.3)",
  },
  currencyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  currencyLabel: {
    color: "#67e8f9",
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  refreshButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  currencySelector: {
    flexDirection: "row",
    gap: 8,
  },
  currencyOption: {
    flex: 1,
    backgroundColor: "rgba(107,114,128,0.3)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "rgba(6,182,212,0.3)",
    alignItems: "center",
  },
  currencyOptionActive: {
    backgroundColor: "rgba(6,182,212,0.2)",
    borderColor: "#06b6d4",
  },
  currencyOptionText: {
    color: "#67e8f9",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  currencyOptionTextActive: {
    color: "#06b6d4",
  },
  loadingText: {
    color: "#67e8f9",
    fontSize: 10,
    fontFamily: "monospace",
    textAlign: "center",
    marginTop: 8,
  },
  // Input container and clear button styles
  inputContainer: {
    position: "relative",
    marginBottom: 16,
  },
  clearButton: {
    position: "absolute",
    right: 12,
    top: 12,
    backgroundColor: "#ef4444",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  clearButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  // Collection button styles
  collectionButton: {
    backgroundColor: "#f59e0b", // amber-500
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 2,
    borderColor: "rgba(245,158,11,0.5)",
  },
  collectionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  // Loading styles
  loadingContainer: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.4)",
    marginTop: 24,
  },
  loadingTitle: {
    fontSize: 20,
    color: "#06b6d4",
    marginBottom: 20,
    fontFamily: "monospace",
    fontWeight: "bold",
  },
  loadingBarContainer: {
    width: "100%",
    marginBottom: 16,
  },
  loadingBar: {
    height: 6,
    backgroundColor: "rgba(6,182,212,0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  loadingBarFill: {
    height: "100%",
    backgroundColor: "#06b6d4",
    borderRadius: 3,
    width: "100%",
  },
  // New styles for centered home header and bottom menu
  homeHeaderCenter: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  searchWrapper: {
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
  },
  searchSectionCentered: {
    width: "100%",
    maxWidth: 640,
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.25)",
  },
  bottomMenu: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(55,65,81,0.6)",
    backgroundColor: "rgba(17,24,39,0.9)",
  },
  bottomButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  bottomIcon: {
    fontSize: 22,
  },
  bottomLabel: {
    color: "#67e8f9",
    fontSize: 12,
    marginTop: 4,
    fontFamily: "monospace",
  },
  hideExtrasButton: {
    marginTop: 8,
    alignSelf: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  hideExtrasText: {
    color: "#9ca3af",
    fontSize: 12,
    fontFamily: "monospace",
  },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  modalContentSmall: {
    width: "90%",
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(103,232,249,0.06)",
  },
  modalTitle: { color: "#67e8f9", fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  modalButton: { padding: 10 },
});
