import { Link } from 'react-router-dom'
import { Instagram, Facebook, Twitter, Phone, Mail, MapPin, Clock } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-ivory border-t border-softgold/20 pt-16 pb-8">
      <div className="container">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div>
            <div className="mb-4">
              <Link to="/" className="flex items-center">
                <span className="font-accent text-rosepink text-4xl">Nana</span>
                <span className="font-heading text-deepbrown text-xl ml-1">Pastry</span>
              </Link>
            </div>
            <p className="text-warmgray-600 mb-6">
              Indulge in the sweet artistry of our handcrafted cakes. Each creation is made with love, premium ingredients, and passion for pastry perfection.
            </p>
            <div className="flex space-x-4">
              <a href="#" aria-label="Instagram" className="text-warmgray-500 hover:text-hotpink transition-colors duration-200">
                <Instagram size={20} />
              </a>
              <a href="#" aria-label="Facebook" className="text-warmgray-500 hover:text-hotpink transition-colors duration-200">
                <Facebook size={20} />
              </a>
              <a href="#" aria-label="Twitter" className="text-warmgray-500 hover:text-hotpink transition-colors duration-200">
                <Twitter size={20} />
              </a>
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
                <Phone className="w-5 h-5 mr-3 text-rosepink mt-0.5" />
                <span className="text-warmgray-600">+1 (234) 567-8900</span>
              </li>
              <li className="flex items-start">
                <Mail className="w-5 h-5 mr-3 text-rosepink mt-0.5" />
                <span className="text-warmgray-600">hello@nanapastry.com</span>
              </li>
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-rosepink mt-0.5 flex-shrink-0" />
                <span className="text-warmgray-600">123 Sweet Lane, Bakery District, Caketown, CA 90210</span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="font-heading text-xl text-deepbrown mb-6">Opening Hours</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Clock className="w-5 h-5 mr-3 text-rosepink mt-0.5" />
                <div>
                  <p className="text-warmgray-600 font-medium">Monday - Friday</p>
                  <p className="text-warmgray-500">9:00 AM - 7:00 PM</p>
                </div>
              </li>
              <li className="flex items-start">
                <Clock className="w-5 h-5 mr-3 text-rosepink mt-0.5" />
                <div>
                  <p className="text-warmgray-600 font-medium">Saturday</p>
                  <p className="text-warmgray-500">10:00 AM - 6:00 PM</p>
                </div>
              </li>
              <li className="flex items-start">
                <Clock className="w-5 h-5 mr-3 text-rosepink mt-0.5" />
                <div>
                  <p className="text-warmgray-600 font-medium">Sunday</p>
                  <p className="text-warmgray-500">Closed</p>
                </div>
              </li>
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
          <p>© {currentYear} Nana Pastry. All rights reserved.</p>
          <p className="mt-2">Handcrafted with 💕 and premium ingredients</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer 