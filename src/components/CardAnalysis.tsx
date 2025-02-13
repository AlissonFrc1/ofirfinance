"use client";

import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CardAnalysisProps {
  cardName: string;
  totalGasto: number;
  percentualLimite: number;
  categorias: {
    categoria: string;
    valor: number;
    percentual: number;
  }[];
  onClose: () => void;
}

export function CardAnalysis({ 
  cardName, 
  totalGasto, 
  percentualLimite, 
  categorias,
  onClose 
}: CardAnalysisProps) {
  const [activeIndex, setActiveIndex] = useState(-1);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
    '#D4A5A5', '#9E579D', '#574B90', '#303952', '#FC427B'
  ];

  const data = categorias.map(cat => ({
    name: cat.categoria,
    value: cat.valor,
    percentual: cat.percentual
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    useEffect(() => {
      if (active && payload && payload.length) {
        const index = data.findIndex(item => item.value === payload[0].value);
        if (index !== activeIndex) {
          setActiveIndex(index);
        }
      }
    }, [active, payload]);
    
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-medium">Análise dos Gastos</h2>
              <p className="text-sm text-text-secondary">{cardName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors p-2 -mr-2"
              aria-label="Fechar análise"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-card-bg p-4 sm:p-6 rounded-xl">
              <h3 className="text-base sm:text-lg font-medium mb-2">Total Gasto</h3>
              <p className="text-xl sm:text-2xl font-bold text-expense break-all">
                {formatCurrency(totalGasto)}
              </p>
            </div>
            <div className="bg-card-bg p-4 sm:p-6 rounded-xl">
              <h3 className="text-base sm:text-lg font-medium mb-2">Percentual de limite utilizado</h3>
              <p className="text-xl sm:text-2xl font-bold">
                {percentualLimite.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Gráfico e Lista */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {/* Gráfico */}
            <div className="relative h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        opacity={activeIndex === index ? 1 : 0.7}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Lista de Categorias */}
            <div className="space-y-4">
              {data.map((item, index) => (
                <div 
                  key={item.name}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card-bg hover:bg-card-bg-hover transition-colors cursor-pointer"
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(-1)}
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-text-secondary">
                      {item.percentual.toFixed(1)}%
                    </p>
                  </div>
                  <p className="text-sm font-medium whitespace-nowrap">
                    {formatCurrency(item.value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}