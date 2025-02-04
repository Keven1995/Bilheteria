import { Router } from "express";
import { EventService } from "../service/event-service";

export const eventRoutes = Router();

eventRoutes.get("/", async (req, res) => {
  const eventService = new EventService();
  const events = await eventService.findAll();
  res.json(events);
});

eventRoutes.get("/:eventsId", async (req, res) => {
  const { eventsId } = req.params;
  const eventService = new EventService();
  const event = await eventService.findById(+eventsId);

  if (!event) {
    res.status(404).json({ message: "Event not found" });
    return;
  }
  res.json(event);
});
