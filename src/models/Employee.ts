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
import { User } from "./User";
import { Organization } from "./Organization";
import { v4 as uuidv4 } from "uuid";

@Table({ tableName: "employees" })
export class Employee extends Model {

  @PrimaryKey
  @Default(() => uuidv4())
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @ForeignKey(() => Organization)
  @Column(DataType.UUID)
  organizationId!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  firstName!: string;

  @Column(DataType.STRING)
  lastName?: string;

  @Column(DataType.STRING)
  designation?: string;

  @Column(DataType.DATE)
  dateOfBirth?: Date;

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Organization, { onDelete: 'CASCADE' })
  organization!: Organization;
}
