const { ArtModel } = require("../model/art.model");
const { CartModel } = require("../model/cart.model");
const { WishlistModel } = require("../model/wishlist.model");

const getArtByCategory = async (req, res) => {
  try {
    const getArtByCategory = await ArtModel.find();
    res.status(200).send(getArtByCategory);
  } catch (err) {
    console.log(err);
  }
};

const Painting = async (req, res) => {
  try {
    const painting = await ArtModel.find({ artCategory: "Painting" });
    res.status(200).send(painting);
  } catch (err) {
    console.log(err);
  }
};

const Print = async (req, res) => {
  try {
    const print = await ArtModel.find({ artCategory: "Print" });
    res.status(200).send(print);
  } catch (err) {
    console.log(err);
  }
};

const Sculpture = async (req, res) => {
  try {
    const sculpture = await ArtModel.find({ artCategory: "Sculpture" });
    res.status(200).send(sculpture);
  } catch (err) {
    console.log(err);
  }
};

const Photography = async (req, res) => {
  try {
    const photography = await ArtModel.find({ artCategory: "Photography" });
    res.status(200).send(photography);
  } catch (err) {
    console.log(err);
  }
};

const Inspiration = async (req, res) => {
  try {
    const Inspiration = await ArtModel.find({ artCategory: "Inspiration" });
    res.status(200).send(Inspiration);
  } catch (err) {
    console.log(err);
  }
};

const Drawings = async (req, res) => {
  try {
    const Drawings = await ArtModel.find({ artCategory: "Drawing" });
    res.status(200).send(Drawings);
  } catch (err) {
    console.log(err);
  }
};

const addToCart = async (req, res) => {
  const { artId, userID: userId } = req.body;
  const quantity = Number(req.body.quantity) || 1;
  try {
    const art = await ArtModel.findById(artId);
    if (!art) {
      return res.status(404).json({ error: "Art not found" });
    }
    if (art.stock <= 0) {
      return res.status(400).json({ error: "This item is out of stock" });
    }

    let cartItem = await CartModel.findOne({ userId, artId });
    const desiredQuantity = (cartItem ? cartItem.quantity : 0) + quantity;
    if (desiredQuantity > art.stock) {
      return res.status(400).json({ error: `Only ${art.stock} in stock` });
    }

    if (cartItem) {
      cartItem.quantity = desiredQuantity;
      await cartItem.save();
    } else {
      cartItem = new CartModel({ userId, artId, quantity: desiredQuantity });
      await cartItem.save();
    }

    res.status(200).send(cartItem);
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ error: "Could not add item to cart" });
  }
};

const getArtInCart = async (req, res) => {
  const { userID } = req.body;

  try {
    const cartItems = await CartModel.find({ userId: userID });

    const arts = await ArtModel.find({
      _id: { $in: cartItems.map((item) => item.artId) },
    });

    const artsWithQuantity = cartItems
      .map((cartItem) => {
        const art = arts.find((a) => a._id.toString() === cartItem.artId);
        if (!art) return null;
        return {
          ...art.toObject(),
          cartItemId: cartItem._id,
          quantity: cartItem.quantity,
        };
      })
      .filter(Boolean);

    res.status(200).send(artsWithQuantity);
  } catch (err) {
    console.error("Error getting cart items:", err);
    res.status(500).json({ error: "Could not get cart items" });
  }
};

const removeFromCart = async (req, res) => {
  const { id } = req.params;
  const { userID } = req.body;
  try {
    const existing = await CartModel.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Cart item not found" });
    }
    if (existing.userId !== userID) {
      return res.status(403).json({ error: "Not your cart item" });
    }
    await CartModel.findByIdAndDelete(id);
    res.status(200).json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Error deleting item from cart:", error);
    res.status(500).json({ error: "Could not remove item from cart" });
  }
};

const updateCartQuantity = async (req, res) => {
  const { id } = req.params;
  const { quantity, userID } = req.body;
  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: "Quantity must be at least 1" });
  }
  try {
    const existing = await CartModel.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Cart item not found" });
    }
    if (existing.userId !== userID) {
      return res.status(403).json({ error: "Not your cart item" });
    }
    const art = await ArtModel.findById(existing.artId);
    if (art && quantity > art.stock) {
      return res.status(400).json({ error: `Only ${art.stock} in stock` });
    }

    const cartItem = await CartModel.findByIdAndUpdate(
      id,
      { quantity },
      { new: true }
    );
    res.status(200).send(cartItem);
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    res.status(500).json({ error: "Could not update cart quantity" });
  }
};

const addToWishlist = async (req, res) => {
  const { artId, userID: userId } = req.body;
  try {
    const art = await ArtModel.findById(artId);
    if (!art) {
      return res.status(404).json({ error: "Art not found" });
    }
    const existing = await WishlistModel.findOne({ userId, artId });
    if (existing) {
      return res.status(200).send(existing);
    }
    const wishlistItem = new WishlistModel({ userId, artId });
    await wishlistItem.save();
    res.status(201).send(wishlistItem);
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ error: "Could not add to wishlist" });
  }
};

const getWishlist = async (req, res) => {
  const { userID } = req.body;
  try {
    const items = await WishlistModel.find({ userId: userID });
    const arts = await ArtModel.find({
      _id: { $in: items.map((item) => item.artId) },
    });
    const artsWithWishlistId = items
      .map((item) => {
        const art = arts.find((a) => a._id.toString() === item.artId);
        if (!art) return null;
        return { ...art.toObject(), wishlistItemId: item._id };
      })
      .filter(Boolean);
    res.status(200).send(artsWithWishlistId);
  } catch (error) {
    console.error("Error getting wishlist:", error);
    res.status(500).json({ error: "Could not get wishlist" });
  }
};

const removeFromWishlist = async (req, res) => {
  const { artId } = req.params;
  const { userID } = req.body;
  try {
    const existing = await WishlistModel.findOne({ userId: userID, artId });
    if (!existing) {
      return res.status(404).json({ error: "Wishlist item not found" });
    }
    await WishlistModel.findByIdAndDelete(existing._id);
    res.status(200).json({ message: "Removed from wishlist" });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ error: "Could not remove from wishlist" });
  }
};

const searchArt = async (req, res) => {
  const query = (req.query.q || "").trim();
  if (!query) {
    return res.status(200).send([]);
  }
  try {
    const results = await ArtModel.find({
      $or: [
        { artName: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
        { artCategory: { $regex: query, $options: "i" } },
      ],
    });
    res.status(200).send(results);
  } catch (error) {
    console.error("Error searching art:", error);
    res.status(500).json({ error: "Could not search art" });
  }
};

module.exports = {
  Painting,
  Print,
  Sculpture,
  Photography,
  Inspiration,
  Drawings,
  getArtByCategory,
  addToCart,
  getArtInCart,
  removeFromCart,
  updateCartQuantity,
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  searchArt,
};
