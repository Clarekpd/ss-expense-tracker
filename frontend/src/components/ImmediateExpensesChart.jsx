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

export default function ImmediateExpensesChart({ expenses, period = 'week' }) {
  // Helper: get ISO week key (YYYY-Www) and label
  const getWeekKeyAndLabel = (dateObj) => {
    const d = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));
    const dayNum = d.getUTCDay() || 7; // 1-7 (Mon-Sun), make Sunday 7
    d.setUTCDate(d.getUTCDate() + (4 - dayNum)); // nearest Thursday
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNum = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    const year = d.getUTCFullYear();
    const key = `${year}-W${String(weekNum).padStart(2, '0')}`;
    const label = `Week ${weekNum} ${year}`;
    return { key, label, sortDate: new Date(Date.UTC(d.getUTCFullYear(), 0, 1 + (weekNum - 1) * 7)) };
  };

  // Helper: get month key (YYYY-MM) and label
  const getMonthKeyAndLabel = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;
    const label = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return { key, label, sortDate: new Date(year, month, 1) };
  };

  // Group expenses by selected period and sum them
  const grouped = {};
  const periodLabels = {};
  const periodSortDates = {};
  (expenses || []).forEach((expense) => {
    const dateObj = new Date(expense.date);
    const amt = Number(expense.amount) || 0;
    const info = period === 'month' ? getMonthKeyAndLabel(dateObj) : getWeekKeyAndLabel(dateObj);
    grouped[info.key] = (grouped[info.key] || 0) + amt;
    periodLabels[info.key] = info.label;
    periodSortDates[info.key] = info.sortDate;
  });

  // Sort period keys chronologically
  const sortedKeys = Object.keys(grouped).sort((a, b) => periodSortDates[a] - periodSortDates[b]);

  const labels = sortedKeys.map((k) => periodLabels[k]);
  const totals = sortedKeys.map((k) => grouped[k]);

  const data = {
    labels,
    datasets: [
      {
        label: period === 'month' ? 'Monthly Spending' : 'Weekly Spending',
        data: totals,
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

  if (sortedKeys.length === 0) {
    return (
      <div className="card mt-4">
        <div className="card-header" style={{ background: 'linear-gradient(135deg, #f3f4f6 0%, #fff 100%)' }}>
          <h6 className="m-0" style={{ fontWeight: 600 }}>
            📈 {period === 'month' ? 'Monthly' : 'Weekly'} Spending
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
          📈 {period === 'month' ? 'Monthly' : 'Weekly'} Spending
        </h6>
      </div>
      <div className="card-body" style={{ position: 'relative', height: '300px' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
