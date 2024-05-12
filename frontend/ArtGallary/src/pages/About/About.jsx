


import './About.css'
const About = () => {

  // const images = [
  //   "https://artlogic-res.cloudinary.com/w_1240,h_620,c_limit,f_auto,fl_lossy,q_auto/ws-artlogicwebsite0399/usr/library/images/main/pages/24/_mg_9507.jpg",
  //   "https://artlogic-res.cloudinary.com/w_1240,h_620,c_limit,f_auto,fl_lossy,q_auto/ws-artlogicwebsite0399/usr/library/images/main/pages/24/07_dsc5126.jpg",
  //   "https://artlogic-res.cloudinary.com/w_1240,h_620,c_limit,f_auto,fl_lossy,q_auto/ws-artlogicwebsite0399/usr/library/images/main/pages/24/07_dsc5126.jpg",
  //   "https://artlogic-res.cloudinary.com/w_1240,h_620,c_limit,f_auto,fl_lossy,q_auto/ws-artlogicwebsite0399/usr/library/images/main/pages/24/xt3b907652357509551o_1600_1066.jpeg",
  //   "https://artlogic-res.cloudinary.com/w_1240,h_620,c_limit,f_auto,fl_lossy,q_auto/ws-artlogicwebsite0399/usr/library/images/main/pages/24/dsc_9189.jpg",
  //   "https://artlogic-res.cloudinary.com/w_1240,h_620,c_limit,f_auto,fl_lossy,q_auto/ws-artlogicwebsite0399/usr/library/images/main/pages/24/_mg_9335.jpg"
  // ]
  // const [selectedImage, setSelectedImage] = useState(images[0]);

  // const handleImageClick = (image) => {
  //   setSelectedImage(image);
  // };
  return (
<>
    <header>
        <h1>About Us</h1>
      </header>
      
      <div className="hero-image">
        <div className="hero-text">
          <h1>Welcome to our Art Gallery</h1>
          <p>Discover unique art experiences</p>
        </div>
      </div>

    
      <section className="container">
        <h1>Our Story</h1>
        <p>Welcome to our art gallery, where unique art experiences begin. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla accumsan magna vel enim lacinia, non varius enim aliquet. Curabitur placerat augue ut augue efficitur, quis dignissim orci interdum. Sed in ligula et arcu imperdiet auctor.</p>
        <p>From contemporary paintings to traditional sculptures, our art gallery offers a diverse collection for every art enthusiast. Our mission is to create a space where anyone can appreciate art and be inspired by creativity.</p>
       
      </section>
      <footer>
        <p>&copy; {new Date().getFullYear()} Art Gallery. All rights reserved.</p>
      </footer>
</>
  )
}

export default About;