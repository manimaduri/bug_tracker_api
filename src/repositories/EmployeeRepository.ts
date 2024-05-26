import { Employee } from "../models/Employee";
import { Transaction } from "sequelize";

export class EmployeeRepository {
  async createEmployee(
    employeeData: Partial<Employee>,
    options?: { transaction: Transaction }
  ) {
    try {
      const result = await Employee.create(employeeData, options);
      return result;
    } catch (error) {
      throw new Error(`Error creating employee: ${error}`);
    }
  }
}
