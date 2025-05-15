import React from 'react';
import CakeList from '@/components/cakes/CakeList'; // Using path alias

const CakesPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Our Cakes</h1>
      {/* Future: Add filter controls here (category, search, featured, etc.) */}
      <CakeList />
    </div>
  );
};

export default CakesPage;
