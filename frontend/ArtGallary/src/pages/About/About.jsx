import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Box, Flex, Grid, Heading, Image, Skeleton, Text } from "@chakra-ui/react";
import { API } from "../../API/api";

const STATS = [
  { label: "Artworks", key: "count" },
  { label: "Artists", key: "artists" },
  { label: "Categories", key: "categories" },
];

const About = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [stats, setStats] = useState({ count: 0, artists: 0, categories: 6 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API}/art`)
      .then((response) => {
        const data = response.data;
        const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 6);
        setImages(shuffled);
        setSelectedImage(shuffled[0] || null);
        setStats({
          count: data.length,
          artists: new Set(data.map((a) => a.username)).size,
          categories: 6,
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching artworks:", error);
        setLoading(false);
      });
  }, []);

  return (
    <Box bg="brand.100" pb={16}>
      <Box px={[4, 8]} pt={10} pb={6} textAlign="center">
        <Heading fontFamily="heading" fontSize={["32px", "44px"]}>
          About The Artline
        </Heading>
        <Text color="gray.600" mt={3} maxW="700px" mx="auto">
          The Artline is a curated online marketplace for real art — from
          Renaissance and Mughal masters to 19th-century photography and
          modern Indian painters — priced in ₹ and delivered to your door.
        </Text>
      </Box>

      <Box px={[4, 8]} mb={10}>
        <Flex direction="column" alignItems="center">
          <Box borderRadius="lg" overflow="hidden" mb={4} width={["100%", "80%"]}>
            <Skeleton isLoaded={!loading} minH="300px">
              {selectedImage && (
                <Image
                  src={selectedImage.artImage[0]}
                  alt={selectedImage.artName}
                  width="100%"
                  maxH="480px"
                  objectFit="cover"
                />
              )}
            </Skeleton>
          </Box>
          <Flex gap={2} wrap="wrap" justify="center" width={["100%", "60%"]}>
            {images.map((art) => (
              <Box key={art._id} boxSize="80px" cursor="pointer" onClick={() => setSelectedImage(art)}>
                <Image
                  width="100%"
                  h="100%"
                  objectFit="cover"
                  src={art.artImage[0]}
                  alt={art.artName}
                  borderRadius="sm"
                  opacity={selectedImage?._id === art._id ? 1 : 0.6}
                />
              </Box>
            ))}
          </Flex>
        </Flex>
      </Box>

      <Grid
        px={[4, 8]}
        mb={12}
        gap={6}
        templateColumns={["repeat(1, 1fr)", "repeat(3, 1fr)"]}
        maxW="700px"
        mx="auto"
        textAlign="center"
      >
        {STATS.map((s) => (
          <Box key={s.label}>
            <Heading fontSize="30px" color="brand.500">
              {stats[s.key]}
            </Heading>
            <Text color="gray.600">{s.label}</Text>
          </Box>
        ))}
      </Grid>

      <Box px={[4, 8]} maxW="700px" mx="auto">
        <Text mb={4} color="gray.700">
          Every listing on The Artline is a real, verified public-domain
          artwork — no filler, no stock photography. We built this as a
          practical project to explore what a modern, India-first art
          marketplace could look like: real browsing and search, a working
          cart, and secure checkout via Razorpay.
        </Text>
        <Text color="gray.700">
          Have a question or want to get in touch? Visit our{" "}
          <Link to="/contactus" style={{ color: "#B79B54", fontWeight: 600 }}>
            Contact page
          </Link>
          .
        </Text>
      </Box>
    </Box>
  );
};

export default About;
