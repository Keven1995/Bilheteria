import { Router } from "express";
import express from "express";
import { PartnerService } from "../service/partner-service";
import { EventService } from "../service/event-service";

export const partnerRoutes = Router();

partnerRoutes.post("/register", async (req, res) => {
  const { name, email, password, company_name } = req.body;
  const partnerService = new PartnerService();

  const result = await partnerService.register({
    name,
    email,
    password,
    company_name,
  });
  res.status(201).json(result);
});

partnerRoutes.post("/events", async (req, res) => {
  const { name, description, date, location } = req.body;
  const userId = (req as express.Request & { user?: { id: number } }).user?.id;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const partnerService = new PartnerService();
  const partner = await partnerService.findByUserId(userId);

  if (!partner) {
    res.status(403).json({ message: "Not authorized" });
    return;
  }

  const eventService = new EventService();

  const newEvent = await eventService.create({
    name,
    description,
    date,
    location,
    partnerId: partner.id,
    userId,
  });

  res.status(201).json(newEvent);
});

partnerRoutes.get("/events", async (req, res) => {
  const userId = (req as express.Request & { user?: { id: number } }).user?.id;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const partnerService = new PartnerService();
  const partner = await partnerService.findByUserId(userId);

  if (!partner) {
    res.status(403).json({ message: "Not authorized" });
    return;
  }

  const eventService = new EventService();
  const event = await eventService.findAll(partner.id);
  res.json(event);
});

partnerRoutes.get("/events/:eventsId", async (req, res) => {
  const { eventsId } = req.params;
  const userId = (req as express.Request & { user?: { id: number } }).user?.id;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const partnerService = new PartnerService();
  const partner = await partnerService.findByUserId(userId);

  if (!partner) {
    res.status(403).json({ message: "Not authorized" });
    return;
  }

  const eventService = new EventService();
  const event = await eventService.findById(+eventsId);

  if (!event || event.partner_id !== partner.id) {
    res.status(404).json({ message: "Event not found" });
    return;
  }

  res.json(event);
});
