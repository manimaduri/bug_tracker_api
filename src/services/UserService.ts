import { EmployeeRepository } from "../repositories/EmployeeRepository";
import { OrganizationRepository } from "../repositories/OrganizationRepository";
import { UserRepository } from "../repositories/UserRepository";
import { HttpError } from "../utils/responseHandler";

export class UserService {
  private userRepository: UserRepository;
  private organizationRepository: OrganizationRepository;
  private employeeRepository: EmployeeRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.organizationRepository = new OrganizationRepository();
    this.employeeRepository = new EmployeeRepository();
  }

  async getAllEmployeesByOrganization(organizationId: string) {
    try {
      const organization =
        await this.organizationRepository.findOrganizationById(organizationId);
      if (!organization) {
        throw new HttpError("Organization not found", 404);
      }
      return this.employeeRepository.findEmployeesByOrganizationId(
        organizationId
      );
    } catch (error: any) {
      console.error("Error fetching employees........:", error.stack);
      throw new HttpError(
        error?.message ?? "Failed to fetch employees.",
        error?.statusCode || 500
      );
    }
  }
}
