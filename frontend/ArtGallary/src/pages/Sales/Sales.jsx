import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Box,
  Text,
  Image,
  Flex,
  Heading,
  Badge,
  Spinner,
  Button,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  useToast,
} from "@chakra-ui/react";
import { API } from "../../API/api";

const statusColor = {
  paid: "yellow",
  processing: "blue",
  shipped: "purple",
  delivered: "green",
  cancelled: "red",
  failed: "red",
};

const NEXT_STATUS = {
  paid: [{ value: "processing", label: "Mark as processing" }, { value: "cancelled", label: "Cancel order" }],
  processing: [{ value: "shipped", label: "Mark as shipped" }, { value: "cancelled", label: "Cancel order" }],
  shipped: [{ value: "delivered", label: "Mark as delivered" }],
};

const Sales = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [userID, setUserID] = useState(null);
  const toast = useToast();
  const token = localStorage.getItem("token");

  const fetchSales = () => {
    axios
      .get(`${API}/order/sales`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching sales:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    // Fetch the current account's real ID from the server rather than
    // trusting localStorage, which can be stale for sessions that logged
    // in before this field started being stored.
    axios
      .get(`${API}/user/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setUserID(res.data._id))
      .catch((err) => console.error("Error fetching current user:", err));
    fetchSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = useMemo(() => {
    const validOrders = orders.filter((o) => !["cancelled", "failed"].includes(o.status));
    let revenue = 0;
    let units = 0;
    validOrders.forEach((order) => {
      order.items
        .filter((i) => i.artistUserID === userID)
        .forEach((i) => {
          revenue += i.artPrice * i.quantity;
          units += i.quantity;
        });
    });
    return { revenue, units, orderCount: validOrders.length };
  }, [orders, userID]);

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await axios.patch(
        `${API}/order/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: "Order updated", status: "success", duration: 2000, isClosable: true });
      fetchSales();
    } catch (err) {
      toast({
        title: err.response?.data?.error || "Could not update order",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUpdatingId(null);
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
    <Box p={[4, 8, 16]} bg="brand.100" minH="70vh">
      <Heading fontSize={["30px", "35px"]} pb={6}>
        Your sales
      </Heading>

      {orders.length > 0 && (
        <StatGroup bg="white" borderRadius="md" borderWidth="1px" p={5} mb={6} maxW="600px">
          <Stat>
            <StatLabel>Total revenue</StatLabel>
            <StatNumber>₹{summary.revenue}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Orders</StatLabel>
            <StatNumber>{summary.orderCount}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Units sold</StatLabel>
            <StatNumber>{summary.units}</StatNumber>
          </Stat>
        </StatGroup>
      )}

      {orders.length === 0 ? (
        <Text fontSize={20} color="gray.600">
          No orders for your artwork yet.
        </Text>
      ) : (
        orders.map((order) => {
          const myItems = order.items.filter((i) => i.artistUserID === userID);
          const nextOptions = NEXT_STATUS[order.status] || [];
          return (
            <Box key={order._id} bg="white" borderRadius="md" borderWidth="1px" p={5} mb={5}>
              <Flex justify="space-between" align="flex-start" mb={4} wrap="wrap" gap={3}>
                <Box>
                  <Text fontWeight={700}>Order #{order._id}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {new Date(order.createdAt).toLocaleString()}
                  </Text>
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    Ship to: {order.shippingInfo.name}, {order.shippingInfo.address}, {order.shippingInfo.city} — {order.shippingInfo.postalCode} · {order.shippingInfo.phone}
                  </Text>
                  {order.shippingInfo.instructions && (
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      Note: {order.shippingInfo.instructions}
                    </Text>
                  )}
                </Box>
                <Badge colorScheme={statusColor[order.status] || "gray"} fontSize="0.8em" px={2} py={1}>
                  {order.status}
                </Badge>
              </Flex>

              {myItems.map((item, index) => (
                <Flex key={index} gap={4} mb={3} align="center">
                  <Image h={14} w={14} objectFit="cover" src={item.artImage} alt={item.artName} />
                  <Box flex="1">
                    <Text>{item.artName}</Text>
                    <Text fontSize="sm" color="gray.600">
                      Qty: {item.quantity} · ₹{item.artPrice} each
                    </Text>
                  </Box>
                  <Text>&#8377;{item.artPrice * item.quantity}</Text>
                </Flex>
              ))}

              <Flex
                justify="flex-end"
                fontWeight={700}
                pt={2}
                mb={2}
                borderTop="1px solid #eee"
              >
                <Text>
                  Your total: &#8377;
                  {myItems.reduce((sum, item) => sum + item.artPrice * item.quantity, 0)}
                </Text>
              </Flex>

              {nextOptions.length > 0 && (
                <Stack direction="row" spacing={3} mt={4}>
                  {nextOptions.map((opt) => (
                    <Button
                      key={opt.value}
                      size="sm"
                      variant={opt.value === "cancelled" ? "outline" : "solid"}
                      colorScheme={opt.value === "cancelled" ? "red" : undefined}
                      isLoading={updatingId === order._id}
                      onClick={() => updateStatus(order._id, opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </Stack>
              )}
            </Box>
          );
        })
      )}
    </Box>
  );
};

export default Sales;
