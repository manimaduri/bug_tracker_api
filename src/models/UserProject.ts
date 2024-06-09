import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    PrimaryKey,
    Default,
  } from "sequelize-typescript";
  import { User } from "./User";
  import { Project } from "./Project";
  import { v4 as uuidv4 } from 'uuid';
  
  @Table({ tableName: "user_projects" })
  export class UserProject extends Model {
    @PrimaryKey
    @Default(() => uuidv4())
    @Column(DataType.UUID)
    id!: string;
  
    @ForeignKey(() => User)
    @Column(DataType.UUID)
    userId!: string;
  
    @ForeignKey(() => Project)
    @Column(DataType.UUID)
    projectId!: string;
  }