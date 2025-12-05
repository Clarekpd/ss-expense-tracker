import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8081;

// MongoDB Setup
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "expense_tracker";
const USERS_COLLECTION = "users";
const EXPENSES_COLLECTION = "expenses";

let db;

// Initialize MongoDB
async function initDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log("✅ MongoDB connected");
  return db;
}

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me";
const TOKEN_EXPIRY = "7d";

// Middleware
app.use(cors());
app.use(express.json());

// ======== AUTHENTICATION MIDDLEWARE ========
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.replace("Bearer ", "");
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.userId = decoded.userId;
    next();
  });
}

// ======== HEALTH CHECK ========
app.get("/", (req, res) => {
  res.json({ message: "Expense Tracker API is running" });
});

// ======== AUTHENTICATION ENDPOINTS ========

// SIGNUP
app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const usersCollection = db.collection(USERS_COLLECTION);
    const existing = await usersCollection.findOne({ username });

    if (existing) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = await usersCollection.insertOne({
      username,
      password: hashed,
      createdAt: new Date(),
    });

    return res.status(201).json({
      message: "User created successfully",
      userId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const usersCollection = db.collection(USERS_COLLECTION);
    const user = await usersCollection.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    return res.json({
      token,
      userId: user._id.toString(),
      username: user.username,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET USER PROFILE
app.get("/user", authenticateToken, async (req, res) => {
  try {
    const usersCollection = db.collection(USERS_COLLECTION);
    const user = await usersCollection.findOne({ _id: new ObjectId(req.userId) });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      userId: user._id.toString(),
      username: user.username,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ======== EXPENSE ENDPOINTS ========

// GET ALL EXPENSES FOR USER
app.get("/expenses", authenticateToken, async (req, res) => {
  try {
    const expensesCollection = db.collection(EXPENSES_COLLECTION);
    const expenses = await expensesCollection
      .find({ userId: req.userId })
      .sort({ date: -1 })
      .toArray();

    res.json(expenses);
  } catch (error) {
    console.error("Get expenses error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ADD NEW EXPENSE
app.post("/expenses", authenticateToken, async (req, res) => {
  try {
    const { amount, category, date, notes } = req.body;

    if (!amount || !category || !date) {
      return res.status(400).json({ error: "Amount, category, and date required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: "Amount must be greater than 0" });
    }

    const expensesCollection = db.collection(EXPENSES_COLLECTION);
    const result = await expensesCollection.insertOne({
      userId: req.userId,
      amount: parseFloat(amount),
      category,
      date: new Date(date),
      notes: notes || "",
      createdAt: new Date(),
    });

    res.status(201).json({
      message: "Expense added",
      expenseId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("Add expense error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE EXPENSE
app.put("/expenses/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category, date, notes } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid expense ID" });
    }

    const updates = {};
    if (amount) updates.amount = parseFloat(amount);
    if (category) updates.category = category;
    if (date) updates.date = new Date(date);
    if (notes !== undefined) updates.notes = notes;

    const expensesCollection = db.collection(EXPENSES_COLLECTION);
    const result = await expensesCollection.updateOne(
      { _id: new ObjectId(id), userId: req.userId },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json({ message: "Expense updated" });
  } catch (error) {
    console.error("Update expense error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE EXPENSE
app.delete("/expenses/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid expense ID" });
    }

    const expensesCollection = db.collection(EXPENSES_COLLECTION);
    const result = await expensesCollection.deleteOne({
      _id: new ObjectId(id),
      userId: req.userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json({ message: "Expense deleted" });
  } catch (error) {
    console.error("Delete expense error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ======== REPORT ENDPOINTS ========

// GET SUMMARY (all time)
app.get("/reports/summary", authenticateToken, async (req, res) => {
  try {
    const expensesCollection = db.collection(EXPENSES_COLLECTION);
    const expenses = await expensesCollection
      .find({ userId: req.userId })
      .toArray();

    const summary = {};
    let totalAmount = 0;

    expenses.forEach((exp) => {
      if (!summary[exp.category]) {
        summary[exp.category] = 0;
      }
      summary[exp.category] += exp.amount;
      totalAmount += exp.amount;
    });

    res.json({
      summary,
      totalAmount,
      expenseCount: expenses.length,
    });
  } catch (error) {
    console.error("Summary error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET MONTHLY SUMMARY
app.get("/reports/monthly", authenticateToken, async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year + 1}-01-01`);

    const expensesCollection = db.collection(EXPENSES_COLLECTION);
    const expenses = await expensesCollection
      .find({
        userId: req.userId,
        date: { $gte: startDate, $lt: endDate },
      })
      .toArray();

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthly = {};

    months.forEach((m) => {
      monthly[m] = 0;
    });

    expenses.forEach((exp) => {
      const monthIndex = exp.date.getMonth();
      monthly[months[monthIndex]] += exp.amount;
    });

    res.json(monthly);
  } catch (error) {
    console.error("Monthly report error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET DAILY SUMMARY (last 30 days)
app.get("/reports/daily", authenticateToken, async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const expensesCollection = db.collection(EXPENSES_COLLECTION);
    const expenses = await expensesCollection
      .find({
        userId: req.userId,
        date: { $gte: startDate, $lte: endDate },
      })
      .sort({ date: 1 })
      .toArray();

    const daily = {};

    expenses.forEach((exp) => {
      const dateStr = exp.date.toISOString().split("T")[0];
      if (!daily[dateStr]) {
        daily[dateStr] = 0;
      }
      daily[dateStr] += exp.amount;
    });

    res.json(daily);
  } catch (error) {
    console.error("Daily report error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ======== START SERVER ========
async function start() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start:", error);
    process.exit(1);
  }
}

start();
