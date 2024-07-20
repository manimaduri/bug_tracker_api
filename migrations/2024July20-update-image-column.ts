'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Manually cast the column to character varying ARRAY
    await queryInterface.sequelize.query(`
      ALTER TABLE "bugs"
      ALTER COLUMN "image"
      TYPE character varying[] USING (CASE WHEN "image" IS NOT NULL THEN ARRAY["image"]::character varying[] ELSE NULL END);
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Convert back to the original type if needed
    // This example assumes the original type was VARCHAR
    await queryInterface.sequelize.query(`
      ALTER TABLE "bugs"
      ALTER COLUMN "image"
      TYPE character varying USING (array_to_string("image", ','));
    `);
  }
};