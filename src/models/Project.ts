// Project.ts
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
  import { Organization } from "./Organization";
  import { v4 as uuidv4 } from 'uuid';
  
  @Table({ tableName: "projects" })
  export class Project extends Model {
    @PrimaryKey
    @Default(() => uuidv4())
    @Column(DataType.UUID)
    id!: string;
  
    @ForeignKey(() => Organization)
    @Column(DataType.UUID)
    createdBy!: string;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    projectName!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    status!: string;

    @Column(DataType.STRING)
    description?: string;
  
    @Column(DataType.DATE)
    deadline?: Date;
  
    @BelongsTo(() => Organization, {onDelete : "CASCADE"})
    organization!: Organization;
  }