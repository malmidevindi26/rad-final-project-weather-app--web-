import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

// to register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface WeatherChartProps {
  logs: any[]
}

export const WeatherChart: React.FC<WeatherChartProps> = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 text-center text-sm text-gray-400">
        📊 No weather logs available for this city yet.
      </div>
    )
  }

  const recentLogs = logs.slice(-7)

  const labels = recentLogs.map((log) => {
    const date = new Date(log.timestamp || log.createdAt)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })

  const data = {
    labels,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: recentLogs.map((log) => log.temp),
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y',
      },
      {
        label: 'Humidity (%)',
        data: recentLogs.map((log) => log.humidity),
        borderColor: 'rgb(6, 182, 212)', // Cyan color
        backgroundColor: 'rgba(6, 182, 212, 0.05)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y1',
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: { size: 12, weight: 'bold' as any },
        },
      },
      title: {
        display: true,
        text: '📈 Weather History Analytics (Timeline)',
        font: { size: 15, weight: 'bold' as any },
        color: '#1e293b',
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: { display: true, text: 'Temperature (°C)' },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Humidity (%)' },
      },
    },
  }

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
      <Line data={data} options={options} />
    </div>
  )
}