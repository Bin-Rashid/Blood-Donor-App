import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const DonorContext = createContext();

export const DonorProvider = ({ children }) => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDonors = async (filters = {}, sortBy = 'name-asc') => {
    setLoading(true);
    let query = supabase.from('donors').select('*');

    // Filtering
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }
    if (filters.bloodType) {
      query = query.eq('blood_type', filters.bloodType);
    }
    if (filters.district) {
      query = query.eq('district', filters.district);
    }
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }
    if (filters.status) {
      const today = new Date();
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(today.getMonth() - 3);
      if (filters.status === 'eligible') {
        query = query.lte('last_donation_date', threeMonthsAgo.toISOString());
      } else if (filters.status === 'not-eligible') {
        query = query.gt('last_donation_date', threeMonthsAgo.toISOString());
      }
    }

    // Sorting
    const [sortKey, sortOrder] = sortBy.split('-');
    query = query.order(sortKey, { ascending: sortOrder === 'asc' });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching donors:', error);
    } else {
      setDonors(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  return (
    <DonorContext.Provider value={{ donors, loading, fetchDonors }}>
      {children}
    </DonorContext.Provider>
  );
};

export const useDonors = () => {
  return useContext(DonorContext);
};
