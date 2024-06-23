import { Organization } from "../models/Organization";
import { Transaction } from "sequelize";
import { HttpError } from "../utils/responseHandler";

export class OrganizationRepository {
  async createOrganization(
    organizationData: Partial<Organization>,
    options?: { transaction: Transaction }
  ) {
    try {
      const result = await Organization.create(organizationData, options);
      return result;
    } catch (error) {
      console.log("Error creating organization:", error);
      throw new HttpError(`Error creating organization: ${error}`);
    }
  }

  async findOrganizationByUserId(userId: string) {
    try {
      const organization = await Organization.findOne({
        where: {
          userId: userId,
        },
      });

      if (!organization) {
        console.log("No organization found with the given user ID");
        throw new HttpError(
          "No organization found with the given user ID",
          404
        );
      }

      return organization;
    } catch (error) {
      console.log("Error finding organization by user ID:", error);
      throw new HttpError(`Error finding organization by user ID: ${error}`);
    }
  }

  async findOrganizationById(organizationId: string) {
    try {
      const organization = await Organization.findOne({
        where: { id: organizationId },
      });
      return organization;
    } catch (error) {
      console.error("Error finding organization by ID:", error);
      throw new HttpError(`Error finding organization by ID`);
    }
  }
}
