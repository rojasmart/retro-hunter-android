import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  formCard: {
    backgroundColor: "rgba(31,41,55,0.8)",
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: "rgba(6,182,212,0.3)",
  },
  profileCard: {
    backgroundColor: "rgba(31,41,55,0.8)",
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: "rgba(6,182,212,0.3)",
    alignItems: "center",
  },
  logoGradient: {
    borderRadius: 6,
  },
  logoText: {
    fontSize: 26, // text-2xl
    fontWeight: "bold", // font-bold
    textAlign: "center",
    color: "transparent", // Necessário para o gradiente
    backgroundColor: "transparent",
  },

  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#67e8f9",
    marginBottom: 4,
    marginTop: 16,
    textAlign: "center",
  },
  formSubtitle: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 24,
    textAlign: "center",
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    color: "#67e8f9",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(17,24,39,0.8)",
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.3)",
    borderRadius: 6,
    padding: 14,
    color: "white",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#34d399",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: "#6b7280",
    borderColor: "rgba(107,114,128,0.5)",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(6,182,212,0.3)",
  },
  dividerText: {
    color: "#6b7280",
    paddingHorizontal: 12,

    fontWeight: "bold",
  },
  link: {
    color: "#67e8f9",
    textAlign: "center",

    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: "rgba(239,68,68,0.2)",
    borderWidth: 1,
    borderColor: "#ef4444",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    textAlign: "center",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#06b6d4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "rgba(6,182,212,0.5)",
  },
  avatarText: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
  profileTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#67e8f9",
    marginBottom: 24,
  },
  infoRow: {
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.2)",
  },
  infoLabel: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  infoValue: {
    color: "#67e8f9",
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 24,
    width: "100%",
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  // New menu sections styles
  sectionContainer: {
    width: "100%",
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    color: "#67e8f9",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    fontFamily: "monospace",
  },
  menuItem: {
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.2)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuItemText: {
    color: "white",
    fontSize: 16,
    flex: 1,
  },
  menuItemArrow: {
    color: "#67e8f9",
    fontSize: 24,
    fontWeight: "bold",
  },
  menuItemValue: {
    color: "#9ca3af",
    fontSize: 14,
    fontFamily: "monospace",
  },
});

export default styles;