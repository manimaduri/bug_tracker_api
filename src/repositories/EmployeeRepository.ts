import { Employee } from "../models/Employee";
import { Transaction } from "sequelize";
import { HttpError } from "../utils/responseHandler";

export class EmployeeRepository {
  async createEmployee(
    employeeData: Partial<Employee>,
    options?: { transaction: Transaction }
  ) {
    try {
      const result = await Employee.create(employeeData, options);
      return result;
    } catch (error) {
      throw new HttpError(`Error creating employee: ${error}`);
    }
  }
}
