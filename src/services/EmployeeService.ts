import { Request } from "express";
import { Employee } from "../models/Employee";
import { EmployeeRepository } from "../repositories/EmployeeRepository";
import { HttpError } from "../utils/responseHandler";
import { plainToClass } from "class-transformer";
import { validateDTO } from "../utils/validateDTO";
import { UpdateEmployeeDTO } from "../models/dto/UpdateEmployeeDTO";
import { OrganizationRepository } from "../repositories/OrganizationRepository";

export class EmployeeService {
  private employeeRepository: EmployeeRepository;
  private organizationRepository: OrganizationRepository;

  constructor() {
    this.employeeRepository = new EmployeeRepository();
    this.organizationRepository = new OrganizationRepository();
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

  async searchEmployees(req: Request): Promise<Employee[]> {
    try {
      const { query } = req.body;
      const userId = req.user!.userId;
      const organization = await this.organizationRepository.findOrganizationByUserId(userId);
      if (!organization) {
        throw new HttpError("Organization not found", 404);
      }

     

      const employees = await this.employeeRepository.searchEmployees(query as string, organization.id);
      return employees;
    } catch (error: any) {
      console.error("Error searching employees:", error);
      throw new HttpError(
        error?.message ?? "Failed to search employees",
        error?.statusCode || 500
      );
    }
  }

}
