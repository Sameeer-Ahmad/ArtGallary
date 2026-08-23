import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import {
  Box,
  Text,
  Stack,
  Image,
  Grid,
  Skeleton,
  Badge,
} from "@chakra-ui/react";
import { API } from "../../API/api";

const Artist = () => {
  const { username } = useParams();
  const artistName = decodeURIComponent(username);
  const [arts, setArts] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API}/art`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setArts(response.data.filter((art) => art.username === artistName));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching artist's artworks:", error);
        setArts([]);
        setLoading(false);
      });
  }, [artistName, token]);

  return (
    <Box bg="rgb(250,248,244)" minH="60vh">
      <Text
        pt={8}
        pl={8}
        fontWeight={400}
        fontSize={["24px", "30px", "35px", "40px"]}
        fontFamily={"Addington CF"}
      >
        {artistName}
      </Text>
      <Text pl={8} pb={4} color="gray.600">
        {loading ? "Loading artworks..." : `${arts.length} artwork${arts.length === 1 ? "" : "s"}`}
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
      ) : arts.length === 0 ? (
        <Text pl={8} pb={20} fontSize="lg">
          No artworks found for this artist.
        </Text>
      ) : (
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
          ]}
        >
          {arts.map((painting) => (
            <Link key={painting._id} to={`/art/${painting._id}`}>
              <Box bg="#f5f1ee" borderRadius="md" boxShadow="md">
                <Box position="relative">
                  <Image
                    width={"100%"}
                    objectFit="cover"
                    src={painting.artImage[0]}
                    alt={painting.artName}
                  />
                  {painting.stock <= 0 && (
                    <Badge position="absolute" top={2} right={2} colorScheme="red">
                      Out of Stock
                    </Badge>
                  )}
                </Box>
                <Stack pt={5} pl={4} pb={5} gap={0} bg={"white"}>
                  <Text
                    fontWeight={400}
                    fontSize={"17px"}
                    fontFamily={"Addington CF"}
                    lineHeight={"21px"}
                    letterSpacing={"1px"}
                  >
                    {painting.artName}
                  </Text>
                  <Text
                    fontSize={"17"}
                    fontFamily={"sans-serif"}
                    color={"rgb(183, 155, 84)"}
                    letterSpacing={"1px"}
                  >
                    {painting.artCategory}
                  </Text>
                  <Text
                    fontSize={"17px"}
                    fontWeight={700}
                    fontFamily={"sans-serif"}
                    color={"rgb(183, 155, 84)"}
                    letterSpacing={"1px"}
                  >
                    ₹{painting.artPrice}
                  </Text>
                </Stack>
              </Box>
            </Link>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Artist;
