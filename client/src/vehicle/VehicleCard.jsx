import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


export default function VehicleCard({vehicle, onDelete, onEdit}){
    return(
    <Card className="relative animate-fade">
        <CardHeader>
            <CardTitle className="text- lg font-semibold">{vehicle.name}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm dark:text-zinc-300">
                <strong>Reg No:</strong>{vehicle.registrationNumber}
            </p>
            <p className="text-sm dark:text-zinc-300">
                <strong>Price</strong>KES {vehicle.pricePerDay} /day
            </p>

            //vehicle status
            <p className="text-sm dark:text-zinc-300">
                <strong>Status:</strong>{" "}
                <span 
                    className={
                        vehicle.status ==="Availabe"
                        ?"text-green-600 font-semibold"
                        :vehicle.status ==="Booked"
                        ?"text-red-600 font-semibold"
                        :"text-yellow-600 font-semibold"
                    }
                >
                    {vehicle.status}

                </span>
            </p>
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button
                variant="outline"
                onClick={()=>onEdit(vehicle)}
            >
                Edit
            </Button>
            <Button
                variant="destructive"
                onClick={()=>onDelete(vehicle._id)}
            >
                Delete
            </Button>
        </CardFooter>

    </Card>
    );

}