import React, { createContext, useState, useEffect, useCallback } from "react";

export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [sessionTimeout, setSessionTimeout] = useState(null);

  // User initialization from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    const sessionExpiry = localStorage.getItem("sessionExpiry");

    if (token && userData) {
      const now = new Date().getTime();
      if (sessionExpiry && now < parseInt(sessionExpiry)) {
        // Session is still valid
        setUser(JSON.parse(userData));
        resetSessionTimer(parseInt(sessionExpiry));
      } else {
        // Session expired
        logout();
      }
    }
  }, []);

  const resetSessionTimer = useCallback(
    (expiryTime) => {
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }

      const now = new Date().getTime();
      const timeUntilExpiry = expiryTime - now;

      if (timeUntilExpiry > 0) {
        const timeout = setTimeout(() => {
          logout();
        }, timeUntilExpiry);

        setSessionTimeout(timeout);
      } else {
        logout();
      }
    },
    [sessionTimeout]
  );

  const login = useCallback(
    (userData, token) => {
      const expiryTime = new Date().getTime() + 30 * 60 * 1000; // 30 minuta per session

      setUser(userData);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("sessionExpiry", expiryTime.toString());

      resetSessionTimer(expiryTime);
    },
    [resetSessionTimer]
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("sessionExpiry");

    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
      setSessionTimeout(null);
    }
  }, [sessionTimeout]);

  const isLoggedIn = useCallback(() => {
    return user !== null;
  }, [user]);

  const getTimeRemaining = useCallback(() => {
    const sessionExpiry = localStorage.getItem("sessionExpiry");
    if (!sessionExpiry) return null;

    const now = new Date().getTime();
    const remaining = parseInt(sessionExpiry) - now;

    if (remaining <= 0) {
      logout();
      return null;
    }

    return Math.ceil(remaining / 1000); // Return seconds
  }, [logout]);

  return (
    <SessionContext.Provider
      value={{
        user,
        login,
        logout,
        isLoggedIn: isLoggedIn(),
        getTimeRemaining,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
