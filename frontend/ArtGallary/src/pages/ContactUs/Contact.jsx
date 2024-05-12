import React from 'react'
import { useState } from 'react';
import './Contact.css'
const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    // Handle form field changes
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

    // Handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        // Perform form submission logic here (e.g., sending data to a server)
        console.log('Form submitted:', formData);
        // Clear form fields after submission
        setFormData({
            name: '',
            email: '',
            message: ''
        });
    }

    return (
        <div className="container">
            <div className="contact-us">
                <h1>Contact us</h1>
                <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                     Inventore commodi laboriosam quos maxime, soluta quia <br />
                     incidunt eius ex consectetur assumenda ipsa quod voluptates 
                     similique accusantium tenetur? Dicta recusandae accusamus dolore,<br />
                     incidunt eius ex consectetur assumenda ipsa quod voluptates  </p>
            </div>
            {/* Company Info */}
            <div className="info">
                <h1>Our Company</h1>
                <p><strong>Address:</strong> Building No.45,Main Street,Mumbai </p>
                <p><strong>Phone:</strong> +1234567890</p>
                <p><strong>Email:</strong> ArtGallery123@gmail.com</p>
            </div>
            {/* Contact Form */}
            <div className="form">
                <h2>Contact Us</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} required />
                    <input type="email" name="email" placeholder="Your Email" value={formData.email} onChange={handleChange} required />
                    <textarea name="message" placeholder="Your Message" value={formData.message} onChange={handleChange} rows="5" required></textarea>
                    <input type="submit" value="Submit" />
                </form>
            </div>
        </div>
    );
}

export default Contact