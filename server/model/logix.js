import mongoose from "mongoose";

const logisticsSchema = new mongoose.Schema(
    {
        freightId: { type: String, required: true }, // Unique ID for the freight
        receivingDate: { type: Date }, // Optional field for when the freight was received
        dispatchDate: { type: Date }, // Optional field for when the freight was dispatched
        origin: { type: String, required: true }, // Origin of the freight
        destination: { type: String, required: true }, // Destination of the freight
        carrier: { type: String }, // Optional field for the carrier transporting the freight
        status: {
            type: String,
            enum: ["pending", "in transit", "delivered", "delayed"], // Enum values for different statuses
            default: "pending", // Default status is 'pending'
        },
        loadOptimization: {
            vehicleId: { type: String }, // ID of the vehicle used for transport
            utilization: { type: Number }, // Percentage of vehicle's capacity used
            route: { type: String }, // Route taken by the vehicle
            estimatedTimeArrival: { type: String }, // ETA for delivery
        },
        trackingNumber: { type: String, unique: true }, // Unique tracking number for the freight
        realTimeNotifications: [
            {
                notification: { type: String }, // Notification message
                date: { type: Date, default: Date.now }, // Date of notification
            },
        ],
        currentLocation: { type: String }, // New field for current location of cargo
        employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true }, // Reference to the employee handling the cargo
    },
    { timestamps: true }
);

const Logistics = mongoose.model("Logistics", logisticsSchema);
export default Logistics;
