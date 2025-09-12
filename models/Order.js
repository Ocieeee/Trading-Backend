import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  stock: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stock",
    require: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    require: true,
  },
  type: {
    type: String,
    enum: ["buy", "Sell"],
    require: true,
  },
  timeStamp: {
    type: Date,
    default: Date.now,
  },
  remainingBalance: {
    type: Number,
    require: true,
    set: function (value) {
      return this.parseFloat(value.toFixed(2));
    },
  },
});

const Order = mongoose.model("Order", OrderSchema);

export default Order;
