import pool from "../config/db.js";

async function checkData() {
    try {
        const [patients] = await pool.query('SELECT id, fullName FROM Patient LIMIT 3');
        const [staff] = await pool.query('SELECT id, fullName FROM Staff LIMIT 3');
        const [icd10] = await pool.query('SELECT id, code, name FROM ICD10 LIMIT 3');
        const [medicine] = await pool.query('SELECT id, name FROM Medicine LIMIT 3');
        
        console.log("Patients:", JSON.stringify(patients));
        console.log("Staff:", JSON.stringify(staff));
        console.log("ICD10:", JSON.stringify(icd10));
        console.log("Medicine:", JSON.stringify(medicine));
    } catch (error) {
        console.error("Error:", error);
    } finally {
        process.exit();
    }
}

checkData();
