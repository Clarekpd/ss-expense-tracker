import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { reportAPI, expenseAPI } from "./api";
import ExpensesChart from "./components/ExpensesChart";

import "./Dashboard.css";
import ImmediateExpensesChart from "./components/ImmediateExpensesChart";

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (checkAuth()) {
      fetchData();
    }
  }, [navigate]);

  const fetchData = async () => {
    if (!checkAuth()) return;
    
    try {
      const response = await reportAPI.getSummary();
      setSummary(response.data);
      
      // Fetch all expenses for the chart
      const expensesResponse = await expenseAPI.getExpenses();
      setExpenses(expensesResponse.data);
      
      setError("");
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError("Failed to load dashboard data");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger m-5">{error}</div>;
  }

  return (
    <div className="container mt-5 mb-5">
      <h2 className="mb-4">Dashboard</h2>

      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted text-uppercase fw-bold">
                Total Spent
              </h6>
              <h3 className="card-title text-primary fw-bold">
                ${summary?.totalAmount?.toFixed(2) || "0.00"}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted text-uppercase fw-bold">
                Transactions
              </h6>
              <h3 className="card-title text-success fw-bold">
                {summary?.expenseCount || 0}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted text-uppercase fw-bold">
                Categories
              </h6>
              <h3 className="card-title text-info fw-bold">
                {Object.keys(summary?.summary || {}).length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {summary?.summary && Object.keys(summary.summary).length > 0 && (
        <div className="card shadow-sm">
          <div className="card-header bg-light">
            <h5 className="mb-0">Breakdown by Category</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Category</th>
                    <th className="text-end">Amount</th>
                    <th className="text-end">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(summary.summary).map(([category, amount]) => (
                    <tr key={category}>
                      <td>
                        <span className="badge bg-secondary">{category}</span>
                      </td>
                      <td className="text-end fw-bold">${amount.toFixed(2)}</td>
                      <td className="text-end text-muted">
                        {((amount / summary.totalAmount) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {(!summary?.summary || Object.keys(summary.summary).length === 0) && (
        <div className="alert alert-info text-center">
          <p className="mb-0">No expenses yet. Start by adding your first expense!</p>
        </div>
      )}

      <div className="charts-grid">
        <ExpensesChart expenses={expenses} />
        <ImmediateExpensesChart expenses={expenses} period="week" />
      </div>

    </div>
  );
}
