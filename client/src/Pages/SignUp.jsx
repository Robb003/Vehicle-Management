import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import API from "../Services/api";
import { useAuthContext } from "@/Context/authContext";

export default function Signup() {
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [location, setLocation] = useState("");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { setUser, setToken, setRole: setUserRole } = useAuthContext();

    const handleSignup = async (e) => {
        // Prevent default form submission
        if (e) e.preventDefault();

        if (!name || !phoneNumber || !email || !password || !role || !location) {
            setError("All fields required");
            return;
        }
        setLoading(true);

        try {
            const res = await API.post("auth/signup", { name, phoneNumber, email, password, role, location });
            const { token, user } = res.data;

            // Update Global State
            setUser(user);
            setToken(token);
            setUserRole(user.role);

            // Update Storage
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("role", user.role);

            setError("");
            // Use replace: true to prevent back-button loops
            navigate("/", { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <Card className="w-full max-w-md shadow-xl animate-fade">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold">Signup</CardTitle>
                </CardHeader>
                {/* Fixed: Wrapped in form to fix DOM warning and allow 'Enter' key submission */}
                <form onSubmit={handleSignup}>
                    <CardContent className="space-y-4">
                        {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
                        
                        <Input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <Input
                            type="tel"
                            placeholder="Phone Number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                        />
                        <Input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            type="password"
                            placeholder="Create Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            required
                        >
                            <option value="" disabled>Select Role</option>
                            <option value="Customer">Customer</option>
                            <option value="Admin">Admin</option>
                        </select>

                        <Input
                            type="text"
                            placeholder="Your Location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        />
                    </CardContent>
                    
                    <CardFooter className="flex flex-col items-center">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? "Signing up..." : "Sign up"}
                        </Button>
                        <p className="text-center mt-2 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
