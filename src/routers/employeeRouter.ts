import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { EmployeeService } from "../services/EmployeeService";


const router = Router();

const employeeService = new EmployeeService();

router.patch("/updateEmployee", authMiddleware, async (req, res) => {
    try {
        const updatedEmployee = await employeeService.updateEmployee(req);
        successResponse(res, updatedEmployee);
    } catch (error: any) {
        errorResponse(
        res,
        error,
        error?.message ?? "Failed to update employee",
        error?.statusCode ?? 500
        );
    }
});

export default router;