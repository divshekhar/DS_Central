import express, { Request, Response, NextFunction } from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON data
app.use(express.json());

// AuthEndpoint should be moved to a .env file, but for the sake of simplicity, I'm keeping it here
const AuthEndpoint = "http://20.244.56.144/train/auth";

/**
 * Get access token from the {AuthEndpoint}
 * @returns {Promise<string>} Access token
 */
async function getAccessToken(): Promise<string> {
  try {
    const response = await axios.post<{ access_token: string }>(`${AuthEndpoint}`, {
      // These credentials should be moved to a .env file, but for the sake of simplicity, I'm hardcoding them here
      companyName: "DS Train Central",
      ownerName: "Divyanshu Shekhar",
      ownerEmail: "20051238@kiit.ac.in",
      rollNo: "20051238",
      clientID: "10341f5f-4cb7-44e8-a4fe-14aec897e15c",
      clientSecret: "bpTqWPUlWAcidRlu",
    });

    console.log("Access token received. ", response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    throw new Error("Failed to get access token.");
  }
}

// Middleware to handle authentication
async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const accessToken = await getAccessToken();
    req.headers.authorization = `Bearer ${accessToken}`;
    console.log("Authentication successful.");
    next();
  } catch (error) {
    res.status(500).json({ error: "Authentication failed." });
  }
}

// Home route to test the server
app.get("/", authenticate, (req, res) => {
  res.send("Hello World!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
