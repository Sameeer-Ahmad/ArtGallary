import { Box, Image, Stack, Text, Badge, IconButton } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";

/* eslint-disable react/prop-types */
const ArtCard = ({ art, isWishlisted, onToggleWishlist }) => (
  <Box bg="#f5f1ee" borderRadius="md" boxShadow="md">
    <Box position="relative">
      <Link to={`/art/${art._id}`}>
        <Image width="100%" objectFit="cover" src={art.artImage[0]} alt={art.artName} />
      </Link>
      {art.stock <= 0 && (
        <Badge position="absolute" top={2} right={2} colorScheme="red">
          Out of Stock
        </Badge>
      )}
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
          e.stopPropagation();
          onToggleWishlist(art._id);
        }}
      />
    </Box>
    <Link to={`/art/${art._id}`}>
      <Stack pt={5} pl={4} pb={5} gap={0} bg="white">
        <Text fontWeight={400} fontSize="17px" lineHeight="21px" letterSpacing="1px">
          {art.artName}
        </Text>
        <Text fontSize="17px" color="rgb(183, 155, 84)" letterSpacing="1px">
          {art.username}
        </Text>
        <Text fontSize="17px" color="rgb(183, 155, 84)" letterSpacing="1px">
          {art.artCategory}
        </Text>
        <Text fontSize="17px" fontWeight={700} color="rgb(183, 155, 84)" letterSpacing="1px">
          ₹{art.artPrice}
        </Text>
      </Stack>
    </Link>
  </Box>
);

export default ArtCard;
