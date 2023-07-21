import { Request, Response, NextFunction } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// AuthEndpoint (The Endpoint is in .env file, following the best practices)
const AuthEndpoint = process.env.Auth_Endpoint || "";

/**
 * Get access token from the {AuthEndpoint}
 * @returns {Promise<string>} Access token
 * @throws {Error} Failed to get access token
 */
async function getAccessToken(): Promise<string> {
  try {
    const response = await axios.post<{ access_token: string }>(`${AuthEndpoint}`, {
      companyName: "DS Train Central",
      ownerName: "Divyanshu Shekhar",
      ownerEmail: "20051238@kiit.ac.in",
      rollNo: "20051238",
      clientID: process.env.ClientID || "ClientID",
      clientSecret: process.env.ClientSecret || "ClientSecret",
    });

    console.log("Access token received. ", response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    throw new Error("Failed to get access token.");
  }
}

/**
 * Authenticate the request
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next function
 * @returns {Promise<void>} Nothing
 * @throws {Error} Authentication failed
 * @description This function authenticates the request by getting the access token from the {AuthEndpoint} and setting the authorization header in the request.
 */
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

export { authenticate };
