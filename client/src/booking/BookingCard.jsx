import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card";



export default function BookingCard({booking}){
    return (
        <Card className="relative animate-fade">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">{booking.vehicleName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-gray-500">status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium
                        ${
                            //booking status
                            booking.status ==="accepted"
                            ?"bg-green-100 text-green-700"
                            :booking.status ==="rejected"
                            ?"bg-red-100 text-red-700"
                            :"bg-yellow-100 text-yellow-700"
                        }
                    `}>
                        {booking.status ==="pending" && "pending"}
                        {booking.status ==="accepted" && "accepted"}
                        {booking.status ==="rejected" && "rejected"}
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}