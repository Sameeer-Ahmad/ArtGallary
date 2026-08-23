import { Component } from "react";
import { Box, Heading, Text, Button, Stack } from "@chakra-ui/react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box minH="70vh" display="flex" alignItems="center" justifyContent="center" bg="brand.100" px={4}>
          <Stack spacing={4} textAlign="center" maxW="480px">
            <Heading fontSize="28px">Something went wrong</Heading>
            <Text color="gray.600">
              An unexpected error occurred. Try reloading the page — if it keeps happening, let us know.
            </Text>
            <Button onClick={() => window.location.assign("/")} alignSelf="center">
              Back to home
            </Button>
          </Stack>
        </Box>
      );
    }
    // eslint-disable-next-line react/prop-types
    return this.props.children;
  }
}

export default ErrorBoundary;
