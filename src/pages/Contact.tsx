import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Phone, Mail, MapPin, Clock, Send, Instagram, Facebook, Twitter } from 'lucide-react';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Set up intersection observer hooks for animations
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [formRef, formInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [infoRef, infoInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
      
      // Reset submission status after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    }, 1500);
  };
  
  return (
    <>
      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        initial="hidden"
        animate={heroInView ? "visible" : "hidden"}
        variants={fadeIn}
        className="relative py-20 md:py-24 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255, 192, 203, 0.7), rgba(255, 245, 238, 0.9)), url('/src/assets/images/contact-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } as React.CSSProperties}
      >
        <div className="absolute inset-0 bg-gold-shimmer opacity-30"></div>
        
        <div className="container relative z-10 text-center">
          <motion.p 
            className="font-script text-rosepink text-2xl md:text-3xl mb-2"
            variants={fadeIn}
          >
            Get In Touch
          </motion.p>
          
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-deepbrown mb-6"
            variants={fadeIn}
          >
            Contact Us
          </motion.h1>
          
          <motion.p 
            className="text-lg max-w-2xl mx-auto text-warmgray-700"
            variants={fadeIn}
          >
            Have a question or ready to order? We'd love to hear from you!
            Fill out the form below or reach out directly through phone or email.
          </motion.p>
        </div>
      </motion.section>

      {/* Contact Content */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              ref={formRef}
              initial="hidden"
              animate={formInView ? "visible" : "hidden"}
              variants={staggerContainer}
              className="bg-white rounded-xl shadow-soft-pink p-6 md:p-8 border border-blush/20"
            >
              <motion.h2 
                className="text-2xl md:text-3xl font-heading text-deepbrown mb-6"
                variants={fadeIn}
              >
                Send Us a Message
              </motion.h2>
              
              {submitted ? (
                <motion.div 
                  className="bg-mint/20 border border-mint text-deepbrown rounded-lg p-4 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="font-medium">Thank you for reaching out!</p>
                  <p>We've received your message and will get back to you shortly.</p>
                </motion.div>
              ) : (
                <motion.form 
                  onSubmit={handleSubmit}
                  variants={staggerContainer}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <motion.div variants={fadeIn}>
                      <label htmlFor="name" className="block text-warmgray-700 font-medium mb-2">
                        Your Name <span className="text-hotpink">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full border border-warmgray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-hotpink focus:border-transparent"
                      />
                    </motion.div>
                    
                    <motion.div variants={fadeIn}>
                      <label htmlFor="email" className="block text-warmgray-700 font-medium mb-2">
                        Email Address <span className="text-hotpink">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full border border-warmgray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-hotpink focus:border-transparent"
                      />
                    </motion.div>
                    
                    <motion.div variants={fadeIn}>
                      <label htmlFor="phone" className="block text-warmgray-700 font-medium mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full border border-warmgray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-hotpink focus:border-transparent"
                      />
                    </motion.div>
                    
                    <motion.div variants={fadeIn}>
                      <label htmlFor="subject" className="block text-warmgray-700 font-medium mb-2">
                        Subject <span className="text-hotpink">*</span>
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full border border-warmgray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-hotpink focus:border-transparent bg-white"
                      >
                        <option value="">Select a subject</option>
                        <option value="order">Cake Order</option>
                        <option value="quote">Price Quote</option>
                        <option value="custom">Custom Design</option>
                        <option value="feedback">Feedback</option>
                        <option value="other">Other</option>
                      </select>
                    </motion.div>
                  </div>
                  
                  <motion.div className="mb-6" variants={fadeIn}>
                    <label htmlFor="message" className="block text-warmgray-700 font-medium mb-2">
                      Your Message <span className="text-hotpink">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="w-full border border-warmgray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-hotpink focus:border-transparent resize-none"
                    ></textarea>
                  </motion.div>
                  
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary w-full md:w-auto flex items-center justify-center"
                    variants={fadeIn}
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </motion.div>

            {/* Contact Information */}
            <motion.div
              ref={infoRef}
              initial="hidden"
              animate={infoInView ? "visible" : "hidden"}
              variants={staggerContainer}
            >
              {/* Map */}
              <motion.div 
                className="mb-8 rounded-xl overflow-hidden shadow-soft-pink border border-blush/20 h-64"
                variants={fadeIn}
              >
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 z-10 flex items-center justify-center">
                    <div className="bg-hotpink w-8 h-8 rounded-full flex items-center justify-center animate-bounce">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 z-10">
                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-soft-pink text-sm">
                      <p className="font-medium text-deepbrown">Nana Pastry</p>
                      <p className="text-warmgray-600">123 Sweet Lane, Bakery District</p>
                    </div>
                  </div>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.7152203584376!2d-118.39023618478883!3d34.03922998061057!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2b9221d371cf5%3A0x11b91ff58ff96f33!2sBeverly%20Hills%2C%20CA%2090210!5e0!3m2!1sen!2sus!4v1639762258279!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="Location map"
                  ></iframe>
                </div>
              </motion.div>
              
              {/* Contact Details */}
              <motion.div 
                className="bg-white rounded-xl shadow-soft-pink p-6 md:p-8 border border-blush/20 mb-8"
                variants={fadeIn}
              >
                <h3 className="text-xl font-heading text-deepbrown mb-6">Get In Touch</h3>
                
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="bg-blush/30 rounded-full p-2 mr-4">
                      <Phone className="w-5 h-5 text-hotpink" />
                    </div>
                    <div>
                      <p className="text-warmgray-600 font-medium">Phone</p>
                      <a href="tel:+1234567890" className="text-deepbrown hover:text-hotpink transition-colors">
                        +1 (234) 567-8900
                      </a>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <div className="bg-mint/30 rounded-full p-2 mr-4">
                      <Mail className="w-5 h-5 text-hotpink" />
                    </div>
                    <div>
                      <p className="text-warmgray-600 font-medium">Email</p>
                      <a href="mailto:hello@nanapastry.com" className="text-deepbrown hover:text-hotpink transition-colors">
                        hello@nanapastry.com
                      </a>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <div className="bg-peachy/30 rounded-full p-2 mr-4">
                      <MapPin className="w-5 h-5 text-hotpink" />
                    </div>
                    <div>
                      <p className="text-warmgray-600 font-medium">Address</p>
                      <p className="text-deepbrown">
                        123 Sweet Lane, Bakery District, Caketown, CA 90210
                      </p>
                    </div>
                  </li>
                </ul>
              </motion.div>
              
              {/* Business Hours */}
              <motion.div 
                className="bg-white rounded-xl shadow-soft-pink p-6 md:p-8 border border-blush/20 mb-8"
                variants={fadeIn}
              >
                <h3 className="text-xl font-heading text-deepbrown mb-6">Opening Hours</h3>
                
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="bg-lilac/30 rounded-full p-2 mr-4">
                      <Clock className="w-5 h-5 text-hotpink" />
                    </div>
                    <div>
                      <p className="text-warmgray-600 font-medium">Monday - Friday</p>
                      <p className="text-deepbrown">9:00 AM - 7:00 PM</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <div className="bg-lilac/30 rounded-full p-2 mr-4">
                      <Clock className="w-5 h-5 text-hotpink" />
                    </div>
                    <div>
                      <p className="text-warmgray-600 font-medium">Saturday</p>
                      <p className="text-deepbrown">10:00 AM - 6:00 PM</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <div className="bg-lilac/30 rounded-full p-2 mr-4">
                      <Clock className="w-5 h-5 text-hotpink" />
                    </div>
                    <div>
                      <p className="text-warmgray-600 font-medium">Sunday</p>
                      <p className="text-deepbrown">Closed</p>
                    </div>
                  </li>
                </ul>
              </motion.div>
              
              {/* Social Media */}
              <motion.div variants={fadeIn}>
                <h3 className="text-xl font-heading text-deepbrown mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <a 
                    href="#" 
                    className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-soft-pink border border-blush/20 text-warmgray-600 hover:text-hotpink hover:border-hotpink transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a 
                    href="#" 
                    className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-soft-pink border border-blush/20 text-warmgray-600 hover:text-hotpink hover:border-hotpink transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a 
                    href="#" 
                    className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-soft-pink border border-blush/20 text-warmgray-600 hover:text-hotpink hover:border-hotpink transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact; 