// generate-hash.mjs - ES Module version
import bcrypt from 'bcrypt';

async function generateHash() {
  try {
    const password = "admin123";
    const saltRounds = 10;
    
    const hash = await bcrypt.hash(password, saltRounds);
    
    console.log("=".repeat(50));
    console.log("🔐 PASSWORD HASH GENERATOR");
    console.log("=".repeat(50));
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
    console.log("=".repeat(50));
    console.log("\n📋 Copy this hash for SQL:");
    console.log(`'${hash}'`);
    
    // Test verify
    const isValid = await bcrypt.compare(password, hash);
    console.log(`\n✅ Verification test: ${isValid ? "PASSED" : "FAILED"}`);
    
  } catch (error) {
    console.error("Error:", error);
  }
}

generateHash();