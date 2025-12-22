import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.3)",
  },
  title: {
    color: "#67e8f9",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 12,
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  looseColor: {
    backgroundColor: "rgba(14, 165, 233, 1)", // blue-500
  },
  cibColor: {
    backgroundColor: "rgba(139, 92, 246, 1)", // violet-500
  },
  newColor: {
    backgroundColor: "rgba(16, 185, 129, 1)", // green-500
  },
  gradedColor: {
    backgroundColor: "rgba(245, 158, 11, 1)", // amber-500
  },
  legendText: {
    color: "#9ca3af",
    fontSize: 11,
    fontWeight: "600",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyContainer: {
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 12,
    padding: 24,
    marginTop: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(107,114,128,0.3)",
  },
  emptyText: {
    color: "#67e8f9",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    color: "#9ca3af",
    fontSize: 12,
    textAlign: "center",
  },
});

export default styles;
