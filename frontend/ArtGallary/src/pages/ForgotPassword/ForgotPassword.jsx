import { useState } from "react";
import {
  Box,
  FormLabel,
  Input,
  Stack,
  Button,
  Text,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { API } from "../../API/api";
import AuthLayout from "../../Component/AuthLayout/AuthLayout";

const ForgotPassword = () => {
  const [step, setStep] = useState("email"); // email -> code -> done
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const requestCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/user/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      toast({ title: data.msg || "If that email exists, a code was sent.", status: "success", duration: 4000, isClosable: true });
      setStep("code");
    } catch {
      toast({ title: "Could not reach the server. Please try again.", status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/user/verify-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (data.resetToken) {
        await submitReset(data.resetToken);
      } else {
        toast({ title: data.error || "Invalid or expired code", status: "error", duration: 3000, isClosable: true });
      }
    } catch {
      toast({ title: "Could not reach the server. Please try again.", status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  const submitReset = async (token) => {
    try {
      const res = await fetch(`${API}/user/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken: token, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep("done");
      } else {
        toast({ title: data.error || "Could not reset password", status: "error", duration: 3000, isClosable: true });
      }
    } catch {
      toast({ title: "Could not reach the server. Please try again.", status: "error", duration: 3000, isClosable: true });
    }
  };

  if (step === "done") {
    return (
      <AuthLayout title="Password reset" subtitle="You can now sign in with your new password.">
        <Button as={Link} to="/login" w="100%">
          Back to sign in
        </Button>
      </AuthLayout>
    );
  }

  if (step === "code") {
    return (
      <AuthLayout
        title="Enter your code"
        subtitle={`We sent a 6-digit code to ${email} if an account exists for it.`}
      >
        <Box as="form" onSubmit={verifyCode}>
          <Stack spacing={4}>
            <Box>
              <FormLabel>6-digit code</FormLabel>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                bg="white"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
              />
            </Box>
            <Box>
              <FormLabel>New password</FormLabel>
              <Input
                type="password"
                placeholder="At least 6 characters"
                bg="white"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
            </Box>
            <Button type="submit" isDisabled={isLoading} mt={2}>
              {isLoading ? <Spinner color="white" size="sm" /> : "Reset password"}
            </Button>
          </Stack>
        </Box>
        <Text mt={6} textAlign="center" color="gray.600">
          Didn&apos;t get a code?{" "}
          <Text as="span" color="brand.500" fontWeight={600} cursor="pointer" onClick={() => setStep("email")}>
            Try again
          </Text>
        </Text>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot password" subtitle="Enter your email and we'll send you a reset code.">
      <Box as="form" onSubmit={requestCode}>
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
          <Button type="submit" isDisabled={isLoading} mt={2}>
            {isLoading ? <Spinner color="white" size="sm" /> : "Send reset code"}
          </Button>
        </Stack>
      </Box>
      <Text mt={6} textAlign="center" color="gray.600">
        Remembered it?{" "}
        <Link to="/login" style={{ color: "#B79B54", fontWeight: 600 }}>
          Sign in
        </Link>
      </Text>
    </AuthLayout>
  );
};

export default ForgotPassword;
