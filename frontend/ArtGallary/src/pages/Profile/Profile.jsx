import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Text,
  Avatar,
  Badge,
  Button,
  Stack,
  Spinner,
} from "@chakra-ui/react";
import { API } from "../../API/api";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get(`${API}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUser(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }

  if (!user) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Text fontSize="lg">Could not load your profile.</Text>
      </Flex>
    );
  }

  return (
    <Box bg="brand.100" minH="60vh" py={12} px={[4, 8]}>
      <Box bg="white" borderRadius="md" boxShadow="md" p={8} maxW="500px" mx="auto">
        <Flex direction="column" align="center" mb={6}>
          <Avatar
            size="xl"
            name={user.username}
            src={user.profilePic || undefined}
            bg="rgb(230,228,224)"
            color="rgb(183,155,84)"
            border="3px solid rgb(183,155,84)"
            mb={4}
          />
          <Heading fontSize="24px">{user.username}</Heading>
          <Badge mt={2} colorScheme={user.role === "artist" ? "purple" : "gray"}>
            {user.role === "artist" ? "Creator" : "Explorer"}
          </Badge>
        </Flex>

        <Stack spacing={3} mb={8}>
          <Flex justify="space-between">
            <Text color="gray.500">Email</Text>
            <Text>{user.email}</Text>
          </Flex>
        </Stack>

        <Stack spacing={3}>
          <Button onClick={() => navigate("/orders")}>Your Orders</Button>
          {user.role === "artist" && (
            <Button variant="outline" onClick={() => navigate("/art-portfolio")}>
              Your Art Portfolio
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default Profile;
