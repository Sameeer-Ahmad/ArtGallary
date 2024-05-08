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
const deleteArt=async(req,res)=>{
    const{id}=req.params
    try{
        const deleteArt=await ArtModel.findByIdAndDelete(id);
        res.status(200).send(deleteArt)
    }catch(err){
        console.log(err);
        console.log("Not able to delete art");
    }
}
module.exports = {
  postArt,
  getArt,
  deleteArt
};
