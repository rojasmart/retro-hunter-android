import React, { useState, useEffect } from "react";
import { View, StatusBar, Text, TextInput, TouchableOpacity, ScrollView, FlatList, Linking, Alert, ActivityIndicator, Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import CameraCapture from "./components/CameraCapture";
import MyAccount from "./screens/MyAccount";
import MyCollectionsPage from "./screens/MyCollectionsPage";
import { AuthProvider } from "./context/AuthContext";

import { API_BASE_URL, AUTH_BASE_URL } from "./config";
import { useAuth } from "./context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

import styles from "./App.styles";

import { MagnifyingGlassIcon, FolderIcon, UserIcon } from "react-native-heroicons/outline";

interface PriceData {
  id: string;
  product_name: string;
  console_name: string;
  genre?: string;
  release_date?: string;
  prices: {
    loose?: number;
    cib?: number;
    new?: number;
    graded?: number;
    box_only?: number;
  };
  currency: string;
}

interface GameResult {
  title: string;
  price: number;
  link: string;
  image?: string;
  tags?: string[];
}

interface PriceCard {
  type: string;
  price: number;
  label: string;
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
  const [priceData, setPriceData] = useState<PriceData | null>(null);
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

  // Fetch exchange rate from API (same as webapp)
  const fetchExchangeRate = async () => {
    try {
      setIsLoadingRate(true);
      const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      const data = await response.json();

      if (data.rates && data.rates.EUR) {
        setExchangeRate(data.rates.EUR);
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

    try {
      const params = new URLSearchParams({
        game_name: finalSearchName,
        platform: platformToSend,
        condition: condition,
      });

      // Debug: build and log the full URL before fetching - usar FastAPI para eBay
      const url = `${API_BASE_URL}/ebay-search?${params.toString()}`;

      const res = await fetch(url);

      const data = await res.json();

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

    if (typeof plataforma === "string" && plataforma.trim() && plataforma.toLowerCase() !== "all") {
      const normalized = normalizePlatform(plataforma);

      // Store both: normalized for filtering, original for saving to collection
      setPlatform(normalized);
      setDetectedPlatformName(plataforma.trim()); // Store original detected name
      platformToUse = normalized;
    }

    setNome(arr[0] || "");
    setSearchNameState(arr[0] || "");

    // If we already have eBay results, use them directly and navigate to home
    if (ebayResults && ebayResults.length > 0) {
      setResultados(ebayResults);
      setLoading(false);
      setPage("home"); // Navigate to home page to show results
    } else if (arr[0]) {
      // Otherwise, make a normal search (which will navigate to home in searchEbayOnly)

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

      // Use FastAPI for combined OCR + Price search
      const ocrUrl = `${API_BASE_URL}/ask-agent-image-with-prices`;

      const ocrResponse = await fetch(ocrUrl, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!ocrResponse.ok) {
        const errorText = await ocrResponse.text();

        const message = `Server returned ${ocrResponse.status}`;
        Alert.alert("Server Error", message);
        setLoading(false);
        return;
      }

      const data = await ocrResponse.json();
      console.log("[OCR] Received data:", JSON.stringify(data, null, 2));

      // Handle the combined OCR + Price response
      if (data.price_data && data.price_data.length > 0) {
        console.log("[OCR] Found price_data:", data.price_data.length, "items");
        const firstPriceData = data.price_data[0];
        console.log("[OCR] Setting price data:", firstPriceData.product_name);
        console.log("[OCR] Prices:", firstPriceData.prices);
        setPriceData(firstPriceData);
        setSearchNameState(firstPriceData.product_name);
        setLoading(false);
        setPage("home");
        console.log("[OCR] Navigation to home complete");
      } else if (data.games && data.games.length > 0) {
        console.log("[OCR] Found games:", data.games);
        // Fallback: show the detected games
        const gamesList = data.games.map((g: any) => `${g.title} (${g.platform})`).join(", ");
        Alert.alert("Games Detected", `Found: ${gamesList}\n\nBut no price data available.`);
        setLoading(false);
      } else if (data.titulo && data.titulo.trim()) {
        console.log("[OCR] Using titulo fallback");
        const gameName = data.titulo;
        const detectedPlatform = data.plataforma;
        const priceResults = data.price_results || [];

        // Use the handleOCRExtraction logic
        handleOCRExtraction(gameName, detectedPlatform, priceResults);
      } else if (data.raw) {
        // Fallback: try to parse the raw response
        const message = "Raw result: " + data.raw;
        Alert.alert("Partial Detection", message);
        setLoading(false);
      } else {
        console.log("[OCR] No valid data found in response");
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
      const platformForCollection = priceData?.console_name || detectedPlatformName || (platform !== "all" ? platform : "");

      console.log("[ADD] Platform sources:", {
        "priceData?.console_name": priceData?.console_name,
        detectedPlatformName,
        platform,
        platformForCollection,
      });

      // Build body with price data if available
      const body: any = {
        gameTitle: (searchNameState && searchNameState.trim()) || nome || "",
        platform: platformForCollection,
        condition: addConditionInput || undefined,
        purchasePrice: typeof priceNum === "number" ? priceNum : undefined,
        notes: "",
        images: [],
        isWishlist: false,
        completionStatus: "not-started",
        userId: uid,
      };

      // Add price data from PriceCharting if available
      if (priceData && priceData.prices) {
        console.log("[ADD] priceData.prices:", JSON.stringify(priceData.prices, null, 2));
        body.loosePrice = priceData.prices.loose || undefined;
        body.cibPrice = priceData.prices.cib || undefined;
        body.completePrice = priceData.prices.cib || undefined; // Backend expects completePrice for CIB
        body.newPrice = priceData.prices.new || undefined;
        body.gradedPrice = priceData.prices.graded || undefined;
        body.boxOnlyPrice = priceData.prices.box_only || undefined;
        body.boxPrice = priceData.prices.box_only || undefined; // Backend might expect boxPrice
        body.priceChartingId = priceData.id || undefined;
        body.genre = priceData.genre || undefined;
        body.releaseDate = priceData.release_date || undefined;
        console.log("[ADD] body with prices:", JSON.stringify(body, null, 2));
      } else {
        // Fallback to old prices if using old search results
        body.lowestPrice = lowestPrice || undefined;
        body.highestPrice = highestPrice || undefined;
        body.averagePrice = Number(averagePrice) || undefined;
      }

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
    <TouchableOpacity style={styles.fullScreenCard} onPress={() => Linking.openURL(item.link)}>
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
                {!priceData && resultados.length === 0 && !loading && (
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

                {/* Results section - Price Data Cards */}
                <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
                  {priceData && (
                    <View style={styles.resultsSection}>
                      <View style={styles.statsContainer}>
                        <TouchableOpacity style={styles.statsHeader} onPress={() => setShowStatsExtras(!showStatsExtras)} activeOpacity={0.7}>
                          <Text style={styles.resultsTitle}>{priceData.product_name}</Text>
                        </TouchableOpacity>

                        <Text style={styles.consoleText}>{priceData.console_name}</Text>
                        {priceData.genre && <Text style={styles.genreText}>Genre: {priceData.genre}</Text>}
                        {priceData.release_date && <Text style={styles.releaseDateText}>Released: {priceData.release_date}</Text>}

                        {/* Price Cards Grid */}
                        <View style={styles.priceCardsContainer}>
                          {priceData.prices.loose && (
                            <View style={[styles.priceCard, styles.looseCard]}>
                              <Text style={styles.priceCardLabel}>LOOSE</Text>
                              <Text style={styles.priceCardValue}>${priceData.prices.loose.toFixed(2)}</Text>
                            </View>
                          )}
                          {priceData.prices.cib && (
                            <View style={[styles.priceCard, styles.cibCard]}>
                              <Text style={styles.priceCardLabel}>CIB</Text>
                              <Text style={styles.priceCardValue}>${priceData.prices.cib.toFixed(2)}</Text>
                            </View>
                          )}
                          {priceData.prices.new && (
                            <View style={[styles.priceCard, styles.newCard]}>
                              <Text style={styles.priceCardLabel}>NEW</Text>
                              <Text style={styles.priceCardValue}>${priceData.prices.new.toFixed(2)}</Text>
                            </View>
                          )}
                          {priceData.prices.graded && (
                            <View style={[styles.priceCard, styles.gradedCard]}>
                              <Text style={styles.priceCardLabel}>GRADED</Text>
                              <Text style={styles.priceCardValue}>${priceData.prices.graded.toFixed(2)}</Text>
                            </View>
                          )}
                          {priceData.prices.box_only && (
                            <View style={[styles.priceCard, styles.boxOnlyCard]}>
                              <Text style={styles.priceCardLabel}>BOX ONLY</Text>
                              <Text style={styles.priceCardValue}>${priceData.prices.box_only.toFixed(2)}</Text>
                            </View>
                          )}
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
                    </View>
                  )}

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
                        numColumns={1} // Display one card per row
                        key={1}
                        contentContainerStyle={styles.resultsGrid}
                        removeClippedSubviews={true}
                        initialNumToRender={10}
                        maxToRenderPerBatch={5}
                        windowSize={5}
                        getItemLayout={(data, index) => ({
                          length: 150,
                          offset: 150 * index,
                          index,
                        })}
                        keyExtractor={(item, index) => index.toString()}
                        nestedScrollEnabled={true}
                      />
                    </View>
                  )}

                  {/* Loading State */}
                  {loading && (
                    <View style={styles.loadingContainer}>
                      <Text style={styles.loadingTitle}>SEARCHING...</Text>
                      <ActivityIndicator size="large" color="#06b6d4" style={{ marginVertical: 20 }} />
                      <View style={styles.loadingBarContainer}>
                        <View style={styles.loadingBar}>
                          <View style={styles.loadingBarFill} />
                        </View>
                      </View>
                      <Text style={styles.loadingText}>Searching for the best prices...</Text>
                    </View>
                  )}

                  {!loading && !priceData && resultados.length === 0 && searchNameState && (
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

          <View style={styles.bottomMenu}>
            <TouchableOpacity style={styles.bottomButton} onPress={() => setPage("search")}>
              <MagnifyingGlassIcon size={24} color={page === "search" ? "#06b6d4" : "#67e8f9"} />
              <Text style={styles.bottomLabel}>Search</Text>
            </TouchableOpacity>
            {user && (
              <TouchableOpacity style={styles.bottomButton} onPress={() => setPage("collections")}>
                <FolderIcon size={24} color={page === "collections" ? "#06b6d4" : "#67e8f9"} />
                <Text style={styles.bottomLabel}>Collections</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.bottomButton} onPress={() => setPage("account")}>
              <UserIcon size={24} color={page === "account" ? "#06b6d4" : "#67e8f9"} />
              <Text style={styles.bottomLabel}>Account</Text>
            </TouchableOpacity>
          </View>

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
