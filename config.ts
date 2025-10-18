import { Platform } from "react-native";
import Constants from "expo-constants";

const hostFromExpo = (() => {
  const m =
    (Constants.manifest && (Constants.manifest as any).debuggerHost) ||
    (Constants.expoConfig && (Constants.expoConfig as any).debuggerHost);
  if (typeof m === "string") return m.split(":")[0];
  return null;
})();

const HOST_FALLBACK = hostFromExpo || "localhost";

let host: string;
if (Platform.OS === "android") {
  // Emulador Android clássico usa 10.0.2.2 para apontar para localhost do host
  host = "10.0.2.2";
} else {
  host = HOST_FALLBACK;
}

// Para testar num dispositivo físico, substitua por: host = "192.168.1.239";

// FastAPI backend (porta 8000) - para OCR e eBay
export const API_BASE_URL = `http://${host}:8000`;
export const API_DOCS_URL = `${API_BASE_URL}/docs`;