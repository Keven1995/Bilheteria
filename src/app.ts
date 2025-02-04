import express from "express";

import jwt from "jsonwebtoken";
import { authRoutes } from "./controller/auth-controller";
import { customerRoutes } from "./controller/customer-controller";
import { partnerRoutes } from "./controller/partner-controller";
import { eventRoutes } from "./controller/event-controller";
import { UserService } from "./service/user-service";

export const app = express();

app.use(express.json());

const unprotectedRoutes = [
  { method: "POST", path: "/auth/login" },
  { method: "POST", path: "/customers/register" },
  { method: "POST", path: "/partners/register" },
  { method: "GET", path: "/events" },
];

app.use(async (req, res, next) => {
  const isUnprotectedRoute = unprotectedRoutes.some(
    (route) => route.method === req.method && req.path.startsWith(route.path)
  );

  if (isUnprotectedRoute) {
    return next();
  }

  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }
  try {
    const payload = jwt.verify(token, "123456") as {
      id: number;
      email: string;
    };

    const useService = new UserService();
    const user = await useService.findById(payload.id);
;
    if (!user) {
      res.status(401).json({ message: "Failed to authenticate token" });
      return;
    }
    (req as express.Request & { user?: { id: number; email: string } }).user =
      user;

    next();
  } catch (error) {
    res.status(401).json({ message: "Failed to authenticate token" });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

app.use("/auth", authRoutes);
app.use("/customers", customerRoutes);
app.use("/partners", partnerRoutes);
app.use("/events", eventRoutes);

app.listen(3000, () => {
  console.log("O servidor está rodando na porta 3000");
});
