import { Request } from "express";
import { Employee } from "../models/Employee";
import { EmployeeRepository } from "../repositories/EmployeeRepository";
import { HttpError } from "../utils/responseHandler";
import { plainToClass } from "class-transformer";
import { validateDTO } from "../utils/validateDTO";
import { UpdateEmployeeDTO } from "../models/dto/UpdateEmployeeDTO";

export class EmployeeService {
  private employeeRepository: EmployeeRepository;

  constructor() {
    this.employeeRepository = new EmployeeRepository();
  }

  async updateEmployee(req: Request): Promise<Employee> {
    try {
      const userId = req.user!.userId;

      // Destructure to exclude userId and organizationId from req.body
      const { id, userId: bodyUserId, organizationId,createdAt,updatedAt, ...filteredBody } = req.body;

      const employee = plainToClass(UpdateEmployeeDTO, filteredBody);
      await validateDTO(employee);
      const currentEmployeeDetails =
        await this.employeeRepository.findEmployeeByUserId(userId);
      if (!currentEmployeeDetails) {
        throw new HttpError("Employee not found", 404);
      }
      const updatedEmployee = await this.employeeRepository.updateEmployee(
        currentEmployeeDetails.id,
        employee
      );
      return updatedEmployee;
    } catch (error: any) {
      throw new HttpError(
        error?.message ?? "Failed to update employee",
        error?.statusCode || 500
      );
    }
  }
}
