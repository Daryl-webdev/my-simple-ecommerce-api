const mongoose = require("mongoose");
const { Schema } = mongoose;

let productInfoSchema = new Schema({
  productId: String,
  productPrice: Number,
  productName: String,
  productImage: String,
  productDescription: String,
  productQty: { type: Number, default: 1 },
  purchacedOn: {
    type: Date,
    default: new Date(),
  },
});

let orderSchema = new Schema({
  totalAmount: Number,
  userName: String,
  userId: String,
  productInfo: [productInfoSchema],
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
