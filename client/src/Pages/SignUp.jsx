import { useState } from "react";
import { useNavigate, Link} from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import API from "../Services/api";
import {  useAuthContext } from "@/Context/authContext";

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

    const {setUser, setToken, setRole: setUserRole} = useAuthContext();

    const handleSignup = async()=>{
        if(!name || !phoneNumber || !email || !password || !role || !location ){
            setError("All fields required");
            return;
        }
        setLoading(true);

        //call api
        try{
            const res = await API.post("auth/signup", {name, phoneNumber, email, password, role, location});
            const {token, user} = res.data;

            setUser(user);
            setToken(token);
            setUserRole(user.role);
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            localStorage.setItem("role", user.role);


            setError("");
            navigate("/");
        } catch(err) {
            alert(err.response?.data?.message || "signup failed");
        } finally {
            setLoading(false);
        }
    };
    return(
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <Card className="w-full max-w-md shadow-xl animate-fade">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold">Signup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
                    <Input
                        type="text"
                        placeholder="name"
                        value={name}
                        onChange= {(e)=>setName(e.target.value)}
                    />
                    <Input
                        type="tel"
                        placeholder="enter phoneNumber"
                        value={phoneNumber}
                        onChange= {(e)=>setPhoneNumber(e.target.value)}
                    />

                        <Input 
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange= {(e)=>setEmail(e.target.value)}
                    />

                    <Input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange= {(e)=>setPassword(e.target.value)}
                    />

                    <div className="space-y-1">
                        <select
                            value={role}
                            onChange={(e)=>setRole(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background"
                        >
                            <option value="" disabled>Select Role</option>
                            <option value="Customer">Customer</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                    <Input
                        type="text"
                        placeholder="enter your location"
                        value={location}
                        onChange={(e)=>setLocation(e.target.value)}
                    />

                </CardContent>
                <CardFooter className="flex flex-col items-center">
                    <Button onClick = {handleSignup}
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? "Signing up..." : "Sign up"}
                    </Button>
                    <p className="text-center mt-2">
                         have an account?{' '}
                        <Link to="/login" className="text-blue-500 underline">Login</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
