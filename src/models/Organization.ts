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
import { v4 as uuidv4 } from 'uuid';

@Table({ tableName: "organizations" })
export class Organization extends Model {
  @PrimaryKey
  @Default(() => uuidv4())
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  companyName!: string;

  @BelongsTo(() => User, {onDelete : "CASCADE"})
  user!: User;
}
