import { Router } from "express";
import { start, index, close } from "../controllers/api/whatsappsController";

const whatappRouter: Router = Router();

whatappRouter.get("", index);

whatappRouter.post("/:name", start);
whatappRouter.delete("/:name", close);

export default whatappRouter;
