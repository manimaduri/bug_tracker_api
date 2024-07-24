import { plainToClass } from "class-transformer";
import { OrganizationRepository } from "../repositories/OrganizationRepository";
import { validateDTO } from "../utils/validateDTO";
import { HttpError } from "../utils/responseHandler";
import { Request } from "express";
import { Organization } from "../models/Organization";
import { UpdateOrganizationDTO } from "../models/dto/UpdateOrganizationDTO";

export class OrganizationService {
  private organizationRepository: OrganizationRepository;

  constructor() {
    this.organizationRepository = new OrganizationRepository();
  }

  async updateOrganization(req: Request): Promise<Organization> {
    try {
      const userId = req.user!.userId;

      const {id, createdAt, updatedAt, userId : bodyUserId, ...organizationData} = req.body;
      const currentOrganizationDetails = await this.organizationRepository.findOrganizationByUserId(userId);
        if (!currentOrganizationDetails) {
            throw new HttpError("Organization not found", 404);
        }
      const organization = plainToClass(UpdateOrganizationDTO, organizationData);
      await validateDTO(organization);
      const updatedOrganization =
        await this.organizationRepository.updateOrganization(
            currentOrganizationDetails.id,
          organization
        );
      return updatedOrganization;
    } catch (error: any) {
      throw new HttpError(
        error?.message ?? "Failed to update organization",
        error?.statusCode || 500
      );
    }
  }
}
