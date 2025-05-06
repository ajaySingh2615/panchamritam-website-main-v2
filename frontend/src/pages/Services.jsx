import React from 'react';
import { Link } from 'react-router-dom';
import './Services.css';

const Services = () => {
  const services = [
    {
      id: 1,
      title: 'Organic Farming',
      description: 'Learn sustainable farming practices and grow your own organic produce.',
      features: [
        'Soil preparation techniques',
        'Natural pest control methods',
        'Crop rotation planning',
        'Organic certification guidance'
      ]
    },
    {
      id: 2,
      title: 'Garden Design',
      description: 'Create beautiful and functional garden spaces with our expert design services.',
      features: [
        'Custom garden layouts',
        'Plant selection guidance',
        'Seasonal planning',
        'Maintenance schedules'
      ]
    },
    {
      id: 3,
      title: 'Plant Care',
      description: 'Keep your plants healthy and thriving with our comprehensive care services.',
      features: [
        'Watering schedules',
        'Fertilization plans',
        'Pruning techniques',
        'Disease prevention'
      ]
    }
  ];

  return (
    <div className="services-page">
      <div className="services-container">
        <h1>Our Services</h1>
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-icon">🌱</div>
              <h2>{service.title}</h2>
              <p className="service-description">{service.description}</p>
              <div className="service-features">
                <h3>What's Included:</h3>
                <ul>
                  {service.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div className="service-cta">
                <Link to={`/services/${service.id}`} className="details-button">View Details</Link>
                <Link to="/contact" className="contact-button">Contact Us</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services; 