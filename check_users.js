// Script to check what users exist in the database
const mongoose = require("mongoose");

// Connect to the same database as the backend
const mongo_url =
  "mongodb+srv://mhuzaifatariq7:zqdaRL05TfaNgD8x@cluster0.kyswp.mongodb.net/hrms?retryWrites=true&w=majority";

// User model (simplified version)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: "user" },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

async function checkUsers() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(mongo_url);
    console.log("✅ Connected to MongoDB");

    console.log("\n📊 Checking users in database...");

    // Get all users
    const users = await User.find({}, "name email role createdAt").sort({
      createdAt: -1,
    });

    console.log(`\n👥 Found ${users.length} users:`);
    console.log("=" * 50);

    if (users.length === 0) {
      console.log("❌ No users found in database!");
      console.log(
        "This might explain why you can't log in with your previous account."
      );
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log("   ---");
      });
    }

    // Check specifically for admin user
    const adminUser = await User.findOne({ role: "admin" });
    if (adminUser) {
      console.log("\n🔑 Admin user found:");
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Name: ${adminUser.name}`);
    } else {
      console.log("\n❌ No admin user found!");
    }

    // Check for any user with your potential email patterns
    const commonEmails = [
      "user@example.com",
      "test@example.com",
      "demo@example.com",
    ];

    console.log("\n🔍 Checking for common test emails...");
    for (const email of commonEmails) {
      const user = await User.findOne({ email });
      if (user) {
        console.log(`✅ Found user with email: ${email}`);
      }
    }

    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkUsers();
