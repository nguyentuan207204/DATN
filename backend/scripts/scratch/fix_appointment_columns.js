import pool from "../config/db.js";

async function migrate() {
    try {
        console.log("Checking and updating Appointment table schema...");
        const [rows] = await pool.query("DESCRIBE Appointment");
        const columns = rows.map(r => r.Field);

        // 1. Add createdAt if missing
        if (!columns.includes('createdAt')) {
            console.log("Adding createdAt column... ");
            await pool.query("ALTER TABLE Appointment ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
            console.log("Done.");
        } else {
            console.log("createdAt already exists.");
        }

        // 2. Add notes if somehow missing (though check_schema said it exists)
        if (!columns.includes('notes')) {
            console.log("Adding notes column...");
            await pool.query("ALTER TABLE Appointment ADD COLUMN notes TEXT");
        }

        // 3. Add imageUrls if somehow missing
        if (!columns.includes('imageUrls')) {
            console.log("Adding imageUrls column...");
            await pool.query("ALTER TABLE Appointment ADD COLUMN imageUrls TEXT");
        }

        console.log("Migration finished successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
