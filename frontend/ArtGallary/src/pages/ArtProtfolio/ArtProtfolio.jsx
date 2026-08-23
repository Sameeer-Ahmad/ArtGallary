import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FormControl, Select, useToast } from "@chakra-ui/react";
import {
  Box,
  Text,
  Stack,
  Image,
  Grid,
  Flex,
  Skeleton,
  Button,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormLabel,
  Input,
  Spinner,
} from "@chakra-ui/react";

import { AddIcon } from "@chakra-ui/icons";
import { FiUpload } from "react-icons/fi";

import AOS from "aos";

import "aos/dist/aos.css";
import { API } from "../../API/api";
AOS.init();
const PAGE_SIZE = 16;
const ArtPortfolio = () => {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);

  const [arts, setArts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sortBy, setSortBy] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const [username, setUsername] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = useRef(null);
  const sentinelRef = useRef(null);
  const fileInputRef = useRef(null);

  const finalRef = useRef(null);
  const [artName, setName] = useState("");
  const [artPrice, setPrice] = useState(0);
  const [editCategory, setEditCategory] = useState("");
  const [editDimension, setEditDimension] = useState("");
  const [editStock, setEditStock] = useState(0);
  const [savingEdit, setSavingEdit] = useState(false);
  const [artId, setArtId] = useState(null);
  const [artNamePost, setArtName] = useState("");
  const [artPricePost, setArtPrice] = useState("");
  const [artCategory, setArtCategory] = useState("");
  const [artDimension, setArtDimension] = useState("");
  const [stock, setStock] = useState(1);
  const [artImage, setSelectedFiles] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [role, setRole] = useState();

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files[0] || null);
  };

  const resetPostForm = () => {
    setArtName("");
    setArtPrice("");
    setArtCategory("");
    setArtDimension("");
    setStock(1);
    setSelectedFiles(null);
  };

  const handleSubmitPostForm = async (e) => {
    e.preventDefault();
    if (!artImage) {
      toast({ title: "Please choose an image", status: "error", duration: 3000, isClosable: true });
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("artImage", artImage);
      formData.append("artName", artNamePost);
      formData.append("artPrice", artPricePost);
      formData.append("artCategory", artCategory);
      formData.append("created_at", Date.now());
      formData.append("artDimension", artDimension);
      formData.append("stock", stock);

      await axios.post(`${API}/artist/add`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      getAllArt();

      toast({
        title: "Art added successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      resetPostForm();
      setShowModal(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error adding art",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalOpen = (painting) => {
    onOpen();
    setName(painting.artName);
    setPrice(painting.artPrice);
    setEditCategory(painting.artCategory);
    setEditDimension(painting.artDimension);
    setEditStock(painting.stock);
    setArtId(painting._id);
  };
  function getAllArt() {
    axios
      .get(`${API}/artist/artPortfolio`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setRole(response.data.role);

        let sortedArts = response.data.getArt;
        if (sortBy === "Newest") {
          sortedArts = sortedArts.sort((a, b) => b.created_at - a.created_at);
        } else if (sortBy === "Low to High") {
          sortedArts = sortedArts.sort((a, b) => a.artPrice - b.artPrice);
        } else if (sortBy === "High to Low") {
          sortedArts = sortedArts.sort((a, b) => b.artPrice - a.artPrice);
        }
        setArts(sortedArts);
        setVisibleCount(PAGE_SIZE);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching paintings:", error);
        setArts([]);
        setLoading(false);
      });
  }
  useEffect(() => {
    getAllArt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, sortBy]);

  useEffect(() => {
    axios
      .get(`${API}/user/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => setUsername(response.data.username))
      .catch((error) => console.error("Error fetching current user:", error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!sentinelRef.current || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, arts.length));
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loading, arts.length]);

  const handleDelete = async (id) => {
    try {
      await axios
        .delete(`${API}/artist/delete/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          console.log(response.status);
          const updatedArts = arts.filter((art) => art._id !== id);
          setArts(updatedArts);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handlePriceChange = (e) => {
    setPrice(e.target.value);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const updates = {
        artName,
        artPrice,
        artCategory: editCategory,
        artDimension: editDimension,
        stock: editStock,
      };
      await axios.patch(`${API}/artist/update/${artId}`, updates, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setArts(
        arts.map((art) => (art._id === artId ? { ...art, ...updates } : art))
      );
      toast({ title: "Art updated", status: "success", duration: 2500, isClosable: true });
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        title: error.response?.data?.error || "Could not update art",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const visibleArts = arts.slice(0, visibleCount);
  const hasMore = visibleCount < arts.length;

  const renderArtCards = () => {
    return visibleArts.map((painting) => (
      <Box
        data-aos="fade-down"
        data-aos-anchor-placement="top"
        key={painting._id}
        width={"auto"}
        height={"auto"}
        bg="#f5f1ee"
        borderRadius="md"
        boxShadow="md"
      >
        <Image
          width={"100%"}
          objectFit="cover"
          src={painting.artImage[0]}
          alt={painting.artName}
        />

        <Stack pt={5} pr={4} pl={4} pb={5} gap={0} bg={"white"}>
          <Text
            fontWeight={400}
            fontSize={"17px"}
            fontFamily={"Addington CF"}
            lineHeight={"21px"}
            letterSpacing={"1px"}
          >
            {painting.artName}
          </Text>
          <Text
            fontSize={"17px"}
            fontFamily={"sans-serif"}
            color={"rgb(183, 155, 84)"}
            letterSpacing={"1px"}
          >
            {painting.username}
          </Text>

          <Text
            fontSize={"17"}
            fontFamily={"sans-serif"}
            color={"rgb(183, 155, 84)"}
            letterSpacing={"1px"}
          >
            {painting.artCategory}
          </Text>

          <Text
            fontSize={"17px"}
            fontWeight={700}
            fontFamily={"sans-serif"}
            color={"rgb(183, 155, 84)"}
            letterSpacing={"1px"}
          >
            ₹{painting.artPrice}
          </Text>
          <Button
            w="100%"
            onClick={() =>
              handleModalOpen(painting)
            }
          >
            Edit Details
          </Button>
          <Button
            w="100%"
            variant="outline"
            colorScheme="red"
            onClick={() => handleDelete(painting._id)}
            mt={2}
          >
            Delete
          </Button>
        </Stack>
      </Box>
      // </Link>
    ));
  };
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };
  return (
    <Box bg="rgb(250,248,244)">
      <Modal
        initialFocusRef={initialRef}
        finalFocusRef={finalRef}
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior="inside"
        size={["full", "md"]}
      >
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>Edit Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <Box>
                  <FormLabel>Name</FormLabel>
                  <Input
                    bg="white"
                    value={artName}
                    onChange={handleNameChange}
                    ref={initialRef}
                    placeholder="Name of your art"
                  />
                </Box>
                <Box>
                  <FormLabel>Price (₹)</FormLabel>
                  <Input
                    bg="white"
                    type="number"
                    min={0}
                    value={artPrice}
                    onChange={handlePriceChange}
                    placeholder="Enter your price"
                  />
                </Box>
                <Box>
                  <FormLabel>Category</FormLabel>
                  <Select
                    bg="white"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                  >
                    {[
                      "Painting",
                      "Print",
                      "Sculpture",
                      "Photography",
                      "Inspiration",
                      "Drawing",
                      "Acrylic",
                    ].map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>
                </Box>
                <Box>
                  <FormLabel>Dimension</FormLabel>
                  <Input
                    bg="white"
                    value={editDimension}
                    onChange={(e) => setEditDimension(e.target.value)}
                    placeholder="e.g. 40 x 50 cm"
                  />
                </Box>
                <Box>
                  <FormLabel>Stock</FormLabel>
                  <Input
                    bg="white"
                    type="number"
                    min={0}
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                  />
                </Box>
                <Stack direction="row">
                  <Button type="submit" isDisabled={savingEdit}>
                    {savingEdit ? <Spinner size="sm" color="white" /> : "Save"}
                  </Button>
                  <Button variant="outline" onClick={onClose} isDisabled={savingEdit}>
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap={4}
        px={[4, 8]}
        pt={8}
        pb={4}
      >
        <Heading fontSize={["20px", "24px", "28px"]} fontWeight={600} fontFamily="body">
          {role === "artist" ? <>{username}&apos;s Art Portfolio</> : username}
        </Heading>

        {role === "artist" && (
          <Button fontSize="sm" onClick={() => setShowModal(true)}>
            Add Art <AddIcon ml={2} />
          </Button>
        )}
      </Flex>

      {role !== "artist" ? (
        ""
      ) : loading ? (
        <Grid
          gap={8}
          p={8}
          templateColumns={[
            "repeat(1, 1fr)",
            "repeat(2, 1fr)",
            "repeat(3, 1fr)",
            "repeat(4, 1fr)",
            "repeat(4,1fr)",
            "repeat(5,1fr)",
            "repeat(5,1fr)",
          ]}
          alignItems="center"
        >
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <Box
              key={index}
              width={"auto"}
              height={"auto"}
              bg="#f5f1ee"
              borderRadius="md"
              boxShadow="md"
            >
              <Skeleton
                height="200px"
                startColor="rgb(250,248,244)"
                endColor="rgb(150,148,144)"
              />
            </Box>
          ))}
        </Grid>
      ) : (
        <>
          <Flex marginRight={4} justifyContent="flex-end" pt={4} pr={6}>
            {role == "artist" && (
              <select
                style={{
                  backgroundColor: "rgb(250,248,244)",
                  fontSize: "16px",
                  fontFamily: "sans-serif",
                  height: "40px",
                  paddingLeft: "10px",
                  width: "140px",
                  border: "1px solid rgb(183, 155, 84)",
                  appearance: "none",
                  background:
                    'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%238a8a8a"><path d="M7 10l5 5 5-5z"/></svg>\') no-repeat right 10px center',
                  backgroundSize: "36px 36px",
                }}
                defaultValue=""
                onFocus={(e) => {
                  e.target.style.borderColor = "green";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#f5f1ee";
                }}
                onChange={handleSortChange}
              >
                <option value="" disabled selected hidden>
                  Sort By
                </option>
                <option value="Newest">Newest</option>
                <option value="Low to High">Low to High</option>
                <option value="High to Low">High to Low</option>
              </select>
            )}
          </Flex>
          <Grid
            gap={8}
            p={8}
            templateColumns={[
              "repeat(1, 1fr)",
              "repeat(2, 1fr)",
              "repeat(3, 1fr)",
              "repeat(4, 1fr)",
              "repeat(4,1fr)",
              "repeat(5,1fr)",
              "repeat(5,1fr)",
            ]}
            alignItems="center"
          >
            {renderArtCards()}
          </Grid>
          {hasMore && (
            <Flex ref={sentinelRef} justifyContent="center" py={8}>
              <Spinner color="brand.500" />
            </Flex>
          )}
          {!hasMore && arts.length > PAGE_SIZE && (
            <Text textAlign="center" py={8} color="gray.500">
              You&apos;ve reached the end — {arts.length} pieces
            </Text>
          )}
        </>
      )}

      <p
        style={{
          borderTop: "1px solid rgb(183, 155, 84)",
          width: "95%",
          margin: "0 auto",
          padding: "10px",
        }}
      ></p>

      <Box
        p={8}
        pb={20}
        fontSize={"10px"}
        fontFamily={"sans-serif"}
        textAlign={"center"}
      >
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          scrollBehavior="inside"
          size={["full", "md"]}
        >
          <ModalOverlay />
          <ModalContent maxH="90vh">
            <ModalHeader>Add New Art</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <form onSubmit={handleSubmitPostForm}>
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel>Name</FormLabel>
                    <Input
                      bg="white"
                      type="text"
                      placeholder="Enter art name"
                      value={artNamePost}
                      onChange={(e) => setArtName(e.target.value)}
                      required
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Price (₹)</FormLabel>
                    <Input
                      bg="white"
                      type="number"
                      min={0}
                      placeholder="Enter price"
                      value={artPricePost}
                      onChange={(e) => setArtPrice(e.target.value)}
                      required
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Category</FormLabel>
                    <Select
                      bg="white"
                      value={artCategory}
                      onChange={(e) => setArtCategory(e.target.value)}
                      placeholder="Select category"
                      required
                    >
                      {[
                        "Painting",
                        "Print",
                        "Sculpture",
                        "Photography",
                        "Inspiration",
                        "Drawing",
                        "Acrylic",
                      ].map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Dimension</FormLabel>
                    <Input
                      bg="white"
                      type="text"
                      placeholder="e.g. 40 x 50 cm"
                      value={artDimension}
                      onChange={(e) => setArtDimension(e.target.value)}
                      required
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Stock</FormLabel>
                    <Input
                      bg="white"
                      type="number"
                      min={0}
                      placeholder="Enter available stock"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      required
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Image</FormLabel>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      display="none"
                    />
                    <Flex align="center" gap={3}>
                      <Button
                        variant="outline"
                        leftIcon={<FiUpload />}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choose image
                      </Button>
                      <Text fontSize="sm" color="gray.600" noOfLines={1}>
                        {artImage ? artImage.name : "No file selected"}
                      </Text>
                    </Flex>
                  </FormControl>
                  <Button type="submit" isDisabled={submitting}>
                    {submitting ? <Spinner size="sm" color="white" /> : "Submit"}
                  </Button>
                </Stack>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </Box>
  );
};

export default ArtPortfolio;
