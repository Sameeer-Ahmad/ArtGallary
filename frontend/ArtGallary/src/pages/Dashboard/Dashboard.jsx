import { useEffect, useState } from "react";
import axios from "axios";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Image,
  Text,
  Heading,
  Button,
  Stack,
  Skeleton,
  Link as ChakraLink,
} from "@chakra-ui/react";
import AOS from "aos";
import "aos/dist/aos.css";
import { API } from "../../API/api";

AOS.init();

const CATEGORIES = [
  { label: "Painting", route: "/art/paintings" },
  { label: "Sculpture", route: "/art/sculpture" },
  { label: "Photography", route: "/art/photography" },
  { label: "Drawing", route: "/art/drawings" },
  { label: "Print", route: "/art/prints" },
  { label: "Inspiration", route: "/art/inspiration" },
];

const Dashboard = () => {
  const [arts, setArts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    axios
      .get(`${API}/art`)
      .then((response) => {
        setArts(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching artworks:", error);
        setArts([]);
        setLoading(false);
      });
  }, []);

  const heroImages = arts.slice(0, 5).map((a) => a.artImage[0]);

  useEffect(() => {
    if (heroImages.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const artistCount = new Set(arts.map((a) => a.username)).size;

  const featured = [...arts]
    .sort(() => Math.random() - 0.5)
    .slice(0, 8);

  const categoryPreviews = CATEGORIES.map((cat) => ({
    ...cat,
    art: arts.find((a) => a.artCategory === cat.label),
  }));

  return (
    <Box bg="brand.100">
      {/* Hero */}
      <Box position="relative" h={["400px", "500px", "600px"]} overflow="hidden" bg="gray.800">
        {loading ? (
          <Skeleton height="100%" />
        ) : (
          heroImages.map((src, index) => (
            <Image
              key={index}
              src={src}
              alt=""
              position="absolute"
              top={0}
              left={0}
              w="100%"
              h="100%"
              objectFit="cover"
              opacity={index === heroIndex ? 0.55 : 0}
              transition="opacity 1.5s ease-in-out"
            />
          ))
        )}
        <Flex
          position="relative"
          direction="column"
          align="center"
          justify="center"
          h="100%"
          textAlign="center"
          px={4}
          color="white"
        >
          <Heading fontSize={["32px", "48px", "60px"]} fontFamily="heading" mb={4}>
            The Artline
          </Heading>
          <Text fontSize={["16px", "20px", "24px"]} maxW="600px" mb={8}>
            A curated marketplace of real, historical and contemporary art —
            from Raja Ravi Varma to Van Gogh — priced in ₹ and delivered to
            your door.
          </Text>
          <Stack direction={["column", "row"]} spacing={4}>
            <Button
              as={RouterLink}
              to="/art"
              size="lg"
              bg="brand.500"
              color="white"
              _hover={{ bg: "brand.600" }}
            >
              Explore Art
            </Button>
            <Button
              as={RouterLink}
              to="/signup"
              size="lg"
              variant="outline"
              borderColor="white"
              color="white"
              _hover={{ bg: "whiteAlpha.200" }}
            >
              Create Account
            </Button>
          </Stack>
        </Flex>
      </Box>

      {/* Stats */}
      <Flex
        justify="center"
        gap={[8, 16]}
        py={8}
        borderBottom="1px solid #D9D1C2"
        wrap="wrap"
      >
        <Stack align="center" spacing={0}>
          <Heading fontSize="30px" color="brand.500">
            {loading ? "—" : arts.length}
          </Heading>
          <Text color="gray.600">Artworks</Text>
        </Stack>
        <Stack align="center" spacing={0}>
          <Heading fontSize="30px" color="brand.500">
            {loading ? "—" : artistCount}
          </Heading>
          <Text color="gray.600">Artists</Text>
        </Stack>
        <Stack align="center" spacing={0}>
          <Heading fontSize="30px" color="brand.500">
            6
          </Heading>
          <Text color="gray.600">Categories</Text>
        </Stack>
      </Flex>

      {/* Category tiles */}
      <Box py={12} px={[4, 8]}>
        <Heading fontSize={["24px", "32px"]} textAlign="center" mb={8} fontFamily="heading">
          Browse by category
        </Heading>
        <Grid
          gap={6}
          templateColumns={["repeat(2, 1fr)", "repeat(3, 1fr)", "repeat(6, 1fr)"]}
        >
          {categoryPreviews.map((cat) => (
            <ChakraLink
              as={RouterLink}
              to={cat.route}
              key={cat.label}
              _hover={{ textDecoration: "none", opacity: 0.85 }}
            >
              <Box borderRadius="md" overflow="hidden" boxShadow="md" bg="white">
                <Skeleton isLoaded={!loading} height="140px">
                  {cat.art && (
                    <Image
                      src={cat.art.artImage[0]}
                      alt={cat.label}
                      w="100%"
                      h="140px"
                      objectFit="cover"
                    />
                  )}
                </Skeleton>
                <Text py={2} textAlign="center" fontWeight={600} fontSize="sm">
                  {cat.label}
                </Text>
              </Box>
            </ChakraLink>
          ))}
        </Grid>
      </Box>

      {/* Featured artworks */}
      <Box py={12} px={[4, 8]} borderTop="1px solid #D9D1C2">
        <Heading fontSize={["24px", "32px"]} textAlign="center" mb={8} fontFamily="heading">
          Featured artworks
        </Heading>
        <Grid
          gap={8}
          templateColumns={[
            "repeat(2, 1fr)",
            "repeat(2, 1fr)",
            "repeat(3, 1fr)",
            "repeat(4, 1fr)",
          ]}
        >
          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} height="260px" borderRadius="md" />
              ))
            : featured.map((art) => (
                <ChakraLink
                  as={RouterLink}
                  to={`/art/${art._id}`}
                  key={art._id}
                  _hover={{ textDecoration: "none" }}
                  data-aos="fade-up"
                >
                  <Box bg="white" borderRadius="md" boxShadow="md" overflow="hidden">
                    <Image
                      src={art.artImage[0]}
                      alt={art.artName}
                      w="100%"
                      h="200px"
                      objectFit="cover"
                    />
                    <Box p={4}>
                      <Text fontWeight={700} noOfLines={1}>
                        {art.artName}
                      </Text>
                      <Text fontSize="sm" color="gray.600" noOfLines={1}>
                        {art.username}
                      </Text>
                      <Text color="brand.500" fontWeight={600} mt={1}>
                        ₹{art.artPrice}
                      </Text>
                    </Box>
                  </Box>
                </ChakraLink>
              ))}
        </Grid>
      </Box>

      {/* Bottom CTA */}
      <Flex
        direction="column"
        align="center"
        py={16}
        px={4}
        bg="brand.500"
        color="white"
        textAlign="center"
      >
        <Heading fontSize={["24px", "32px"]} mb={4} fontFamily="heading">
          Start your collection today
        </Heading>
        <Text mb={6} maxW="500px">
          Sign up to buy, save favourites, and check out securely with
          Razorpay.
        </Text>
        <Button
          as={RouterLink}
          to="/signup"
          size="lg"
          bg="white"
          color="brand.500"
          _hover={{ bg: "gray.100" }}
        >
          Sign Up Free
        </Button>
      </Flex>
    </Box>
  );
};

export default Dashboard;
