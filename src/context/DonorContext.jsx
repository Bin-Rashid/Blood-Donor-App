// src/context/DonorContext.jsx
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../services/supabase';

const DonorContext = createContext();

export const DonorProvider = ({ children }) => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const lastQueryRef = useRef('');

  // Utility: sanitize user input for ilike/or queries
  const sanitize = (str = '') => {
    return String(str).trim().replace(/[%()*]/g, '').replace(/\s+/g, ' ');
  };

  const fetchDonors = useCallback(async (filters = {}, sortBy = 'name-asc') => {
    if (!mountedRef.current) return;

    // Create a query key to prevent duplicate requests
    const queryKey = JSON.stringify({ filters, sortBy });
    if (lastQueryRef.current === queryKey) {
      return; // Skip if same query
    }
    lastQueryRef.current = queryKey;

    setLoading(true);

    try {
      // base query
      let query = supabase.from('donors').select('*');

      // SEARCH (safe)
      if (filters.search && String(filters.search).trim()) {
        const s = sanitize(filters.search);
        // use or() with ilike on multiple columns
        query = query.or(
          `name.ilike.%${s}%,phone.ilike.%${s}%,email.ilike.%${s}%`
        );
      }

      // BLOOD TYPE
      if (filters.bloodType) {
        query = query.eq('blood_type', filters.bloodType);
      }

      // DISTRICT
      if (filters.district) {
        query = query.eq('district', filters.district);
      }

      // CITY (safe ilike)
      if (filters.city && String(filters.city).trim()) {
        const c = sanitize(filters.city);
        query = query.ilike('city', `%${c}%`);
      }

      // STATUS (eligible / not-eligible)
      if (filters.status) {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        // Supabase expects plain ISO without ms for comparisons sometimes; remove ms
        const iso = threeMonthsAgo.toISOString().split('.')[0] + 'Z';

        if (filters.status === 'eligible') {
          // donors whose last_donation_date is older than 3 months OR null
          query = query.or(`last_donation_date.lte.${iso},last_donation_date.is.null`);
        } else if (filters.status === 'not-eligible') {
          query = query.gt('last_donation_date', iso);
        }
      }

      // Sorting (safeguard against invalid column names)
      const [sortKey, sortOrder] = String(sortBy || 'name-asc').split('-');
      const validSortKeys = ['name', 'age', 'created_at', 'last_donation_date'];
      if (validSortKeys.includes(sortKey)) {
        query = query.order(sortKey, { ascending: sortOrder === 'asc' });
      } else {
        // fallback sort
        query = query.order('name', { ascending: true });
      }

      // execute
      const { data, error, status } = await query;
      if (error) {
        // log detailed error to help debugging (will show in browser console)
        console.error('Error fetching donors:', { message: error.message, details: error.details, hint: error.hint, code: error.code, status });
        setDonors([]);
      } else {
        setDonors(data || []);
      }
    } catch (err) {
      console.error('Unexpected error in fetchDonors:', err);
      setDonors([]);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    // initial load
    fetchDonors();
    return () => {
      mountedRef.current = false;
    };
    // intentionally empty deps so it runs once on mount
  }, []);

  return (
    <DonorContext.Provider value={{ donors, loading, fetchDonors }}>
      {children}
    </DonorContext.Provider>
  );
};

export const useDonors = () => useContext(DonorContext);