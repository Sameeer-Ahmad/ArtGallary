import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Text,
  Grid,
  Flex,
  Skeleton,
  Select,
  Input,
  FormLabel,
} from "@chakra-ui/react";
import { API } from "../../API/api";
import ArtCard from "../../Component/ArtCard/ArtCard";
import { useWishlist } from "../../hooks/useWishlist";

const CATEGORIES = [
  "Painting",
  "Print",
  "Sculpture",
  "Photography",
  "Inspiration",
  "Drawing",
  "Acrylic",
];

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [arts, setArts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("");
  const token = localStorage.getItem("token");
  const { wishlistIds, toggleWishlist } = useWishlist();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API}/art/search`, {
        params: { q: query },
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setArts(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error searching art:", error);
        setArts([]);
        setLoading(false);
      });
  }, [query, token]);

  const filteredArts = arts
    .filter((art) => !category || art.artCategory === category)
    .filter((art) => !minPrice || art.artPrice >= Number(minPrice))
    .filter((art) => !maxPrice || art.artPrice <= Number(maxPrice))
    .sort((a, b) => {
      if (sortBy === "Newest") return b.created_at - a.created_at;
      if (sortBy === "Low to High") return a.artPrice - b.artPrice;
      if (sortBy === "High to Low") return b.artPrice - a.artPrice;
      return 0;
    });

  return (
    <Box bg="rgb(250,248,244)" minH="60vh">
      <Text
        pt={8}
        pl={8}
        fontWeight={400}
        fontSize={["24px", "30px", "35px", "40px"]}
        fontFamily={"Addington CF"}
      >
        Search results for &quot;{query}&quot;
      </Text>
      <Text pl={8} pb={4} color="gray.600">
        {loading ? "Searching..." : `${filteredArts.length} result${filteredArts.length === 1 ? "" : "s"}`}
      </Text>

      <Flex
        p={8}
        pt={0}
        gap={6}
        wrap="wrap"
        align="end"
        bg="rgb(250,248,244)"
      >
        <Box>
          <FormLabel fontSize="sm">Category</FormLabel>
          <Select
            bg="white"
            placeholder="All categories"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            w="200px"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Box>
        <Box>
          <FormLabel fontSize="sm">Min price (₹)</FormLabel>
          <Input
            bg="white"
            type="number"
            w="140px"
            placeholder="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </Box>
        <Box>
          <FormLabel fontSize="sm">Max price (₹)</FormLabel>
          <Input
            bg="white"
            type="number"
            w="140px"
            placeholder="Any"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </Box>
        <Box>
          <FormLabel fontSize="sm">Sort by</FormLabel>
          <Select
            bg="white"
            placeholder="Sort by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            w="180px"
          >
            <option value="Newest">Newest</option>
            <option value="Low to High">Price: Low to High</option>
            <option value="High to Low">Price: High to Low</option>
          </Select>
        </Box>
      </Flex>

      {loading ? (
        <Grid
          gap={8}
          p={8}
          pt={0}
          templateColumns={[
            "repeat(2, 1fr)",
            "repeat(2, 1fr)",
            "repeat(3, 1fr)",
            "repeat(4, 1fr)",
            "repeat(4,1fr)",
            "repeat(5,1fr)",
          ]}
        >
          {Array.from({ length: 10 }).map((_, index) => (
            <Box key={index} bg="#f5f1ee" borderRadius="md" boxShadow="md">
              <Skeleton
                height="200px"
                startColor="rgb(250,248,244)"
                endColor="rgb(150,148,144)"
              />
            </Box>
          ))}
        </Grid>
      ) : filteredArts.length === 0 ? (
        <Text pl={8} pb={20} fontSize="lg">
          No artworks matched your search.
        </Text>
      ) : (
        <Grid
          gap={8}
          p={8}
          pt={0}
          templateColumns={[
            "repeat(2, 1fr)",
            "repeat(2, 1fr)",
            "repeat(3, 1fr)",
            "repeat(4, 1fr)",
            "repeat(4,1fr)",
            "repeat(5,1fr)",
          ]}
        >
          {filteredArts.map((painting) => (
            <ArtCard
              key={painting._id}
              art={painting}
              isWishlisted={wishlistIds.has(painting._id)}
              onToggleWishlist={toggleWishlist}
            />
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Search;
