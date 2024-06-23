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

  async findEmployeesByOrganizationId(organizationId: string) {
    try{

        const employees = await Employee.findAll({ where : { organizationId }});

        return employees;

    }catch(error){
        console.error("Error finding employees by organization ID:", error);
        throw new HttpError(`Error finding employees by organization ID`);
    }
}
}
