import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      50: "#faf7ef",
      100: "#f5f1ee",
      200: "#e6e4e0",
      300: "#d9d1c2",
      400: "#cdb87a",
      500: "#b79b54",
      600: "#a68a3f",
      700: "#8a7433",
      800: "#595957",
      900: "#3a3a38",
    },
  },
  fonts: {
    heading: `'Fraunces', serif`,
    body: `'Inter', sans-serif`,
  },
  styles: {
    global: {
      body: {
        bg: "brand.100",
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "20px",
      },
      variants: {
        solid: {
          bg: "brand.500",
          color: "white",
          border: "2px solid",
          borderColor: "brand.500",
          _hover: {
            bg: "white",
            color: "brand.500",
          },
        },
      },
    },
  },
});

export default theme;
