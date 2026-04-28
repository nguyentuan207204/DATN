const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkIds() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    try {
        const [patients] = await connection.execute('SELECT id, fullName FROM Patient LIMIT 3');
        const [doctors] = await connection.execute('SELECT id, fullName FROM Doctor LIMIT 3');
        const [departments] = await connection.execute('SELECT id, name FROM Department LIMIT 3');
        
        console.log("Patients:", patients);
        console.log("Doctors:", doctors);
        console.log("Departments:", departments);
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await connection.end();
    }
}

checkIds();
