import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { Heart, Leaf, ThumbsUp, Sparkles, Award, Instagram, Facebook, Twitter } from 'lucide-react';

import { team } from '@/utils/data';

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

const About = () => {
  // Set up intersection observer hooks for animations
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [storyRef, storyInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [valuesRef, valuesInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [teamRef, teamInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  
  return (
    <>
      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        initial="hidden"
        animate={heroInView ? "visible" : "hidden"}
        variants={fadeIn}
        className="relative py-24 md:py-32 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255, 192, 203, 0.7), rgba(255, 245, 238, 0.9)), url('/src/assets/images/about-hero.jpg')`,
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
            Our Sweet Journey
          </motion.p>
          
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-deepbrown mb-6"
            variants={fadeIn}
          >
            About Nana Pastry
          </motion.h1>
          
          <motion.p 
            className="text-lg max-w-2xl mx-auto text-warmgray-700"
            variants={fadeIn}
          >
            Discover the passion, artistry, and love that goes into every creation at Nana Pastry.
          </motion.p>
        </div>
      </motion.section>

      {/* Our Story */}
      <motion.section
        ref={storyRef}
        initial="hidden"
        animate={storyInView ? "visible" : "hidden"}
        variants={staggerContainer}
        className="section"
      >
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeIn}>
              <p className="title-accent">Our Journey</p>
              <h2 className="mb-6">The Story Behind Our Sweet Creations</h2>
              
              <div className="space-y-4 text-warmgray-700">
                <p>
                  Nana Pastry began in 2010 as a small home bakery founded by Sophia Williams, whose 
                  grandmother (affectionately called "Nana") inspired her love for baking with her 
                  traditional family recipes and techniques.
                </p>
                <p>
                  What started as a passion project quickly blossomed into a beloved local bakery as 
                  word spread about our extraordinary cakes that not only looked stunning but tasted 
                  incredible. After outgrowing Sophia's home kitchen, we opened our first boutique 
                  bakery in 2015.
                </p>
                <p>
                  Today, Nana Pastry has become synonymous with artisanal quality, creative designs, 
                  and memorable flavors. Our team of talented pastry chefs and cake artists work tirelessly 
                  to create edible masterpieces for all of life's special moments.
                </p>
                <p>
                  Despite our growth, we remain committed to Nana's original philosophy: using only the 
                  finest ingredients, crafting each cake with love and attention to detail, and treating 
                  every customer like family.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              variants={fadeIn}
              className="relative"
            >
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-blush/30 rounded-full"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-lavender/30 rounded-full"></div>
              
              <div className="relative z-10 grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="rounded-xl overflow-hidden shadow-soft-pink h-56">
                    <img 
                      src="/src/assets/images/about1.jpg" 
                      alt="Nana Pastry beginnings" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="rounded-xl overflow-hidden shadow-soft-pink h-40">
                    <img 
                      src="/src/assets/images/about2.jpg" 
                      alt="Cake decorating" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="rounded-xl overflow-hidden shadow-soft-pink h-40">
                    <img 
                      src="/src/assets/images/about3.jpg" 
                      alt="Our bakery" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="rounded-xl overflow-hidden shadow-soft-pink h-56">
                    <img 
                      src="/src/assets/images/about4.jpg" 
                      alt="Team working together" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Our Values */}
      <motion.section
        ref={valuesRef}
        initial="hidden"
        animate={valuesInView ? "visible" : "hidden"}
        variants={staggerContainer}
        className="section bg-pink-gradient"
      >
        <div className="container">
          <div className="text-center mb-12">
            <motion.p 
              className="title-accent"
              variants={fadeIn}
            >
              What Guides Us
            </motion.p>
            
            <motion.h2 
              variants={fadeIn}
              className="text-deepbrown"
            >
              Our Core Values
            </motion.h2>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
          >
            <motion.div 
              className="bg-white/80 p-6 rounded-xl shadow-soft-pink border-thin border-blush/40"
              variants={fadeIn}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="bg-blush/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-hotpink" />
              </div>
              <h3 className="text-xl font-heading text-deepbrown mb-2">Passion</h3>
              <p className="text-warmgray-600">
                We pour our hearts into every creation, infusing passion into each step of the baking process.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white/80 p-6 rounded-xl shadow-soft-pink border-thin border-blush/40"
              variants={fadeIn}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="bg-mint/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Leaf className="w-8 h-8 text-softgold" />
              </div>
              <h3 className="text-xl font-heading text-deepbrown mb-2">Quality</h3>
              <p className="text-warmgray-600">
                We never compromise on ingredients, using only the finest and freshest to ensure exceptional taste.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white/80 p-6 rounded-xl shadow-soft-pink border-thin border-blush/40"
              variants={fadeIn}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="bg-lilac/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <ThumbsUp className="w-8 h-8 text-rosepink" />
              </div>
              <h3 className="text-xl font-heading text-deepbrown mb-2">Reliability</h3>
              <p className="text-warmgray-600">
                We deliver on our promises, ensuring your cake is perfect and on time for your special day.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white/80 p-6 rounded-xl shadow-soft-pink border-thin border-blush/40"
              variants={fadeIn}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="bg-peachy/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-hotpink" />
              </div>
              <h3 className="text-xl font-heading text-deepbrown mb-2">Creativity</h3>
              <p className="text-warmgray-600">
                We embrace innovation, constantly exploring new designs, flavors, and techniques.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white/80 p-6 rounded-xl shadow-soft-pink border-thin border-blush/40"
              variants={fadeIn}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="bg-babyblue/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Award className="w-8 h-8 text-softgold" />
              </div>
              <h3 className="text-xl font-heading text-deepbrown mb-2">Excellence</h3>
              <p className="text-warmgray-600">
                We strive for perfection in every detail, from the first sketch to the final decoration.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white/80 p-6 rounded-xl shadow-soft-pink border-thin border-blush/40"
              variants={fadeIn}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="bg-dustyrose/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-rosepink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="text-xl font-heading text-deepbrown mb-2">Community</h3>
              <p className="text-warmgray-600">
                We cherish the connections we build with our customers and local community.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Our Team */}
      <motion.section
        ref={teamRef}
        initial="hidden"
        animate={teamInView ? "visible" : "hidden"}
        variants={staggerContainer}
        className="section"
      >
        <div className="container">
          <div className="text-center mb-12">
            <motion.p 
              className="title-accent"
              variants={fadeIn}
            >
              The Talent Behind the Cakes
            </motion.p>
            
            <motion.h2 
              variants={fadeIn}
              className="text-deepbrown"
            >
              Meet Our Pastry Artists
            </motion.h2>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
          >
            {team.map((member) => (
              <motion.div 
                key={member.id}
                className="bg-white rounded-xl overflow-hidden shadow-soft-pink border-thin border-blush/40"
                variants={fadeIn}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="h-64 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-heading text-deepbrown">{member.name}</h3>
                  <p className="text-rosepink font-medium mb-3">{member.role}</p>
                  <p className="text-warmgray-600 mb-4">{member.bio}</p>
                  
                  {member.socialLinks && (
                    <div className="flex space-x-3 mt-4">
                      {member.socialLinks.map((link) => (
                        <a 
                          key={link.platform} 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-warmgray-500 hover:text-hotpink transition-colors"
                          aria-label={`${member.name}'s ${link.platform}`}
                        >
                          {link.platform === 'instagram' && <Instagram size={18} />}
                          {link.platform === 'facebook' && <Facebook size={18} />}
                          {link.platform === 'twitter' && <Twitter size={18} />}
                          {link.platform === 'pinterest' && (
                            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                              <path d="M21 12c0 4.418 -4.03 8 -9 8a9.863 9.863 0 0 1 -4.255 -.949l-3.745 1.949l1.08 -3.098a7.902 7.902 0 0 1 -2.080 -5.902c0 -4.418 4.03 -8 9 -8s9 3.582 9 8z" />
                            </svg>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <section className="section bg-gradient-to-r from-blush/30 to-ivory">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <p className="title-accent text-center">Let's Create Together</p>
            <h2 className="text-deepbrown mb-6">Ready to Order Your Dream Cake?</h2>
            <p className="text-lg text-warmgray-700 mb-8">
              Contact us today to discuss your vision. Our team of skilled pastry artists is excited to bring your sweetest dreams to life.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/products" className="btn btn-primary">
                Explore Our Cakes
              </Link>
              <Link to="/contact" className="btn btn-secondary">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default About; 