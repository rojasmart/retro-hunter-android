import { StyleSheet } from "react-native";


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
    backgroundColor: "rgba(0, 0, 0, 0.4)", // bg-black/40
    borderRadius: 12, // rounded-xl
    padding: 24, // p-6
    marginBottom: 32,
    borderWidth: 2, // border-2
    borderColor: "rgba(167, 139, 250, 0.5)", // border-purple-400/50
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 10, // Para Android
  },
  statsHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    position: "relative",
  },
  resultsTitle: {
    fontSize: 24, // text-2xl
    fontWeight: "bold",
    color: "#f472b6", // pink-400
    textAlign: "center",
    flex: 1,
    fontFamily: "monospace", // font-mono
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
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
  },
  lowestCard: {
    backgroundColor: "#10b981", // green-500
    borderColor: "#4ade80", // green-400
  },
  highestCard: {
    backgroundColor: "#ef4444", // red-500
    borderColor: "#f87171", // red-400
  },
  averageCard: {
    backgroundColor: "#3b82f6", // blue-500
    borderColor: "#60a5fa", // blue-400
  },
  statLabel: {
    color: "white",
    fontSize: 10,
    fontFamily: "monospace",
    marginBottom: 4,
  },
  statValue: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },

  row: {
    justifyContent: "space-between",
  },
  gameCard: {
    backgroundColor: "rgba(31,41,55,0.8)",
    borderWidth: 2,
    borderColor: "rgba(6,182,212,0.3)",
    borderRadius: 6,
    padding: 16,
    marginBottom: 16,
    width: "48%",
  },
  fullScreenCard: {
    backgroundColor: "rgba(31,41,55,0.8)",
    borderWidth: 2,
    borderColor: "rgba(6,182,212,0.3)",
    borderRadius: 6,
    padding: 16,
    marginBottom: 8,
    width: "100%", // Full width
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
    borderRadius: 3,
    borderWidth: 1,
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
    borderRadius: 3,
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
    borderRadius: 3,
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
    borderRadius: 3,
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
    borderRadius: 3,
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
    backgroundColor: "#a855f7", // purple-500
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 2,
    borderColor: "rgba(168, 85, 247, 0.5)", // purple-400/50
  },
  collectionButtonText: {
    color: "white",
    fontSize: 14,
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
  // Results grid for FlatList
  resultsGrid: {
    paddingBottom: 16,
  },
  // Price Data Styles
  consoleText: {
    color: "white",
    fontSize: 14,
    textAlign: "left",
    marginTop: 4,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  genreText: {
    color: "white",
    fontSize: 12,
    textAlign: "left",
    marginTop: 8,
    fontFamily: "monospace",
  },
  releaseDateText: {
    color: "white",
    fontSize: 12,
    textAlign: "left",
    marginTop: 4,
    fontFamily: "monospace",
  },
  priceCardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },
  priceCard: {
    width: "48%",
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: 12,
  },
  looseCard: {
    backgroundColor: "rgba(30, 58, 138, 0.4)", // blue-900/40
    borderColor: "rgba(96, 165, 250, 0.5)", // blue-400/50
  },
  cibCard: {
    backgroundColor: "rgba(6, 78, 59, 0.4)", // green-900/40
    borderColor: "rgba(52, 211, 153, 0.5)", // green-400/50
  },
  newCard: {
    backgroundColor: "rgba(76, 29, 149, 0.4)", // purple-900/40
    borderColor: "rgba(167, 139, 250, 0.5)", // purple-400/50
  },
  gradedCard: {
    backgroundColor: "rgba(120, 53, 15, 0.4)", // yellow-900/40
    borderColor: "rgba(251, 191, 36, 0.5)", // yellow-400/50
  },
  boxOnlyCard: {
    backgroundColor: "rgba(23, 23, 23, 0.4)", // gray-900/40
    borderColor: "rgba(163, 163, 163, 0.5)", // gray-400/50
  },
  priceCardLabel: {
    color: "rgba(147, 197, 253, 1)", // blue-300
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  priceCardValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});


export default styles;