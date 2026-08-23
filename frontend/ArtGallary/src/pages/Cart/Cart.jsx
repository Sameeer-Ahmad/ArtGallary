import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Text, Image, Flex, Button, IconButton } from "@chakra-ui/react";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { API } from "../../API/api";
import {
  getGuestCart,
  updateGuestCartQuantity,
  removeFromGuestCart,
} from "../../API/guestCart";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isGuest = !token;

  useEffect(() => {
    const fetchCartItems = async () => {
      if (isGuest) {
        const guestItems = getGuestCart();
        if (guestItems.length === 0) {
          setCartItems([]);
          return;
        }
        try {
          const response = await axios.get(`${API}/art`);
          const artById = new Map(response.data.map((a) => [a._id, a]));
          const items = guestItems
            .map((g) => {
              const art = artById.get(g.artId);
              if (!art) return null;
              return { ...art, cartItemId: art._id, quantity: g.quantity };
            })
            .filter(Boolean);
          setCartItems(items);
        } catch (error) {
          console.error("Error fetching guest cart items:", error);
        }
        return;
      }

      try {
        const response = await axios.get(`${API}/art/cart`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCartItems(response.data);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };

    fetchCartItems();
  }, [token, isGuest]);

  const removeFromCart = async (itemId) => {
    if (isGuest) {
      removeFromGuestCart(itemId);
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.cartItemId !== itemId)
      );
      return;
    }
    try {
      await axios.delete(`${API}/art/removeFromCart/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.cartItemId !== itemId)
      );
      window.dispatchEvent(new Event("cart:updated"));
    } catch (error) {
      console.error("Error deleting item from cart:", error);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }

    if (isGuest) {
      updateGuestCartQuantity(itemId, newQuantity);
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.cartItemId === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      return;
    }

    try {
      await axios.patch(
        `${API}/art/updateCartQuantity/${itemId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.cartItemId === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      window.dispatchEvent(new Event("cart:updated"));
    } catch (error) {
      console.error("Error updating cart quantity:", error);
    }
  };

  const total = cartItems.reduce(
    (acc, item) => acc + item.artPrice * item.quantity,
    0
  );
  return (
    <Box p={16} bg={"rgb(250,248,244)"}>
      <Text
        pt={8}
        pb={6}
        fontWeight={400}
        fontSize={["30px", "30px", "35px", "35px", "40px"]}
      >
        Your cart
      </Text>
      {cartItems.length == 0 ? (
        <Flex direction="column" align="center" gap={6} pb={16} pt={16}>
          <Text fontSize={36}>Your cart is empty.</Text>
          <Button onClick={() => navigate("/art")}>Browse artworks</Button>
        </Flex>
      ) : (
        <Box
          pt={6}
          pb={12}
          bg={"rgb(243,243,243)"}
          borderWidth="1px"
          borderRadius="md"
          width={["100%"]}
        >
          <Flex
            pl={5}
            pr={5}
            align={"center"}
            alignContent={"center"}
            m={"auto"}
            mb={6}
            fontSize={32}
            justifyContent={{ base: "center", md: "space-between" }}
          >
            <Text>Item</Text>
            <Text pr={5} display={{ base: "none", md: "block" }}>
              Subtotal
            </Text>
          </Flex>
          {cartItems.map((item) => (
            <Box
              key={item.cartItemId}
              bg={"rgb(250,248,244)"}
              borderWidth="1px"
              // borderRadius="md"
            >
              <Box p={4} borderWidth="1px">
                <Flex
                  flexDir={["column", "row", "row"]}
                  gap={6}
                  align={"center"}
                >
                  <Image
                    h={32}
                    w={32}
                    src={item.artImage[0]}
                    alt={item.artName}
                  />
                  <Flex justifyContent={"space-between"} width={"100%"}>
                    <Box fontSize={18} flex={"1"}>
                      <Text fontWeight={700}>{item.artName}</Text>
                      <Text>by {item.username}</Text>
                      <Text>{item.artCategory}</Text>
                      <Text>&#8377; {item.artPrice}</Text>
                      <Flex align="center" gap={2} mt={2}>
                        <IconButton
                          aria-label="Decrease quantity"
                          icon={<MinusIcon />}
                          size="xs"
                          onClick={() =>
                            updateQuantity(item.cartItemId, item.quantity - 1)
                          }
                        />
                        <Text minW={6} textAlign="center">
                          {item.quantity}
                        </Text>
                        <IconButton
                          aria-label="Increase quantity"
                          icon={<AddIcon />}
                          size="xs"
                          isDisabled={item.quantity >= item.stock}
                          onClick={() =>
                            updateQuantity(item.cartItemId, item.quantity + 1)
                          }
                        />
                      </Flex>
                      <Button
                        mt={3}
                        mr={8}
                        bg={"none"}
                        border={"2px solid #f5f1ee "}
                        _hover={{ textDecoration: "underline", bg: " #f5f1ee" }}
                        onClick={() => removeFromCart(item.cartItemId)}
                      >
                        remove
                      </Button>
                    </Box>
                    <Box>
                      <Text
                        pt={12}
                        pr={[0, 6, 6]}
                        fontSize={[22, 24, 26]}
                        fontWeight={700}
                      >
                        &#8377; {item.artPrice * item.quantity}
                      </Text>
                    </Box>
                  </Flex>
                </Flex>
              </Box>
            </Box>
          ))}
          <Flex justifyContent="space-between" pl={6} pr={12} pt={6}>
            <Text fontSize={22} fontWeight="bold">
              Total:
            </Text>
            <Text fontSize={22} fontWeight="bold">
              &#8377; {total}
            </Text>
          </Flex>
          <Flex justifyContent="flex-end" pr={12} pt={6}>
            {isGuest ? (
              <Button
                bg="brand.500"
                color="white"
                _hover={{ bg: "brand.600" }}
                onClick={() => navigate("/login")}
              >
                Login to Proceed
              </Button>
            ) : (
              <Button onClick={() => navigate("/checkout")}>
                Proceed to Checkout
              </Button>
            )}
          </Flex>
        </Box>
      )}
    </Box>
  );
};

export default Cart;
