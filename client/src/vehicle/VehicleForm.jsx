import { useState } from "react";
import API from "../Services/api";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AddVehicle({onAdd}) {
    const [name, setName] = useState("");
    const [registrationNumber, setRegistrationNumber] = useState("");
    const [pricePerDay, setPricePerDay] = useState("");
    const [loading, setLoading] = useState(false);

    //posting a vehicle
    const handleSubmit = async(e)=>{
        e.preventDefault();
        if(!name || !registrationNumber || !pricePerDay){
            return alert("all fields required");
        }
        setLoading(true);
        try {
            const res = await API.post("/vehicles", {name, registrationNumber, pricePerDay},{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        onAdd([name, registrationNumber, pricePerDay]);
        setName("");
        setRegistrationNumber("");
        setPricePerDay();
        alert("vehicle added successfully");
            
        } catch(err) {
            alert(err.response?.data?.message || "failed to add a vehicle")
        } finally {
            setLoading(false);
        }

    };

    return(
        <div className="flex justify-center mt-6">
            <Card className="w-[400]">
                <CardHeader>
                    <CardTitle>Add Vehicle</CardTitle>
                </CardHeader>
                <form onSubmit = {handleSubmit}>
                    <CardContent className="space-y-3">
                        <Input
                            type="text"
                            value="name"
                            placeholder="Vehicle name"
                            onChange={(e)=>setName(e.target.value)}
                        />
                        <Input
                            type="text"
                            value="registrationNumber"
                            placeholder="Registration Number"
                            onChange={(e)=>setRegistrationNumber(e.target.value)}
                        />

                        <Input
                            type="number"
                            value="pricePerDay"
                            placeholder="Enter Price"
                            onChange={(e)=>setPricePerDay(e.target.value)}
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