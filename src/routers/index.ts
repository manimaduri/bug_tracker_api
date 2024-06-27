// src/routers/index.ts
import express from "express";
import userRouter from "./userRouter";
import projectRouter from "./projectRouter";

const router = express.Router();

router.use("/users", userRouter);
router.use("/projects", projectRouter);

export default router;
