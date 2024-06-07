// Notification.ts
import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    AllowNull,
    PrimaryKey,
    Default,
    BelongsTo,
  } from "sequelize-typescript";
  import { User } from "./User";
  import { v4 as uuidv4 } from 'uuid';
  
  @Table({ tableName: "notifications" })
  export class Notification extends Model {
    @PrimaryKey
    @Default(() => uuidv4())
    @Column(DataType.UUID)
    id!: string;
  
    @ForeignKey(() => User)
    @Column(DataType.UUID)
    userId!: string;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    type!: string;
  
    @AllowNull(false)
    @Column(DataType.TEXT)
    message!: string;
  
    @AllowNull(false)
    @Column(DataType.BOOLEAN)
    read!: boolean;
  
    @BelongsTo(() => User, {onDelete : "CASCADE"})
    user!: User;
  }