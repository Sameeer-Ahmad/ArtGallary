const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const AddressModel = mongoose.model("address", addressSchema);

module.exports = { AddressModel };
