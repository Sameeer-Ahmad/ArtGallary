const { ArtModel } = require("../model/art.model");

const Painting = async (req, res) => {
  try {
    const painting = await ArtModel.find({ artCategory: "paintings" });
    res.status(200).send(painting);
  } catch (err) {
    console.log(err);
  }
};
const Print = async (req, res) => {
  try {
    const print = await ArtModel.find({ artCategory: "prints" });
    res.status(200).send(print);
  } catch (err) {
    console.log(err);
  }
};

const Sculpture = async (req, res) => {
  try {
    const sculpture = await ArtModel.find({ artCategory: "sculpture" });
    res.status(200).send(sculpture);
  } catch (err) {
    console.log(err);
  }
};

const Photography = async (req, res) => {
  try {
    const photography = await ArtModel.find({ artCategory: "photography" });
    res.status(200).send(photography);
  } catch (err) {
    console.log(err);
  }
};

const Inspiration = async (req, res) => {
  try {
    const Inspiration = await ArtModel.find({ artCategory: "inspiration" });
    res.status(200).send(Inspiration);
  } catch (err) {
    console.log(err);
  }
};

const Drawings = async (req, res) => {
  try {
    const Drawings = await ArtModel.find({ artCategory: "drawings" });
    res.status(200).send(Drawings);
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  Painting,
  Print,
  Sculpture,
  Photography,
  Inspiration,
  Drawings,
};
