import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Text,
  Image,
  Flex,
  Button,
  FormLabel,
  Input,
  Textarea,
  Checkbox,
  Stack,
  Heading,
  Spinner,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { CheckCircleIcon, ArrowBackIcon } from "@chakra-ui/icons";
import { FiTrash2, FiPlus } from "react-icons/fi";
import { API } from "../../API/api";

const EMPTY_ADDRESS = { name: "", phone: "", address: "", city: "", postalCode: "" };

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressMode, setAddressMode] = useState("new"); // "saved" | "new"
  const [saveNewAddress, setSaveNewAddress] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [shippingInfo, setShippingInfo] = useState({
    ...EMPTY_ADDRESS,
    name: localStorage.getItem("username") || "",
    instructions: "",
  });
  const [confirmedOrderId, setConfirmedOrderId] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();
  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    axios
      .get(`${API}/art/cart`, authHeader)
      .then((response) => {
        setCartItems(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching cart items:", error);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    axios
      .get(`${API}/addresses`, authHeader)
      .then((response) => {
        setSavedAddresses(response.data);
        if (response.data.length > 0) {
          selectAddress(response.data[0]);
        }
      })
      .catch((error) => console.error("Error fetching addresses:", error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const itemsTotal = cartItems.reduce(
    (acc, item) => acc + item.artPrice * item.quantity,
    0
  );
  const deliveryCharge = 0;
  const total = itemsTotal + deliveryCharge;

  const selectAddress = (addr) => {
    setAddressMode("saved");
    setSelectedAddressId(addr._id);
    setShippingInfo({
      name: addr.name,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      postalCode: addr.postalCode,
      instructions: shippingInfo.instructions,
    });
  };

  const startNewAddress = () => {
    setAddressMode("new");
    setSelectedAddressId(null);
    setShippingInfo({
      ...EMPTY_ADDRESS,
      name: localStorage.getItem("username") || "",
      instructions: shippingInfo.instructions,
    });
  };

  const deleteAddress = async (id) => {
    setDeletingId(id);
    try {
      await axios.delete(`${API}/addresses/${id}`, authHeader);
      const remaining = savedAddresses.filter((a) => a._id !== id);
      setSavedAddresses(remaining);
      if (selectedAddressId === id) {
        if (remaining.length > 0) selectAddress(remaining[0]);
        else startNewAddress();
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      toast({ title: "Could not delete address", status: "error", isClosable: true });
    } finally {
      setDeletingId(null);
    }
  };

  const handleFieldChange = (field) => (e) => {
    setShippingInfo({ ...shippingInfo, [field]: e.target.value });
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (typeof window.Razorpay !== "function") {
      toast({
        title: "Payment gateway didn't load. Check your connection and try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    setIsPaying(true);

    if (addressMode === "new" && saveNewAddress) {
      try {
        // eslint-disable-next-line no-unused-vars
        const { instructions, ...addressFields } = shippingInfo;
        await axios.post(`${API}/addresses`, addressFields, authHeader);
      } catch (error) {
        console.error("Error saving address:", error);
      }
    }

    try {
      const { data } = await axios.post(
        `${API}/order/create`,
        shippingInfo,
        authHeader
      );

      const razorpay = new window.Razorpay({
        key: data.keyId,
        order_id: data.razorpayOrderId,
        amount: data.amount,
        currency: data.currency,
        name: "The Artline",
        description: "Art purchase",
        prefill: {
          name: shippingInfo.name,
          contact: shippingInfo.phone,
        },
        handler: async (response) => {
          try {
            await axios.post(
              `${API}/order/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              authHeader
            );
            setConfirmedOrderId(data.dbOrderId);
            toast({
              title: "Payment successful",
              description: "Your order has been placed.",
              status: "success",
              duration: 4000,
              isClosable: true,
            });
          } catch (error) {
            console.error("Error verifying payment:", error);
            toast({
              title: "Payment verification failed",
              status: "error",
              duration: 4000,
              isClosable: true,
            });
          } finally {
            setIsPaying(false);
          }
        },
        modal: {
          ondismiss: () => setIsPaying(false),
        },
        theme: { color: "#B79B54" },
      });

      razorpay.open();
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: error.response?.data?.error || "Could not start checkout",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsPaying(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" pt={20}>
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }

  if (confirmedOrderId) {
    return (
      <Flex
        direction="column"
        align="center"
        pt={16}
        pb={20}
        px={4}
        bg="brand.100"
        borderBottom="1px solid #D9D1C2"
      >
        <Flex
          align="center"
          justify="center"
          borderRadius="full"
          bg="green.100"
          boxSize="72px"
          mb={4}
        >
          <CheckCircleIcon boxSize="40px" color="green.500" />
        </Flex>
        <Heading fontSize="30px" mb={2}>
          Order placed!
        </Heading>
        <Text color="gray.600" mb={1}>
          Thank you — your order has been confirmed.
        </Text>
        <Text fontSize="sm" color="gray.500" mb={8}>
          Order ID: {confirmedOrderId}
        </Text>

        <Box
          bg="white"
          borderRadius="md"
          boxShadow="md"
          p={6}
          w={["100%", "90%", "500px"]}
          mb={8}
        >
          <Heading fontSize="18px" mb={4}>
            Order summary
          </Heading>
          {cartItems.map((item) => (
            <Flex key={item.cartItemId} gap={4} mb={4} align="center">
              <Image
                h={14}
                w={14}
                objectFit="cover"
                borderRadius="sm"
                src={item.artImage[0]}
                alt={item.artName}
              />
              <Box flex="1">
                <Text fontWeight={700}>{item.artName}</Text>
                <Text fontSize="sm" color="gray.600">
                  Qty: {item.quantity}
                </Text>
              </Box>
              <Text>&#8377;{item.artPrice * item.quantity}</Text>
            </Flex>
          ))}
          <Flex
            justify="space-between"
            fontWeight="bold"
            fontSize="18px"
            pt={4}
            borderTop="1px solid #eee"
          >
            <Text>Total</Text>
            <Text>&#8377;{total}</Text>
          </Flex>
        </Box>

        <Flex gap={4}>
          <Button onClick={() => navigate("/orders")}>View your orders</Button>
          <Button variant="outline" onClick={() => navigate("/art")}>
            Continue shopping
          </Button>
        </Flex>
      </Flex>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Flex direction="column" align="center" pt={20} pb={20}>
        <Text fontSize={24} mb={6}>
          Your cart is empty.
        </Text>
        <Button onClick={() => navigate("/art")}>Browse artworks</Button>
      </Flex>
    );
  }

  return (
    <Box p={[4, 8, 16]} bg={"brand.100"}>
      <Box maxW="1100px" mx="auto">
        <Flex
          as={Link}
          to="/cart"
          align="center"
          gap={2}
          color="brand.500"
          fontWeight={600}
          w="fit-content"
          mb={4}
        >
          <ArrowBackIcon /> Back to cart
        </Flex>
        <Heading fontSize={["30px", "35px"]} pb={6}>
          Checkout
        </Heading>
        <Flex direction={["column", "column", "row"]} gap={10}>
          <Box flex="1" bg="white" borderRadius="md" boxShadow="md" p={[5, 6]}>
            <Heading fontSize="20px" mb={4}>
              Shipping details
            </Heading>

            {savedAddresses.length > 0 && addressMode === "saved" && (
              <Stack spacing={3} mb={5}>
                {savedAddresses.map((addr) => (
                  <Flex
                    key={addr._id}
                    borderWidth="2px"
                    borderColor={selectedAddressId === addr._id ? "brand.500" : "gray.200"}
                    borderRadius="md"
                    p={4}
                    align="flex-start"
                    justify="space-between"
                    cursor="pointer"
                    onClick={() => selectAddress(addr)}
                  >
                    <Box>
                      <Text fontWeight={700}>{addr.name}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {addr.address}, {addr.city} — {addr.postalCode}
                      </Text>
                      <Text fontSize="sm" color="gray.600">{addr.phone}</Text>
                    </Box>
                    <IconButton
                      aria-label="Delete address"
                      icon={<FiTrash2 />}
                      size="sm"
                      variant="ghost"
                      isLoading={deletingId === addr._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAddress(addr._id);
                      }}
                    />
                  </Flex>
                ))}
                <Button
                  variant="outline"
                  leftIcon={<FiPlus />}
                  onClick={startNewAddress}
                  alignSelf="flex-start"
                >
                  Add a new address
                </Button>
              </Stack>
            )}

            <Box as="form" onSubmit={handlePay}>
              {addressMode === "new" && (
                <Stack spacing={4} mb={4}>
                  {savedAddresses.length > 0 && (
                    <Text
                      color="brand.500"
                      fontWeight={600}
                      fontSize="sm"
                      cursor="pointer"
                      onClick={() => selectAddress(savedAddresses[0])}
                    >
                      &larr; Use a saved address
                    </Text>
                  )}
                  <Box>
                    <FormLabel>Full name</FormLabel>
                    <Input
                      bg="white"
                      required
                      value={shippingInfo.name}
                      onChange={handleFieldChange("name")}
                    />
                  </Box>
                  <Box>
                    <FormLabel>Phone number</FormLabel>
                    <Input
                      bg="white"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      required
                      value={shippingInfo.phone}
                      onChange={(e) =>
                        setShippingInfo({
                          ...shippingInfo,
                          phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                        })
                      }
                    />
                  </Box>
                  <Box>
                    <FormLabel>Address</FormLabel>
                    <Input
                      bg="white"
                      required
                      value={shippingInfo.address}
                      onChange={handleFieldChange("address")}
                    />
                  </Box>
                  <Flex gap={4}>
                    <Box flex="1">
                      <FormLabel>City</FormLabel>
                      <Input
                        bg="white"
                        required
                        value={shippingInfo.city}
                        onChange={handleFieldChange("city")}
                      />
                    </Box>
                    <Box flex="1">
                      <FormLabel>Postal code</FormLabel>
                      <Input
                        bg="white"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        placeholder="6-digit PIN code"
                        required
                        value={shippingInfo.postalCode}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            postalCode: e.target.value.replace(/\D/g, "").slice(0, 6),
                          })
                        }
                      />
                    </Box>
                  </Flex>
                  <Checkbox
                    isChecked={saveNewAddress}
                    onChange={(e) => setSaveNewAddress(e.target.checked)}
                  >
                    Save this address for future orders
                  </Checkbox>
                </Stack>
              )}

              <Box mb={4}>
                <FormLabel>Delivery instructions (optional)</FormLabel>
                <Textarea
                  bg="white"
                  placeholder="e.g. Leave with security, call on arrival..."
                  value={shippingInfo.instructions}
                  onChange={handleFieldChange("instructions")}
                  rows={3}
                />
              </Box>

              <Button type="submit" mt={2} isDisabled={isPaying} w="100%">
                {isPaying ? <Spinner size="sm" color="white" /> : `Pay ₹${total}`}
              </Button>
            </Box>
          </Box>

          <Box
            flex="1"
            bg="white"
            borderRadius="md"
            boxShadow="md"
            p={[5, 6]}
            h="fit-content"
            position={["static", "static", "sticky"]}
            top="100px"
          >
            <Heading fontSize="20px" mb={4}>
              Order summary ({cartItems.length} item{cartItems.length === 1 ? "" : "s"})
            </Heading>
            {cartItems.map((item) => (
              <Flex key={item._id} gap={4} mb={4} align="center">
                <Image
                  h={16}
                  w={16}
                  objectFit="cover"
                  borderRadius="sm"
                  src={item.artImage[0]}
                  alt={item.artName}
                />
                <Box flex="1">
                  <Text fontWeight={700}>{item.artName}</Text>
                  <Text fontSize="sm" color="gray.600">Qty: {item.quantity}</Text>
                </Box>
                <Text>&#8377;{item.artPrice * item.quantity}</Text>
              </Flex>
            ))}

            <Stack spacing={2} mt={6} pt={4} borderTop="1px solid #eee">
              <Flex justify="space-between" color="gray.700">
                <Text>Subtotal</Text>
                <Text>&#8377;{itemsTotal}</Text>
              </Flex>
              <Flex justify="space-between" color="gray.700">
                <Text>Delivery</Text>
                <Text color="green.600">Free</Text>
              </Flex>
              <Flex
                justify="space-between"
                fontWeight="bold"
                fontSize="20px"
                pt={2}
                borderTop="1px solid #eee"
              >
                <Text>Total</Text>
                <Text>&#8377;{total}</Text>
              </Flex>
            </Stack>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default Checkout;
