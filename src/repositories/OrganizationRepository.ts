import { Organization } from "../models/Organization";
import { Transaction } from "sequelize";
import { Op } from 'sequelize';

export class OrganizationRepository {
  async createOrganization(
    organizationData: Partial<Organization>,
    options?: { transaction: Transaction }
  ) {
    try {
      const result = await Organization.create(organizationData, options);
      return result;
    } catch (error) {
      throw new Error(`Error creating organization: ${error}`);
    }
  }

  async findOrganizationByUserId(userId: string) {
    const organization = await Organization.findOne({
      where: {
        userId: userId
      }
    });

    if (!organization) {
      throw new Error("No organization found with the given user ID");
    }

    return organization;
  }

  
}