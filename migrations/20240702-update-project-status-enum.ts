exports.up = async (queryInterface, Sequelize) => {
  // Assuming 'status' column already exists and you're altering its type to ENUM

  // Step 1: Remove the existing default value from the 'status' column
  await queryInterface.changeColumn('projects', 'status', {
    type: Sequelize.STRING, // Temporarily set type to STRING to remove default
    allowNull: true,
    defaultValue: null
  });

  // Step 2: Explicitly add the enum type for PostgreSQL (if necessary)
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE "enum_projects_status" AS ENUM('Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled', 'Review', 'Planning', 'Deployed', 'Archived');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Step 3: Change the column to use the new ENUM type
  await queryInterface.changeColumn('projects', 'status', {
    type: Sequelize.ENUM('Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled', 'Review', 'Planning', 'Deployed', 'Archived'),
    allowNull: false
  });

  // Step 4: Set the new default value for the 'status' column
  await queryInterface.sequelize.query(`
    ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'Not Started';
  `);
};

exports.down = async (queryInterface, Sequelize) => {
  // Revert the 'status' column back to STRING if needed and remove the ENUM type
  await queryInterface.changeColumn('projects', 'status', {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: null
  });

  await queryInterface.sequelize.query(`
    DROP TYPE IF EXISTS "enum_projects_status";
  `);
};