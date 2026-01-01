
import { useState, useEffect } from 'react';
import { supabase, getModalities, subscribeToModalities } from '../services/supabase';
import { Modality } from '../types';

export const useModalities = () => {
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    const data = await getModalities();
    setModalities(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    const channel = subscribeToModalities(fetchAll);
    return () => { channel.unsubscribe(); };
  }, []);

  return { modalities, loading, refresh: fetchAll };
};
