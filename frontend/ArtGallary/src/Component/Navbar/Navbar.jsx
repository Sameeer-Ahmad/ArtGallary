import {
  Box,
  Flex,
  HStack,
  IconButton,
  useDisclosure,
  Stack,
  Menu,
  MenuButton,
  MenuList,
  Center,
  MenuDivider,
  MenuItem,
  InputGroup,
  InputRightElement,
  Input,
  Image,
  Text,
  Avatar,
  Badge,
  Spinner,
  Button,
  Link as ChakraLink,
} from "@chakra-ui/react";

import { HamburgerIcon, CloseIcon, SearchIcon } from "@chakra-ui/icons";
import {
  FiShoppingCart,
  FiUser,
  FiPackage,
  FiHeart,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useLogout } from "../../pages/Logout/Logout";
import { API } from "../../API/api";
import { guestCartCount } from "../../API/guestCart";

const Links = [
  { ids: 1, name: "PAINTING", link: "/art/paintings" },
  { ids: 2, name: "PRINTS", link: "/art/prints" },
  { ids: 3, name: "PHOTOGRAPHY", link: "/art/photography" },
  { ids: 4, name: "SCULPTURE", link: "/art/sculpture" },
  { ids: 5, name: "DRAWINGS", link: "/art/drawings" },
  { ids: 6, name: "INSPIRATION", link: "/art/inspiration" },
  // { ids: 7, name: "ABOUT", link: "/about" },
];

