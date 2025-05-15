import { Link } from 'react-router-dom'
import { Instagram, Facebook, Twitter, Share, Phone, Mail, MapPin, Clock } from 'lucide-react'

import { companyInfo, contactInfo, businessHours, socialMediaLinks } from '@/utils/data';

const Footer = () => {
  const currentYear = new Date().getFullYear()

  // Helper function to get appropriate social icon
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return <Instagram size={20} />;
      case 'facebook': return <Facebook size={20} />;
      case 'twitter': return <Twitter size={20} />;
      case 'pinterest': return <Share size={20} />; 
      default: return null;
    }
  };

  return (
    <footer className="bg-ivory border-t border-softgold/20 pt-16 pb-8">
      <div className="container">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div>
            <div className="mb-4">
              <Link to="/" className="flex items-center">
                <img src={companyInfo.logo} alt={`${companyInfo.name} logo`} className="h-14 mr-2" />
              </Link>
            </div>
            <p className="text-warmgray-600 mb-6">
              {companyInfo.tagline}
            </p>
            <div className="flex space-x-4">
              {socialMediaLinks.map((link) => (
                <a 
                  key={link.platform}
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label={link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                  className="text-warmgray-500 hover:text-hotpink transition-colors duration-200"
                >
                  {getSocialIcon(link.platform)}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-heading text-xl text-deepbrown mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-warmgray-600 hover:text-hotpink transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-warmgray-600 hover:text-hotpink transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-warmgray-600 hover:text-hotpink transition-colors duration-200">
                  Our Cakes
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-warmgray-600 hover:text-hotpink transition-colors duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading text-xl text-deepbrown mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Phone className="w-5 h-5 mr-3 text-rosepink mt-0.5 flex-shrink-0" />
                <a href={`tel:${contactInfo.phone}`} className="text-warmgray-600 hover:text-hotpink transition-colors">
                  {contactInfo.phone}
                </a>
              </li>
              <li className="flex items-start">
                <Mail className="w-5 h-5 mr-3 text-rosepink mt-0.5 flex-shrink-0" />
                <a href={`mailto:${contactInfo.email}`} className="text-warmgray-600 hover:text-hotpink transition-colors">
                  {contactInfo.email}
                </a>
              </li>
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-rosepink mt-0.5 flex-shrink-0" />
                <span className="text-warmgray-600">{contactInfo.address}</span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="font-heading text-xl text-deepbrown mb-6">Opening Hours</h4>
            <ul className="space-y-3">
              {Object.entries(businessHours).map(([day, hours]) => (
                <li key={day} className="flex items-start">
                  <Clock className="w-5 h-5 mr-3 text-rosepink mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-warmgray-600 font-medium capitalize">{day}</p>
                    <p className="text-warmgray-500 text-sm">
                      {hours.open === 'Closed' ? 'Closed' : `${hours.open} - ${hours.close}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="relative py-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-softgold/30"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-ivory px-4">
              <svg className="h-5 w-5 text-softgold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </span>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-warmgray-500 text-sm">
          <p>© {currentYear} {companyInfo.name}. All rights reserved.</p>
          <p className="mt-2">Handcrafted with 💕 and premium ingredients</p>
          <p className="mt-4 text-xs max-w-2xl mx-auto">
            <span className="text-hotpink">*</span> The cake images displayed on this website are for inspirational purposes only and may not represent the exact product you will receive.
          </p>
          
          {/* Developer Credits */}
          <div className="mt-8 pt-6 max-w-md mx-auto">
            <div className="py-3 px-4 bg-gradient-to-r from-blush/5 via-ivory to-blush/5 rounded-full border border-softgold/10 flex justify-center items-center space-x-2 shadow-sm hover:shadow-md hover:border-softgold/20 transition-all duration-300 group">
              <div className="bg-white/80 p-1 rounded-full group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
                <svg className="w-3.5 h-3.5 text-hotpink group-hover:text-deepbrown transition-colors duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                  <path d="M2 2l7.586 7.586"></path>
                  <circle cx="11" cy="11" r="2"></circle>
                </svg>
              </div>
              <p className="text-xs font-medium tracking-wide group-hover:text-deepbrown transition-colors duration-300">
                Designed & Developed by{' '}
                <a 
                  href="https://gorobale.tech" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-hotpink hover:text-deepbrown transition-colors font-semibold relative inline-block"
                >
                  <span className="relative z-10">Go Robale</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-hotpink group-hover:w-full transition-all duration-300"></span>
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 