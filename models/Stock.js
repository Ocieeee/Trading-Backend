import mongoose from "mongoose";

const StockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    require: true,
    unique: true,
  },
  companyName: {
    type: String,
    require: true,
  },
  iconUrl: {
    type: String,
    require: true,
  },
  lastDayTraddedPrice: {
    type: Number,
    require: true,
  },
  currentPrice: {
    type: Number,
    require: true,
  },
  dayTimeSeries: {
    type: [Object],
    default: [],
  },
});

const Stock = mongoose.model("Stock", StockSchema);

export default Stock;
