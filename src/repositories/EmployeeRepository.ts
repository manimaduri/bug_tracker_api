import { Employee } from "../models/Employee";
import { Transaction } from "sequelize";
import { HttpError } from "../utils/responseHandler";
import { User } from "../models/User";

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

  async findEmployeesByOrganizationId(organizationId: string) {
    try {
      const employees = await Employee.findAll({
        where: { organizationId },
        include: [{
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] } // Exclude password from the response
        }]
      });

      return employees;
    } catch (error) {
      console.error("Error finding employees by organization ID:", error);
      throw new HttpError(`Error finding employees by organization ID`);
    }
  }

  async findEmployeeByUserId(userId: string) {
    try {
      return await Employee.findOne({ where: { userId } });
    } catch (err) {
      console.log("Error finding employee", err);
      throw new HttpError("Unable to find Employee");
    }
  }
}
