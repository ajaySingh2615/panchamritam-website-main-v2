import { useState, useEffect, useRef } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import personImage1 from '../assets/images/contact-page-hero-section-person-images/person1.jpg';
import personImage2 from '../assets/images/contact-page-hero-section-person-images/person2.jpg';
import personImage3 from '../assets/images/contact-page-hero-section-person-images/person3.jpg';
import personImage4 from '../assets/images/contact-page-hero-section-person-images/person4.jpg';
import personImage5 from '../assets/images/contact-page-hero-section-person-images/person5.jpg';
import personImage6 from '../assets/images/contact-page-hero-section-person-images/person6.jpg';

// Custom hook for scroll animations using Intersection Observer
const useScrollAnimation = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        // Once visible, we can unobserve the element
        if (ref.current) observer.unobserve(ref.current);
      }
    }, {
      threshold: options.threshold || 0.1,
      rootMargin: options.rootMargin || '0px'
    });
    
    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options.threshold, options.rootMargin]);
  
  return [ref, isVisible];
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Question',
    message: ''
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: ''
  });

  const [scrolled, setScrolled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  // State for FAQ accordion
  const [activeAccordion, setActiveAccordion] = useState(null);
  
  // Refs and animation states for scroll animations
  const [contactSectionRef, contactSectionVisible] = useScrollAnimation({ threshold: 0.1 });
  const [card1Ref, card1Visible] = useScrollAnimation({ threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  const [card2Ref, card2Visible] = useScrollAnimation({ threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  const [card3Ref, card3Visible] = useScrollAnimation({ threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  const [mapSectionRef, mapSectionVisible] = useScrollAnimation({ threshold: 0.1 });
  const [faqSectionRef, faqSectionVisible] = useScrollAnimation({ threshold: 0.1 });
  
  // Toggle accordion state
  const toggleAccordion = (index) => {
    if (activeAccordion === index) {
      setActiveAccordion(null);
    } else {
      setActiveAccordion(index);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Trigger entrance animations after component mounts
    setLoaded(true);
  }, []);

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
      phone: '',
      subject: 'Question',
      message: ''
    });
  };

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Contact Us', path: '/contact' }
  ];

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      {/* Modern Hero Section for Organic Farming E-commerce */}
      <div className={`relative transition-all duration-700 ease-out ${loaded ? 'opacity-100' : 'opacity-0 translate-y-10'}`}>
        {/* Organic gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f8f6f3] via-[#f1efe9] to-[#e8e4d9] opacity-70"></div>
        
        {/* Content container */}
        <div className={`relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 transition-all duration-500 ${scrolled ? 'transform -translate-y-4' : ''}`}>
          {/* Breadcrumb navigation */}
          <div className="mb-6">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <a href="/" className="text-[#4D7C0F] hover:text-green-800 text-sm font-medium transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-[#6B7280]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span className="ml-1 text-sm font-medium text-[#6B7280] md:ml-2">Contact</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left column - Hero content */}
            <div className={`transition-all duration-700 delay-300 ${loaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <div className="inline-block px-3 py-1 rounded-full bg-[#4D7C0F] text-white text-xs font-semibold mb-4">
                Get in Touch
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1F2937] leading-tight mb-6 transition-all duration-500">
                Let's Start a <span className="text-[#4D7C0F] relative overflow-hidden group">
                  <span className="inline-block transition-transform duration-300 group-hover:transform group-hover:-translate-y-1">Conversation</span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4D7C0F] transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100 origin-left"></span>
                </span>
              </h1>
              
              <p className="text-base md:text-lg text-[#6B7280] mb-8 max-w-xl leading-relaxed">
                Have questions about our organic products or farming practices? We're here to help you connect with truly sustainable farming.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <a href="#contact-form" className="inline-flex items-center justify-center bg-[#4D7C0F] hover:bg-green-800 text-white font-medium py-3 px-8 rounded-md transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform hover:-translate-y-1 hover:shadow-lg active:translate-y-0">
                  <span>Send Us a Message</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
                
                <a href="#why-organic" className="inline-flex items-center justify-center bg-white border border-[#E5E7EB] text-[#4D7C0F] hover:bg-[#ECFDF5] font-medium py-3 px-8 rounded-md transition-all duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform hover:-translate-y-1 hover:shadow-md active:translate-y-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Learn More</span>
                </a>
              </div>
              
              {/* Social proof with client images */}
              <div className="mt-8 pt-6 border-t border-[#E5E7EB] transition-all duration-700 delay-500 ease-out">
                <p className="mb-3 text-sm font-medium text-[#4D7C0F]">Trusted by Organic Enthusiasts</p>
                <div className="flex -space-x-3">
                  {[
                    { img: personImage1, alt: "Client testimonial" },
                    { img: personImage2, alt: "Client testimonial" },
                    { img: personImage3, alt: "Client testimonial" },
                    { img: personImage4, alt: "Client testimonial" },
                    { img: personImage5, alt: "Client testimonial" }
                  ].map((person, i) => (
                    <div 
                      key={i} 
                      className={`w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-white overflow-hidden shadow-sm transition-all duration-300 transform hover:scale-110 hover:translate-y-[-5px] hover:z-10 hover:shadow-md cursor-pointer`}
                      style={{ animationDelay: `${i * 50}ms`, transitionDelay: `${i * 50}ms` }}
                    >
                      <img 
                        src={person.img} 
                        alt={person.alt} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[#6B7280] text-sm italic animate-pulse">
                  "Their commitment to sustainable farming practices and exceptional customer service sets them apart in the organic market."
                </p>
              </div>
            </div>
            
            {/* Right column - Hero image instead of contact details */}
            <div className={`relative h-full flex items-center justify-center p-4 transition-all duration-700 delay-500 ${loaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="relative w-full max-w-md h-80 lg:h-96 bg-white rounded-lg overflow-hidden shadow-lg transform transition-all duration-500 hover:shadow-2xl hover:scale-105">
                <div className="absolute top-0 left-0 w-full h-full bg-[#f8f6f3] flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-20 h-20 mb-6 rounded-full bg-[#4D7C0F] flex items-center justify-center transition-transform duration-500 hover:rotate-12 animate-bounce">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-[#1F2937] mb-2">Reach Out To Us</h2>
                  <p className="text-[#6B7280] mb-4">We're excited to hear from you about our organic products</p>
                  <span className="inline-block px-4 py-2 bg-[#4D7C0F] text-white rounded-full text-sm font-semibold hover:bg-green-800 transition-colors duration-300 cursor-pointer transform hover:scale-105 active:scale-95">
                    Response within 24 hours
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information Section - Moved from hero to its own section */}
      <div ref={contactSectionRef} className="py-16 bg-gradient-to-b from-white to-[#f8f6f3]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`mb-12 text-center transition-all duration-700 transform ${contactSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="mb-4">
              <span className="inline-block px-4 py-1 rounded-full bg-[#ECFDF5] text-[#4D7C0F] text-sm font-medium">Get In Touch</span>
            </div>
            <h2 className="text-4xl font-bold text-[#1F2937] leading-tight">How to Reach Us</h2>
            <div className="mb-6"></div>
            <p className="text-[#6B7280] text-lg max-w-2xl mx-auto">We're always here to help with any questions about our organic products</p>
          </div>
          
          {/* Contact Info Cards - Simple, clean design */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {/* Email Card */}
            <div 
              ref={card1Ref} 
              className={`bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-700 hover:-translate-y-2 hover:shadow-xl ${card1Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
              style={{ transitionDelay: '0ms' }}
            >
              <div className="bg-[#4D7C0F] text-white h-20 flex justify-center items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#1F2937] mb-2">Email</h3>
                <p className="text-[#6B7280] mb-4">For any inquiries about our products or services</p>
                <a href="mailto:support@organicfarm.com" className="text-[#4D7C0F] hover:text-green-800 font-medium transition-colors flex items-center">
                  support@organicfarm.com
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
            
            {/* Phone Card */}
            <div 
              ref={card2Ref} 
              className={`bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-700 hover:-translate-y-2 hover:shadow-xl ${card2Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
              style={{ transitionDelay: '150ms' }}
            >
              <div className="bg-[#4D7C0F] text-white h-20 flex justify-center items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#1F2937] mb-2">Phone</h3>
                <p className="text-[#6B7280] mb-4">Call us during business hours for immediate assistance</p>
                <a href="tel:+15551234567" className="text-[#4D7C0F] hover:text-green-800 font-medium transition-colors flex items-center">
                  +1 (555) 123-4567
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
                <p className="text-sm text-[#6B7280] mt-2">Monday-Friday: 9AM-6PM</p>
              </div>
            </div>
            
            {/* Location Card */}
            <div 
              ref={card3Ref} 
              className={`bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-700 hover:-translate-y-2 hover:shadow-xl ${card3Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
              style={{ transitionDelay: '300ms' }}
            >
              <div className="bg-[#4D7C0F] text-white h-20 flex justify-center items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#1F2937] mb-2">Location</h3>
                <p className="text-[#6B7280] mb-4">Visit our farm and store for a direct experience</p>
                <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-[#4D7C0F] hover:text-green-800 font-medium transition-colors flex items-center">
                  123 Farm Road, Green Valley
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
                <div className="grid grid-cols-2 gap-1 text-sm mt-2">
                  <p className="text-[#6B7280]">Mon-Fri:</p>
                  <p className="text-[#1F2937]">9AM-6PM</p>
                  <p className="text-[#6B7280]">Saturday:</p>
                  <p className="text-[#1F2937]">10AM-4PM</p>
                  <p className="text-[#6B7280]">Sunday:</p>
                  <p className="text-[#1F2937]">Closed</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Map section with cleaner design */}
          <div 
            ref={mapSectionRef} 
            className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-700 transform ${mapSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
            style={{ transitionDelay: '450ms' }}
          >
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/3 bg-[#4D7C0F] text-white p-8 flex flex-col justify-center">
                <h3 className="text-2xl font-bold mb-4">Our Location</h3>
                <p className="mb-6 opacity-90">Find our farm and organic store with the map</p>
                <div className="mb-6">
                  <address className="not-italic text-lg font-medium">
                    123 Farm Road, Green Valley<br />
                    California, 90210
                  </address>
                </div>
                <a 
                  href="https://maps.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#4D7C0F] rounded-lg font-medium transition-all duration-300 hover:bg-[#f1f5f1] transform hover:scale-105"
                >
                  <span>Get Directions</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
              <div className="w-full md:w-2/3 p-0">
                <div className="bg-[#f8f6f3] h-64 md:h-80 relative">
                  {/* Map placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <div className="animate-ping-slow w-8 h-8 bg-[#4D7C0F] bg-opacity-50 rounded-full mb-6"></div>
                    <div className="bg-white rounded-lg px-6 py-3 shadow-md">
                      <p className="font-semibold text-[#1F2937]">Interactive Map Coming Soon</p>
                    </div>
                  </div>
                  
                  {/* Simple grid pattern overlay */}
                  <div className="absolute inset-0 opacity-10 pattern-grid"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ section */}
      <div ref={faqSectionRef} className="py-20 bg-gradient-to-b from-[#f8f6f3] to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Light decorative elements */}
          <div className="absolute top-40 right-0 w-40 h-40 bg-[#ECFDF5] rounded-full opacity-20 translate-x-1/2 blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-20 left-0 w-32 h-32 bg-[#4D7C0F] rounded-full opacity-10 -translate-x-1/2 blur-2xl pointer-events-none"></div>
          
          {/* Section header with animation */}
          <div className={`text-center mb-16 transition-all duration-1000 transform ${faqSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="mb-4">
              <span className="inline-block px-4 py-1 rounded-full bg-[#4D7C0F] bg-opacity-10 text-[#4D7C0F] text-sm font-medium">Support</span>
            </div>
            <h2 className="text-4xl font-bold text-[#1F2937] mb-4">Frequently Asked Questions</h2>
            <p className="mt-4 text-[#6B7280] text-lg max-w-2xl mx-auto">Find quick answers to common questions about our organic products and services</p>
          </div>
          
          {/* FAQ Accordion Items */}
          <div className="space-y-4">
            {[
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                q: "How do I know your products are truly organic?", 
                a: "All our products are certified organic by [certification body]. We maintain rigorous standards throughout our farming process and provide transparency through farm visits and detailed product information."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                q: "Do you offer international shipping?", 
                a: "Yes, we ship to select international destinations. Shipping rates and delivery times vary by location. Please contact our customer service for specific details about shipping to your country."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                  </svg>
                ),
                q: "What's your return policy?", 
                a: "We offer a 30-day satisfaction guarantee. If you're not completely satisfied with your purchase, you can return it within 30 days for a full refund or exchange."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                q: "How long does delivery usually take?",
                a: "Delivery times vary based on your location. For domestic orders, delivery typically takes 3-5 business days. For international orders, please allow 7-14 business days for your package to arrive. You'll receive tracking information once your order ships."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                q: "Are there any discounts for bulk orders?",
                a: "Yes, we offer special pricing for bulk orders. For orders exceeding $500, you automatically receive a 10% discount. For larger wholesale inquiries, please contact our sales team directly at sales@organicfarm.com to discuss custom pricing options."
              }
            ].map((faq, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-lg overflow-hidden shadow-md transition-all duration-500 transform ${faqSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* FAQ Question (always visible) */}
                <button 
                  onClick={() => toggleAccordion(index)}
                  className={`w-full px-6 py-5 flex items-center justify-between text-left transition-all duration-300 ${activeAccordion === index ? 'bg-[#ECFDF5]' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center">
                    <div className={`mr-4 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${activeAccordion === index ? 'bg-[#4D7C0F] text-white' : 'bg-[#ECFDF5] text-[#4D7C0F]'}`}>
                      {faq.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-[#1F2937]">{faq.q}</h3>
                  </div>
                  <div className={`text-[#4D7C0F] transform transition-transform duration-300 ${activeAccordion === index ? 'rotate-180' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </button>
                
                {/* FAQ Answer (collapsible) */}
                <div 
                  className={`px-6 overflow-hidden transition-all duration-500 ease-in-out ${
                    activeAccordion === index ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 pb-0 opacity-0'
                  }`}
                >
                  <div className="pl-14 border-l-2 border-[#ECFDF5] ml-5">
                    <p className="text-[#6B7280] text-base">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className={`mt-12 text-center transition-all duration-1000 delay-300 transform ${faqSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <a href="#contact-form" className="inline-flex items-center justify-center px-8 py-3 bg-[#4D7C0F] text-white rounded-lg shadow-md transition-all duration-300 hover:bg-green-800 hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0">
              <span>Have more questions? Contact us</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Contact form would go here */}
    </div>
  );
};

// Add these animation classes to your CSS file (index.css or App.css)
const style = document.createElement('style');
style.textContent = `
  @keyframes blob {
    0% {
      transform: translate(0px, 0px) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
    100% {
      transform: translate(0px, 0px) scale(1);
    }
  }
  
  .animate-blob {
    animation: blob 7s infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }
  
  .animate-pulse {
    animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  .animate-bounce {
    animation: bounce 2s infinite;
  }
  
  @keyframes float {
    0% {
      transform: translateY(0px) rotate(0deg);
    }
    50% {
      transform: translateY(-20px) rotate(4deg);
    }
    100% {
      transform: translateY(0px) rotate(0deg);
    }
  }
  
  .animate-float {
    animation: float 15s ease-in-out infinite;
  }
  
  @keyframes expand {
    0% {
      transform: scaleX(0);
    }
    100% {
      transform: scaleX(1);
    }
  }
  
  .animate-expand {
    animation: expand 1.5s ease-out forwards;
    animation-delay: 0.5s;
  }
  
  @keyframes ping-slow {
    0% {
      transform: scale(0.2);
      opacity: 0.8;
    }
    80%, 100% {
      transform: scale(2);
      opacity: 0;
    }
  }
  
  .animate-ping-slow {
    animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
  }
  
  .perspective-1000 {
    perspective: 1000px;
  }
  
  .rotate-y-5 {
    transform: rotateY(5deg);
  }
  
  /* Background patterns */
  .pattern-dots {
    background-image: radial-gradient(#4D7C0F 2px, transparent 2px);
    background-size: 30px 30px;
  }
  
  .pattern-grid {
    background-image: linear-gradient(to right, #4D7C0F 1px, transparent 1px),
                      linear-gradient(to bottom, #4D7C0F 1px, transparent 1px);
    background-size: 30px 30px;
  }
  
  .pattern-leaf {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 40' width='80' height='40'%3E%3Cpath fill='%234D7C0F' fill-opacity='0.1' d='M0 40a19.96 19.96 0 0 1 5.9-14.11 20.17 20.17 0 0 1 19.44-5.2A20 20 0 0 1 40.94 40H0zM40.94 40A20 20 0 0 1 15.43 20.89 20.26 20.26 0 0 1 34.86 7.83 20.03 20.03 0 0 1 40.94 40zM75.79 40a20.23 20.23 0 0 1-12.32-12.8 19.67 19.67 0 0 1 4.44-20.14A20.02 20.02 0 0 1 80 7.86V40H75.79z'%3E%3C/path%3E%3C/svg%3E");
  }
  
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  
  .animation-delay-4000 {
    animation-delay: 4s;
  }
`;
document.head.appendChild(style);

export default Contact; 