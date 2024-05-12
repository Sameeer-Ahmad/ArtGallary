import {
  Box,
  Flex,
  HStack,
  IconButton,
  useDisclosure,
  Stack,
  Menu,
  MenuButton,
  Avatar,
  MenuList,
  Center,
  MenuDivider,
  MenuItem,
  InputGroup,
  InputRightElement,
  Input,
  Image,
} from "@chakra-ui/react";
import "./ArtGallaryLogo.png";
import { HamburgerIcon, CloseIcon, SearchIcon } from "@chakra-ui/icons";
import { Link, useParams } from "react-router-dom";

import PropTypes from 'prop-types';
NavBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
};
const Links = [
  { ids: 1, name: "PAINTING", link: "/art/paintings" },
  { ids: 2, name: "PRINTS", link: "/art/prints" },
  { ids: 3, name: "PHOTOGRAPHY", link: "/art/photography" },
  { ids: 4, name: "SCULPTURE", link: "/art/sculpture" },
  { ids: 5, name: "DRAWINGS", link: "/art/drawings" },
  { ids: 6, name: "INSPIRATION", link: "/art/inspiration" },
  { ids: 7, name: "ABOUT", link: "/about" },
  // { ids: 8, name: "cart", link: "/cart" },
];

export default function NavBar() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box bg={"rgb(250,248,244)"}>
        <HStack
          spacing={10}
          display={["flex", "flex", "flex", "flex", "flex", "flex"]}
          justifyContent={"space-around"}
          alignItems={"center"}
          fontSize={["xs", "xs", "xs", "sm", "sm", "md"]}
          pl={[0, 0, 0, 40]}
          pr={[0, 0, 0, 40]}
          pt={1}
          pb={1}
        >
          <Menu>
            <Link to={"/"}>
              <Image
                h={20}
                w={20}
                src="https://theartling.com/build/_assets/TheArtlingLogo-BZIAGPLW.svg"
                alt="logo"
                pl={[3, 0, 0]}
              />
            </Link>
            <Center width={["60%"]}>
              <InputGroup border={"none"}>
                <InputRightElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputRightElement>
                <Input
                  bg={"white"}
                  border={"none"}
                  variant="unstyled"
                  type="text"
                  placeholder="Search for artworks"
                />
              </InputGroup>
            </Center>
            <Link to={`/cart`}>
              <Image
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOS21XGbmcqgL2cVVZrVFIRU1gW6KbOqh6Gedz9I6y2Vz_d2KWk_-tw_6eQw&s"
                h={8}
                w={8}
              />
            </Link>
            <MenuButton>
              <Avatar
                h={8}
                w={8}
                pr={[3, 0, 0]}
                src={"https://www.svgrepo.com/show/170633/profile-user.svg"}

              />
            </MenuButton>

            <MenuList>
              <Center>
                <p>Username</p>
              </Center>
              <MenuDivider />
              <MenuItem>Your Servers</MenuItem>
              <MenuItem>Account Settings</MenuItem>
              <MenuItem>Logout</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Box>
      <Box width={"100%"} borderBottom="1px solid #D9D1C2"></Box>
      <Box bg="rgb(250,248,244)" px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <IconButton
            size={"md"}
            bg={"none"}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"}
            display={{ md: "none" }}
            onClick={isOpen ? onClose : onOpen}
          />

          <HStack
            spacing={10}
            alignItems={"center"}
            fontSize={["xs", "xs", "xs", "sm", "sm", "md"]}
          >
            <HStack
              as={"nav"}
              spacing={8}
              display={{ base: "none", md: "flex" }}
              justify={"flex-end"}
              pl={[0, 0, 62, 48, 72]}
            >
              {Links.map((el) => (
                <Link to={el.link} key={el.ids}>
                  {el.name}{" "}
                </Link>
              ))}
            </HStack>
          </HStack>
          <Flex alignItems={"center"}></Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: "none" }}>
            <Stack
              as={"nav"}
              spacing={4}
              fontSize={["xs", "sm", "sm", "sm", "md", "lg"]}
            >
              {Links.map((el) => (
                <Link to={el.link} key={el.ids}>
                  {el.name}{" "}
                </Link>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  );
}
