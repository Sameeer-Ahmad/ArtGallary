import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Box,
  Heading,
  Text,
  Input,
  FormLabel,
  Button,
  Stack,
  Spinner,
  Flex,
  Avatar,
  useToast,
} from "@chakra-ui/react";
import { API } from "../../API/api";

const Settings = () => {
  const toast = useToast();
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const fileInputRef = useRef(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    axios
      .get(`${API}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUsername(response.data.username);
        setEmail(response.data.email);
        setProfilePic(response.data.profilePic || "");
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
        setLoading(false);
      });
  }, [token]);

  const handlePicChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPic(true);
    try {
      const formData = new FormData();
      formData.append("profilePic", file);
      const response = await axios.patch(`${API}/user/profile-pic`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfilePic(response.data.profilePic);
      localStorage.setItem("profilePic", response.data.profilePic);
      window.dispatchEvent(new Event("profile:updated"));
      toast({ title: "Profile picture updated", status: "success", isClosable: true });
    } catch (error) {
      toast({
        title: error.response?.data?.error || "Could not upload picture",
        status: "error",
        isClosable: true,
      });
    } finally {
      setUploadingPic(false);
      e.target.value = "";
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const response = await axios.patch(
        `${API}/user/me`,
        { newUsername: username },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem("username", response.data.username);
      window.dispatchEvent(new Event("cart:updated"));
      toast({ title: "Profile updated", status: "success", isClosable: true });
    } catch (error) {
      toast({
        title: error.response?.data?.error || "Could not update profile",
        status: "error",
        isClosable: true,
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "New passwords do not match", status: "error", isClosable: true });
      return;
    }
    setSavingPassword(true);
    try {
      await axios.patch(
        `${API}/user/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: "Password updated", status: "success", isClosable: true });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast({
        title: error.response?.data?.error || "Could not update password",
        status: "error",
        isClosable: true,
      });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }

  return (
    <Box bg="brand.100" minH="70vh" py={12} px={[4, 8]}>
      <Heading fontFamily="heading" fontSize={["28px", "36px"]} textAlign="center" mb={10}>
        Account Settings
      </Heading>

      <Box bg="white" borderRadius="md" boxShadow="md" p={8} maxW="500px" mx="auto" mb={8}>
        <Heading fontSize="20px" mb={4}>
          Profile
        </Heading>
        <Flex direction="column" align="center" mb={6}>
          <Box position="relative">
            <Avatar
              size="xl"
              name={username}
              src={profilePic || undefined}
              bg="rgb(230,228,224)"
              color="rgb(183,155,84)"
              border="3px solid rgb(183,155,84)"
            />
            {uploadingPic && (
              <Flex
                position="absolute"
                inset={0}
                align="center"
                justify="center"
                bg="blackAlpha.500"
                borderRadius="full"
              >
                <Spinner size="sm" color="white" />
              </Flex>
            )}
          </Box>
          <Button
            size="sm"
            variant="link"
            mt={3}
            onClick={() => fileInputRef.current?.click()}
            isDisabled={uploadingPic}
          >
            Change photo
          </Button>
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            display="none"
            onChange={handlePicChange}
          />
        </Flex>
        <Box as="form" onSubmit={handleProfileSave}>
          <Stack spacing={4}>
            <Box>
              <FormLabel>Name</FormLabel>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
            </Box>
            <Box>
              <FormLabel>Email</FormLabel>
              <Input value={email} isReadOnly bg="gray.50" />
              <Text fontSize="xs" color="gray.500" mt={1}>
                Email cannot be changed.
              </Text>
            </Box>
            <Button type="submit" isDisabled={savingProfile}>
              {savingProfile ? <Spinner size="sm" color="white" /> : "Save Profile"}
            </Button>
          </Stack>
        </Box>
      </Box>

      <Box bg="white" borderRadius="md" boxShadow="md" p={8} maxW="500px" mx="auto">
        <Heading fontSize="20px" mb={4}>
          Change Password
        </Heading>
        <Box as="form" onSubmit={handlePasswordSave}>
          <Stack spacing={4}>
            <Box>
              <FormLabel>Current password</FormLabel>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </Box>
            <Box>
              <FormLabel>New password</FormLabel>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </Box>
            <Box>
              <FormLabel>Confirm new password</FormLabel>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Box>
            <Button type="submit" isDisabled={savingPassword}>
              {savingPassword ? <Spinner size="sm" color="white" /> : "Update Password"}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default Settings;
