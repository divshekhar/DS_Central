import express from "express";
import dotenv from "dotenv";
import { authenticate } from "./auth/authentication";

dotenv.config();

// Routes
import trainRoutes from "./routes/trains";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON data
app.use(express.json());

// Home route to test the server
app.get("/", authenticate, (req, res) => {
  res.send("Hello World!");
});

// Trains routes
// All trains routes are prefixed with /trains
// To get all trains in sorted order, send a GET request to /trains/all
app.use("/trains", trainRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
