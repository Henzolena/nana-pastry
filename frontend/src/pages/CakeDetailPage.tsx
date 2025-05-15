import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Cake } from '@/types';
import { getCakeById } from '@/services/cakeApi';
import CakeDetail from '@/components/cakes/CakeDetail';

const CakeDetailPage: React.FC = () => {
  const { cakeId } = useParams<{ cakeId: string }>();
  const [cake, setCake] = useState<Cake | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cakeId) {
      const fetchCake = async () => {
        try {
          setLoading(true);
          setError(null);
          const fetchedCake = await getCakeById(cakeId);
          setCake(fetchedCake);
        } catch (err: any) {
          setError(err.message || 'Failed to fetch cake details.');
          console.error(`Error fetching cake ${cakeId}:`, err);
        } finally {
          setLoading(false);
        }
      };
      fetchCake();
    } else {
      setError('No cake ID provided.');
      setLoading(false);
    }
  }, [cakeId]);

  if (loading) {
    return <div className="text-center py-10">Loading cake details...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        <p>Error: {error}</p>
        <Link to="/cakes" className="text-blue-500 hover:underline mt-4 inline-block">
          Back to Cakes
        </Link>
      </div>
    );
  }

  if (!cake) {
    return (
      <div className="text-center py-10">
        <p>Cake not found.</p>
        <Link to="/cakes" className="text-blue-500 hover:underline mt-4 inline-block">
          Back to Cakes
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CakeDetail cake={cake} />
    </div>
  );
};

export default CakeDetailPage;
