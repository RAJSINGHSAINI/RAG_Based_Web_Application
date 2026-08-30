import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api, { getErrorMessage } from "../services/api.js";

const AuthContext = createContext(null);

/** Handy hook so components do not import useContext everywhere. */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Starts true: until /api/auth/me answers we do not know whether there is a
  // session, and ProtectedRoute must wait rather than bounce to /login.
  const [loading, setLoading] = useState(true);

  /**
   * Asks the server who is logged in. The browser sends the HTTP-only cookie
   * automatically; React never reads or stores the token itself. This is the
   * only source of truth for "am I authenticated".
   */
  const checkAuth = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      return data.user;
    } catch (error) {
      // A 401 here just means "no valid session", which is normal.
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Restores the session on every page load or refresh.
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const signup = async ({ fullName, email, password, confirmPassword }) => {
    try {
      const { data } = await api.post("/auth/signup", {
        fullName,
        email,
        password,
        confirmPassword,
      });
      return { success: true, ...data };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  };

  const login = async ({ email, password }) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      // The response carries the user, not a token — the token is in the cookie.
      setUser(data.user);
      return { success: true, ...data };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
        // Set by the API when the account exists but is not verified yet.
        requiresVerification: Boolean(error?.response?.data?.requiresVerification),
        email: error?.response?.data?.email,
      };
    }
  };

  const logout = async () => {
    try {
      // The server clears the cookie; the client cannot do it itself.
      await api.post("/auth/logout");
    } catch (error) {
      // Even if the call fails, drop local state so the UI is not stuck.
    } finally {
      setUser(null);
    }
    return { success: true };
  };

  const verifyEmail = async ({ email, otp }) => {
    try {
      const { data } = await api.post("/auth/verify-email", { email, otp });
      // Only refresh context state if this browser already has a session
      // (verifying from the Profile page). Verifying after signup does not
      // log anyone in.
      if (user && data.user) setUser(data.user);
      return { success: true, ...data };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  };

  const resendVerificationOtp = async (email) => {
    try {
      const { data } = await api.post("/auth/resend-verification-otp", { email });
      return { success: true, ...data };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      return { success: true, ...data };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  };

  const verifyForgotPasswordOtp = async ({ email, otp }) => {
    try {
      const { data } = await api.post("/auth/verify-forgot-password-otp", {
        email,
        otp,
      });
      return { success: true, ...data };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  };

  const resetPassword = async ({ email, resetToken, password, confirmPassword }) => {
    try {
      const { data } = await api.post("/auth/reset-password", {
        email,
        resetToken,
        password,
        confirmPassword,
      });
      return { success: true, ...data };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/auth/profile");
      setUser(data.user);
      return { success: true, ...data };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  };

  const updateProfile = async ({ fullName }) => {
    try {
      const { data } = await api.put("/auth/profile", { fullName });
      // Every component reading from context sees the new name immediately.
      setUser(data.user);
      return { success: true, ...data };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  };

  const requestChangeEmail = async (newEmail) => {
    try {
      const { data } = await api.post("/auth/request-change-email", { newEmail });
      return { success: true, ...data };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  };

  const verifyChangeEmail = async (otp) => {
    try {
      const { data } = await api.post("/auth/verify-change-email", { otp });
      setUser(data.user);
      return { success: true, ...data };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    checkAuth,
    signup,
    login,
    logout,
    verifyEmail,
    resendVerificationOtp,
    forgotPassword,
    verifyForgotPasswordOtp,
    resetPassword,
    fetchProfile,
    updateProfile,
    requestChangeEmail,
    verifyChangeEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
