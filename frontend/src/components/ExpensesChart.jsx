import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ExpensesChart({ expenses }) {
  // Group expenses by date and sum them
  const groupedExpenses = {};
  expenses.forEach((expense) => {
    const date = new Date(expense.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    groupedExpenses[date] = (groupedExpenses[date] || 0) + expense.amount;
  });

  // Sort dates chronologically
  const sortedDates = Object.keys(groupedExpenses).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  // Calculate cumulative totals for line chart
  let cumulative = 0;
  const cumulativeData = sortedDates.map((date) => {
    cumulative += groupedExpenses[date];
    return cumulative;
  });

  const data = {
    labels: sortedDates,
    datasets: [
      {
        label: 'Cumulative Expenses Over Time',
        data: cumulativeData,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          font: {
            size: 12,
            weight: 600,
          },
          color: '#1f2937',
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.9)',
        padding: 12,
        titleFont: {
          size: 13,
          weight: 'bold',
        },
        bodyFont: {
          size: 12,
        },
        callbacks: {
          label: (context) => `$${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 11,
          },
          color: '#6b7280',
          callback: (value) => `$${value.toFixed(0)}`,
        },
        grid: {
          color: 'rgba(229, 231, 235, 0.5)',
          drawBorder: false,
        },
      },
      x: {
        ticks: {
          font: {
            size: 11,
          },
          color: '#6b7280',
        },
        grid: {
          display: false,
          drawBorder: false,
        },
      },
    },
  };

  if (sortedDates.length === 0) {
    return (
      <div className="card mt-4">
        <div className="card-header" style={{ background: 'linear-gradient(135deg, #f3f4f6 0%, #fff 100%)' }}>
          <h6 className="m-0" style={{ fontWeight: 600 }}>
            📈 Expenses Over Time
          </h6>
        </div>
        <div className="card-body text-center py-5">
          <p style={{ color: '#6b7280' }}>No expenses to display yet. Add some expenses to see the chart!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card mt-4">
      <div className="card-header" style={{ background: 'linear-gradient(135deg, #f3f4f6 0%, #fff 100%)' }}>
        <h6 className="m-0" style={{ fontWeight: 600 }}>
          📈 Expenses Over Time
        </h6>
      </div>
      <div className="card-body" style={{ position: 'relative', height: '400px' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
