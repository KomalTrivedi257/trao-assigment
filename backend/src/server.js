const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const kitRoutes = require("./routes/kitRoutes");
const aiRoutes = require("./routes/aiRoutes");
const requirementRoutes = require("./routes/requirementRoutes");
const companyRoutes = require("./routes/companyRoutes");
const questionRoutes = require("./routes/questionRoutes");
const coverageRoutes = require("./routes/coverageRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const practiceRoutes = require("./routes/practiceRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/kits", kitRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/requirements", requirementRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/coverage", coverageRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/practice", practiceRoutes);

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "Trao Interview Prep API is running"
    });
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});