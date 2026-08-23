import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Flex, Heading, Text, Image } from "@chakra-ui/react";

const HERO_IMAGES = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/VanGogh-starry_night_ballance1.jpg/1280px-VanGogh-starry_night_ballance1.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Claude_Monet_044.jpg/1280px-Claude_Monet_044.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Mona_Lisa.jpg/1280px-Mona_Lisa.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/c/c9/Sairandhri%2C_by_Raja_Ravi_Varma.jpg",
];

// eslint-disable-next-line react/prop-types
const AuthLayout = ({ title, subtitle, children }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Flex minH="100vh">
      <Box
        display={["none", "none", "block"]}
        flex="1"
        position="relative"
        bg="gray.800"
        overflow="hidden"
      >
        {HERO_IMAGES.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt=""
            position="absolute"
            top={0}
            left={0}
            w="100%"
            h="100%"
            objectFit="cover"
            opacity={i === index ? 0.6 : 0}
            transition="opacity 1.5s ease-in-out"
          />
        ))}
        <Flex
          position="relative"
          direction="column"
          justify="flex-end"
          h="100%"
          p={12}
          color="white"
        >
          <Link to="/">
            <Heading fontFamily="heading" fontSize="36px" mb={2}>
              The Artline
            </Heading>
          </Link>
          <Text fontSize="lg" maxW="380px">
            Real, curated art — from Raja Ravi Varma to Van Gogh — priced in
            ₹ and delivered to your door.
          </Text>
        </Flex>
      </Box>

      <Flex
        flex="1"
        align="center"
        justify="center"
        bg="brand.100"
        p={8}
      >
        <Box w="100%" maxW="400px">
          <Link to="/">
            <Heading
              fontFamily="heading"
              fontSize="28px"
              color="brand.500"
              mb={8}
              display={["block", "block", "none"]}
              textAlign="center"
            >
              The Artline
            </Heading>
          </Link>
          <Text mb={4}>
            <Link to="/" style={{ color: "#B79B54", fontWeight: 600 }}>
              &larr; Back to home
            </Link>
          </Text>
          <Heading fontSize="32px" mb={2}>
            {title}
          </Heading>
          {subtitle && (
            <Text color="gray.600" mb={8}>
              {subtitle}
            </Text>
          )}
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default AuthLayout;
