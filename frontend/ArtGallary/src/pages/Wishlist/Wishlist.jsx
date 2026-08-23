import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Box,
  Text,
  Image,
  Grid,
  Stack,
  Badge,
  IconButton,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import { FiHeart } from "react-icons/fi";
import { API } from "../../API/api";

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchWishlist = () => {
    axios
      .get(`${API}/art/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setItems(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching wishlist:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWishlist();
  }, [token]);

  const removeItem = async (artId) => {
    try {
      await axios.delete(`${API}/art/wishlist/${artId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems((prev) => prev.filter((item) => item._id !== artId));
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }

  return (
    <Box bg="brand.100" minH="70vh" py={12} px={[4, 8]}>
      <Text fontSize={["28px", "36px"]} fontWeight={400} textAlign="center" mb={8}>
        Your Wishlist
      </Text>

      {items.length === 0 ? (
        <Flex direction="column" align="center" gap={4}>
          <Text fontSize="lg" color="gray.600">
            You haven&apos;t saved anything yet.
          </Text>
          <Link to="/art" style={{ color: "#B79B54", fontWeight: 600 }}>
            Browse artworks
          </Link>
        </Flex>
      ) : (
        <Grid
          gap={8}
          maxW="1100px"
          mx="auto"
          templateColumns={["repeat(1, 1fr)", "repeat(2, 1fr)", "repeat(3, 1fr)", "repeat(4, 1fr)"]}
        >
          {items.map((item) => (
            <Box key={item._id} bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
              <Box position="relative">
                <Link to={`/art/${item._id}`}>
                  <Image width="100%" h="200px" objectFit="cover" src={item.artImage[0]} alt={item.artName} />
                </Link>
                {item.stock <= 0 && (
                  <Badge position="absolute" top={2} left={2} colorScheme="red">
                    Out of Stock
                  </Badge>
                )}
                <IconButton
                  aria-label="Remove from wishlist"
                  icon={<FiHeart fill="#e53e3e" color="#e53e3e" />}
                  position="absolute"
                  top={2}
                  right={2}
                  size="sm"
                  bg="white"
                  onClick={() => removeItem(item._id)}
                />
              </Box>
              <Stack p={4} spacing={0}>
                <Text fontWeight={600} noOfLines={1}>
                  {item.artName}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {item.username}
                </Text>
                <Text color="brand.500" fontWeight={700} mt={1}>
                  ₹{item.artPrice}
                </Text>
              </Stack>
            </Box>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Wishlist;
