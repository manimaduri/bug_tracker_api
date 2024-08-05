import { Employee } from "../models/Employee";
import { Op, Transaction } from "sequelize";
import { HttpError } from "../utils/responseHandler";
import { User } from "../models/User";
import { Organization } from "../models/Organization";

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

  async updateEmployee(id: string, employeeData: Partial<Employee>) {
    try {
      const result = await Employee.update(employeeData, {
        where: { id },
        returning: true,
      });
      return result[1][0];
    } catch (error) {
      throw new HttpError(`Error updating employee: ${error}`);
    }
  }

  async findEmployeesByOrganizationId(organizationId: string) {
    try {
      const employees = await Employee.findAll({
        where: { organizationId },
        include: [
          {
            model: User,
            as: "user",
            attributes: { exclude: ["password"] }, // Exclude password from the response
          },
        ],
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

  async findEmployeeAndOrganizationByUserId(userId: string) {
    try {
      return await Employee.findOne({
        where: { userId },
        include: [
          { model: User, as: "user" },
          { model: Organization, as: "organization" },
        ],
      });
    } catch (err) {
      console.log("Error finding employee and organization", err);
      throw new HttpError("Unable to find Employee and Organization");
    }
  }

  async searchEmployees(query: string, organizationId: string) {
    try {
      const formattedQuery = query.replace(/ /g, " | "); // Replace spaces with regex OR for multi-word search
      const employees = await Employee.findAll({
        where: {
          organizationId,
          [Op.or]: [
            {
              firstName: {
                [Op.iRegexp]: `(^| )${formattedQuery}`, // Match any word starting with the query
              },
            },
            {
              lastName: {
                [Op.iRegexp]: `(^| )${formattedQuery}`, // Match any word starting with the query
              },
            },
            {
              designation: {
                [Op.iRegexp]: `(^| )${formattedQuery}`, // Match any word starting with the query
              },
            },
          ],
        },
        include: [
          {
            model: User,
            as: "user",
            attributes: { exclude: ["password"] }, // Exclude password from the response
          },
        ],
      });

      return employees;
    } catch (error) {
      console.error("Error searching employees:", error);
      throw new HttpError(`Error searching employees`);
    }
  }
}
