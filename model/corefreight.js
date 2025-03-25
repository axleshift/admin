import mongoose from 'mongoose';

const AmountSchema = new mongoose.Schema({
    currency: { 
        type: String, 
        default: 'USD' 
    },
    value: { 
        type: Number, 
        required: true 
    }
});

const FreightSchema = new mongoose.Schema({
    user_id: { 
        type: String, 
        required: true 
    },
    is_import: { 
        type: Boolean, 
        default: false 
    },
    is_residential_address: { 
        type: Boolean, 
        default: false 
    },
    contains_danger_goods: { 
        type: Boolean, 
        default: false 
    },
    contains_documents: { 
        type: Boolean, 
        default: false 
    },
    type: { 
        type: String, 
        default: 'private' 
    },
    status: { 
        type: String, 
        default: 'to_pay' 
    },
    courier: { 
        type: String, 
        default: 'none' 
    },
    total_weight: { 
        type: Number, 
        default: 0 
    },
    number_of_items: { 
        type: Number, 
        default: 1 
    },
    amount: {
        type: AmountSchema,
        default: () => ({})
    },
    expected_delivery_date: { 
        type: Number 
    },
    country: { 
        type: String 
    },
    session_id: { 
        type: String 
    },
    tracking_number: { 
        type: String,
        unique: true 
    }
}, {
    timestamps: { 
        createdAt: 'created_at', 
        updatedAt: 'updated_at' 
    }
});

// Add index for faster querying
FreightSchema.index({ tracking_number: 1, user_id: 1 });

export default mongoose.model('Freight', FreightSchema);