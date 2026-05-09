import { useState, useEffect, createContext, useContext } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = () => {
            const savedUser = localStorage.getItem("user");
            const savedToken = localStorage.getItem("token");
            const savedRole = localStorage.getItem("role");

            // Added check for "null" string which localStorage sometimes returns
            if (savedUser && savedUser !== "undefined" && savedUser !== "null" && savedToken) {
                try {
                    setUser(JSON.parse(savedUser));
                    setToken(savedToken);
                    setRole(savedRole);
                } catch (err) {
                    console.error("Auth initialization failed:", err);
                    localStorage.clear(); 
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const logout = () => {
        localStorage.clear();
        setUser(null);
        setToken(null);
        setRole(null);
        // Do not call navigate here; App.jsx will see user is null and redirect
    };

    return (
        <AuthContext.Provider
            value={{ user, setUser, token, setToken, role, setRole, logout, loading }}
        >
            {/* 
              This prevents the App from trying to route 
              before we know if the user is logged in 
            */}
            {!loading ? children : (
                <div className="flex h-screen items-center justify-center">
                    Loading Session...
                </div>
            )}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => useContext(AuthContext);
