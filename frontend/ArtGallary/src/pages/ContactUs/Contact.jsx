import { useState } from "react";
import {
  Box,
  Grid,
  Heading,
  Text,
  Stack,
  Input,
  Textarea,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useToast,
} from "@chakra-ui/react";

const FAQS = [
  {
    q: "Do I need an account to browse?",
    a: "No — you can browse and search every artwork without signing in. You'll need an account to check out.",
  },
  {
    q: "How do I buy an artwork?",
    a: "Sign up or log in, find a piece you like, add it to your cart, then check out securely with Razorpay.",
  },
  {
    q: "What payment methods are supported?",
    a: "Checkout is handled by Razorpay, which supports cards, UPI, and netbanking depending on your account.",
  },
  {
    q: "How do I see my past orders?",
    a: "Open the account menu in the top right and choose \"Your Orders\" to see everything you've purchased.",
  },
  {
    q: "I'm an artist — how do I list my own art?",
    a: "Sign up with the \"Creator\" role, then use \"Your Art Portfolio\" from the account menu to add listings.",
  },
];

const Contact = () => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Form submitted:", formData);
    toast({
      title: "Message sent — we'll get back to you soon.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <Box bg="brand.100" minH="70vh" py={12} px={[4, 8]}>
      <Heading fontFamily="heading" fontSize={["28px", "36px"]} textAlign="center" mb={2}>
        Contact Us
      </Heading>
      <Text textAlign="center" color="gray.600" mb={12}>
        Questions about an order, an artwork, or your account? Send us a
        message.
      </Text>

      <Box bg="white" borderRadius="md" boxShadow="md" p={8} maxW="700px" mx="auto" mb={10}>
        <Heading fontSize="20px" mb={4}>
          Frequently asked questions
        </Heading>
        <Accordion allowToggle>
          {FAQS.map((faq) => (
            <AccordionItem key={faq.q}>
              <AccordionButton px={0}>
                <Box as="span" flex="1" textAlign="left" fontWeight={600}>
                  {faq.q}
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} px={0} color="gray.600">
                {faq.a}
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Box>

      <Grid
        templateColumns={["1fr", "1fr", "1fr 1fr"]}
        gap={10}
        maxW="900px"
        mx="auto"
      >
        <Box bg="white" borderRadius="md" boxShadow="md" p={8}>
          <Heading fontSize="20px" mb={4}>
            Our Company
          </Heading>
          <Stack spacing={2} color="gray.700">
            <Text>
              <strong>Address:</strong> Building No.45, Main Street, Mumbai
            </Text>
            <Text>
              <strong>Phone:</strong> +91 12345 67890
            </Text>
            <Text>
              <strong>Email:</strong> support@theartline.example
            </Text>
          </Stack>
        </Box>

        <Box bg="white" borderRadius="md" boxShadow="md" p={8}>
          <Heading fontSize="20px" mb={4}>
            Send a message
          </Heading>
          <Box as="form" onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <Input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Textarea
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                required
              />
              <Button type="submit">Submit</Button>
            </Stack>
          </Box>
        </Box>
      </Grid>
    </Box>
  );
};

export default Contact;
