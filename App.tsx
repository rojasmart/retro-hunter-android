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

import { MagnifyingGlassIcon, FolderIcon, UserIcon } from "react-native-heroicons/outline";

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
  const [detectedPlatformName, setDetectedPlatformName] = useState<string>(""); // Store original OCR platform name
  const [condition, setCondition] = useState<string>("all");
  const [resultados, setResultados] = useState<GameResult[]>([]);
  const [searchNameState, setSearchNameState] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState<"home" | "account" | "collections" | "search">("home");
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
  const [showFilters, setShowFilters] = useState(true);
  const [showStatsExtras, setShowStatsExtras] = useState(true);

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

    // If this is a manual search (not from OCR), clear the detected platform name
    if (!platformParam) {
      setDetectedPlatformName("");
    }

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
      // Navigate to home to show results
      setPage("home");
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
      console.log("[handleOCRExtraction] storing original platform name:", plataforma);

      // Store both: normalized for filtering, original for saving to collection
      setPlatform(normalized);
      setDetectedPlatformName(plataforma.trim()); // Store original detected name
      platformToUse = normalized;
    }

    setNome(arr[0] || "");
    setSearchNameState(arr[0] || "");

    // If we already have eBay results, use them directly and navigate to home
    if (ebayResults && ebayResults.length > 0) {
      console.log("[handleOCRExtraction] Using provided eBay results:", ebayResults.length);
      setResultados(ebayResults);
      setLoading(false);
      setPage("home"); // Navigate to home page to show results
    } else if (arr[0]) {
      // Otherwise, make a normal search (which will navigate to home in searchEbayOnly)
      console.log("[handleOCRExtraction] No eBay results provided, making search");
      searchEbayOnly(arr[0], platformToUse);
    }
  };

  const handleImageCaptured = async (imageUri: string) => {
    setLoading(true);
    // Navigate to home page immediately to show loading state
    setPage("home");

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
        setLoading(false);
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
        setLoading(false);
      } else {
        Alert.alert("No Game Detected", "Could not identify any game in the image. Try a clearer photo.");
        setLoading(false);
      }
    } catch (error) {
      console.error("OCR processing failed:", error);
      Alert.alert("Error", "Failed to process image. Please try again.");
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

      // Use original detected platform name if available, otherwise use normalized platform
      const platformForCollection = detectedPlatformName || (platform !== "all" ? platform : "");

      const body: any = {
        gameTitle: (searchNameState && searchNameState.trim()) || nome || "",
        platform: platformForCollection,
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

      console.log("[ADD_TO_COLLECTION] Current platform state:", platform);
      console.log("[ADD_TO_COLLECTION] Detected platform name:", detectedPlatformName);
      console.log("[ADD_TO_COLLECTION] Platform for collection:", platformForCollection);
      console.log("[ADD_TO_COLLECTION] Body being sent:", body);

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
                {/* Home page - only shows results if they exist, no search component */}
                {resultados.length === 0 && !loading && (
                  <View style={styles.homeWelcome}>
                    <LinearGradient
                      colors={["#34d399", "#ec4899", "#a855f7"]} // Gradiente: verde, rosa, roxo
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.logoGradient}
                    >
                      <Text style={styles.logoText}>RETRO HUNTER</Text>
                    </LinearGradient>
                    <Text style={styles.tagline}>Hunt, Decide, Sell</Text>
                    <Text style={styles.welcomeText}>Click the search icon below to start hunting for game prices!</Text>
                  </View>
                )}

                {/* Results section - only filters and stats, no search component */}
                <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
                  {resultados.length > 0 && (
                    <View style={styles.resultsSection}>
                      {/* Stats section matching your exact 3-column grid */}
                      <View style={styles.statsContainer}>
                        <TouchableOpacity style={styles.statsHeader} onPress={() => setShowStatsExtras(!showStatsExtras)} activeOpacity={0.7}>
                          <Text style={styles.resultsTitle}>{searchNameState}</Text>
                          <Text style={styles.statsToggleIcon}>{showStatsExtras ? "▼" : "▶"}</Text>
                        </TouchableOpacity>

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

                        {showStatsExtras && (
                          <>
                            {/* Price Filters - Collapsible */}
                            <View style={styles.filtersContainer}>
                              <TouchableOpacity style={styles.filterHeader} onPress={() => setShowFilters(!showFilters)} activeOpacity={0.7}>
                                <Text style={styles.filterTitle}>FILTERS</Text>
                                <Text style={styles.filterToggleIcon}>{showFilters ? "▼" : "▶"}</Text>
                              </TouchableOpacity>

                              {showFilters && (
                                <>
                                  {/* Sort Order */}
                                  <View style={styles.filterRow}>
                                    <Text style={styles.filterLabel}>Sort by Price:</Text>
                                    <View style={styles.sortButtons}>
                                      <TouchableOpacity
                                        style={[styles.sortButton, sortOrder === "asc" && styles.sortButtonActive]}
                                        onPress={() => setSortOrder("asc")}
                                      >
                                        <Text style={[styles.sortButtonText, sortOrder === "asc" && styles.sortButtonTextActive]}>↑ Low to High</Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity
                                        style={[styles.sortButton, sortOrder === "desc" && styles.sortButtonActive]}
                                        onPress={() => setSortOrder("desc")}
                                      >
                                        <Text style={[styles.sortButtonText, sortOrder === "desc" && styles.sortButtonTextActive]}>
                                          ↓ High to Low
                                        </Text>
                                      </TouchableOpacity>
                                    </View>
                                  </View>

                                  {/* Price Range */}
                                  <View style={styles.filterRow}>
                                    <Text style={styles.filterLabel}>Price Range:</Text>
                                    <View style={styles.priceRangeInputs}>
                                      <View style={styles.priceInputWrapper}>
                                        <Text style={styles.priceInputLabel}>Min:</Text>
                                        <TextInput
                                          style={styles.priceInput}
                                          value={minPrice.toString()}
                                          onChangeText={(text) => {
                                            const num = Number(text);
                                            if (!isNaN(num) && num >= 0) setMinPrice(num);
                                          }}
                                          keyboardType="numeric"
                                          placeholderTextColor="#67e8f9"
                                        />
                                      </View>
                                      <Text style={styles.priceSeparator}>-</Text>
                                      <View style={styles.priceInputWrapper}>
                                        <Text style={styles.priceInputLabel}>Max:</Text>
                                        <TextInput
                                          style={styles.priceInput}
                                          value={maxPrice.toString()}
                                          onChangeText={(text) => {
                                            const num = Number(text);
                                            if (!isNaN(num) && num >= 0) setMaxPrice(num);
                                          }}
                                          keyboardType="numeric"
                                          placeholderTextColor="#67e8f9"
                                        />
                                      </View>
                                    </View>
                                  </View>

                                  {/* Reset Filters Button */}
                                  <TouchableOpacity
                                    style={styles.resetButton}
                                    onPress={() => {
                                      setMinPrice(lowestPrice);
                                      setMaxPrice(highestPrice);
                                      setSortOrder("asc");
                                    }}
                                  >
                                    <Text style={styles.resetButtonText}>Reset Filters</Text>
                                  </TouchableOpacity>
                                </>
                              )}
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
                          </>
                        )}
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

                  {!loading && resultados.length === 0 && searchNameState && (
                    <View style={styles.noResults}>
                      <Text style={styles.noResultsTitle}>😕 NO DATA FOUND</Text>
                      <Text style={styles.noResultsText}>
                        &gt; No results for "<Text style={styles.noResultsHighlight}>{searchNameState}</Text>"
                      </Text>
                      <Text style={styles.noResultsSubtext}>Try different search terms or filters</Text>
                    </View>
                  )}
                </ScrollView>
              </>
            )}

            {page === "search" && (
              <View style={styles.searchPageContainer}>
                {/* Centered branding */}
                <View style={styles.homeHeaderCenter}>
                  <LinearGradient
                    colors={["#34d399", "#ec4899", "#a855f7"]} // Gradiente: verde, rosa, roxo
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.logoGradient}
                  >
                    <Text style={styles.logoText}>RETRO HUNTER</Text>
                  </LinearGradient>
                  <Text style={styles.tagline}>Hunt, Decide, Sell</Text>
                </View>

                {/* Search section */}
                <View style={styles.searchWrapper}>
                  <View style={styles.searchSectionCentered}>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        value={nome}
                        onChangeText={setNome}
                        placeholder="Enter the game name..."
                        placeholderTextColor="#67e8f9"
                      />
                      {nome.trim() && (
                        <TouchableOpacity
                          style={styles.clearButton}
                          onPress={() => {
                            setNome("");
                          }}
                        >
                          <Text style={styles.clearButtonText}>✕</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <CameraCapture onImageCaptured={handleImageCaptured} isProcessing={loading} />

                    <TouchableOpacity
                      style={[styles.searchButton, loading && styles.disabledButton]}
                      onPress={() => searchEbayOnly()}
                      disabled={loading || !nome.trim()}
                    >
                      <Text style={styles.searchButtonText}>{loading ? "SCANNING..." : "HUNT FOR PRICES"}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {page === "collections" && <MyCollectionsPage onBack={() => setPage("home")} />}
            {page === "account" && <MyAccount onBack={() => setPage("home")} />}
          </View>

          {/* Bottom menu with centered icons for Collections and Account */}
          <View style={styles.bottomMenu}>
            <TouchableOpacity style={styles.bottomButton} onPress={() => setPage("search")}>
              <MagnifyingGlassIcon size={24} color={page === "search" ? "#06b6d4" : "#67e8f9"} />
              <Text style={styles.bottomLabel}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomButton} onPress={() => setPage("collections")}>
              <FolderIcon size={24} color={page === "collections" ? "#06b6d4" : "#67e8f9"} />
              <Text style={styles.bottomLabel}>Collections</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomButton} onPress={() => setPage("account")}>
              <UserIcon size={24} color={page === "account" ? "#06b6d4" : "#67e8f9"} />
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
                  placeholderTextColor="white"
                />
                <TextInput
                  placeholder="Condition (e.g., used, new)"
                  value={addConditionInput}
                  onChangeText={setAddConditionInput}
                  style={styles.input}
                  placeholderTextColor="white"
                />
                <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 8 }}>
                  <TouchableOpacity style={[styles.modalButton, styles.modalCancelButton]} onPress={() => setIsAddModalVisible(false)}>
                    <Text style={styles.modalCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalSaveButton, { marginLeft: 12 }]}
                    onPress={addToCollection}
                    disabled={addingToCollection}
                  >
                    <Text style={styles.modalSaveButtonText}>{addingToCollection ? "Adding..." : "Save"}</Text>
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
    marginTop: 6,
  },
  logoGradient: {
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  logoText: {
    fontSize: 22, // text-2xl
    fontWeight: "bold", // font-bold
    textAlign: "center",
    color: "transparent", // Necessário para o gradiente
    backgroundColor: "transparent",
  },
  tagline: {
    fontSize: 11,
    color: "#9ae6ff",

    marginTop: 14,
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
    borderWidth: 1,
    borderColor: "#06b6d4",
    borderRadius: 6,
    padding: 16,
    color: "white",
    fontSize: 16,
    marginVertical: 2,
  },
  searchButton: {
    backgroundColor: "#ec4899", // pink-500
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: -12,
    borderRadius: 6,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#6b7280",
    borderColor: "rgba(107,114,128,0.5)",
  },
  searchButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  resultsContainer: {
    flex: 1,
    padding: 10,
  },
  resultsSection: {
    marginTop: 6,
  },
  statsContainer: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 8,
    padding: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.5)",
  },
  statsHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    position: "relative",
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#67e8f9",
    textAlign: "center",
    flex: 1,
  },
  statsToggleIcon: {
    color: "#67e8f9",
    fontSize: 18,
    fontWeight: "bold",
    position: "absolute",
    right: 0,
  },
  statsGrid: {
    flexDirection: "row",
  },
  statCard: {
    flex: 1,
    padding: 8,
    alignItems: "flex-start",
  },
  lowestCard: {
    backgroundColor: "#10b981", // green-500
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  highestCard: {
    backgroundColor: "#ef4444", // red-500
  },
  averageCard: {
    backgroundColor: "#3b82f6", // blue-500
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  statLabel: {
    color: "white",
    fontSize: 10,

    marginBottom: 4,
  },
  statValue: {
    color: "white",
    fontSize: 20,
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
  },
  gamePrice: {
    color: "#10b981", // green-400
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  gameTag: {
    color: "#a855f7", // purple-500
    fontSize: 12,
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
  },
  noResultsText: {
    color: "#67e8f9",
    fontSize: 16,
    marginBottom: 4,
  },
  noResultsHighlight: {
    color: "#ec4899", // pink-400
  },
  noResultsSubtext: {
    color: "#6b7280",
    fontSize: 12,
  },
  // Filter styles
  filtersContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.3)",
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  filterTitle: {
    color: "#67e8f9",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  filterToggleIcon: {
    color: "#67e8f9",
    fontSize: 14,
    fontWeight: "bold",
    position: "absolute",
    right: 0,
  },
  filterRow: {
    marginBottom: 16,
  },
  filterLabel: {
    color: "#67e8f9",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 8,
  },
  sortButtons: {
    flexDirection: "row",
    gap: 8,
  },
  sortButton: {
    flex: 1,
    backgroundColor: "rgba(107,114,128,0.3)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "rgba(6,182,212,0.3)",
    alignItems: "center",
  },
  sortButtonActive: {
    backgroundColor: "rgba(6,182,212,0.2)",
    borderColor: "#06b6d4",
  },
  sortButtonText: {
    color: "#67e8f9",
    fontSize: 12,
    fontWeight: "bold",
  },
  sortButtonTextActive: {
    color: "#06b6d4",
  },
  priceRangeInputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priceInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priceInputLabel: {
    color: "#67e8f9",
    fontSize: 12,
    fontWeight: "bold",
  },
  priceInput: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.8)",
    borderWidth: 1,
    borderColor: "#06b6d4",
    borderRadius: 8,
    padding: 8,
    color: "white",
    fontSize: 14,
    textAlign: "center",
  },
  priceSeparator: {
    color: "#67e8f9",
    fontSize: 16,
    fontWeight: "bold",
  },
  resetButton: {
    backgroundColor: "#6b7280",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 8,
  },
  resetButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
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
  },
  refreshButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 3,
  },
  refreshButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
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
  },
  currencyOptionTextActive: {
    color: "#06b6d4",
  },
  loadingText: {
    color: "#67e8f9",
    fontSize: 10,
    textAlign: "center",
    marginTop: 8,
  },
  // Input container and clear button styles
  inputContainer: {
    position: "relative",
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
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 16,
  },
  collectionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
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
    paddingVertical: 90,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    height: "50%",
  },
  searchSectionCentered: {
    flex: 1,
    width: "100%",
    maxWidth: 640,
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 16,
    borderRadius: 6,
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
  modalButton: { padding: 6, paddingHorizontal: 12, borderRadius: 6 },
  // Home welcome screen styles
  homeWelcome: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },

  modalCancelButton: {
    backgroundColor: "#6b7280", // gray-500
    borderWidth: 1,
    borderColor: "#4b5563",
  },
  modalCancelButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalSaveButton: {
    backgroundColor: "#10b981", // green-500
    borderWidth: 1,
    borderColor: "#059669",
  },
  modalSaveButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  welcomeText: {
    color: "#67e8f9",
    fontSize: 16,
    textAlign: "center",
    marginTop: 24,
    lineHeight: 24,
  },
  // Search page container
  searchPageContainer: {
    flex: 1,
  },
});
