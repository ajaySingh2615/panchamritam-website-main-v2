import { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would normally handle form submission to a backend API
    console.log('Form submitted:', formData);
    
    // Mock successful submission
    setFormStatus({
      submitted: true,
      success: true,
      message: 'Thank you for your message! We will get back to you soon.'
    });
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      message: ''
    });
  };

  return (
    <div className="contact-page">
      <h2>Contact Us</h2>
      
      <div className="contact-container">
        <div className="contact-info">
          <h3>Get in Touch</h3>
          <p>We'd love to hear from you. Please fill out the form or use the contact details below.</p>
          
          <div className="contact-details">
            <div className="contact-item">
              <strong>Address:</strong>
              <p>123 Panchamritam Street, City, State, Country</p>
            </div>
            
            <div className="contact-item">
              <strong>Email:</strong>
              <p>info@panchamritam.com</p>
            </div>
            
            <div className="contact-item">
              <strong>Phone:</strong>
              <p>+1 (123) 456-7890</p>
            </div>
          </div>
        </div>
        
        <div className="contact-form">
          {formStatus.submitted && formStatus.success ? (
            <div className="success-message">
              {formStatus.message}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  required
                ></textarea>
              </div>
              
              <button type="submit" className="submit-btn">Send Message</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact; 