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
  HasMany,
} from "sequelize-typescript";
import { User } from "./User";
import { v4 as uuidv4 } from "uuid";
import { Project } from "./Project";

@Table({ tableName: "organizations" })
export class Organization extends Model {
  @PrimaryKey
  @Default(() => uuidv4())
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, unique: true })
  userId!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  companyName!: string;

  @HasMany(() => Project, { foreignKey: "createdBy" })
  projects!: Project[];

  @BelongsTo(() => User, { onDelete: "CASCADE" })
  user!: User;
}
