'use server';

import { User, Plan } from '@/types';

export async function saveUser(userData: Partial<User>) {
  try {
    const response = await fetch('/api/users', {
      method: userData.id ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error('Erro ao salvar usuário');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao salvar usuário:', error);
    throw error;
  }
}

export async function savePlan(planData: Partial<Plan>) {
  try {
    const response = await fetch('/api/plans', {
      method: planData.id ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(planData)
    });

    if (!response.ok) {
      throw new Error('Erro ao salvar plano');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao salvar plano:', error);
    throw error;
  }
} 