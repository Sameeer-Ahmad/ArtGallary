import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Text,
  Input,
  Stack,
  Button,
  Container,
  SimpleGrid,
  Heading,
  useToast,
} from "@chakra-ui/react";

const LINK_COLUMNS = [
  {
    heading: "The Artline",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact Us", to: "/contactus" },
      { label: "FAQs", to: "/contactus" },
    ],
  },
  {
    heading: "Shop",
    links: [
      { label: "Painting", to: "/art/paintings" },
      { label: "Sculpture", to: "/art/sculpture" },
      { label: "Photography", to: "/art/photography" },
      { label: "Drawings", to: "/art/drawings" },
      { label: "Prints", to: "/art/prints" },
      { label: "Inspiration", to: "/art/inspiration" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Your Cart", to: "/cart" },
      { label: "Your Orders", to: "/orders" },
      { label: "Sign In", to: "/login" },
      { label: "Sign Up", to: "/signup" },
    ],
  },
];

const Footer = () => {
  const [email, setEmail] = useState("");
  const toast = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: "Enter a valid email address",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    toast({
      title: "Subscribed! You'll hear from us soon.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    setEmail("");
  };

  return (
    <Box bg="#f5f1ee" w="100%" p={4} color="white">
      <Stack align={"flex-start"} alignItems={"center"}>
        <Text
          fontSize={"ms"}
          textAlign={"center"}
          width={"230px"}
          color="black"
        >
          Subscribe for the latest updates in contemporary art & design!
        </Text>
        <Stack as="form" direction={"row"} onSubmit={handleSubscribe}>
          <Input
            marginTop={"20px"}
            color="tomato"
            placeholder="Enter Your Email"
            bg="white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            _placeholder={{ opacity: 1.8, color: "grey" }}
          />
          <Button
            type="submit"
            size="md"
            height="38px"
            width="140px"
            borderColor="none"
            marginTop={"20px"}
            bg={"#b79b54"}
            color="white"
            _hover={{ color: "none" }}
          >
            Subscribe
          </Button>
        </Stack>
      </Stack>

      <Container as={Stack} maxW={"6xl"} py={10}>
        <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={7}>
          {LINK_COLUMNS.map((col) => (
            <Stack align={"flex-start"} key={col.heading}>
              <Heading fontSize={"xl"} color={"#1e0e00"}>
                {col.heading}
              </Heading>
              {col.links.map((link) => (
                <Box as={Link} to={link.to} color="#685253" key={link.label}>
                  {link.label}
                </Box>
              ))}
            </Stack>
          ))}
        </SimpleGrid>
      </Container>

      <Text textAlign="center" color="#685253" fontSize="sm" pb={4}>
        &copy; {new Date().getFullYear()} The Artline. All rights reserved.
      </Text>
    </Box>
  );
};

export default Footer;
