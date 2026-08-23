const { AddressModel } = require("../model/address.model");

const getAddresses = async (req, res) => {
  const { userID } = req.body;
  try {
    const addresses = await AddressModel.find({ userId: userID }).sort({ createdAt: -1 });
    res.status(200).json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ error: "Could not fetch addresses" });
  }
};

const addAddress = async (req, res) => {
  const { userID, name, phone, address, city, postalCode } = req.body;
  if (!name || !phone || !address || !city || !postalCode) {
    return res.status(400).json({ error: "All address fields are required" });
  }
  try {
    const saved = await AddressModel.create({ userId: userID, name, phone, address, city, postalCode });
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error saving address:", error);
    res.status(500).json({ error: "Could not save address" });
  }
};

const deleteAddress = async (req, res) => {
  const { id } = req.params;
  const { userID } = req.body;
  try {
    const existing = await AddressModel.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Address not found" });
    }
    if (existing.userId !== userID) {
      return res.status(403).json({ error: "Not your address" });
    }
    await AddressModel.findByIdAndDelete(id);
    res.status(200).json({ message: "Address deleted" });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ error: "Could not delete address" });
  }
};

module.exports = { getAddresses, addAddress, deleteAddress };
