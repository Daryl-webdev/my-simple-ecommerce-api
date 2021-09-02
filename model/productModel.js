const mongoose = require("mongoose");
const { Schema } = mongoose;

let productSchema = new Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  createdOn: {
    type: Date,
    default: new Date(),
  },
  productImage: String,
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
