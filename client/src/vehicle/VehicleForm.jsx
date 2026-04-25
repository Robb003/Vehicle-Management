import { useState } from "react";
import API from "../Services/api";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AddVehicle({ onAdd }) { // Note: ensure parent passes onAdd
    const [name, setName] = useState("");
    const [registrationNumber, setRegistrationNumber] = useState("");
    const [pricePerDay, setPricePerDay] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !registrationNumber || !pricePerDay) {
            return alert("All fields are required");
        }
        setLoading(true);
        try {
            // No need to manually pass headers if your API service 
            // has the interceptor we added earlier
            await API.post("vehicle", { name, registrationNumber, pricePerDay });
            
            if (onAdd) onAdd(); // Trigger the reload in the parent dashboard
            
            setName("");
            setRegistrationNumber("");
            setPricePerDay("");
            alert("Vehicle added successfully");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add a vehicle");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center mt-6">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Add Vehicle</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-3">
                        <Input
                            type="text"
                            value={name}
                            placeholder="Vehicle name"
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Input
                            type="text"
                            // FIX: Changed "registrationNumber" string to the variable
                            value={registrationNumber} 
                            // FIX: Changed RegistrationNumber to "Registration Number" string
                            placeholder="Registration Number" 
                            onChange={(e) => setRegistrationNumber(e.target.value)}
                        />
                        <Input
                            type="number"
                            value={pricePerDay}
                            placeholder="Enter Price"
                            onChange={(e) => setPricePerDay(e.target.value)}
                        />
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? "Adding..." : "Add Vehicle"}
                        </Button>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}
