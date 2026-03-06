import express from "express";
import {
  submitAppointmentRequest,
  submitContactMessage,
  subscribeNewsletter,
  getPublicSettings,
  getTrendingHealthNews,
  getHealthTips,
} from "../controllers/publicController.js";
import { getActiveAnnouncements } from "../controllers/adminController.js";
const publicRouter = express.Router();

publicRouter.post("/appointment-request", submitAppointmentRequest);
publicRouter.post("/contact", submitContactMessage);
publicRouter.post("/newsletter", subscribeNewsletter);
publicRouter.get("/announcements", getActiveAnnouncements);
publicRouter.get("/settings", getPublicSettings);
publicRouter.get("/trending-health-news", getTrendingHealthNews);
publicRouter.get("/health-tips", getHealthTips);

// Email diagnostics endpoints removed during cleanup

export default publicRouter;

