import { Schema } from "mongoose";

export const ProductSchema = new Schema({
    id: String,
    name: String,
    thumbnail_image: String,
    catalog: String,
    published_date: Date,
    price: Number,
    stock_quantity: Number
})

export const ProductDetailSchema = new Schema({
    id: String,
    name: String,
    thumbnail_image: String,
    catalog: String,
    published_date: Date,
    price: Number,
    stock_quantity: Number,
    // additional image, video and text descriptions make a ProductDTO into a ProductDetailDTO
    description_text: [String],
    description_images: [String],
    description_videos: [String]
})