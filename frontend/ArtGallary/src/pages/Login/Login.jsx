import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {
  Box,
  FormLabel,
  Input,
  Stack,
  Button,
  InputGroup,
  InputRightElement,
  Text,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API } from "../../API/api";
import { getGuestCart, clearGuestCart } from "../../API/guestCart";
import AuthLayout from "../../Component/AuthLayout/AuthLayout";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State to track loading
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true); // Set loading to true when login process starts
    const payload = {
      email,
      password,
    };

    fetch(`${API}/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then(async (data) => {
        setIsLoading(false); // Set loading to false when login process completes
        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userID", data.userID);
          localStorage.setItem("username", data.username);
          localStorage.setItem("role", data.role || "collector");
          localStorage.setItem("profilePic", data.profilePic || "");

          const guestItems = getGuestCart();
          if (guestItems.length > 0) {
            await Promise.all(
              guestItems.map((item) =>
                axios
                  .post(
                    `${API}/art/addToCart`,
                    { artId: item.artId, quantity: item.quantity },
                    { headers: { Authorization: `Bearer ${data.token}` } }
                  )
                  .catch((err) => console.error("Error merging guest cart item:", err))
              )
            );
            clearGuestCart();
            window.dispatchEvent(new Event("cart:updated"));
          }

          toast({
            title: "Logged in successfully",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          navigate(guestItems.length > 0 ? "/cart" : "/home");
        } else {
          toast({
            title: data.error || "Invalid email or password",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      })
      .catch((err) => {
        setIsLoading(false); // Set loading to false if login process encounters an error
        console.log(err);
        toast({
          title: "Could not reach the server. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue collecting."
    >
      <Box as="form" onSubmit={handleLogin}>
        <Stack spacing={4}>
          <Box>
            <FormLabel>Email address</FormLabel>
            <Input
              type="email"
              placeholder="you@example.com"
              bg="white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Box>
          <Box>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                bg="white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <InputRightElement>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>
            <Text mt={2} textAlign="right">
              <Link to="/forgot-password" style={{ color: "#B79B54", fontSize: "14px" }}>
                Forgot password?
              </Link>
            </Text>
          </Box>
          <Button type="submit" isDisabled={isLoading} mt={2}>
            {isLoading ? <Spinner color="white" size="sm" /> : "Sign In"}
          </Button>
        </Stack>
      </Box>
      <Text mt={6} textAlign="center" color="gray.600">
        Don&apos;t have an account?{" "}
        <Link to="/signup" style={{ color: "#B79B54", fontWeight: 600 }}>
          Sign up
        </Link>
      </Text>
    </AuthLayout>
  );
}

export default Login;
