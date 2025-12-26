

import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  headerRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    marginBottom: 12,
    paddingVertical: 16,
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  back: { color: "#67e8f9" },
  heading: { fontSize: 18, fontWeight: "bold", color: "#67e8f9" },
  addFolderButton: {
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#a78bfa",
  },
  addFolderButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  card: { backgroundColor: "rgba(31,41,55,0.8)", borderRadius: 8, padding: 12, marginBottom: 8 },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardLeft: {
    flex: 1,
    paddingRight: 12,
  },
  cardRight: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(31, 41, 55, 0.5)", // gray-800/50
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.3)", // cyan-400/30
  },
  title: { color: "#e6f7ff", fontSize: 19 },
  meta: { color: "#9ca3af", fontSize: 12, marginTop: 4 },
  paidLabel: {
    color: "#d8b4fe", // purple-300
    fontSize: 14,
    marginRight: 8,
  },
  paidPrice: {
    color: "#c084fc", // purple-400
    fontSize: 18,
    fontWeight: "bold",
  },
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
  small: { color: "#9ca3af", fontSize: 12, marginTop: 8 },
  notes: { color: "#cfefff", fontSize: 13, marginTop: 6 },
  // thumb style removed (images no longer rendered inline)
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  priceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
  },
  statChip: {
    width: "48%", // Garante exatamente 2 colunas (48% x 2 + gap)
    alignItems: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 2,
  },
  looseChip: {
    backgroundColor: "rgba(30, 58, 138, 0.4)", // blue-900/40
    borderColor: "rgba(96, 165, 250, 0.5)", // blue-400/50
  },
  cibChip: {
    backgroundColor: "rgba(6, 78, 59, 0.4)", // green-900/40
    borderColor: "rgba(52, 211, 153, 0.5)", // green-400/50
  },
  newChip: {
    backgroundColor: "rgba(76, 29, 149, 0.4)", // purple-900/40
    borderColor: "rgba(167, 139, 250, 0.5)", // purple-400/50
  },
  gradedChip: {
    backgroundColor: "rgba(120, 53, 15, 0.4)", // yellow-900/40
    borderColor: "rgba(251, 191, 36, 0.5)", // yellow-400/50
  },
  lowestChip: {
    backgroundColor: "#10b981",
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  averageChip: {
    backgroundColor: "#3b82f6",
  },
  highestChip: {
    backgroundColor: "#ef4444",
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(147, 197, 253, 1)", // blue-300 para labels
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 4,
  },
  trendBadge: {
    marginLeft: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 12,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  historyToggle: {
    backgroundColor: "rgba(6,182,212,0.2)",
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.4)",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 12,
  },
  historyToggleText: {
    color: "#67e8f9",
    fontSize: 13,
    fontWeight: "bold",
  },
  folderChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  folderChipText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  folderOption: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
});

export default styles;