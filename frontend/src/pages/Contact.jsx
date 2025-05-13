import { useState, useEffect } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import personImage1 from '../assets/images/contact-page-hero-section-person-images/person1.jpg';
import personImage2 from '../assets/images/contact-page-hero-section-person-images/person2.jpg';
import personImage3 from '../assets/images/contact-page-hero-section-person-images/person3.jpg';
import personImage4 from '../assets/images/contact-page-hero-section-person-images/person4.jpg';
import personImage5 from '../assets/images/contact-page-hero-section-person-images/person5.jpg';
import personImage6 from '../assets/images/contact-page-hero-section-person-images/person6.jpg';

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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      <div className="relative">
        {/* Organic gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f8f6f3] via-[#f1efe9] to-[#e8e4d9] opacity-70"></div>
        
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-10" 
             style={{
               backgroundImage: `radial-gradient(circle at 25px 25px, #4D7C0F 2px, transparent 0)`,
               backgroundSize: '30px 30px'
             }}>
        </div>
        
        {/* Subtle animated shapes */}
        <div className="hidden md:block absolute top-20 right-20 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply opacity-20 animate-blob animation-delay-2000"></div>
        <div className="hidden md:block absolute bottom-20 left-20 w-72 h-72 bg-[#4D7C0F] rounded-full mix-blend-multiply opacity-10 animate-blob animation-delay-4000"></div>

        {/* Content container */}
        <div className={`relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 transition-all duration-500 ${scrolled ? 'transform -translate-y-4' : ''}`}>
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
            <div className="transform transition duration-500 hover:translate-y-[-5px]">
              <div className="inline-block px-3 py-1 rounded-full bg-[#4D7C0F] text-white text-xs font-semibold mb-4">
                Get in Touch
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1F2937] leading-tight mb-6">
                Let's Start a <span className="text-[#4D7C0F] relative">
                  Conversation
                  <span className="absolute bottom-0 left-0 w-full h-2 bg-[#4D7C0F] opacity-30"></span>
                </span>
              </h1>
              
              <p className="text-base md:text-lg text-[#6B7280] mb-8 max-w-xl leading-relaxed">
                Have questions about our organic products or farming practices? Need information about your order? We're here to help you connect with truly sustainable farming.
              </p>
              
              {/* Enhanced value propositions in a row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <div className="group flex items-start space-x-3 transition-all duration-300 hover:transform hover:translate-x-1">
                  <div className="w-10 h-10 rounded-full bg-[#ECFDF5] flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4D7C0F]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1F2937]">100% Organic</h3>
                    <p className="text-sm text-[#6B7280]">Certified practices</p>
                  </div>
                </div>
                
                <div className="group flex items-start space-x-3 transition-all duration-300 hover:transform hover:translate-x-1">
                  <div className="w-10 h-10 rounded-full bg-[#ECFDF5] flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4D7C0F]" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1F2937]">Top Quality</h3>
                    <p className="text-sm text-[#6B7280]">Premium products</p>
                  </div>
                </div>
                
                <div className="group flex items-start space-x-3 transition-all duration-300 hover:transform hover:translate-x-1">
                  <div className="w-10 h-10 rounded-full bg-[#ECFDF5] flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4D7C0F]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1F2937]">Fast Response</h3>
                    <p className="text-sm text-[#6B7280]">24-hour support</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <a href="#contact-form" className="inline-flex items-center justify-center bg-[#4D7C0F] hover:bg-green-800 text-white font-medium py-3 px-8 rounded-md transition duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                  <span>Send Us a Message</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
                
                <a href="#why-organic" className="inline-flex items-center justify-center bg-white border border-[#E5E7EB] text-[#4D7C0F] hover:bg-[#ECFDF5] font-medium py-3 px-8 rounded-md transition duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Learn More</span>
                </a>
              </div>
              
              {/* Social proof */}
              <div className="mt-10 pt-6 border-t border-[#E5E7EB]">
                <p className="text-sm text-[#6B7280] mb-3">Trusted by organic enthusiasts</p>
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8">
                  <div className="flex -space-x-3">
                    {[
                      { img: personImage1, alt: "Customer 1" },
                      { img: personImage2, alt: "Customer 2" },
                      { img: personImage3, alt: "Customer 3" },
                      { img: personImage4, alt: "Customer 4" },
                      { img: personImage5, alt: "Customer 5" },
                      { img: personImage6, alt: "Customer 6" }
                    ].map((person, i) => (
                      <div key={i} className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-white overflow-hidden shadow-sm">
                        <img 
                          src={person.img} 
                          alt={person.alt} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map(i => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm font-medium text-[#6B7280]">4.9/5 from 200+ reviews</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column - Hero image instead of contact details */}
            <div className="relative h-full flex items-center justify-center p-4">
              <div className="relative w-full max-w-md h-80 lg:h-96 bg-gradient-to-r from-[#ECFDF5] to-white rounded-lg overflow-hidden shadow-lg">
                <div className="absolute top-0 left-0 w-full h-full bg-[#f8f6f3] flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-20 h-20 mb-6 rounded-full bg-[#4D7C0F] border-4 border-[#ECFDF5] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-[#1F2937] mb-2">Reach Out To Us</h2>
                  <p className="text-[#6B7280] mb-4">We're excited to hear from you and answer any questions about our organic products</p>
                  <span className="inline-block px-4 py-2 bg-[#4D7C0F] text-white rounded-full text-sm font-semibold">
                    Response within 24 hours
                  </span>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-5 right-5 w-16 h-16 rounded-full bg-[#ECFDF5] opacity-40"></div>
                <div className="absolute bottom-10 left-5 w-12 h-12 rounded-full bg-[#4D7C0F] opacity-20"></div>
                <div className="absolute bottom-20 right-10 w-8 h-8 rounded-full bg-[#4D7C0F] opacity-30"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information Section - Moved from hero to its own section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1F2937]">Contact Information</h2>
            <p className="mt-4 text-[#6B7280] text-lg">Multiple ways to reach our team and get the support you need</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Email Contact Card */}
            <div className="relative w-full bg-gradient-to-r from-[#ECFDF5] to-white rounded-lg overflow-hidden shadow-lg p-6 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border border-[#E5E7EB]">
              <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full bg-[#ECFDF5] opacity-30"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#ECFDF5] flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#4D7C0F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#1F2937] mb-2">Email Us</h3>
                <p className="text-[#6B7280] mb-4">For any inquiries about our products or services</p>
                <a href="mailto:support@organicfarm.com" className="text-[#4D7C0F] hover:text-green-800 font-medium transition hover:underline">
                  support@organicfarm.com
                </a>
              </div>
            </div>
            
            {/* Phone Contact Card */}
            <div className="relative w-full bg-gradient-to-r from-[#ECFDF5] to-white rounded-lg overflow-hidden shadow-lg p-6 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border border-[#E5E7EB]">
              <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full bg-[#ECFDF5] opacity-30"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#ECFDF5] flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#4D7C0F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#1F2937] mb-2">Call Us</h3>
                <p className="text-[#6B7280] mb-4">Call us during business hours for immediate assistance</p>
                <a href="tel:+15551234567" className="text-[#4D7C0F] hover:text-green-800 font-medium transition hover:underline">
                  +1 (555) 123-4567
                </a>
                <p className="text-sm text-[#6B7280] mt-2">Monday-Friday: 9AM-6PM</p>
              </div>
            </div>
            
            {/* Location Contact Card */}
            <div className="relative w-full bg-gradient-to-r from-[#ECFDF5] to-white rounded-lg overflow-hidden shadow-lg p-6 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border border-[#E5E7EB]">
              <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full bg-[#ECFDF5] opacity-30"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#ECFDF5] flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#4D7C0F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#1F2937] mb-2">Visit Us</h3>
                <p className="text-[#6B7280] mb-4">Visit our farm and store for a direct experience</p>
                <p className="text-[#4D7C0F] font-medium">123 Farm Road, Green Valley</p>
                <div className="grid grid-cols-2 gap-2 text-sm mt-2">
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
          
          {/* Map placeholder */}
          <div className="mt-12 relative w-full bg-gradient-to-r from-[#ECFDF5] to-white rounded-lg overflow-hidden shadow-lg p-6 flex items-center justify-center border border-[#E5E7EB]">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-[#ECFDF5] opacity-30"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 rounded-tr-full bg-[#ECFDF5] opacity-20"></div>
            <div className="relative z-10 text-center py-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-[#4D7C0F] opacity-70 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <h3 className="text-xl font-semibold text-[#1F2937] mb-2">Find Our Location</h3>
              <p className="text-[#6B7280] text-lg mb-2">Interactive Map Coming Soon</p>
              <p className="text-[#6B7280] text-base">Find directions to our organic farm and store</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ section */}
      <div className="bg-[#f8f6f3] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1F2937]">Frequently Asked Questions</h2>
            <p className="mt-4 text-[#6B7280] text-lg">Find quick answers to common questions about our organic products and services</p>
          </div>
          
          <div className="space-y-8">
            {[
              {
                q: "How do I know your products are truly organic?", 
                a: "All our products are certified organic by [certification body]. We maintain rigorous standards throughout our farming process and provide transparency through farm visits and detailed product information."
              },
              {
                q: "Do you offer international shipping?", 
                a: "Yes, we ship to select international destinations. Shipping rates and delivery times vary by location. Please contact our customer service for specific details about shipping to your country."
              },
              {
                q: "What's your return policy?", 
                a: "We offer a 30-day satisfaction guarantee. If you're not completely satisfied with your purchase, you can return it within 30 days for a full refund or exchange."
              }
            ].map((faq, index) => (
              <div key={index} className="relative w-full bg-gradient-to-r from-[#ECFDF5] to-white rounded-lg overflow-hidden shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-[#E5E7EB]">
                <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full bg-[#ECFDF5] opacity-30"></div>
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold text-[#1F2937] mb-2">{faq.q}</h3>
                  <p className="text-[#6B7280] text-base">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <a href="#contact-form" className="inline-flex items-center text-[#4D7C0F] hover:text-green-800 font-medium transition-colors">
              <span>Have more questions? Contact us</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
  
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  
  .animation-delay-4000 {
    animation-delay: 4s;
  }
`;
document.head.appendChild(style);

export default Contact; 