import { Box, Flex, Image, Text, useBreakpointValue, VStack } from '@chakra-ui/react'
import { SlArrowRight } from "react-icons/sl";
import { useEffect, useState } from 'react'
const images = ["https://ik.imagekit.io/theartling/prod/banners/Banner/245a41e41489485ca732825fc36d596a.jpeg", "https://ik.imagekit.io/theartling/prod/banners/Banner/457e5452c9344b34949f10a074275e91.jpeg", "https://ik.imagekit.io/theartling/prod/banners/Banner/88f5df715f784aa9b005c9d49de17072.jpeg"]
const Home = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);


  //hover effect of projects

  const [hoveredBox, setHoveredBox] = useState(null);
  const boxWidth = useBreakpointValue({ base: "100%", sm: "45%" });

  const boxes = [
    {
      src: "https://ik.imagekit.io/theartling/prod/tr:w-2400,h-2400,c-at_max,bg-000000,f-png/consultancy/Project/f2edf3da62e5457587a0f51ed4eb1032.jpg",
      text: "Patina Hotel",
      p: "maldiv"
    },
    {
      src: "https://ik.imagekit.io/theartling/prod/tr:w-2400,h-2400,c-at_max,bg-000000,f-png/consultancy/Project/d666d236f1334c159ff3bfba6567efe3.JPG",
      text: "Revolver",
      p: "singapore"
    }
  ]

  return (
    <Box display={"flex"} flexDir={"column"} alignItems={"center"} padding={4}>
      <Text w={"80%"} fontSize={"60px"} >Transforming spaces with art and design</Text>
      <Box w={"80%"} height={"650px"} position="relative" mt={"30px"}>
        {images.map((image, index) => (
          <Image
            key={index}
            src={image}
            alt={`Image ${index + 1}`}
            boxSize="100%"
            objectFit="cover"
            position="absolute"
            width={"100%"}
            top="0"
            left="0"
            opacity={index === currentIndex ? 1 : 0}
            transition="opacity 1s ease-in-out"
          />
        ))}

      </Box>
      <Text fontSize={"30px"} marginTop={"5px"}>Discover curated art & design Discover curated art & design</Text>

      <Text color={"#595957"} fontSize={"30px"} marginTop={"40px"} mar>Selected Projets</Text>
      <Box display={"flex"} width={"70%"} flexWrap={"wrap"} gap={"15px"} marginTop={"30px"}>

        <Flex direction={{ base: "column", sm: "row" }} justifyContent="space-between">
          {boxes.map((box, index) => (
            <Box
              key={index}
              width={boxWidth}
              height="auto"
              position="relative"
              overflow="hidden"
              transition="background-color 0.3s ease"
              onMouseEnter={() => setHoveredBox(index)}
              onMouseLeave={() => setHoveredBox(null)}
              bg={hoveredBox === index ? "black" : "transparent"}
            >
              <Image src={box.src} alt="image" width="100%" height={"100%"} />
              {hoveredBox === index && (
                <VStack
                  position="absolute"
                  top={0}
                  left={0}
                  width="100%"
                  height="100%"
                  bg="black"
                  color="white"
                  justifyContent="center"
                  textAlign={"center"}

                  opacity={hoveredBox === index ? 1 : 0}
                  transition="opacity 0.3s ease"
                >
                  <Text fontSize={"30px"} fontWeight={"700"} alignItems="center">{box.text}</Text>
                  <Text fontSize={"20px"} alignItems="center">{box.p}</Text>

                </VStack>
              )}
            </Box>
          ))}
        </Flex>





      </Box>
      <Flex alignItems={"flex-end"} mt={8} >
        <Text fontSize={"38px"}>Discover more projects  </Text>
        <SlArrowRight fontSize={"38px"} mt={2} />
      </Flex>
      <Box width={"200px"} marginTop={"50px"}></Box>
    </Box>
  )
}

export default Home