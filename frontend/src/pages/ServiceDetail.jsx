import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './ServiceDetail.css';

const ServiceDetail = () => {
  const { serviceId } = useParams();
  
  // Predefined service details data
  // In a real application, this would come from an API
  const servicesData = {
    '1': {
      id: 1,
      title: 'Organic Farming',
      description: 'Learn sustainable farming practices and grow your own organic produce.',
      fullDescription: `Our organic farming service provides comprehensive guidance on establishing and maintaining
        your own organic garden or farm. We believe in sustainable practices that are good for the environment,
        your health, and your wallet.
        
        Our experts will work with you to understand your specific needs, soil conditions, and climate to recommend
        the best crops and farming techniques. We emphasize natural methods of pest control and fertilization to 
        ensure your produce is truly organic.`,
      imageSrc: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      features: [
        'Soil preparation techniques',
        'Natural pest control methods',
        'Crop rotation planning',
        'Organic certification guidance',
        'Sustainable irrigation systems',
        'Composting and natural fertilizers',
        'Seasonal planting guides',
        'Harvest and storage best practices'
      ],
      testimonial: {
        quote: "The organic farming service completely transformed my backyard garden. I'm now growing enough vegetables for my family with extra to share with neighbors!",
        author: "Sarah Johnson",
        location: "Portland, OR"
      }
    },
    '2': {
      id: 2,
      title: 'Garden Design',
      description: 'Create beautiful and functional garden spaces with our expert design services.',
      fullDescription: `Our garden design service combines aesthetics with functionality to create outdoor spaces that
        are not only beautiful but practical. Whether you have a small balcony or a large backyard, we can help you
        make the most of your space.
        
        We take into account your preferences, the local climate, existing structures, and how you plan to use the
        space. Our designs incorporate plants that work well together, hardscaping elements, and features like seating
        areas or water features as desired.`,
      imageSrc: 'https://images.unsplash.com/photo-1470755270084-05b57e9463f0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      features: [
        'Custom garden layouts',
        'Plant selection guidance',
        'Seasonal planning',
        'Maintenance schedules',
        'Hardscape integration',
        'Water feature design',
        'Lighting plans',
        'Native plant recommendations'
      ],
      testimonial: {
        quote: "I couldn't be happier with my new garden design. It's beautiful year-round and surprisingly low maintenance!",
        author: "Michael Thompson",
        location: "Austin, TX"
      }
    },
    '3': {
      id: 3,
      title: 'Plant Care',
      description: 'Keep your plants healthy and thriving with our comprehensive care services.',
      fullDescription: `Our plant care service is perfect for both novice gardeners and those looking to improve their 
        plant health. We provide personalized care plans for your indoor and outdoor plants to ensure they thrive.
        
        Our team can help diagnose plant problems, establish proper watering and fertilization schedules, prune for
        optimal growth, and provide ongoing support as your plants develop. We focus on teaching you the skills to
        maintain healthy plants long-term.`,
      imageSrc: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      features: [
        'Watering schedules',
        'Fertilization plans',
        'Pruning techniques',
        'Disease prevention',
        'Pest identification and control',
        'Seasonal care adjustments',
        'Propagation methods',
        'Plant health assessments'
      ],
      testimonial: {
        quote: "After struggling to keep my houseplants alive for years, the plant care service has been a game-changer. My home is now full of thriving plants!",
        author: "Emma Rodriguez",
        location: "Chicago, IL"
      }
    }
  };
  
  const service = servicesData[serviceId];
  
  if (!service) {
    return (
      <div className="not-found-container">
        <h2>Service Not Found</h2>
        <p>The service you're looking for doesn't exist.</p>
        <Link to="/services" className="back-button">Back to Services</Link>
      </div>
    );
  }

  return (
    <div className="service-detail-page">
      <div className="service-detail-container">
        <div className="service-header">
          <h1>{service.title}</h1>
          <p className="service-brief">{service.description}</p>
        </div>
        
        <div className="service-image-container">
          <img 
            src={service.imageSrc} 
            alt={service.title} 
            className="service-detail-image" 
          />
        </div>
        
        <div className="service-full-description">
          {service.fullDescription.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        
        <div className="service-features-container">
          <h2>What's Included</h2>
          <ul className="service-features-list">
            {service.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
        
        {service.testimonial && (
          <div className="service-testimonial">
            <blockquote>
              <p>"{service.testimonial.quote}"</p>
              <cite>
                — {service.testimonial.author}, {service.testimonial.location}
              </cite>
            </blockquote>
          </div>
        )}
        
        <div className="service-cta-container">
          <h2>Ready to Get Started?</h2>
          <p>Contact us today to discuss how we can help with your {service.title.toLowerCase()} needs.</p>
          <div className="service-buttons">
            <Link to="/contact" className="contact-button">Contact Us</Link>
            <Link to="/services" className="back-to-services">Back to Services</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail; 