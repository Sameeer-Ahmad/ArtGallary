import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Box,
  Text,
  Grid,
  Flex,
  Skeleton,
  Select,
  Spinner,
} from "@chakra-ui/react";
import { API } from "../../API/api";
import ArtCard from "../../Component/ArtCard/ArtCard";
import { useWishlist } from "../../hooks/useWishlist";

const PAGE_SIZE = 15;

const Inspiration = () => {
  const [arts, setArts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sortBy, setSortBy] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const sentinelRef = useRef(null);
  const { wishlistIds, toggleWishlist } = useWishlist();

  useEffect(() => {
    axios
      .get(`${API}/art/inspiration`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        let sortedArts = response.data;
        if (sortBy === "Newest") {
          sortedArts = sortedArts.sort((a, b) => b.created_at - a.created_at);
        } else if (sortBy === "Low to High") {
          sortedArts = sortedArts.sort((a, b) => a.artPrice - b.artPrice);
        } else if (sortBy === "High to Low") {
          sortedArts = sortedArts.sort((a, b) => b.artPrice - a.artPrice);
        }
        setArts(sortedArts);
        setVisibleCount(PAGE_SIZE);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching inspiration:", error);
        setArts([]);
        setLoading(false);
      });
  }, [token, sortBy]);

  useEffect(() => {
    if (!sentinelRef.current || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, arts.length));
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loading, arts.length]);

  const visibleArts = arts.slice(0, visibleCount);
  const hasMore = visibleCount < arts.length;

  return (
    <Box bg="brand.100">
      <Text pt={8} pl={8} fontWeight={400} fontSize={["24px", "30px", "40px"]}>
        Inspiration
      </Text>
      <Text pl={8} pb={4} color="gray.600" maxW="600px">
        Mood pieces and landscapes curated for inspiration, priced in ₹ and
        delivered to your door.
      </Text>

      {loading ? (
        <Grid
          gap={8}
          p={8}
          templateColumns={["repeat(2, 1fr)", "repeat(2, 1fr)", "repeat(3, 1fr)", "repeat(4, 1fr)", "repeat(4,1fr)", "repeat(5,1fr)"]}
        >
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <Box key={index} bg="#f5f1ee" borderRadius="md" boxShadow="md">
              <Skeleton height="200px" startColor="rgb(250,248,244)" endColor="rgb(150,148,144)" />
            </Box>
          ))}
        </Grid>
      ) : arts.length === 0 ? (
        <Text pl={8} pb={20} fontSize="lg">
          No inspiration pieces found yet.
        </Text>
      ) : (
        <>
          <Flex justifyContent="flex-end" pt={4} pr={8}>
            <Select
              bg="white"
              placeholder="Sort by"
              w="180px"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="Newest">Newest</option>
              <option value="Low to High">Price: Low to High</option>
              <option value="High to Low">Price: High to Low</option>
            </Select>
          </Flex>
          <Grid
            gap={8}
            p={8}
            templateColumns={["repeat(2, 1fr)", "repeat(2, 1fr)", "repeat(3, 1fr)", "repeat(4, 1fr)", "repeat(4,1fr)", "repeat(5,1fr)"]}
          >
            {visibleArts.map((painting) => (
              <ArtCard
                key={painting._id}
                art={painting}
                isWishlisted={wishlistIds.has(painting._id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </Grid>
          {hasMore && (
            <Flex ref={sentinelRef} justifyContent="center" py={8}>
              <Spinner color="brand.500" />
            </Flex>
          )}
          {!hasMore && arts.length > PAGE_SIZE && (
            <Text textAlign="center" py={8} color="gray.500">
              You&apos;ve reached the end — {arts.length} pieces
            </Text>
          )}
        </>
      )}
    </Box>
  );
};

export default Inspiration;
