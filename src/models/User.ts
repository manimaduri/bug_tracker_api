import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
  AllowNull,
  BelongsToMany,
  HasMany,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { Project } from "./Project";
import { UserProject } from "./UserProject";
import { Bug } from "./Bug";

@Table({ tableName: "users" })
export class User extends Model {
  @PrimaryKey
  @Default(() => uuidv4())
  @Column(DataType.UUID)
  id!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  email!: string;

  @Column(DataType.STRING)
  mobileNumber?: string;

  @Column(DataType.STRING)
  password!: string;

  @Column(DataType.STRING)
  profilePicture?: string;

  @Column(DataType.STRING)
  city?: string;

  @Column(DataType.STRING)
  state?: string;

  @Column(DataType.STRING)
  country?: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  role!: string;

  @BelongsToMany(() => Project, { through: () => UserProject, onDelete: "CASCADE" })
  projects!: Project[];

  @HasMany(() => Bug, { 
    foreignKey: 'assignedTo', 
    as: 'AssignedBugs', 
  })
  assignedBugs!: Bug[];
  
  @HasMany(() => Bug, { 
    foreignKey: 'createdBy', 
    as: 'CreatedBugs', 
  })
  createdBugs!: Bug[];
}

// import { DataTypes, Model, Sequelize } from 'sequelize';
// import { v4 as uuidv4 } from 'uuid';

// export class User extends Model {
//   public id!: string;
//   public email!: string;
//   public password!: string;
//   public confirmPassword!: string;
//   public profilePicture!: string; // Path to profile picture file
//   public readonly createdAt!: Date;
//   public readonly updatedAt!: Date;
// }

// export default function initialize(sequelize: Sequelize) {
//   User.init({
//     id: {
//       type: DataTypes.UUID,
//       defaultValue: () => uuidv4(),
//       primaryKey: true,
//     },
//     email: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     password: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     confirmPassword: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     profilePicture: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//   }, {
//     tableName: 'users',
//     sequelize: sequelize,
//   });
// }
