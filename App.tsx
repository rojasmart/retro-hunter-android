import React, { useState, useEffect } from "react";
import { StyleSheet, View, StatusBar, Text, TextInput, TouchableOpacity, ScrollView, FlatList, Image, Linking, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import CameraCapture from "./components/CameraCapture";

import { API_BASE_URL } from "./config";

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

export default function App() {
  const [nome, setNome] = useState("");
  const [platform, setPlatform] = useState<Platform>("all");
  const [condition, setCondition] = useState<string>("all");
  const [resultados, setResultados] = useState<GameResult[]>([]);
  const [searchNameState, setSearchNameState] = useState<string>("");
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    console.log("API_BASE_URL:", API_BASE_URL);
  }, []);

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

    try {
      const params = new URLSearchParams({
        nome: finalSearchName,
        platform: platformToSend,
        condition: condition,
      });

      // Debug: build and log the full URL before fetching
      const url = `${API_BASE_URL}/api/ebay?${params.toString()}`;
      console.log("[SEARCH] fetching:", url);

      const res = await fetch(url);
      console.log("[SEARCH] status:", res.status);
      const data = await res.json();
      console.log("[SEARCH] data:", data);

      setResultados(data.resultados || []);
    } catch (error) {
      console.error("Search failed:", error);
      Alert.alert("Error", "Failed to search. Check your internet connection.");
    } finally {
      setLoading(false);
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

      // Use the correct endpoint from your backend
      const ocrUrl = `${API_BASE_URL}/ask-agent-image`;
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

      // Adapt to your backend's response format
      if (data.titulo && data.titulo.trim()) {
        const gameName = data.titulo;
        const detectedPlatform = data.plataforma;

        setNome(gameName);
        if (detectedPlatform) {
          const normalizedPlatform = normalizePlatform(detectedPlatform);
          setPlatform(normalizedPlatform);
        }

        searchEbayOnly(gameName, detectedPlatform);
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

  // Filter and sort results (matching your webapp)
  const filteredItems = resultados
    .filter((item) => item.price >= minPrice && item.price <= maxPrice)
    .sort((a, b) => (sortOrder === "asc" ? a.price - b.price : b.price - a.price));

  // Currency conversion functions (matching your webapp)
  const convertPrice = (price: number) => {
    return currency === "EUR" ? (price * exchangeRate).toFixed(2) : price.toFixed(2);
  };

  const getCurrencySymbol = () => {
    return currency === "EUR" ? "€" : "$";
  };

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
          {/* Header matching your webapp exactly */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.logo}>RETRO HUNTER</Text>
              <Text style={styles.tagline}>Hunt, Decide, Sell</Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.headerButton}>
                <Text style={styles.headerButtonText}>Collection</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Text style={styles.headerButtonText}>Account</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.mainContent}>
            {/* Left side equivalent - Search section (matches your w-1/2 layout) */}
            <View style={styles.searchSection}>
              <CameraCapture onImageCaptured={handleImageCaptured} isProcessing={loading} />

              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Enter the game name (e.g., Action Fighter)"
                placeholderTextColor="#67e8f9"
              />

              <TouchableOpacity
                style={[styles.searchButton, loading && styles.disabledButton]}
                onPress={() => searchEbayOnly()}
                disabled={loading || !nome.trim()}
              >
                <Text style={styles.searchButtonText}>{loading ? "🔍 SCANNING..." : "HUNT FOR PRICES"}</Text>
              </TouchableOpacity>
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
          </View>
        </SafeAreaView>
      </LinearGradient>
    </SafeAreaProvider>
  );
}

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
    padding: 24,
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
    padding: 16,
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
    fontSize: 18,
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
});
