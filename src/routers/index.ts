import {Router} from "express";
import userRouter from "./userRouter";
import projectRouter from "./projectRouter";
import bugRouter from "./bugRouter";
import userProjectRouter from "./userProjectRouter";
import employeeRouter from "./employeeRouter";
import organizationRouter from "./organizationRouter";

const router = Router();

router.use("/users", userRouter);
router.use("/projects", projectRouter);
router.use("/userProject", userProjectRouter);
router.use("/bugs", bugRouter);
router.use("/employee", employeeRouter);
router.use("/organization", organizationRouter);

export default router;
