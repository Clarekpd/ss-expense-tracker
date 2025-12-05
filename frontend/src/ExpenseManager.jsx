import { useState, useEffect } from "react";
import { expenseAPI } from "./api";
import "./ExpenseManager.css";

export default function ExpenseManager() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    date: "",
    notes: "",
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await expenseAPI.getExpenses();
      setExpenses(response.data);
      setError("");
    } catch (err) {
      setError("Failed to load expenses");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ amount: "", category: "", date: "", notes: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.amount || !formData.category || !formData.date) {
      setError("Amount, category, and date are required");
      return;
    }

    try {
      if (editingId) {
        await expenseAPI.updateExpense(editingId, formData);
      } else {
        await expenseAPI.addExpense(
          formData.amount,
          formData.category,
          formData.date,
          formData.notes
        );
      }
      resetForm();
      fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save expense");
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      amount: expense.amount,
      category: expense.category,
      date: expense.date.split("T")[0],
      notes: expense.notes || "",
    });
    setEditingId(expense._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await expenseAPI.deleteExpense(id);
        fetchExpenses();
      } catch (err) {
        setError("Failed to delete expense");
      }
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

  return (
    <div className="container mt-5 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Expenses</h2>
        <button
          className={`btn ${showForm ? "btn-secondary" : "btn-primary"}`}
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
        >
          {showForm ? "Cancel" : "➕ Add Expense"}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      {showForm && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-light">
            <h5 className="mb-0">{editingId ? "Edit Expense" : "Add New Expense"}</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="amount" className="form-label">
                    Amount ($)
                  </label>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="category" className="form-label">
                    Category
                  </label>
                  <input
                    id="category"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Food, Gas, Bills"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="date" className="form-label">
                    Date
                  </label>
                  <input
                    id="date"
                    type="date"
                    className="form-control"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="notes" className="form-label">
                    Notes (optional)
                  </label>
                  <input
                    id="notes"
                    type="text"
                    className="form-control"
                    placeholder="Add any notes..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-success">
                  {editingId ? "Update Expense" : "Add Expense"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {expenses.length === 0 ? (
        <div className="alert alert-info text-center">
          <p className="mb-0">No expenses yet. Add your first expense to get started!</p>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-header bg-light">
            <h5 className="mb-0">All Expenses</h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th className="text-end">Amount</th>
                    <th>Notes</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense._id}>
                      <td>
                        <small className="text-muted">
                          {new Date(expense.date).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        <span className="badge bg-info">{expense.category}</span>
                      </td>
                      <td className="text-end fw-bold">
                        ${expense.amount.toFixed(2)}
                      </td>
                      <td>
                        <small className="text-muted">{expense.notes || "-"}</small>
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-warning me-1"
                          onClick={() => handleEdit(expense)}
                          title="Edit"
                          style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '0.35rem 0.6rem' }}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(expense._id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
