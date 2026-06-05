import db from './config/db.js';
async function run() {
  try {
    const [rows] = await db.query('SHOW PROCESSLIST');
    console.log(rows);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
