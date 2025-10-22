import React, { createContext, useContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL, AUTH_BASE_URL } from "../config";
import { Alert } from "react-native";

// Types
type User = any;

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, confirmPassword?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "LOGOUT" }
  | { type: "CLEAR_ERROR" };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("auth_token");
        if (!token) {
          dispatch({ type: "SET_LOADING", payload: false });
          return;
        }

        const response = await fetch(`${AUTH_BASE_URL}/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            dispatch({ type: "SET_USER", payload: data.user });
            return;
          }
        }

        await AsyncStorage.removeItem("auth_token");
        dispatch({ type: "SET_LOADING", payload: false });
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        await AsyncStorage.removeItem("auth_token");
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "CLEAR_ERROR" });

      const response = await fetch(`${AUTH_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.user && data.token) {
        await AsyncStorage.setItem("auth_token", data.token);
        await AsyncStorage.setItem("user_data", JSON.stringify(data.user));
        dispatch({ type: "SET_USER", payload: data.user });
        return true;
      } else {
        dispatch({ type: "SET_ERROR", payload: data.message || "Erro no login" });
        return false;
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro de conexão" });
      return false;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string, confirmPassword?: string): Promise<boolean> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "CLEAR_ERROR" });

      if (confirmPassword !== undefined && password !== confirmPassword) {
        dispatch({ type: "SET_ERROR", payload: "As senhas não coincidem" });
        return false;
      }

      const response = await fetch(`${AUTH_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.user && data.token) {
        await AsyncStorage.setItem("auth_token", data.token);
        await AsyncStorage.setItem("user_data", JSON.stringify(data.user));
        dispatch({ type: "SET_USER", payload: data.user });
        return true;
      } else {
        dispatch({ type: "SET_ERROR", payload: data.message || "Erro no registro" });
        return false;
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro de conexão" });
      return false;
    }
    return false;
  };

  const logout = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (token) {
        await fetch(`${AUTH_BASE_URL}/auth/logout`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      }
    } catch (error) {
      console.error("Erro no logout:", error);
    } finally {
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("user_data");
      dispatch({ type: "LOGOUT" });
    }
  };

  const clearError = () => dispatch({ type: "CLEAR_ERROR" });

  const value: AuthContextType = {
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    error: state.error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
}

export default AuthContext;
