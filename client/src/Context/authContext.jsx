import { useState, useEffect, createContext, useContext } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        const savedToken = localStorage.getItem("token");
        const savedRole = localStorage.getItem("role");

        if (savedUser && savedUser !== "undefined" && savedToken) {
            try {
                setUser(JSON.parse(savedUser));
                setToken(savedToken);
                setRole(savedRole);
            } catch (err) {
                console.error("Invalid JSON in localStorage", err);
                localStorage.clear(); 
            }
        }
        setLoading(false);
    }, []);

    // --- ADDED LOGOUT FUNCTION ---
    const logout = () => {
        localStorage.clear(); // Clear all saved data
        setUser(null);        // Reset states to trigger App.js redirects
        setToken(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider
            // Include 'logout' in the value so components can use it
            value={{ user, setUser, token, setToken, role, setRole, logout }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => useContext(AuthContext);
