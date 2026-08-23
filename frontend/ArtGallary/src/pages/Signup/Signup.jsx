import { useState } from "react";
import {
  Box,
  Button,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../../API/api";
import AuthLayout from "../../Component/AuthLayout/AuthLayout";

const ROLES = [
  { value: "collector", label: "Explorer", hint: "Browse and buy art" },
  { value: "artist", label: "Creator", hint: "Sell your own art" },
];

function Signup() {
  const [role, setRole] = useState("collector");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleRegister = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const payload = {
      username,
      email,
      password,
      role,
    };

    fetch(`${API}/user/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to create account");
        }
        return data;
      })
      .then(() => {
        toast({
          title: "Account created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        navigate("/login");
      })
      .catch((err) => {
        console.log(err);
        toast({
          title: err.message || "Failed to create account",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join The Artline to start collecting or selling."
    >
      <Box as="form" onSubmit={handleRegister}>
        <Stack spacing={4}>
          <Box>
            <FormLabel>Name</FormLabel>
            <Input
              required
              type="text"
              placeholder="Your name"
              bg="white"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Box>

          <Box>
            <FormLabel>Sign up as</FormLabel>
            <Stack direction="row" spacing={3}>
              {ROLES.map((r) => (
                <Box
                  key={r.value}
                  as="button"
                  type="button"
                  onClick={() => setRole(r.value)}
                  flex={1}
                  textAlign="left"
                  p={3}
                  borderRadius="md"
                  border="2px solid"
                  borderColor={role === r.value ? "brand.500" : "gray.200"}
                  bg="white"
                >
                  <Text fontWeight={700}>{r.label}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {r.hint}
                  </Text>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box>
            <FormLabel>Email address</FormLabel>
            <Input
              required
              type="email"
              placeholder="you@example.com"
              bg="white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Box>

          <Box>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                required
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                bg="white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </Box>

          <Box>
            <FormLabel>Confirm password</FormLabel>
            <InputGroup>
              <Input
                required
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                bg="white"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <InputRightElement>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? <ViewIcon /> : <ViewOffIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>
          </Box>

          <Button type="submit" mt={2}>
            Sign Up
          </Button>
        </Stack>
      </Box>
      <Text mt={6} textAlign="center" color="gray.600">
        Already have an account?{" "}
        <Link to="/login" style={{ color: "#B79B54", fontWeight: 600 }}>
          Sign in
        </Link>
      </Text>
    </AuthLayout>
  );
}

export default Signup;
