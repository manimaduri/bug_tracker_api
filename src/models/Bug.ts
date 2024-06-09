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

@Table({ tableName: "bugs" })
export class Bug extends Model {
  @PrimaryKey
  @Default(() => uuidv4())
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Project)
  @Column(DataType.UUID)
  projectId!: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  assignedTo!: string;

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

  @AllowNull(true)
  @Column(DataType.STRING)
  classification?: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  priority!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  status!: string;

  @BelongsTo(() => Project, { onDelete: "CASCADE" })
  project!: Project;

  @BelongsTo(() => User, { as: "AssignedUser", onDelete: "CASCADE" })
  assignedUser!: User;

  @BelongsTo(() => User, { as: "Creator", onDelete: "CASCADE" })
  creator!: User;
}
