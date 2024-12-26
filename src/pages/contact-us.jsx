import React, { useState } from 'react';
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faPhone, faLocationDot, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        fullName: '',
        message: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePhoneChange = (value) => {
        setFormData({ ...formData, phone: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5001/contactus', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    phone_number: formData.phone,
                    fullname: formData.fullName,
                    message: formData.message,
                }),
            });

            if (response.ok) {
                alert('Message sent successfully!');
                const responseData = await response.json();
                console.log('Response Data:', responseData);

                setFormData({ email: '', phone: '', fullName: '', message: '' });
                window.location.href = '/';
            } else {
                alert('Failed to send the message. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting the form:', error);
            alert('An error occurred. Please try again later.');
        }
    };

    return (
        <div className="flex flex-row w-full h-screen justify-center items-center bg-gray-100">
            <div className="flex flex-row w-4/5 sm:w-3/4 md:w-2/3 lg:w-1/2 bg-white shadow-lg rounded-lg h-[570px] mt-">
                {/* Form Section */}
                <div className="flex flex-col w-[70%] h-[400px] p-8">
                    <h1 className="text-2xl font-semibold mb-6">Send us a Message</h1>
                    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                        <label htmlFor="fullName" className="font-medium">
                            Your Name
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="border rounded-lg p-2"
                        />

                        <label htmlFor="email" className="font-medium">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="border rounded-lg p-2"
                        />

                        <label htmlFor="phone" className="font-medium">
                            Phone
                        </label>
                        <PhoneInput
                            country={'in'}
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            inputStyle={{
                                border: 'none',  // Remove border
                                outline: 'none',  // Remove any outline if present
                            }}
                            className="border rounded-lg"
                        />

                        <label htmlFor="message" className="font-medium">
                            Message
                        </label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            className="border rounded-lg p-2"
                            style={{ resize: 'none' }}
                            rows="3"
                        />

                        <button
                            type="submit"
                            className="bg-black text-white rounded-full px-6 py-2 mt-4 flex items-center justify-center"
                        >
                            <FontAwesomeIcon icon={faPaperPlane} style={{ color: "#ffffff", marginRight: "8px" }} />
                            Submit
                        </button>
                    </form>
                </div>

                {/* Contact Info Section */}
                <div className="flex flex-col gap-3 bg-[url('public/img/contactbg.jpeg')] bg-cover bg-center text-white p-8">
                    <h1 className="text-2xl font-semibold mb-20">Contact Information</h1>
                    <p className="flex items-center mb-4">
                        <span><FontAwesomeIcon icon={faLocationDot} style={{ color: "#ffffff", marginRight: "8px", padding: "6px" }} /></span>
                        Lorem ipsum dolor sit ut inventore. Libero!
                    </p>
                    <p className="flex items-center mb-4">
                        <span><FontAwesomeIcon icon={faPhone} style={{ color: "#ffffff", marginRight: "8px", padding: "6px" }} /></span>
                        (800) 900-200-300
                    </p>
                    <p className="flex items-center mb-10">
                        <span><FontAwesomeIcon icon={faEnvelope} style={{ color: "#ffffff", marginRight: "8px", padding: "6px" }} /></span>
                        info@example.com
                    </p>

                    {/* Contact Icons */}
                    <div className="mt-auto flex gap-4 justify-center">
                        <a href="#" className="text-white hover:text-blue-300">
                            <span className="material-icons">twitter</span>
                        </a>
                        <a href="#" className="text-white hover:text-blue-300">
                            <span className="material-icons">linkedin</span>
                        </a>
                        <a href="#" className="text-white hover:text-blue-300">
                            <span className="material-icons">facebook</span>
                        </a>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ContactUs;
