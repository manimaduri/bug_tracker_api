import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  AllowNull,
  PrimaryKey,
  Default,
  BelongsToMany,
  HasMany,
  Unique,
} from "sequelize-typescript";
import { Organization } from "./Organization";
import { v4 as uuidv4 } from "uuid";
import { User } from "./User";
import { UserProject } from "./UserProject";
import { Bug } from "./Bug";

export enum ProjectStatus {
  NotStarted = "Not Started",
  InProgress = "In Progress",
  OnHold = "On Hold",
  Completed = "Completed",
  Cancelled = "Cancelled",
  Review = "Review",
  Planning = "Planning",
  Deployed = "Deployed",
  Archived = "Archived",
}

@Table({ tableName: "projects" })
export class Project extends Model {
  @PrimaryKey
  @Default(() => uuidv4())
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Organization)
  @Column(DataType.UUID)
  createdBy!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  projectName!: string;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM,
    values: Object.values(ProjectStatus),
    defaultValue: ProjectStatus.NotStarted,
  })
  status!: ProjectStatus;

  @Column(DataType.TEXT)
  description?: string;

  @Column(DataType.DATE)
  deadline?: Date;

  @BelongsTo(() => Organization, { onDelete: "CASCADE" })
  organization!: Organization;

  @BelongsToMany(() => User, {
    through: () => UserProject,
    onDelete: "CASCADE",
  })
  users!: User[];

  @HasMany(() => Bug)
  bugs!: Bug[];
}
