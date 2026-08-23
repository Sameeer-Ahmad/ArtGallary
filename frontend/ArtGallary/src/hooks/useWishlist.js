import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { API } from "../API/api";

export const useWishlist = () => {
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API}/art/wishlist`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setWishlistIds(new Set(res.data.map((item) => item._id))))
      .catch((err) => console.error("Error fetching wishlist:", err));
  }, [token]);

  const toggleWishlist = useCallback(
    async (artId) => {
      if (!token) {
        toast({ title: "Please sign in to save items", status: "info", isClosable: true });
        navigate("/login");
        return;
      }
      const wasSaved = wishlistIds.has(artId);
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.delete(artId);
        else next.add(artId);
        return next;
      });
      try {
        if (wasSaved) {
          await axios.delete(`${API}/art/wishlist/${artId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          await axios.post(
            `${API}/art/wishlist`,
            { artId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } catch (err) {
        console.error("Error updating wishlist:", err);
        setWishlistIds((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.add(artId);
          else next.delete(artId);
          return next;
        });
        toast({ title: "Could not update wishlist", status: "error", isClosable: true });
      }
    },
    [wishlistIds, token, navigate, toast]
  );

  return { wishlistIds, toggleWishlist };
};
