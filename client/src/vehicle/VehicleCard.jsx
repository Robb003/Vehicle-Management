import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VehicleCard({ vehicle, onDelete, onEdit }) {
    if (!vehicle) return null;

    // Logic Fix: Default to "Available" if the backend property is missing (for old data)
    const status = vehicle?.status || "Available";

    return (
        <Card className="relative animate-fade">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">
                    {vehicle?.name || "Unnamed Vehicle"}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm dark:text-zinc-300">
                    <strong>Reg No: </strong>{vehicle?.registrationNumber || "N/A"}
                </p>
                <p className="text-sm dark:text-zinc-300">
                    <strong>Price: </strong>KES {vehicle?.pricePerDay?.toLocaleString() || "0"} /day
                </p>

                <p className="text-sm dark:text-zinc-300">
                    <strong>Status: </strong>{" "}
                    <span 
                        className={
                            status === "Available"
                                ? "text-green-600 font-semibold"
                                : status === "Booked"
                                ? "text-red-600 font-semibold"
                                : "text-yellow-600 font-semibold"
                        }
                    >
                        {status}
                    </span>
                </p>
            </CardContent>
            <CardFooter className="flex justify-between gap-2">
                <Button
                    variant="outline"
                    onClick={() => onEdit?.(vehicle)}
                >
                    Edit
                </Button>
                <Button
                    variant="destructive"
                    onClick={() => onDelete?.(vehicle?._id)}
                >
                    Delete
                </Button>
            </CardFooter>
        </Card>
    );
}
