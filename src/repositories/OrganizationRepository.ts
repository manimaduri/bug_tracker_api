import { Organization } from "../models/Organization";
import { Transaction, UniqueConstraintError } from "sequelize";
import { HttpError } from "../utils/responseHandler";
import { User } from "../models/User";
import { Employee } from "../models/Employee";

export class OrganizationRepository {
  async createOrganization(
    organizationData: Partial<Organization>,
    options?: { transaction: Transaction }
  ) {
    try {
      const result = await Organization.create(organizationData, options);
      return result;
    } catch (error) {
      if(error instanceof UniqueConstraintError){
        console.log("Organization with the given name already exists");
        throw new HttpError(
          "Organization with the given name already exists",
          409
        );
      }
      console.log("Error creating organization:", error);
      throw new HttpError(`Error creating organization`);
    }
  }

  async updateOrganization(
    organizationId: string,
    organizationData: Partial<Organization>
  ) {
    try {
      const result = await Organization.update(organizationData, {
        where: { id: organizationId },
        returning: true,
      });
      return result[1][0];
    } catch (error) {
      console.log("Error updating organization:", error);
      throw new HttpError(`Error updating organization`);
    }
  }

  async findOrganizationByUserId(userId: string): Promise<Organization | null> {
    try {
      // Find the user by userId
      const user = await User.findByPk(userId, {
        include: [
          { model: Organization, as: 'organization' },
          { model: Employee, as: 'employee', include: [{ model: Organization }] }
        ]
      });
  
      if (!user) {
        console.log("User not found");
        throw new HttpError("User not found", 404);
      }
  
      // Check if the user has an associated organization
      if (user.organization) {
        return user.organization;
      }
  
      // Check if the user is an employee and find the associated organization
      if (user?.employee?.organization) {
        return user.employee.organization;
      }
  
      // If no organization is found
      console.log("No organization found with the given user ID");
      throw new HttpError("No organization found with the given user ID", 404);
    } catch (error) {
      console.log("Error finding organization by user ID:", error);
      throw new HttpError(`Error finding organization by user ID: ${error}`);
    }
  }

  async findOrganizationById(organizationId: string) {
    try {
      const organization = await Organization.findByPk(
        organizationId
      );
      return organization;
    } catch (error) {
      console.error("Error finding organization by ID:", error);
      throw new HttpError(`Error finding organization by ID`);
    }
  }
}
