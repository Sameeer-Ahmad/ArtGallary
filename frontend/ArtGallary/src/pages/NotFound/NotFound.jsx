import { Box, Heading, Text, Button, Stack } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const NotFound = () => (
  <Box minH="70vh" display="flex" alignItems="center" justifyContent="center" bg="brand.100" px={4}>
    <Stack spacing={4} textAlign="center" maxW="480px">
      <Heading fontSize={["48px", "64px"]} color="brand.500">
        404
      </Heading>
      <Heading fontSize="24px">This page doesn&apos;t exist</Heading>
      <Text color="gray.600">
        The page you&apos;re looking for may have been moved or never existed.
      </Text>
      <Stack direction="row" spacing={3} justify="center" pt={2}>
        <Button as={Link} to="/art">
          Browse artworks
        </Button>
        <Button as={Link} to="/" variant="outline">
          Go home
        </Button>
      </Stack>
    </Stack>
  </Box>
);

export default NotFound;
