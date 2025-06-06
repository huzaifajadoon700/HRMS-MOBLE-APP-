const mongoose = require("mongoose");
const Table = require("../Models/Table");

// Connect to MongoDB Atlas
mongoose.connect(
  "mongodb+srv://mhuzaifatariq7:zqdaRL05TfaNgD8x@cluster0.kyswp.mongodb.net/auth-db?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

async function resetTableStatuses() {
  try {
    console.log("Resetting all table statuses to Available...");

    const result = await Table.updateMany(
      {}, // Update all tables
      { status: "Available" }
    );

    console.log(`Updated ${result.modifiedCount} tables`);

    // Verify the update
    const tables = await Table.find({}, "tableName status");
    console.log("Current table statuses:");
    tables.forEach((table) => {
      console.log(`Table ${table.tableName}: ${table.status}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error resetting table statuses:", error);
    process.exit(1);
  }
}

resetTableStatuses();
