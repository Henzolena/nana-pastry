import React, { useEffect, useState } from 'react';
import { Cake } from '@/types';
import { getCakes } from '@/services/cakeApi'; // Using path alias
import CakeListItem from './CakeListItem';
// import { CakeCategory } from '@/types'; // Import if filter UI is added

interface CakeListProps {
  // Props for filtering, e.g., category, featured, bakerId, searchTerm
  // category?: CakeCategory;
  // featured?: boolean;
  // bakerId?: string;
  // searchTerm?: string;
}

const CakeList: React.FC<CakeListProps> = (/*{ category, featured, bakerId, searchTerm }*/) => {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCakes = async () => {
      try {
        setLoading(true);
        setError(null);
        // Pass filter props to getCakes if they are implemented
        // const fetchedCakes = await getCakes(category, featured, bakerId, searchTerm);
        const fetchedCakes = await getCakes(); // Basic fetch for now
        setCakes(fetchedCakes);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch cakes.');
        console.error("Error fetching cakes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCakes();
  }, [/*category, featured, bakerId, searchTerm*/]); // Add dependencies if filters are used

  if (loading) {
    return <div className="text-center py-10">Loading cakes...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  if (cakes.length === 0) {
    return <div className="text-center py-10">No cakes found.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {cakes.map((cake) => (
        <CakeListItem key={cake.id} cake={cake} />
      ))}
    </div>
  );
};

export default CakeList;
