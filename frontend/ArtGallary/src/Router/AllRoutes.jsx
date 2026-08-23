import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Paint from "../Component/Paint/Paint";
import Print from "../Component/Prints/Print";
import Sculpture from "../Component/Sculpture/Sculpture";
import Photography from "../Component/Photography/Photography";
import Inspiration from "../Component/Insipration/Inspiration";
import Drawing from "../Component/Drawings/Drawing";
import Cart from "../pages/Cart/Cart";
import Profile from "../pages/Profile/Profile";
import ArtProtfolio from "../pages/ArtProtfolio/ArtProtfolio";
import Signup from "../pages/Signup/Signup";
import Login from "../pages/Login/Login";
import About from "../pages/About/About";
import Navbar from "../Component/Navbar/Navbar";
import Art from "../pages/Art/Art";
import SingleArt from "../pages/SingleArt/singleArt";
import Home from "../pages/Home/Home";
import Dashboard from "../pages/Dashboard/Dashboard";
import Footer from "../Component/Footer/Footer";
import Contact from "../pages/ContactUs/Contact";
import DashNav from "../pages/Dashboard/Dashbordnav";
import Checkout from "../pages/Checkout/Checkout";
import Orders from "../pages/Orders/Orders";
import Artist from "../pages/Artist/Artist";
import Search from "../pages/Search/Search";
import Settings from "../pages/Settings/Settings";
import Wishlist from "../pages/Wishlist/Wishlist";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import Sales from "../pages/Sales/Sales";
import NotFound from "../pages/NotFound/NotFound";

// eslint-disable-next-line react/prop-types
const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

// eslint-disable-next-line react/prop-types
const GuestOnly = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/home" replace /> : children;
};

// eslint-disable-next-line react/prop-types
const RequireArtist = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <Navigate to="/login" replace />;
  return role === "artist" ? children : <Navigate to="/home" replace />;
};

const AllRoutes = () => {
  const location = useLocation();
  const [showNavbar, setShowNavbar] = useState(true);
  const [showFooter, setShowFooter] = useState(true);
  const [showDashNav, setDashNav] = useState(false)
  useEffect(() => {
    window.scrollTo(0, 0);

    if (
      location.pathname === "/login" ||
      location.pathname === "/signup" ||
      location.pathname === "/forgot-password"
    ) {
      setShowNavbar(false);
      setShowFooter(false);
      setDashNav(false)
    }
    else if (location.pathname === "/" || location.pathname === '/about' || location.pathname === '/contactus') {
      setShowNavbar(false)
      setShowFooter(true)
      setDashNav(true)
    }
    else {
      setShowNavbar(true);
      setShowFooter(true);
      setDashNav(false)
    }
  }, [location]);

  return (
    <div>
      {showNavbar && <Navbar isDashboardNavbar={false}  />}
      {showDashNav && <DashNav />}
      <Routes>
        <Route
          path="/"
          element={
            <GuestOnly>
              <Dashboard />
            </GuestOnly>
          }
        />
        <Route path="/art/paintings" element={<Paint />} />
        <Route path="/art/prints" element={<Print />} />
        <Route path="/art/sculpture" element={<Sculpture />} />
        <Route path="/art/photography" element={<Photography />} />
        <Route path="/art/inspiration" element={<Inspiration />} />
        <Route path="/art/drawings" element={<Drawing />} />
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/art-portfolio"
          element={
            <RequireAuth>
              <ArtProtfolio />
            </RequireAuth>
          }
        />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/art" element={<Art />} />
        <Route
          path="/home"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route path="/contactus" element={<Contact />} />
        <Route path="/art/:id" element={<SingleArt />} />
        <Route path="/artist/:username" element={<Artist />} />
        <Route path="/search" element={<Search />} />
        <Route
          path="/checkout"
          element={
            <RequireAuth>
              <Checkout />
            </RequireAuth>
          }
        />
        <Route
          path="/orders"
          element={
            <RequireAuth>
              <Orders />
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <Settings />
            </RequireAuth>
          }
        />
        <Route
          path="/wishlist"
          element={
            <RequireAuth>
              <Wishlist />
            </RequireAuth>
          }
        />
        <Route path="/forgot-password" element={<GuestOnly><ForgotPassword /></GuestOnly>} />
        <Route
          path="/sales"
          element={
            <RequireArtist>
              <Sales />
            </RequireArtist>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showFooter && <Footer />}
    </div>
  );
};

export default AllRoutes;
