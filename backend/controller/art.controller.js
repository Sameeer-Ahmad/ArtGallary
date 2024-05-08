const { ArtModel } = require("../model/art.model");

const postArt = async (req, res) => {
  try {
    const art = new ArtModel(req.body);
    await art.save();
    res.status(201).send(art);
  } catch (err) {
    console.log(err);
    res.status(500).send("Not able to create art");
  }
};

const getArt = async (req, res) => {
  try {
    const getArt = await ArtModel.find();
    res.status(200).send(getArt);
  } catch (err) {
    console.log(err);
    console.log("Not able to get art");
  }
};

const deleteArt = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteArt = await ArtModel.findByIdAndDelete(id);
    res.status(200).send(deleteArt);
  } catch (err) {
    console.log(err);
    console.log("Not able to delete art");
  }
};

const updateArt = async (req, res) => {
  const { id } = req.params;
  try {
    const updateArt = await ArtModel.findByIdAndUpdate(id, req.body);
    res.status(200).send(updateArt);
  } catch (err) {
    console.log(err);
    console.log("Not able to update art");
  }
};

const getArtById = async (req, res) => {
  const { id } = req.params;
  try {
    const getArtById = await ArtModel.findById(id);
    res.status(200).send(getArtById);
  } catch (err) {
    console.log(err);
    console.log("Not able to get art by id");
  }
};

module.exports = {
  postArt,
  getArt,
  deleteArt,
  updateArt,
  getArtById,
};
