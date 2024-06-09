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
  import { Bug } from "./Bug";
  import { User } from "./User";
  import { v4 as uuidv4 } from 'uuid';
  
  @Table({ tableName: "comments" })
  export class Comment extends Model {
    @PrimaryKey
    @Default(() => uuidv4())
    @Column(DataType.UUID)
    id!: string;
  
    @ForeignKey(() => Bug)
    @Column(DataType.UUID)
    bugId!: string;
  
    @ForeignKey(() => User)
    @Column(DataType.UUID)
    userId!: string;
  
    @AllowNull(false)
    @Column(DataType.TEXT)
    comment!: string;
  
    @BelongsTo(() => Bug, {onDelete : "CASCADE"})
    bug!: Bug;
  
    @BelongsTo(() => User, {onDelete : "CASCADE"})
    user!: User;
  }