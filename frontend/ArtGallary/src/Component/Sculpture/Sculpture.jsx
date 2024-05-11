import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Text, Stack, Image, Grid, Flex } from "@chakra-ui/react";

const Sculpture = () => {
  const [paintings, setPaintings] = useState([]);
  const token = localStorage.getItem("token");
  useEffect(() => {
    axios
      .get("https://artgallary.onrender.com/art/sculpture", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setPaintings(response.data);
      })
      .catch((error) => {
        console.error("Error fetching paintings:", error);
        setPaintings([]);
      });
  }, []);

  return (
    <Box bg="rgb(250,248,244)">
      <Text
        pt={8}
        pl={8}
        fontWeight={400}
        fontSize={["20px", "30px", "35px", "40px", "50px"]}
        fontFamily={"Addington CF"}
      >
        Original Contemporary Sculpture for Sale
      </Text>
      <Flex marginRight={4} justifyContent="flex-end" pt={4} pr={6}>
        <select
          style={{
            backgroundColor: "rgb(250,248,244)",
            fontSize: "16px",
            fontFamily: "sans-serif",
            height: "40px",
            paddingLeft: "10px",
            width: "140px",
            border: "1px solid rgb(183, 155, 84)",
            appearance: "none", // Remove default arrow
            background:
              'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%238a8a8a"><path d="M7 10l5 5 5-5z"/></svg>\') no-repeat right 10px center',
            backgroundSize: "36px 36px",
          }}
          defaultValue=""
          onFocus={(e) => {
            e.target.style.borderColor = "green";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#f5f1ee";
          }}
        >
          <option value="" disabled selected hidden>
            Sort By
          </option>
          <option value="Newest">Newest</option>
          <option value="Low to High">Low to High</option>
          <option value="High to Low">High to Low</option>
        </select>
      </Flex>

      <Grid
        gap={8}
        p={8}
        templateColumns={[
          "repeat(2, 1fr)",
          "repeat(2, 1fr)",
          "repeat(3, 1fr)",
          "repeat(4, 1fr)",
        ]}
        alignItems="center"
      >
        {paintings.map((painting) => (
          <Box key={painting._id} width={"auto"} height={"auto"} bg="#f5f1ee">
            <Image
              objectFit="cover"
              src={painting.artImage[0]}
              alt={painting.artName}
            />

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
                fontSize={"17px"}
                fontFamily={"sans-serif"}
                color={"rgb(183, 155, 84)"}
                letterSpacing={"1px"}
              >
                {painting.username}
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
                US$ {painting.artPrice}
              </Text>
            </Stack>
          </Box>
        ))}
      </Grid>
      <p style={{ borderTop: "1px solid rgb(183, 155, 84)", width: "95%", margin: "0 auto", padding: "10px" }}></p>

      <Box p={8} pb={20} fontSize={"10px"} fontFamily={"sans-serif"} textAlign={"center"}>
      <Text pb={4} >
        Original, hand-picked contemporary paintings for sale from the finest
        artists around the world. The Artling offers a curated selection of
        paintings, including{" "}
        <span style={{ color: "rgb(115,164,253)", cursor: "pointer" }}>
          abstract paintings
        </span>
        ,{" "}
        <span style={{ color: "rgb(115,164,253)", cursor: "pointer" }}>
          figurative paintings
        </span>
        ,{" "}
        <span style={{ color: "rgb(115,164,253)", cursor: "pointer" }}>
          geometric paintings
        </span>
        ,{" "}
        <span style={{ color: "rgb(115,164,253)", cursor: "pointer" }}>
          minimalist paintings
        </span>
        ,{" "}
        <span style={{ color: "rgb(115,164,253)", cursor: "pointer" }}>
          nature paintings
        </span>
        , and{" "}
        <span style={{ color: "rgb(115,164,253)", cursor: "pointer" }}>
          pop paintings
        </span>
        . If you are looking for even more styles, you can look forward to
        <span style={{ color: "rgb(115,164,253)", cursor: "pointer" }}>
          portraiture paintings
        </span>
        ,{" "}
        <span style={{ color: "rgb(115,164,253)", cursor: "pointer" }}>
          stil life paintings
        </span>
        ,{" "}
        <span style={{ color: "rgb(115,164,253)", cursor: "pointer" }}>
          street art paintings
        </span>
        ,
        <span style={{ color: "rgb(115,164,253)", cursor: "pointer" }}>
          surrealist paintings
        </span>
        ,
        <span style={{ color: "rgb(115,164,253)", cursor: "pointer" }}>
          typography paintings
        </span>{" "}
        and{" "}
        <span style={{ color: "rgb(115,164,253)", cursor: "pointer" }}>
          urban paintings
        </span>{" "}
        in a range of price, colour and size to suit your preference.
      </Text>
      <Text pb={4} >
        Whether you are looking for paintings for your bedroom, kitchen, living
        room, or even your office, we have you covered with thousands of
        paintings from popular and emerging artists and galleries from around
        the world. Dont forget to look at our{" "}
        <span style={{ color: "rgb(115,164,253)", cursor: "pointer" }}>
          exclusive paintings
        </span>{" "}
        and{" "}
        <span style={{ color: "rgb(115,164,253)", cursor: "pointer" }}>
          framed paintings
        </span>{" "}
        - available only on The Artling.
      </Text>
      <Text pb={4} >
        Take your pick from our expertly-curated selection of paintings and get
        the works that you love delivered right to your doorstep. When you buy
        contemporary paintings from The Artling, you can buy with confidence as
        each item comes with a Certificate of Authenticity and a 3-day return
        window.
      </Text>
      <Text pb={4} >
        If you have particular or specific requirements, use our{" "}
        <span style={{ color: "rgb(115,164,253)", cursor: "pointer" }}>
          Art Advisory service{" "}
        </span>{" "}
        and get personalized recommendations from an expert art curator to find
        the perfect artwork for you.
      </Text>
      </Box>
    </Box>
  );
};

export default Sculpture;
