import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
  AllowNull,
  BelongsToMany,
  HasMany,
  HasOne,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { Project } from "./Project";
import { UserProject } from "./UserProject";
import { Bug } from "./Bug";
import { Organization } from "./Organization";
import { Employee } from "./Employee";

@Table({ tableName: "users" })
export class User extends Model {
  @PrimaryKey
  @Default(() => uuidv4())
  @Column(DataType.UUID)
  id!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  email!: string;

  @Column(DataType.STRING)
  mobileNumber?: string;

  @Column(DataType.STRING)
  password!: string;

  @Column(DataType.STRING)
  profilePicture?: string;

  @Column(DataType.STRING)
  city?: string;

  @Column(DataType.STRING)
  state?: string;

  @Column(DataType.STRING)
  country?: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  role!: string;

  @BelongsToMany(() => Project, { through: () => UserProject, onDelete: "CASCADE" })
  projects!: Project[];

  @HasOne(()=> Organization, { foreignKey: 'userId', as: 'organization' })
  organization!: Organization;

  @HasOne(()=> Employee, { foreignKey: 'userId', as: 'employee' })
  employee!: Employee;
  
  @HasMany(() => Bug, { 
    foreignKey: 'assignedTo', 
    as: 'assignedBugs', 
  })
  assignedBugs!: Bug[];
  
  @HasMany(() => Bug, { 
    foreignKey: 'createdBy', 
    as: 'createdBugs', 
  })
  createdBugs!: Bug[];
}
