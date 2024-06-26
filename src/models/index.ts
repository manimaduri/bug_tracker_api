import { Sequelize } from 'sequelize-typescript';
import { User } from './User';
import { Organization } from './Organization';
import { Employee } from './Employee';
import dotenv from "dotenv";
import { Bug } from './Bug';
import { Comment } from './Comment';
import { Notification } from './Notification';
import { Project } from './Project';
import { UserProject } from './UserProject';

// const fetchSecret = require("../utility/secretManager"); for later use
dotenv.config();

let sequelizeInstance: Sequelize | null = null;

async function initDB(): Promise<Sequelize> {
  try {
    // const secretValue = await fetchSecret(); for future use
    const secretValue = process.env;
    // const secretData = JSON.parse(secretValue); for future use
    // Object.entries(secretData).forEach(([key, value]) => {
    //   process.env[key] = String(value);
    // });
    const sequelize = new Sequelize({
      database: secretValue.db_name,
      dialect: "postgres",
      username: secretValue.db_user,
      password: secretValue.db_password,
      host: secretValue.db_host,
      port: Number(secretValue.db_port),
      logging: false,
      pool: {
        max: 1000, // maximum number of connection in pool
        min: 0, // minimum number of connection in pool
        acquire: 30000, // maximum time, in milliseconds, that pool will try to get connection before throwing error
        // idle: 10000, // maximum time, in milliseconds, that a connection can be idle before being released
        evict: 60000,
      },
      // dialectOptions: {
      //   ssl: { rejectUnauthorized: false }, // Adjust SSL options as needed
      // }, // for heroku
    });

    // Force the creation of UserEducation table

    sequelize.addModels([
      User, Organization, Employee, Bug, Comment, Notification, Project, UserProject
    ]);

    await sequelize.authenticate();
    console.log(
      "Connection to the database has been established successfully."
    );

    await sequelize.sync({  alter: false  });

    sequelizeInstance = sequelize; // Assign the initialized Sequelize instance

    return sequelize; // Return the Sequelize instance
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error; // Rethrow the error to indicate failure
  }
}

function getSequelizeInstance(): Sequelize {
  if (!sequelizeInstance) {
    throw new Error("Sequelize has not been initialized yet.");
  }
  return sequelizeInstance;
}

export { initDB,getSequelizeInstance };


