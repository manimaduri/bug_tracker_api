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
} from "sequelize-typescript";
import { Project } from "./Project";
import { User } from "./User";
import { v4 as uuidv4 } from "uuid";

export enum BugClassification {
  Bug = "Bug",
  Enhancement = "Enhancement",
  Feature = "Feature",
  Task = "Task",
  Question = "Question",
  Documentation = "Documentation",
  Security = "Security",
  Performance = "Performance",
  Test = "Test",
  Support = "Support",
}

export enum BugPriority {
  High = "High",
  Low = "Low",
  Medium = "Medium",
}

export enum BugStatus {
  Open = "Open",
  Closed = "Closed",
  InProgress = "In Progress",
}

@Table({ tableName: "bugs" })
export class Bug extends Model {
  @PrimaryKey
  @Default(() => uuidv4())
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Project)
  @Column(DataType.UUID)
  projectId!: string;

  @AllowNull(true)
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  assignedTo?: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  createdBy!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  bugName!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  description!: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  image?: string;

  @Column({type : DataType.ENUM, values: Object.values(BugClassification), defaultValue: BugClassification.Bug})
  classification!: BugClassification;

  @AllowNull(false)
  @Column({type:DataType.STRING, values : Object.values(BugPriority), defaultValue: BugPriority.Medium})
  priority!: BugPriority;

  @AllowNull(false)
  @Column({type:DataType.STRING, values : Object.values(BugStatus), defaultValue: BugStatus.Open})
  status!: BugStatus;

  @BelongsTo(() => Project, { onDelete: "CASCADE" })
  project!: Project;

  @BelongsTo(() => User, { as: "assignedUser", onDelete: "CASCADE" })
  assignedUser!: User;

  @BelongsTo(() => User, { as: "createdUser", onDelete: "CASCADE" })
  createdUser!: User;
}
