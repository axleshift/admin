
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            min:2,
            max:100,
        },
        price:{
            type:Number,
            required:true,
        },
        description:{
            type:String,
            required:true,
        },
        category:{
            type:String,
            enum:["freightair","freightsea","freightland"],
            required:true,
        },
        rating: {
            type: Number,
            default: 0
          },
          supply: {
            type: Number,
            default: 0
          }
    },
    {timestamps:true}
)

const Product = mongoose.model("Product",ProductSchema)
export default Product