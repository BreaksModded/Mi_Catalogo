import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useLanguage } from '../context/LanguageContext';
import { useGenreTranslation } from '../utils/genreTranslation';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function GeneroChart({ data }) {
  const { t } = useLanguage();
  const { translateGenre } = useGenreTranslation();
  
  if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).length === 0) {
    return <div className="no-data-message">{t('messages.noData', 'No hay datos de géneros')}</div>;
  }

  const labels = Object.keys(data).map(translateGenre);
  const counts = Object.values(data);

  const chartData = {
    labels,
    datasets: [
      {
        label: t('summary.moviesWatched', 'Títulos vistos'),
        data: counts,
        backgroundColor: '#1976d2',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { 
        callbacks: { 
          label: ctx => `${ctx.parsed.y} ${t('general.title', 'título')}${ctx.parsed.y === 1 ? '' : 's'}` 
        } 
      }
    },
    scales: {
      x: { ticks: { color: '#fff' } },
      y: { beginAtZero: true, ticks: { color: '#fff', precision: 0 } }
    }
  };

  return (
    <div className="genero-chart-wrapper">
      <Bar data={chartData} options={options} />
    </div>
  );
}

export function YearChart({ data }) {
  const { t } = useLanguage();
  
  if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).length === 0) {
    return <div className="no-data-message">{t('messages.noData', 'No hay datos de años')}</div>;
  }

  // Ordenar años numéricamente
  const labels = Object.keys(data).sort((a, b) => Number(a) - Number(b));
  const counts = labels.map(year => data[year]);

  const chartData = {
    labels,
    datasets: [
      {
        label: t('summary.moviesWatched', 'Títulos vistos'),
        data: counts,
        backgroundColor: '#43a047', // Verde
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { 
        callbacks: { 
          label: ctx => `${ctx.parsed.y} ${t('general.title', 'título')}${ctx.parsed.y === 1 ? '' : 's'}` 
        } 
      }
    },
    scales: {
      x: { ticks: { color: '#fff' } },
      y: { beginAtZero: true, ticks: { color: '#fff', precision: 0 } }
    }
  };

  return (
    <div className="genero-chart-wrapper">
      <Bar data={chartData} options={options} />
    </div>
  );
}
