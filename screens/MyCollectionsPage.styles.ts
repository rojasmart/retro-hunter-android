

import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  back: { color: "#67e8f9" },
  heading: { fontSize: 18, fontWeight: "bold", color: "#67e8f9" },
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
    alignItems: "flex-end",
    backgroundColor: "rgba(16,185,129,0.15)",
    borderRadius: 3,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  title: { color: "#e6f7ff", fontSize: 19 },
  meta: { color: "#9ca3af", fontSize: 12, marginTop: 4 },
  paidLabel: {
    color: "#6ee7b7",
    fontSize: 10,
    letterSpacing: 1,
  },
  paidPrice: {
    color: "#10b981",
    fontSize: 20,
    marginTop: 2,
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
  statChip: {
    flex: 1,
    alignItems: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 8,
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
    fontSize: 11,
    color: "white",
    fontWeight: "bold",
  },
  statValue: {
    fontSize: 18,
    color: "white",
    marginTop: 2,
  },
});

export default styles;