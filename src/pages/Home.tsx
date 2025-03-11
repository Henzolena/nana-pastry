import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Heart, Star, Clock, Award, Phone } from 'lucide-react';

import { cakes, testimonials } from '@/utils/data';

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

const Home = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const featuredCakes = cakes.filter(cake => cake.featured);
  
  // Set up intersection observer hooks for animations
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [featuredRef, featuredInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [whyChooseRef, whyChooseInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [testimonialRef, testimonialInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [ctaRef, ctaInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        initial="hidden"
        animate={heroInView ? "visible" : "hidden"}
        variants={fadeIn}
        className="relative h-screen flex items-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(245, 221, 233, 0.8), rgba(255, 245, 238, 0.9)), url('/src/assets/images/hero-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } as React.CSSProperties}
      >
        <div className="absolute inset-0 bg-gold-shimmer opacity-50"></div>
        
        <div className="container relative z-10">
          <div className="max-w-2xl">
            <motion.p 
              className="font-script text-rosepink text-2xl md:text-3xl mb-2"
              variants={fadeIn}
            >
              Delicious & Beautiful
            </motion.p>
            
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-deepbrown mb-6"
              variants={fadeIn}
            >
              Handcrafted Cakes for Your Special Moments
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-warmgray-700 mb-8"
              variants={fadeIn}
            >
              Indulge in our exquisite cakes and pastries made with premium ingredients, 
              passion, and artistry. Each creation is crafted to make your celebrations unforgettable.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              variants={fadeIn}
            >
              <Link to="/products" className="btn btn-primary">
                Explore Our Cakes
              </Link>
              
              <a href="tel:+1234567890" className="btn btn-secondary group">
                <Phone className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                Call to Order
              </a>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Featured Cakes */}
      <motion.section 
        ref={featuredRef}
        initial="hidden"
        animate={featuredInView ? "visible" : "hidden"}
        variants={staggerContainer}
        className="section bg-pink-gradient"
      >
        <div className="container">
          <div className="text-center mb-12">
            <motion.p 
              className="title-accent"
              variants={fadeIn}
            >
              Our Signature Creations
            </motion.p>
            
            <motion.h2 
              variants={fadeIn}
              className="text-deepbrown"
            >
              Featured Cakes
            </motion.h2>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
          >
            {featuredCakes.map((cake) => (
              <motion.div 
                key={cake.id}
                className="cake-card group"
                variants={fadeIn}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="relative overflow-hidden rounded-t-xl">
                  <img 
                    src={cake.images[0]} 
                    alt={cake.name}
                    className="cake-card-image w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-hotpink/0 group-hover:bg-hotpink/20 transition-all duration-300"></div>
                </div>
                
                <div className="cake-card-content">
                  <h3 className="text-xl font-heading text-deepbrown">{cake.name}</h3>
                  <p className="text-warmgray-600 text-sm line-clamp-2 mt-1 mb-2">{cake.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-heading text-rosepink text-lg">${cake.price.toFixed(2)}</span>
                    <Link 
                      to={`/products/${cake.id}`}
                      className="text-sm font-medium text-deepbrown hover:text-hotpink transition-colors duration-200"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div 
            className="text-center mt-12"
            variants={fadeIn}
          >
            <Link 
              to="/products" 
              className="btn btn-secondary inline-flex items-center"
            >
              View All Cakes
              <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Why Choose Us */}
      <motion.section 
        ref={whyChooseRef}
        initial="hidden"
        animate={whyChooseInView ? "visible" : "hidden"}
        variants={staggerContainer}
        className="section"
      >
        <div className="container">
          <div className="text-center mb-12">
            <motion.p 
              className="title-accent"
              variants={fadeIn}
            >
              The Nana Pastry Difference
            </motion.p>
            
            <motion.h2 
              variants={fadeIn}
              className="text-deepbrown"
            >
              Why Choose Our Cakes
            </motion.h2>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
          >
            <motion.div 
              className="glass p-6 rounded-xl text-center"
              variants={fadeIn}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="bg-lavender/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-hotpink" />
              </div>
              <h3 className="text-xl font-heading text-deepbrown mb-2">Made with Love</h3>
              <p className="text-warmgray-600">Every cake is crafted with passion, precision, and a whole lot of love.</p>
            </motion.div>
            
            <motion.div 
              className="glass p-6 rounded-xl text-center"
              variants={fadeIn}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="bg-mint/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-softgold" />
              </div>
              <h3 className="text-xl font-heading text-deepbrown mb-2">Premium Ingredients</h3>
              <p className="text-warmgray-600">We source only the finest ingredients for exceptional flavor and quality.</p>
            </motion.div>
            
            <motion.div 
              className="glass p-6 rounded-xl text-center"
              variants={fadeIn}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="bg-peachy/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-rosepink" />
              </div>
              <h3 className="text-xl font-heading text-deepbrown mb-2">Made Fresh Daily</h3>
              <p className="text-warmgray-600">Our cakes are baked fresh each day, ensuring maximum freshness.</p>
            </motion.div>
            
            <motion.div 
              className="glass p-6 rounded-xl text-center"
              variants={fadeIn}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="bg-babyblue/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-hotpink" />
              </div>
              <h3 className="text-xl font-heading text-deepbrown mb-2">Custom Designs</h3>
              <p className="text-warmgray-600">Personalized cake designs to match your vision and celebration.</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section 
        ref={testimonialRef}
        initial="hidden"
        animate={testimonialInView ? "visible" : "hidden"}
        variants={fadeIn}
        className="section bg-luxury-gradient"
      >
        <div className="container">
          <div className="text-center mb-12">
            <motion.p 
              className="title-accent"
              variants={fadeIn}
            >
              What Our Customers Say
            </motion.p>
            
            <motion.h2 
              variants={fadeIn}
              className="text-deepbrown"
            >
              Customer Testimonials
            </motion.h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{
                    opacity: activeTestimonial === index ? 1 : 0,
                    x: activeTestimonial === index ? 0 : 20,
                    zIndex: activeTestimonial === index ? 10 : 0,
                  } as any}
                  transition={{ duration: 0.5 }}
                  className="glass p-8 rounded-xl absolute inset-0"
                  style={{ display: activeTestimonial === index ? 'block' : 'none' } as React.CSSProperties}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`inline-block w-5 h-5 ${i < testimonial.rating ? 'text-softgold' : 'text-warmgray-300'}`} 
                          fill={i < testimonial.rating ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                    
                    <p className="text-lg text-warmgray-700 italic mb-6">"{testimonial.testimonial}"</p>
                    
                    <div className="flex items-center">
                      {testimonial.image && (
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-softgold mr-3">
                          <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="text-left">
                        <h4 className="font-heading text-deepbrown font-medium">{testimonial.name}</h4>
                        {testimonial.role && (
                          <p className="text-sm text-warmgray-500">{testimonial.role}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Empty div for height */}
            <div className="h-72 md:h-64"></div>
            
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    activeTestimonial === index ? 'bg-hotpink w-6' : 'bg-warmgray-300'
                  }`}
                  aria-label={`View testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        ref={ctaRef}
        initial="hidden"
        animate={ctaInView ? "visible" : "hidden"}
        variants={fadeIn}
        className="section bg-gradient-to-r from-blush/30 to-ivory"
      >
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <motion.p 
              className="title-accent text-center"
              variants={fadeIn}
            >
              Ready to Order?
            </motion.p>
            
            <motion.h2 
              variants={fadeIn}
              className="text-deepbrown mb-6"
            >
              Let's Create Your Perfect Cake
            </motion.h2>
            
            <motion.p 
              className="text-lg text-warmgray-700 mb-8"
              variants={fadeIn}
            >
              Contact us today to discuss your custom cake needs. Whether it's a birthday, wedding, 
              or special celebration, we'll create something extraordinary just for you.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row justify-center gap-4"
              variants={fadeIn}
            >
              <a 
                href="tel:+1234567890" 
                className="btn btn-primary"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call to Order: (123) 456-7890
              </a>
              
              <Link to="/contact" className="btn btn-secondary">
                Contact Us
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </>
  );
};

export default Home; 