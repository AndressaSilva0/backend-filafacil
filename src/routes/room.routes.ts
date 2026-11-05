import { Router } from "express";
import {
  RoomController,
  roomSchema,
} from "../controllers/room.controller";
import { validateBody } from "../middlewares/validation.middleware";
import { optionalAuthMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", RoomController.listRooms);
router.get("/:id", RoomController.getRoomById);
router.post("/", validateBody(roomSchema), RoomController.createRoom);
router.put("/:id", RoomController.updateRoom);
router.post("/:id/assign", optionalAuthMiddleware as any, RoomController.assignProfessional as any);

export default router;

