import express, { Request, Response } from "express";
import { authenticate } from "../auth/authentication";
import axios from "axios";

// Models
import { ITrain } from "../models/train";

const router = express.Router();

// Trains Endpoint (The Endpoint is in .env file, following the best practices)
const TrainsEndpoint = process.env.TrainsEndpoint || "";

// Endpoint to get real-time train schedules with seat availability and price
router.get("/all", authenticate, async (req: Request, res: Response) => {
  try {
    const response = await axios.get<ITrain[]>(TrainsEndpoint, {
      headers: {
        Authorization: req.headers.authorization,
      },
    });

    // Fetch train data
    const trainsData = response.data.filter((train) => {
      // Filter trains departing in the next 12 hours and ignore trains departing in the next 30 minutes
      const departureTime = new Date();
      departureTime.setHours(train.departureTime.Hours);
      departureTime.setMinutes(train.departureTime.Minutes);
      departureTime.setSeconds(train.departureTime.Seconds);

      const currentTime = new Date();
      const timeDifference = departureTime.getTime() - currentTime.getTime();
      const timeDifferenceInMinutes = timeDifference / 1000 / 60;

      return timeDifferenceInMinutes > 30 && timeDifferenceInMinutes < 12 * 60;
    });

    // Sorting the trains based on the specified criteria
    trainsData.sort((a, b) => {
      // Sort based on price (ascending order)
      if (a.price.AC !== b.price.AC) {
        return a.price.AC - b.price.AC;
      }

      // Sort based on ticket availability (descending order)
      if (a.seatsAvailable.AC !== b.seatsAvailable.AC) {
        return b.seatsAvailable.AC - a.seatsAvailable.AC;
      }

      // Sort based on departure time (descending order considering delays)
      const aDepartureTime = new Date().getTime() + a.delayedBy * 60 * 1000;
      const bDepartureTime = new Date().getTime() + b.delayedBy * 60 * 1000;
      return bDepartureTime - aDepartureTime;
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch train schedules." });
  }
});

export default router;
