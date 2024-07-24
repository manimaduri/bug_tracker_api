import {Router} from "express";
import userRouter from "./userRouter";
import projectRouter from "./projectRouter";
import bugRouter from "./bugRouter";
import userProjectRouter from "./userProjectRouter";
import employeeRouter from "./employeeRouter";

const router = Router();

router.use("/users", userRouter);
router.use("/projects", projectRouter);
router.use("/userProject", userProjectRouter);
router.use("/bugs", bugRouter);
router.use("/employee", employeeRouter);

export default router;
