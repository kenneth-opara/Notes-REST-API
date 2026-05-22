require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const connectDB = require("./config/database");

const authRoutes = require("./routes/auth");
const notesRoutes = require("./routes/notes");

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB().catch((err) => {
  console.error("Failed to connect to MongoDB:", err.message);
  process.exit(1);
});

// ─── App Setup ────────────────────────────────────────────────────────────────
const app = express();
app.use(cors());

app.use(express.json({ limit: "50kb" })); // guard against large payloads
app.use(express.urlencoded({ extended: false }));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get("/", (req, res) =>
  res.json({ status: "ok", message: "Notes API is running.", version: "1.0.0", docs: "/api-docs" })
);

// ─── Swagger UI ───────────────────────────────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "Notes API Docs",
  swaggerOptions: { persistAuthorization: true },
}));

app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ status: "error", message: `Route ${req.method} ${req.path} not found.` })
);

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);

  // Mongoose CastError — invalid ObjectId
  if (err.name === "CastError" && err.kind === "ObjectId") {
    return res.status(400).json({ status: "error", message: "Invalid ID format." });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({ status: "error", message: `${field} already exists.` });
  }

  // Mongoose ValidationError
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ status: "error", message: "Validation failed.", errors });
  }

  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : "Internal server error.";
 // res.status(status).json({ status: "error", message });
 res.status(status).json({status: "error", message: err.message, stack: err.stack});
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;