import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  PrimaryKey,
  Default,
  BelongsTo,
} from "sequelize-typescript";
import { User } from "./User";
import { Project } from "./Project";
import { v4 as uuidv4 } from "uuid";

@Table({ tableName: "user_projects" })
export class UserProject extends Model {
  @PrimaryKey
  @Default(() => uuidv4())
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    onDelete: "CASCADE", // Add cascade delete for User
  })
  userId!: string;

  @ForeignKey(() => Project)
  @Column({
    type: DataType.UUID,
    onDelete: "CASCADE", // Add cascade delete for Project
  })
  projectId!: string;

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Project)
  project!: Project;
}