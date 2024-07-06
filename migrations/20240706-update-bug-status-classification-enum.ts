module.exports = {
    up: async (queryInterface, Sequelize) => {
      const transaction = await queryInterface.sequelize.transaction();
      try {
        // Define ENUM types for BugClassification, BugPriority, BugStatus
        const bugClassificationValues = ['Bug', 'Enhancement', 'Feature', 'Task', 'Question', 'Documentation', 'Security', 'Performance', 'Test', 'Support'];
        const bugPriorityValues = ['High', 'Low', 'Medium'];
        const bugStatusValues = ['Open', 'Closed', 'In Progress'];
  
        // 1. Create new columns with ENUM types
        await queryInterface.addColumn('bugs', 'new_classification', {
          type: Sequelize.ENUM(...bugClassificationValues),
          allowNull: true, // Temporarily allow NULL to handle existing NULLs
          defaultValue: 'Bug' // This default is used for new rows, not for updating existing NULLs
        }, { transaction });
  
        await queryInterface.addColumn('bugs', 'new_priority', {
          type: Sequelize.ENUM(...bugPriorityValues),
          allowNull: false,
          defaultValue: 'Medium'
        }, { transaction });
  
        await queryInterface.addColumn('bugs', 'new_status', {
          type: Sequelize.ENUM(...bugStatusValues),
          allowNull: false,
          defaultValue: 'Open'
        }, { transaction });
  
        // 2. Update NULL values in the old 'classification' column to 'Bug'
        await queryInterface.sequelize.query(`
          UPDATE bugs
          SET classification = COALESCE(classification, 'Bug')
        `, { transaction });
  
        // 3. Copy data from old columns to new columns
        await queryInterface.sequelize.query(`
            UPDATE bugs
            SET new_classification = classification::enum_bugs_new_classification,
                new_priority = priority::enum_bugs_new_priority,
                new_status = status::enum_bugs_new_status
          `, { transaction });
  
        // 4. Drop old columns
        await queryInterface.removeColumn('bugs', 'classification', { transaction });
        await queryInterface.removeColumn('bugs', 'priority', { transaction });
        await queryInterface.removeColumn('bugs', 'status', { transaction });
  
        // 5. Rename new columns to original names
        await queryInterface.renameColumn('bugs', 'new_classification', 'classification', { transaction });
        await queryInterface.renameColumn('bugs', 'new_priority', 'priority', { transaction });
        await queryInterface.renameColumn('bugs', 'new_status', 'status', { transaction });
  
        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    },
  
    down: async (queryInterface, Sequelize) => {
      // Implement the reverse logic for the down migration
    }
  };