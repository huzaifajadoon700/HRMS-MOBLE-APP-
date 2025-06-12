const mongoose = require('mongoose');
require('dotenv').config();

// Import the Table model
const Table = require('../Models/Table');

const mongo_url = process.env.Mongo_Conn;

const sampleTables = [
  {
    tableName: "Garden View Table",
    tableType: "outdoor",
    capacity: 4,
    status: "Available",
    description: "Beautiful outdoor table with garden view, perfect for romantic dinners"
  },
  {
    tableName: "Executive Suite Table",
    tableType: "private",
    capacity: 8,
    status: "Available", 
    description: "Private dining table for business meetings and special occasions"
  },
  {
    tableName: "Main Hall Table 1",
    tableType: "indoor",
    capacity: 6,
    status: "Available",
    description: "Spacious indoor table in the main dining hall"
  },
  {
    tableName: "Terrace Table",
    tableType: "outdoor",
    capacity: 4,
    status: "Available",
    description: "Outdoor terrace table with city view"
  },
  {
    tableName: "VIP Private Room",
    tableType: "private",
    capacity: 12,
    status: "Available",
    description: "Luxury private dining room for large groups and celebrations"
  },
  {
    tableName: "Window Side Table",
    tableType: "indoor",
    capacity: 2,
    status: "Available",
    description: "Intimate table by the window, perfect for couples"
  },
  {
    tableName: "Poolside Table",
    tableType: "outdoor",
    capacity: 6,
    status: "Available",
    description: "Relaxing poolside dining experience"
  },
  {
    tableName: "Main Hall Table 2",
    tableType: "indoor",
    capacity: 8,
    status: "Available",
    description: "Large indoor table for family gatherings"
  }
];

const addSampleTables = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongo_url);
    console.log("Connected to MongoDB");

    // Check if tables already exist
    const existingTables = await Table.find();
    if (existingTables.length > 0) {
      console.log(`Found ${existingTables.length} existing tables. Skipping sample data creation.`);
      console.log("If you want to add sample data anyway, please clear the tables collection first.");
      return;
    }

    // Add sample tables
    console.log("Adding sample tables...");
    const createdTables = await Table.insertMany(sampleTables);
    console.log(`✅ Successfully added ${createdTables.length} sample tables to the database!`);
    
    // Display created tables
    createdTables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.tableName} (${table.tableType}, ${table.capacity} seats)`);
    });

  } catch (error) {
    console.error("❌ Error adding sample tables:", error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
};

// Run the script
addSampleTables();
