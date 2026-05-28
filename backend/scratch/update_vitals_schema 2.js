import pool from "../config/db.js";

async function updateSchema() {
    try {
        console.log("Starting database schema update...");
        
        // Check existing columns
        const [existingColumns] = await pool.query(
            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'MedicalRecord'"
        );
        const columnNames = existingColumns.map(c => c.COLUMN_NAME.toLowerCase());

        const columnsToAdd = [
            { name: "weight", type: "FLOAT NULL" },
            { name: "height", type: "FLOAT NULL" },
            { name: "bloodPressure", type: "VARCHAR(50) NULL" },
            { name: "heartRate", type: "INT NULL" },
            { name: "temperature", type: "FLOAT NULL" },
            { name: "respiratoryRate", type: "INT NULL" }
        ];

        for (const col of columnsToAdd) {
            if (!columnNames.includes(col.name.toLowerCase())) {
                const query = `ALTER TABLE MedicalRecord ADD COLUMN ${col.name} ${col.type}`;
                console.log(`Executing: ${query}`);
                await pool.query(query);
            } else {
                console.log(`Column ${col.name} already exists. Skipping.`);
            }
        }

        console.log("Database schema updated successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error updating database schema:", error);
        process.exit(1);
    }
}

updateSchema();
