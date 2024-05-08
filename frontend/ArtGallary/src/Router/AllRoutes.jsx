import React from 'react';
import { BrowserRouter as Router, Route,Routes } from 'react-router-dom';
// import Painting from '../Component/Navbar/Painting';
import Navigation from '../Navigation/Navigate';
import Home from '../pages/Home/Home';
import Painting from '../Component/Navbar/Painting';

const AllRoutes = () => {
  return (
    // <Router>
   <div>
     <Navigation />
      <Routes>
      
      <Route path="/painting" element={<Painting />} />
      <Route path="/home" element={<Home/>}/>
      <Route path="/paint" element={<print/>}/>
      </Routes>
   </div>
    // </Router>
  );
};

export default AllRoutes;
