import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  Box,
  Text,
  Grid,
  Flex,
  Skeleton,
  Select,
  Input,
  Button,
  Spinner,
} from "@chakra-ui/react";
import AOS from "aos";
import "aos/dist/aos.css";
import { API } from "../../API/api";
import ArtCard from "../../Component/ArtCard/ArtCard";
import { useWishlist } from "../../hooks/useWishlist";

AOS.init();

const PAGE_SIZE = 15;
const CATEGORIES = [
  "Painting",
  "Print",
  "Sculpture",
  "Photography",
  "Inspiration",
  "Drawing",
  "Acrylic",
];

const Art = () => {
  const [arts, setArts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sortBy, setSortBy] = useState("");
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [artist, setArtist] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const token = localStorage.getItem("token");
  const sentinelRef = useRef(null);
  const { wishlistIds, toggleWishlist } = useWishlist();

  useEffect(() => {
    axios
      .get(`${API}/art`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setArts(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching paintings:", error);
        setArts([]);
        setLoading(false);
      });
  }, [token]);

  const artistOptions = useMemo(
    () => [...new Set(arts.map((a) => a.username))].sort(),
    [arts]
  );

  const filteredArts = useMemo(() => {
    let result = arts;
    if (category) result = result.filter((a) => a.artCategory === category);
    if (artist) result = result.filter((a) => a.username === artist);
    if (minPrice !== "") result = result.filter((a) => a.artPrice >= Number(minPrice));
    if (maxPrice !== "") result = result.filter((a) => a.artPrice <= Number(maxPrice));

    result = [...result];
    if (sortBy === "Newest") {
      result.sort((a, b) => b.created_at - a.created_at);
    } else if (sortBy === "Low to High") {
      result.sort((a, b) => a.artPrice - b.artPrice);
    } else if (sortBy === "High to Low") {
      result.sort((a, b) => b.artPrice - a.artPrice);
    }
    return result;
  }, [arts, category, artist, minPrice, maxPrice, sortBy]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [category, artist, minPrice, maxPrice, sortBy]);

  useEffect(() => {
    if (!sentinelRef.current || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredArts.length));
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loading, filteredArts.length]);

  const visibleArts = filteredArts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredArts.length;
  const hasActiveFilters = category || artist || minPrice !== "" || maxPrice !== "";

  const clearFilters = () => {
    setCategory("");
    setArtist("");
    setMinPrice("");
    setMaxPrice("");
  };

  const renderArtCards = () => {
    return visibleArts.map((painting) => (
      <Box key={painting._id} data-aos="fade-down" data-aos-anchor-placement="top">
        <ArtCard
          art={painting}
          isWishlisted={wishlistIds.has(painting._id)}
          onToggleWishlist={toggleWishlist}
        />
      </Box>
    ));
  };

  return (
    <Box bg="rgb(250,248,244)">
      <Text
        pt={8}
        pl={8}
        fontWeight={400}
        fontSize={["20px", "30px", "35px", "40px", "50px"]}
      >
        Original Contemporary Artworks for Sale
      </Text>
      {loading ? (
        <Grid
          gap={8}
          p={8}
          templateColumns={[
            "repeat(2, 1fr)",
            "repeat(2, 1fr)",
            "repeat(3, 1fr)",
            "repeat(4, 1fr)",
            "repeat(4,1fr)",
            "repeat(5,1fr)",
            "repeat(5,1fr)",
          ]}
          alignItems="center"
        >
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <Box key={index} width={"auto"} height={"auto"} bg="#f5f1ee" borderRadius="md" boxShadow="md">
              <Skeleton height="200px" startColor="rgb(250,248,244)" endColor="rgb(150,148,144)" />
            </Box>
          ))}
        </Grid>
      ) : (
        <>
          <Flex
            px={8}
            pt={4}
            gap={3}
            wrap="wrap"
            align="center"
            justify="space-between"
          >
            <Flex gap={3} wrap="wrap" flex="1">
              <Select
                bg="white"
                placeholder="All categories"
                w={["100%", "160px"]}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              <Select
                bg="white"
                placeholder="All artists"
                w={["100%", "180px"]}
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
              >
                {artistOptions.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </Select>
              <Input
                bg="white"
                type="number"
                placeholder="Min ₹"
                w={["48%", "110px"]}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <Input
                bg="white"
                type="number"
                placeholder="Max ₹"
                w={["48%", "110px"]}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
              {hasActiveFilters && (
                <Button variant="ghost" size="md" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </Flex>
            <Select
              bg="white"
              placeholder="Sort by"
              w={["100%", "180px"]}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="Newest">Newest</option>
              <option value="Low to High">Price: Low to High</option>
              <option value="High to Low">Price: High to Low</option>
            </Select>
          </Flex>

          <Text pl={8} pt={3} color="gray.500" fontSize="sm">
            {filteredArts.length} artwork{filteredArts.length !== 1 ? "s" : ""}
          </Text>

          {filteredArts.length === 0 ? (
            <Text pl={8} py={16} fontSize="lg" color="gray.600">
              No artworks match your filters.{" "}
              <Text as="span" color="brand.500" fontWeight={600} cursor="pointer" onClick={clearFilters}>
                Clear filters
              </Text>
            </Text>
          ) : (
            <>
              <Grid
                gap={8}
                p={8}
                templateColumns={[
                  "repeat(2, 1fr)",
                  "repeat(2, 1fr)",
                  "repeat(3, 1fr)",
                  "repeat(4, 1fr)",
                  "repeat(4,1fr)",
                  "repeat(5,1fr)",
                  "repeat(5,1fr)",
                ]}
                alignItems="center"
              >
                {renderArtCards()}
              </Grid>
              {hasMore && (
                <Flex ref={sentinelRef} justifyContent="center" py={8}>
                  <Spinner color="brand.500" />
                </Flex>
              )}
              {!hasMore && filteredArts.length > PAGE_SIZE && (
                <Text textAlign="center" py={8} color="gray.500">
                  You&apos;ve reached the end — {filteredArts.length} artworks
                </Text>
              )}
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default Art;
