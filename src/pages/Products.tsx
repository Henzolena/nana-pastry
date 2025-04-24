import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Search, Filter, ChevronDown, X } from 'lucide-react';
import { Link } from 'react-router-dom';

import { cakes } from '@/utils/data';
import { Cake, CakeCategory } from '@/types';
import CakeDetailsModal from '@/components/CakeDetailsModal';
import FavoriteButton from '@/components/FavoriteButton';

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
      staggerChildren: 0.1
    }
  }
};

// Generate categories dynamically from cakes data
const uniqueCategories = Array.from(new Set(cakes.map(cake => cake.category)));
const categories: { label: string; value: CakeCategory | 'all' }[] = [
  { label: 'All Cakes', value: 'all' },
  ...uniqueCategories.map(category => ({
    label: category.charAt(0).toUpperCase() + category.slice(1), // Capitalize category name
    value: category,
  })),
];

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState<CakeCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Add state for modal
  const [selectedCake, setSelectedCake] = useState<null | Cake>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Set up intersection observer hooks for animation
  const [headerRef, headerInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [cakesRef, cakesInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  // Filter cakes based on category and search
  const filteredCakes = cakes.filter((cake) => {
    // Category filter
    const matchesCategory = selectedCategory === 'all' || cake.category === selectedCategory;
    
    // Search filter
    const matchesSearch = searchQuery === '' || 
      cake.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cake.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Add a handler to open modal with cake details
  const handleOpenCakeDetails = (cake: Cake) => {
    setSelectedCake(cake);
    setIsModalOpen(true);
  };

  return (
    <div className="">
      {/* Add Modal */}
      <CakeDetailsModal 
        cake={selectedCake}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Header */}
      <motion.section
        ref={headerRef}
        initial="hidden"
        animate={headerInView ? "visible" : "hidden"}
        variants={fadeIn}
        className="relative min-h-[50vh] flex items-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(255, 192, 203, 0.7), rgba(255, 245, 238, 0.9)), url('/src/assets/images/cakes-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          width: '100%',
          marginTop: '0',
          paddingTop: '6rem',
          paddingBottom: '3rem'
        } as React.CSSProperties}
      >
        <div className="absolute inset-0 bg-gold-shimmer opacity-30"></div>
        
        <div className="container relative z-10 text-center">
          <motion.p 
            className="font-script text-rosepink text-2xl md:text-3xl mb-2"
            variants={fadeIn}
          >
            Sweet Indulgence
          </motion.p>
          
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-deepbrown mb-6"
            variants={fadeIn}
          >
            Our Cake Collection
          </motion.h1>
          
          <motion.p 
            className="text-lg max-w-2xl mx-auto text-warmgray-700"
            variants={fadeIn}
          >
            Explore our handcrafted cakes made with premium ingredients and artistic flair.
            Each creation is designed to make your special moments unforgettable.
          </motion.p>
        </div>
      </motion.section>

      {/* Filters and Search */}
      <section className="py-8 bg-ivory border-b border-blush/20">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            {/* Search */}
            <div className="relative max-w-md w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-warmgray-400" />
              </div>
              <input
                type="text"
                placeholder="Search cakes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white w-full pl-10 pr-4 py-2 border border-warmgray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-hotpink focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-warmgray-400 hover:text-hotpink"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Categories - Desktop */}
            <div className="hidden md:flex items-center space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === category.value
                      ? 'bg-hotpink text-white shadow-soft-pink'
                      : 'bg-white border border-warmgray-200 text-warmgray-700 hover:bg-blush/20'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Categories - Mobile */}
            <div className="md:hidden">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full flex items-center justify-between px-4 py-2 bg-white border border-warmgray-200 rounded-full text-warmgray-700"
              >
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <span>Filter: {categories.find(c => c.value === selectedCategory)?.label}</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFilterOpen && (
                <div className="mt-2 bg-white rounded-lg shadow-lg overflow-hidden border border-warmgray-200 z-20">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => {
                        setSelectedCategory(category.value);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors duration-200 ${
                        selectedCategory === category.value
                          ? 'bg-blush/20 text-hotpink font-medium'
                          : 'hover:bg-warmgray-50 text-warmgray-700'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Cakes Grid */}
      <motion.section
        ref={cakesRef}
        initial="hidden"
        animate={cakesInView ? "visible" : "hidden"}
        variants={staggerContainer}
        className="section bg-pink-gradient"
      >
        <div className="container">
          {/* Image Disclaimer Notice */}
          <motion.div 
            variants={fadeIn}
            className="bg-white/80 rounded-lg p-4 mb-8 border border-blush/20 shadow-sm"
          >
            <div className="flex items-center text-sm text-warmgray-700">
              <span className="text-hotpink mr-2">※</span>
              <p>The cake images shown are for inspiration only. Each cake is handcrafted and may vary slightly from the photographs shown.</p>
            </div>
          </motion.div>

          {selectedCategory === 'custom' && (
            <motion.div 
              variants={fadeIn}
              className="bg-white/90 rounded-xl p-6 mb-8 border border-blush/30 shadow-soft-pink"
            >
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="bg-blush/30 p-4 rounded-full">
                  <svg className="w-10 h-10 text-hotpink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-heading text-deepbrown mb-2">Looking for a Custom Design?</h3>
                  <p className="text-warmgray-700">
                    Our talented pastry chefs can create a customized cake to perfectly match your vision and occasion.
                  </p>
                </div>
                <Link to="/request-custom-design" className="btn btn-primary whitespace-nowrap">
                  Start My Design
                </Link>
              </div>
            </motion.div>
          )}
          
          {filteredCakes.length > 0 ? (
            <>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={staggerContainer}
              >
                {filteredCakes.map((cake) => (
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
                        className="cake-card-image w-full h-72 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-deepbrown/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <div className="p-4 text-white">
                          <span className="text-xs uppercase tracking-wider bg-hotpink px-2 py-0.5 rounded-full">
                            {cake.category}
                          </span>
                          <p className="mt-2 line-clamp-2 text-sm md:text-base text-white">
                            {cake.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Add Favorite button */}
                      <div className="absolute top-2 right-2 z-10">
                        <FavoriteButton 
                          productId={cake.id}
                          size="sm"
                          className="bg-white/80 hover:bg-white shadow-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="cake-card-content">
                      <h3 className="text-xl font-heading text-deepbrown">{cake.name}</h3>
                      
                      <div className="flex justify-between items-center mt-2">
                        {cake.sizes && cake.sizes.length > 0 && (
                          <span className="font-heading text-rosepink text-lg">
                            {cake.sizes.length > 1 ? 'From ' : ''}${Math.min(...cake.sizes.map(s => s.price)).toFixed(2)}
                          </span>
                        )}
                        <button 
                          onClick={() => handleOpenCakeDetails(cake)}
                          className="text-sm font-medium text-deepbrown hover:text-hotpink transition-colors duration-200 bg-white/70 hover:bg-white px-3 py-1 rounded-full"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Load more button, can be implemented for pagination */}
              {filteredCakes.length > 9 && (
                <div className="mt-12 text-center">
                  <button className="btn btn-secondary">
                    Load More
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="bg-white/80 max-w-md mx-auto p-8 rounded-xl shadow-soft-pink">
                <h3 className="text-xl font-heading text-deepbrown mb-3">No cakes found</h3>
                <p className="text-warmgray-600 mb-6">
                  We couldn't find any cakes matching your search criteria. Try adjusting your filters or consider requesting a custom design.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                    className="btn btn-secondary inline-flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </button>
                  <Link to="/request-custom-design" className="btn btn-primary">
                    Request Custom Design
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.section>

      {/* Custom Order CTA */}
      <section className="section bg-gradient-to-r from-blush/30 to-ivory">
        <div className="container">
          <div className="max-w-4xl mx-auto bg-white/80 rounded-2xl p-8 md:p-12 shadow-soft-pink border border-blush/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="title-accent">Don't See What You Need?</p>
                <h2 className="text-2xl md:text-3xl font-heading text-deepbrown mb-4">Custom Cake Design</h2>
                <p className="text-warmgray-700 mb-6">
                  Let us create a unique cake tailored to your vision and requirements. Our cake artists
                  love bringing special requests to life, no matter how simple or elaborate.
                </p>
                <Link to="/request-custom-design" className="btn btn-primary">
                  Request Custom Design
                </Link>
              </div>
              <div className="relative">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-lilac/30 rounded-full"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-peachy/30 rounded-full"></div>
                <img 
                  src="images/cakes/custom-cake.jpg" 
                  alt="Custom cake design" 
                  className="relative z-10 rounded-xl shadow-soft-pink"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products; 