export default function NavBar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const username = localStorage.getItem("username");
  const isGuest = !localStorage.getItem("token");
  const isArtist = localStorage.getItem("role") === "artist";
  const [profilePic, setProfilePic] = useState(localStorage.getItem("profilePic") || "");
  const navigate = useNavigate();
  const handleLogout = useLogout();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  useEffect(() => {
    const fetchCartCount = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setCartCount(guestCartCount());
        return;
      }

      axios
        .get(`${API}/art/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const totalQuantity = response.data.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          setCartCount(totalQuantity);
        })
        .catch((error) => console.error("Error fetching cart count:", error));
    };

    fetchCartCount();
    window.addEventListener("cart:updated", fetchCartCount);
    return () => window.removeEventListener("cart:updated", fetchCartCount);
  }, [location]);

  useEffect(() => {
    const syncProfilePic = () => setProfilePic(localStorage.getItem("profilePic") || "");
    window.addEventListener("profile:updated", syncProfilePic);
    return () => window.removeEventListener("profile:updated", syncProfilePic);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    setSuggestionsLoading(true);
    const timer = setTimeout(() => {
      const token = localStorage.getItem("token");
      axios
        .get(`${API}/art/search`, {
          params: { q: searchQuery.trim() },
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setSuggestions(response.data.slice(0, 6));
          setSuggestionsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching search suggestions:", error);
          setSuggestions([]);
          setSuggestionsLoading(false);
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <Box position="sticky" top={0} zIndex={100}>
      <Box bg={"rgb(250,248,244)"}>
        <HStack
          spacing={10}
          display={["flex", "flex", "flex", "flex", "flex", "flex"]}
          justifyContent={"space-around"}
          alignItems={"center"}
          fontSize={["xs", "xs", "xs", "sm", "sm", "md"]}
          pt={2}
          pb={2}
        >
          <Flex
            justifyContent={"space-between"}
            alignItems={"center"}
            width={["100%"]}
            gap={4}
            px={[0, 0, 6]}
          >
            <Menu>
              <Link to={"/home"}>
                <Text
                  fontFamily="heading"
                  fontSize={["20px", "22px", "26px"]}
                  fontWeight={700}
                  color="brand.500"
                  ml={[0, 0, 4]}
                  whiteSpace="nowrap"
                >
                  The Artline
                </Text>
              </Link>
              <Center
                flex="1"
                maxW="600px"
                display={["none", "flex", "flex"]}
                position="relative"
              >
                <InputGroup
                  as="form"
                  h="44px"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      setSuggestionsOpen(false);
                      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    }
                  }}
                >
                  <InputRightElement h="44px" style={{ cursor: "pointer" }}>
                    <SearchIcon
                      color="gray.400"
                      onClick={() => {
                        if (searchQuery.trim()) {
                          setSuggestionsOpen(false);
                          navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                        }
                      }}
                    />
                  </InputRightElement>
                  <Input
                    bg={"white"}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="full"
                    h="44px"
                    px={5}
                    _focus={{ borderColor: "brand.500", boxShadow: "none" }}
                    type="text"
                    placeholder="Search for artworks"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSuggestionsOpen(true);
                    }}
                    onFocus={() => setSuggestionsOpen(true)}
                    onBlur={() => setTimeout(() => setSuggestionsOpen(false), 150)}
                  />
                </InputGroup>
                {suggestionsOpen && searchQuery.trim() && (
                  <Box
                    position="absolute"
                    top="100%"
                    left={0}
                    right={0}
                    mt={1}
                    bg="white"
                    borderRadius="md"
                    boxShadow="lg"
                    zIndex={200}
                    overflow="hidden"
                    textAlign="left"
                  >
                    {suggestionsLoading ? (
                      <Flex justify="center" py={4}>
                        <Spinner size="sm" color="brand.500" />
                      </Flex>
                    ) : suggestions.length === 0 ? (
                      <Text px={4} py={3} color="gray.500">
                        No matches found
                      </Text>
                    ) : (
                      <>
                        {suggestions.map((item) => (
                          <ChakraLink
                            as={Link}
                            to={`/art/${item._id}`}
                            key={item._id}
                            display="flex"
                            alignItems="center"
                            gap={3}
                            px={4}
                            py={2}
                            _hover={{ bg: "#f5f1ee", textDecoration: "none" }}
                            onClick={() => setSuggestionsOpen(false)}
                          >
                            <Image
                              src={item.artImage[0]}
                              alt={item.artName}
                              boxSize="36px"
                              objectFit="cover"
                              borderRadius="sm"
                            />
                            <Box>
                              <Text fontSize="sm" fontWeight={600}>
                                {item.artName}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {item.username}
                              </Text>
                            </Box>
                          </ChakraLink>
                        ))}
                        <ChakraLink
                          as={Link}
                          to={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                          display="block"
                          px={4}
                          py={2}
                          fontSize="sm"
                          color="brand.500"
                          fontWeight={600}
                          borderTop="1px solid #eee"
                          _hover={{ bg: "#f5f1ee", textDecoration: "none" }}
                          onClick={() => setSuggestionsOpen(false)}
                        >
                          See all results
                        </ChakraLink>
                      </>
                    )}
                  </Box>
                )}
              </Center>
              <HStack spacing={[1, 1, 2]} flexShrink={0}>
                {!isGuest && (
                  <Flex
                    as={Link}
                    to={"/wishlist"}
                    align="center"
                    justify="center"
                    boxSize="44px"
                    borderRadius="full"
                    _hover={{ bg: "blackAlpha.100" }}
                    transition="background 0.15s"
                  >
                    <FiHeart size={22} />
                  </Flex>
                )}
                <Flex
                  as={Link}
                  to={"/cart"}
                  position="relative"
                  align="center"
                  justify="center"
                  boxSize="44px"
                  borderRadius="full"
                  _hover={{ bg: "blackAlpha.100" }}
                  transition="background 0.15s"
                >
                  <FiShoppingCart size={22} />
                  {cartCount > 0 && (
                    <Badge
                      position="absolute"
                      top={0}
                      right={0}
                      borderRadius="full"
                      bg="brand.500"
                      color="white"
                      fontSize="0.65rem"
                      px={2}
                      minW="18px"
                      textAlign="center"
                    >
                      {cartCount}
                    </Badge>
                  )}
                </Flex>
                {isGuest ? (
                  <Stack direction="row" spacing={2} align="center">
                    <Button
                      as={Link}
                      to="/login"
                      size="sm"
                      variant="ghost"
                      fontWeight={600}
                    >
                      Sign In
                    </Button>
                    <Button
                      as={Link}
                      to="/signup"
                      size="sm"
                      bg="brand.500"
                      color="white"
                      _hover={{ bg: "brand.600" }}
                    >
                      Sign Up
                    </Button>
                  </Stack>
                ) : (
                  <MenuButton
                    borderRadius="full"
                    transition="box-shadow 0.15s"
                    _hover={{ boxShadow: "0 0 0 3px rgba(183,155,84,0.25)" }}
                  >
                    <Avatar
                      size={["sm", "md", "md"]}
                      bg={"rgb(230,228,224)"}
                      color={"rgb(183,155,84)"}
                      border={"3px solid rgb(183,155,84)"}
                      name={username}
                      src={profilePic || undefined}
                    />
                  </MenuButton>
                )}
              </HStack>

              {!isGuest && (
                <MenuList bg={"white"} borderRadius="md" boxShadow="lg" py={2} minW="220px">
                    <Box px={4} py={2}>
                      <Text fontSize={16} fontWeight={700}>
                        {username}
                      </Text>
                    </Box>
                    <MenuDivider />
                    <MenuItem
                      icon={<FiUser />}
                      onClick={() => navigate("/profile")}
                      _hover={{ bg: "#f5f1ee" }}
                      bg={"white"}
                    >
                      Your Profile
                    </MenuItem>
                    {isArtist && (
                      <>
                        <MenuItem
                          icon={<FiPackage />}
                          onClick={() => navigate("/art-portfolio")}
                          _hover={{ bg: "#f5f1ee" }}
                          bg={"white"}
                        >
                          Your Art Portfolio
                        </MenuItem>
                        <MenuItem
                          icon={<FiPackage />}
                          onClick={() => navigate("/sales")}
                          _hover={{ bg: "#f5f1ee" }}
                          bg={"white"}
                        >
                          Your Sales
                        </MenuItem>
                      </>
                    )}
                    <MenuItem
                      icon={<FiPackage />}
                      onClick={() => navigate("/orders")}
                      _hover={{ bg: "#f5f1ee" }}
                      bg={"white"}
                    >
                      Your Orders
                    </MenuItem>
                    <MenuItem
                      icon={<FiHeart />}
                      onClick={() => navigate("/wishlist")}
                      _hover={{ bg: "#f5f1ee" }}
                      bg={"white"}
                    >
                      Your Wishlist
                    </MenuItem>
                    <MenuItem
                      icon={<FiSettings />}
                      onClick={() => navigate("/settings")}
                      _hover={{ bg: "#f5f1ee" }}
                      bg={"white"}
                    >
                      Account Settings
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem
                      icon={<FiLogOut />}
                      onClick={handleLogout}
                      color="red.500"
                      _hover={{ bg: "red.50" }}
                      bg={"white"}
                    >
                      Logout
                    </MenuItem>
                  </MenuList>
              )}
            </Menu>
          </Flex>
        </HStack>
      </Box>
      <Box width={"100%"} borderBottom="1px solid #D9D1C2"></Box>
      <Box bg="rgb(250,248,244)" px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <IconButton
            size={"md"}
            bg={"none"}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"}
            display={{ md: "none" }}
            onClick={isOpen ? onClose : onOpen}
          />

          <Flex
            as="nav"
            px={4}
            display={{ base: "none", md: "flex" }}
            justifyContent="center"
            alignItems="center"
            height="60px" // Adjust the height as needed
            width="100%" // Ensure it takes up the full width of its container
          >
            <Flex justifyContent="center" alignItems="center" spacing={8}>
              {Links.map((el) => (
                <ChakraLink
                  as={Link}
                  to={el.link}
                  key={el.ids}
                  mx={4}
                  fontWeight={location.pathname === el.link ? 700 : 400}
                  color={location.pathname === el.link ? "brand.500" : "inherit"}
                  borderBottom={
                    location.pathname === el.link ? "2px solid" : "none"
                  }
                  borderColor="brand.500"
                  _hover={{ textDecoration: "none", color: "brand.500" }}
                >
                  {el.name}
                </ChakraLink>
              ))}
            </Flex>
          </Flex>

          <Flex alignItems={"center"}></Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: "none" }}>
            <Stack
              as={"nav"}
              spacing={4}
              fontSize={["xs", "sm", "sm", "sm", "md", "lg"]}
            >
              {Links.map((el) => (
                <Link to={el.link} key={el.ids} onClick={onClose}>
                  {el.name}{" "}
                </Link>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
