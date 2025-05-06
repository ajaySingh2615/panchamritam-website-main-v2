import React from 'react';
import './About.css';

const About = () => {
  const teamMembers = [
    {
      id: 1,
      name: 'John Doe',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      role: 'Lead Developer',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    }
  ];

  const values = [
    {
      id: 1,
      title: 'Sustainability',
      description: 'We are committed to sustainable practices in everything we do, from our farming methods to our business operations.'
    },
    {
      id: 2,
      title: 'Quality',
      description: 'We maintain the highest standards of quality in our products and services, ensuring customer satisfaction.'
    },
    {
      id: 3,
      title: 'Innovation',
      description: 'We continuously innovate and adapt to bring you the best solutions for your gardening needs.'
    }
  ];

  return (
    <div className="about-page">
      <div className="about-container">
        <div className="about-header">
          <h1>About Us</h1>
          <p>
            We are passionate about helping people create beautiful, sustainable gardens
            and grow their own food. Our mission is to make gardening accessible to everyone.
          </p>
        </div>

        <div className="about-content">
          <img
            src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80"
            alt="Our Garden"
            className="about-image"
          />
          <div className="about-text">
            <h2>Our Story</h2>
            <p>
              Founded in 2020, our company began with a simple idea: to help people
              connect with nature through gardening. What started as a small local
              business has grown into a comprehensive gardening service provider.
            </p>
            <p>
              We believe that everyone should have access to fresh, organic produce
              and the joy of growing their own food. Our team of experts is dedicated
              to making this possible through education, support, and high-quality
              products.
            </p>
          </div>
        </div>

        <div className="team-section">
          <h2>Our Team</h2>
          <div className="team-grid">
            {teamMembers.map((member) => (
              <div key={member.id} className="team-member">
                <img
                  src={member.image}
                  alt={member.name}
                  className="team-member-image"
                />
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="values-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            {values.map((value) => (
              <div key={value.id} className="value-card">
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 