import { useState } from "react";
import {useNavigate, Link} from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import API from "../Services/api.js";
import { useAuthContext } from "@/Context/authContext.jsx";


export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const {setUser, setToken, setRole: setUserRole} = useAuthContext();
 
    const handleLogin = async()=>{
        if(!email || !password){
            setError("all fields required");
            return;
        }
        setLoading(true);

        
        

        try {
            const res = await API.post("auth/login", {email, password});
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
            setError(err.response?.data?.message || "login failed");
        } finally{
            setLoading(false);
        }
    };
    return(
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <Card className="w-full max-w-md shadow-xl animate-fade">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold">LOGIN</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
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
                </CardContent>
                <CardFooter className="flex flex-col items-center">
                    <Button onClick = {handleLogin}
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? "Logging in..." : "Log in"}
                    </Button>
                    <p className="text-center mt-2">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-blue-500 underline">Signup</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};