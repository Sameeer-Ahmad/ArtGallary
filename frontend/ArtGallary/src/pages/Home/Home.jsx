import {
  Box,
  Flex,
  Grid,
  Image,
  Skeleton,
  Stack,
  Text,
  Heading,
  Button,
  IconButton,
} from "@chakra-ui/react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FiHeart } from "react-icons/fi";
import { API } from "../../API/api";
import { useWishlist } from "../../hooks/useWishlist";

const CATEGORIES = [
  { label: "Painting", route: "/art/paintings" },
  { label: "Sculpture", route: "/art/sculpture" },
  { label: "Photography", route: "/art/photography" },
  { label: "Drawing", route: "/art/drawings" },
  { label: "Print", route: "/art/prints" },
  { label: "Inspiration", route: "/art/inspiration" },
];

/* eslint-disable react/prop-types */
const ArtCard = ({ art, isWishlisted, onToggleWishlist }) => (
  <Box bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
    <Box position="relative">
      <Link to={`/art/${art._id}`}>
        <Image
          width={"100%"}
          h="220px"
          objectFit="cover"
          src={art.artImage[0]}
          alt={art.artName}
        />
      </Link>
      <IconButton
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        icon={
          <FiHeart
            fill={isWishlisted ? "#e53e3e" : "none"}
            color={isWishlisted ? "#e53e3e" : "white"}
          />
        }
        size="sm"
        borderRadius="full"
        bg="blackAlpha.500"
        _hover={{ bg: "blackAlpha.700" }}
        position="absolute"
        top={2}
        left={2}
        onClick={(e) => {
          e.preventDefault();
          onToggleWishlist(art._id);
        }}
      />
    </Box>
    <Link to={`/art/${art._id}`}>
      <Stack pt={4} pl={4} pb={4} gap={0}>
        <Text fontWeight={600} noOfLines={1}>
          {art.artName}
        </Text>
        <Text fontSize="sm" color="gray.500">
          {art.artCategory}
        </Text>
        <Text color="brand.500" fontWeight={700} mt={1}>
          ₹{art.artPrice}
        </Text>
      </Stack>
    </Link>
  </Box>
);
/* eslint-enable react/prop-types */

const Home = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const [allArts, setAllArts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const { wishlistIds, toggleWishlist } = useWishlist();

  useEffect(() => {
    axios
      .get(`${API}/art`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setAllArts(response.data);
        const shuffled = [...response.data].sort(() => Math.random() - 0.5);
        setTrending(shuffled.slice(0, 8));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching paintings:", error);
        setAllArts([]);
        setTrending([]);
        setLoading(false);
      });
  }, [token]);

  const newArrivals = [...allArts]
    .sort((a, b) => b.created_at - a.created_at)
    .slice(0, 4);

  const categoryPreviews = CATEGORIES.map((cat) => ({
    ...cat,
    art: allArts.find((a) => a.artCategory === cat.label),
  }));

  const artistCounts = allArts.reduce((acc, art) => {
    acc[art.username] = (acc[art.username] || 0) + 1;
    return acc;
  }, {});
  const topArtists = Object.entries(artistCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([username]) => ({
      username,
      art: allArts.find((a) => a.username === username),
    }));

  return (
    <Box bg="brand.100" pb={16}>
      <Box px={[4, 8]} pt={10} pb={6}>
        <Heading fontFamily="heading" fontSize={["28px", "36px"]}>
          Welcome back{username ? `, ${username}` : ""}
        </Heading>
        <Text color="gray.600" mt={2}>
          Here&apos;s what&apos;s new in the gallery today.
        </Text>
      </Box>


      <Grid
        px={[4, 8]}
        pb={10}
        gap={6}
        templateColumns={["repeat(2, 1fr)", "repeat(3, 1fr)", "repeat(6, 1fr)"]}
      >
        {categoryPreviews.map((cat) => (
          <Link key={cat.label} to={cat.route}>
            <Box borderRadius="md" overflow="hidden" boxShadow="md" bg="white">
              <Skeleton isLoaded={!loading} height="120px">
                {cat.art && (
                  <Image
                    src={cat.art.artImage[0]}
                    alt={cat.label}
                    w="100%"
                    h="120px"
                    objectFit="cover"
                  />
                )}
              </Skeleton>
              <Text py={2} textAlign="center" fontWeight={600} fontSize="sm">
                {cat.label}
              </Text>
            </Box>
          </Link>
        ))}
      </Grid>

      <Box px={[4, 8]} mb={12}>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading fontFamily="heading" fontSize={["22px", "28px"]}>
            New arrivals
          </Heading>
        </Flex>
        <Grid
          gap={8}
          templateColumns={[
            "repeat(1, 1fr)",
            "repeat(2, 1fr)",
            "repeat(4, 1fr)",
          ]}
        >
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} height="280px" borderRadius="md" />
              ))
            : newArrivals.map((art) => (
                <ArtCard
                  key={art._id}
                  art={art}
                  isWishlisted={wishlistIds.has(art._id)}
                  onToggleWishlist={toggleWishlist}
                />
              ))}
        </Grid>
      </Box>

      <Box px={[4, 8]} mb={12}>
        <Heading fontFamily="heading" fontSize={["22px", "28px"]} mb={6}>
          Shop by artist
        </Heading>
        <Grid
          gap={6}
          templateColumns={["repeat(2, 1fr)", "repeat(3, 1fr)", "repeat(6, 1fr)"]}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} height="160px" borderRadius="md" />
              ))
            : topArtists.map(({ username: artistName, art }) => (
                <Link key={artistName} to={`/artist/${encodeURIComponent(artistName)}`}>
                  <Box borderRadius="md" overflow="hidden" boxShadow="md" bg="white">
                    {art && (
                      <Image
                        src={art.artImage[0]}
                        alt={artistName}
                        w="100%"
                        h="120px"
                        objectFit="cover"
                      />
                    )}
                    <Text py={2} textAlign="center" fontWeight={600} fontSize="sm" noOfLines={1} px={2}>
                      {artistName}
                    </Text>
                  </Box>
                </Link>
              ))}
        </Grid>
      </Box>

      <Box px={[4, 8]}>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading fontFamily="heading" fontSize={["22px", "28px"]}>
            Trending artworks
          </Heading>
          <Button variant="outline" onClick={() => navigate("/art")}>
            View all
          </Button>
        </Flex>
        <Grid
          gap={8}
          templateColumns={[
            "repeat(1, 1fr)",
            "repeat(2, 1fr)",
            "repeat(3, 1fr)",
            "repeat(4, 1fr)",
          ]}
        >
          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} height="280px" borderRadius="md" />
              ))
            : trending.map((art) => (
                <ArtCard
                  key={art._id}
                  art={art}
                  isWishlisted={wishlistIds.has(art._id)}
                  onToggleWishlist={toggleWishlist}
                />
              ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Home;
