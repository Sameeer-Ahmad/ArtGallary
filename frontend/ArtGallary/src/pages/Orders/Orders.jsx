import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Text, Image, Flex, Heading, Badge, Spinner, Button, useToast } from "@chakra-ui/react";
import { API } from "../../API/api";

const statusColor = {
  created: "yellow",
  paid: "yellow",
  processing: "blue",
  shipped: "purple",
  delivered: "green",
  cancelled: "red",
  failed: "red",
};

const TIMELINE = ["paid", "processing", "shipped", "delivered"];
const CANCELLABLE = ["paid", "processing"];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const toast = useToast();
  const token = localStorage.getItem("token");

  const fetchOrders = () => {
    axios
      .get(`${API}/order/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setOrders(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancelOrder = async (orderId) => {
    setCancellingId(orderId);
    try {
      await axios.patch(
        `${API}/order/${orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: "Order cancelled", status: "success", duration: 2500, isClosable: true });
      fetchOrders();
    } catch (err) {
      toast({
        title: err.response?.data?.error || "Could not cancel order",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" pt={20}>
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }

  return (
    <Box p={[4, 8, 16]} bg={"brand.100"}>
      <Heading fontSize={["30px", "35px"]} pb={6}>
        Your orders
      </Heading>
      {orders.length === 0 ? (
        <Text fontSize={24} textAlign="center" pt={10}>
          You haven&apos;t placed any orders yet.
        </Text>
      ) : (
        orders.map((order) => (
          <Box
            key={order._id}
            bg="white"
            borderRadius="md"
            borderWidth="1px"
            p={5}
            mb={5}
          >
            <Flex justify="space-between" align="center" mb={4}>
              <Box>
                <Text fontWeight={700}>Order #{order._id}</Text>
                <Text fontSize="sm" color="gray.600">
                  {new Date(order.createdAt).toLocaleString()}
                </Text>
              </Box>
              <Badge colorScheme={statusColor[order.status] || "gray"}>
                {order.status}
              </Badge>
            </Flex>

            {TIMELINE.includes(order.status) && (
              <Flex mb={4} gap={2} align="center" wrap="wrap">
                {TIMELINE.map((step, i) => {
                  const reached = TIMELINE.indexOf(order.status) >= i;
                  return (
                    <Flex key={step} align="center" gap={2}>
                      <Badge
                        variant={reached ? "solid" : "outline"}
                        colorScheme={reached ? "green" : "gray"}
                        fontSize="0.7em"
                      >
                        {step}
                      </Badge>
                      {i < TIMELINE.length - 1 && <Text color="gray.400">→</Text>}
                    </Flex>
                  );
                })}
              </Flex>
            )}

            {order.items.map((item, index) => (
              <Flex key={index} gap={4} mb={3} align="center">
                <Image
                  h={14}
                  w={14}
                  objectFit="cover"
                  src={item.artImage}
                  alt={item.artName}
                />
                <Box flex="1">
                  <Text>{item.artName}</Text>
                  <Text fontSize="sm" color="gray.600">
                    Qty: {item.quantity}
                  </Text>
                </Box>
                <Text>&#8377;{item.artPrice * item.quantity}</Text>
              </Flex>
            ))}
            <Flex justify="space-between" align="center" mt={2}>
              {CANCELLABLE.includes(order.status) ? (
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="red"
                  isLoading={cancellingId === order._id}
                  onClick={() => cancelOrder(order._id)}
                >
                  Cancel order
                </Button>
              ) : (
                <Box />
              )}
              <Text fontWeight="bold">Total: &#8377;{order.totalAmount}</Text>
            </Flex>
          </Box>
        ))
      )}
    </Box>
  );
};

export default Orders;
