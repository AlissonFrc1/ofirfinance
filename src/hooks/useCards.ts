import { useState, useEffect } from 'react';
import { Card } from '../types/card';

export function useCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCards = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cards');
      if (!response.ok) throw new Error('Erro ao buscar cartões');
      const data = await response.json();
      setCards(data);
    } catch (error) {
      console.error('Erro ao buscar cartões:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  return { cards, isLoading, fetchCards };
} 