import mongoose from "mongoose";

const holdingSchema = new mongoose.Schema({
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
  buyPrice: {
    type: Number,
    required: true,
  },
});

const Holding = mongoose.model("Holding", holdingSchema);

export default Holding;
