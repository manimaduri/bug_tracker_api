import {Router} from "express";
import userRouter from "./userRouter";
import projectRouter from "./projectRouter";
import bugRouter from "./bugRouter";
import userProjectRouter from "./userProjectRouter";

const router = Router();

router.use("/users", userRouter);
router.use("/projects", projectRouter);
router.use("/userProject", userProjectRouter);
router.use("/bugs", bugRouter);

export default router;
