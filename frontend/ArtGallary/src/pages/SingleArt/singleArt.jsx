import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Image,
  Text,
  Flex,
  Stack,
  Button,
  IconButton,
  Badge,
  Spinner,
  Textarea,
  Select,
  Link as ChakraLink,
  useToast,
} from "@chakra-ui/react";
import { AddIcon, MinusIcon, StarIcon } from "@chakra-ui/icons";
import { FiHeart } from "react-icons/fi";
import { API } from "../../API/api";
import {
  getGuestCart,
  addToGuestCart,
  updateGuestCartQuantity,
  removeFromGuestCart,
} from "../../API/guestCart";

const CATEGORY_ROUTES = {
  Painting: "/art/paintings",
  Print: "/art/prints",
  Sculpture: "/art/sculpture",
  Photography: "/art/photography",
  Drawing: "/art/drawings",
  Inspiration: "/art/inspiration",
};

const SingleArt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [art, setArt] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [cartItemId, setCartItemId] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const token = localStorage.getItem("token");
  const [currentUserID, setUserID] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [canReview, setCanReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const toast = useToast();
  useEffect(() => {
    axios
      .get(`${API}/artist/get/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setArt(response.data.getArtById);
        setUserID(response.data.userID);
      })
      .catch((error) => {
        console.error("Error fetching art:", error);
        setArt(null);
        setNotFound(true);
      });
  }, [id, token]);

  useEffect(() => {
    if (!token) {
      const existing = getGuestCart().find((item) => item.artId === id);
      if (existing) {
        setCartItemId("guest");
        setQuantity(existing.quantity);
      }
      return;
    }
    axios
      .get(`${API}/art/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const existing = response.data.find((item) => item._id === id);
        if (existing) {
          setCartItemId(existing.cartItemId);
          setQuantity(existing.quantity);
        }
      })
      .catch((error) => console.error("Error fetching cart:", error));
  }, [id, token]);

  const showError = (error, fallback) => {
    toast({
      title: error.response?.data?.error || fallback,
      status: "error",
      isClosable: true,
    });
  };

  const addToCart = async (userId, artId) => {
    if (!token) {
      addToGuestCart(artId, 1);
      setCartItemId("guest");
      setQuantity((q) => q + 1);
      toast({
        title: "Item added to cart",
        status: "success",
        isClosable: true,
      });
      return;
    }
    try {
      const response = await axios.post(
        `${API}/art/addToCart`,
        { userId, artId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItemId(response.data._id);
      setQuantity(response.data.quantity);
      toast({
        title: "Item added to cart",
        status: "success",
        isClosable: true,
      });
      window.dispatchEvent(new Event("cart:updated"));
    } catch (error) {
      console.error("Error adding item to cart:", error);
      showError(error, "Could not add item to cart");
    }
  };

  const changeQuantity = async (delta) => {
    const newQuantity = quantity + delta;

    if (!token) {
      if (newQuantity < 1) {
        removeFromGuestCart(id);
        setCartItemId(null);
        setQuantity(0);
      } else {
        updateGuestCartQuantity(id, newQuantity);
        setQuantity(newQuantity);
      }
      return;
    }

    if (newQuantity < 1) {
      try {
        await axios.delete(`${API}/art/removeFromCart/${cartItemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartItemId(null);
        setQuantity(0);
        window.dispatchEvent(new Event("cart:updated"));
      } catch (error) {
        console.error("Error removing item from cart:", error);
        showError(error, "Could not remove item from cart");
      }
      return;
    }
    try {
      await axios.patch(
        `${API}/art/updateCartQuantity/${cartItemId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuantity(newQuantity);
      window.dispatchEvent(new Event("cart:updated"));
    } catch (error) {
      console.error("Error updating quantity:", error);
      showError(error, "Could not update quantity");
    }
  };

  useEffect(() => {
    if (art) {
      const interval = setInterval(() => {
        setImageIndex((prevIndex) => (prevIndex + 1) % art.artImage.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [art]);

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API}/art/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setIsWishlisted(response.data.some((item) => item._id === id));
      })
      .catch((error) => console.error("Error fetching wishlist:", error));
  }, [id, token]);

  const fetchReviews = () => {
    axios
      .get(`${API}/reviews/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((response) => {
        setReviews(response.data.reviews);
        setAverageRating(response.data.average);
        setReviewCount(response.data.count);
        setCanReview(response.data.canReview);
      })
      .catch((error) => console.error("Error fetching reviews:", error));
  };

  useEffect(() => {
    fetchReviews();
  }, [id]);

  const toggleWishlist = async () => {
    if (!token) {
      toast({ title: "Please sign in to save items", status: "info", isClosable: true });
      navigate("/login");
      return;
    }
    try {
      if (isWishlisted) {
        await axios.delete(`${API}/art/wishlist/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsWishlisted(false);
      } else {
        await axios.post(
          `${API}/art/wishlist`,
          { artId: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      showError(error, "Could not update wishlist");
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!token) {
      toast({ title: "Please sign in to leave a review", status: "info", isClosable: true });
      navigate("/login");
      return;
    }
    setSubmittingReview(true);
    try {
      await axios.post(
        `${API}/reviews/${id}`,
        { rating: Number(newRating), comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment("");
      fetchReviews();
      toast({ title: "Review submitted", status: "success", isClosable: true });
    } catch (error) {
      showError(error, "Could not submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (notFound) {
    return (
      <Flex direction="column" justify="center" align="center" minH="60vh" gap={4}>
        <Text fontSize="xl">This artwork could not be found.</Text>
        <Button onClick={() => navigate("/art")}>Browse artworks</Button>
      </Flex>
    );
  }

  if (!art) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }

  return (
    <Box
      bg={"rgb(250,248,244)"}
      h={"auto"}
      pt={16}
      border={"1px solid rgb(250,248,244)"}
      borderRadius={"10px"}
    >
      <Flex
        flexDir={["column", "column", "column", "row"]}
        m={8}
        bg={"#f5f1ee"}
        gap={8}
      >
        <Box
          width={["100%", "100%", "100%", "50%"]}
          minH={["300px", "300px", "300px", "300px"]}
          maxH={["500px", "500px", "500px", "500px"]}
        >
          {art.artImage && (
            <Image
              pt={16}
              m={"auto"}
              width={"90%"}
              maxH={["450px", "450px", "450px", "490px"]}
              objectFit="cover"
              src={art.artImage[imageIndex]}
              alt={art.artName}
            />
          )}
        </Box>
        <Box
          width={["100%", "100%", "100%", "50%"]}
          pt={5}
          pb={5}
          gap={0}
          bg={"white"}
        >
          <Text
            pl={10}
            fontSize={["20px", "30px", "35px", "40px", "50px"]}
            fontFamily={"Addington CF"}
          >
            {art.artName}
          </Text>
          <Text pl={10} pb={6} fontSize="lg" _hover={{ color: "#b79b54" }}>
            By{" "}
            <Link
              to={`/artist/${encodeURIComponent(art.username)}`}
              style={{
                fontSize: "26px",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              {art.username}
            </Link>
          </Text>
          <Flex pl={10} align="center" gap={4}>
            <Text
              fontSize={["20px", "20px", "30px", "30px", "30px"]}
              color={"#b79b54"}
              fontFamily={"Addington CF"}
            >
              ₹{art.artPrice}
            </Text>
            {art.stock <= 0 ? (
              <Badge colorScheme="red">Out of Stock</Badge>
            ) : (
              <Badge colorScheme="green">In Stock ({art.stock})</Badge>
            )}
            <IconButton
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              icon={<FiHeart fill={isWishlisted ? "#e53e3e" : "none"} color="#e53e3e" />}
              size="sm"
              variant="outline"
              onClick={toggleWishlist}
            />
          </Flex>
          {reviewCount > 0 && (
            <Flex pl={10} align="center" gap={2} mt={2}>
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  color={star <= Math.round(averageRating) ? "#b79b54" : "gray.300"}
                  boxSize={4}
                />
              ))}
              <Text fontSize="sm" color="gray.600">
                {averageRating.toFixed(1)} ({reviewCount} review{reviewCount === 1 ? "" : "s"})
              </Text>
            </Flex>
          )}
          <p
            style={{
              borderTop: "1px solid rgb(183, 155, 84)",
              width: "90%",
              margin: "10px auto",
              textAlign: "start",
              paddingRight: "40px",
            }}
          ></p>
          <Flex justifyContent={"space-between"}>
            <Text
              pl={10}
              fontSize={["16px", "18px", "24px", "24px", "24px"]}
              fontFamily={"Addington CF"}
            >
              Overview
            </Text>
            <Text pr={10} fontFamily={"Addington CF"}>
              ___
            </Text>
          </Flex>
          <Stack pl={10} fontSize="18px" spacing={2}>
            <Flex gap={2}>
              <Text color="gray.500">Category:</Text>
              <ChakraLink
                as={Link}
                to={CATEGORY_ROUTES[art.artCategory] || "/art"}
                color="#b79b54"
                textDecoration="underline"
              >
                {art.artCategory}
              </ChakraLink>
            </Flex>
            <Flex gap={2}>
              <Text color="gray.500">Dimensions:</Text>
              <Text>{art.artDimension}</Text>
            </Flex>
            <Flex gap={2}>
              <Text color="gray.500">Added:</Text>
              <Text>{new Date(art.created_at).toLocaleDateString()}</Text>
            </Flex>
          </Stack>
          <Text
            pl={8}
            pt={3}
            pb={3}
            fontSize="14px"
            color={"rgb(0, 0, 0, 0.48)"}
          >
            Note: Actual colours may very due to photography & computer settings
          </Text>
          <p
            style={{
              borderTop: "1px solid rgb(183, 155, 84)",
              width: "90%",
              margin: "10px auto",
              textAlign: "start",
              paddingRight: "40px",
            }}
          ></p>
          <Text
            pl={10}
            fontSize={["16px", "18px", "24px", "24px", "24px"]}
            fontFamily={"Addington CF"}
          >
            Shipping
          </Text>
          <Text pl={10} fontSize={["14px", "14px", "18px", "18px", "18px"]}>
            <li>Estimated delivery for this item is 3 - 5 business days</li>
          </Text>
          <Text pl={10} fontSize={["14px", "14px", "18px", "18px", "18px"]}>
            <li>Please note that item requires crating for shipment</li>
          </Text>
          <Text
            pl={10}
            pb={3}
            fontSize={["14px", "14px", "18px", "18px", "18px"]}
          >
            <li>Shipping cost will be calculated upon checkout</li>
          </Text>
          <p
            style={{
              borderTop: "1px solid rgb(183, 155, 84)",
              width: "90%",
              margin: "10px auto",
              textAlign: "start",
              paddingRight: "40px",
            }}
          ></p>
          <Flex mt={8} justifyContent={"center"}>
            {art.stock <= 0 ? (
              <Button
                borderRadius={"1px"}
                size={"lg"}
                color={"white"}
                width={"80%"}
                bg={"gray.400"}
                isDisabled
              >
                Out of Stock
              </Button>
            ) : cartItemId ? (
              <Flex
                align="center"
                justify="center"
                gap={6}
                width={"80%"}
                borderRadius={"1px"}
                bg={"rgb(183,155,84)"}
                py={2}
              >
                <IconButton
                  aria-label="Decrease quantity"
                  icon={<MinusIcon />}
                  size="sm"
                  onClick={() => changeQuantity(-1)}
                />
                <Text color="white" fontSize="lg" minW={6} textAlign="center">
                  {quantity}
                </Text>
                <IconButton
                  aria-label="Increase quantity"
                  icon={<AddIcon />}
                  size="sm"
                  isDisabled={quantity >= art.stock}
                  onClick={() => changeQuantity(1)}
                />
              </Flex>
            ) : (
              <Button
                borderRadius={"1px"}
                size={"lg"}
                color={"white"}
                width={"80%"}
                bg={"rgb(183,155,84)"}
                _hover={{ bg: "#B79B19" }}
                onClick={() => addToCart(currentUserID, art._id)}
              >
                Add to Cart
              </Button>
            )}
          </Flex>
        </Box>
      </Flex>

      <Box bg="white" m={8} p={8} borderRadius="md">
        <Text fontSize="24px" mb={6}>
          Reviews {reviewCount > 0 && `(${reviewCount})`}
        </Text>

        {reviews.length === 0 ? (
          <Text color="gray.500" mb={6}>
            No reviews yet — be the first to share your thoughts.
          </Text>
        ) : (
          <Stack spacing={4} mb={8}>
            {reviews.map((review) => (
              <Box key={review._id} borderBottom="1px solid #eee" pb={4}>
                <Flex align="center" gap={2} mb={1}>
                  <Text fontWeight={700}>{review.username}</Text>
                  <Flex>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        boxSize={3}
                        color={star <= review.rating ? "#b79b54" : "gray.300"}
                      />
                    ))}
                  </Flex>
                </Flex>
                {review.comment && <Text color="gray.700">{review.comment}</Text>}
              </Box>
            ))}
          </Stack>
        )}

        {canReview ? (
          <Box as="form" onSubmit={submitReview} maxW="500px">
            <Text fontWeight={600} mb={2}>
              Leave a review
            </Text>
            <Flex gap={4} mb={3}>
              <Select
                value={newRating}
                onChange={(e) => setNewRating(e.target.value)}
                w="140px"
                bg="white"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} star{n === 1 ? "" : "s"}
                  </option>
                ))}
              </Select>
            </Flex>
            <Textarea
              placeholder="Share your thoughts (optional)"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              bg="white"
              mb={3}
            />
            <Button type="submit" isDisabled={submittingReview}>
              {submittingReview ? <Spinner size="sm" color="white" /> : "Submit Review"}
            </Button>
          </Box>
        ) : (
          <Text color="gray.500" fontSize="sm">
            {token
              ? "You can leave a review once this artwork has been delivered to you."
              : "Sign in and purchase this artwork to leave a review once it's delivered."}
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default SingleArt;
