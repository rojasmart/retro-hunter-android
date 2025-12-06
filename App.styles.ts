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


export default styles;