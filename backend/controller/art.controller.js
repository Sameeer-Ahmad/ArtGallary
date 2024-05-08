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



module.exports = {
  postArt,
 
};
