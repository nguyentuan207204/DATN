import pool from "../config/db.js";

export const createStaff = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO Staff (fullName, departmentId, userId)
     VALUES (?, ?, ?)`,
    [data.fullName, data.departmentId, data.userId || null]
  );
  return { id: result.insertId };
};

export const getAllStaff = async () => {
  const [rows] = await pool.query(
    `SELECT 
       s.*,
       d.name AS departmentName,
       u.username,
       r.name AS roleName
     FROM Staff s
     JOIN Department d ON s.departmentId = d.id
     LEFT JOIN User u ON s.userId = u.id
     LEFT JOIN Role r ON u.roleId = r.id`
  );
  return rows;
};

export const getStaffById = async (id) => {
  const [rows] = await pool.query(
    `SELECT 
       s.*,
       d.name AS departmentName,
       u.username,
       r.name AS roleName
     FROM Staff s
     JOIN Department d ON s.departmentId = d.id
     LEFT JOIN User u ON s.userId = u.id
     LEFT JOIN Role r ON u.roleId = r.id
     WHERE s.id = ?`,
    [id]
  );
  return rows[0];
};

export const updateStaff = async (id, data) => {
  await pool.query(
    `UPDATE Staff
     SET fullName = ?, departmentId = ?, userId = ?
     WHERE id = ?`,
    [data.fullName, data.departmentId, data.userId || null, id]
  );
  return { message: "Updated" };
};

export const deleteStaff = async (id) => {
  await pool.query(`DELETE FROM Staff WHERE id = ?`, [id]);
  return { message: "Deleted" };
};

export const getStaffByDepartment = async (departmentId) => {
  const [rows] = await pool.query(
    `SELECT 
       s.*,
       d.name AS departmentName,
       u.username,
       r.name AS roleName
     FROM Staff s
     JOIN Department d ON s.departmentId = d.id
     LEFT JOIN User u ON s.userId = u.id
     LEFT JOIN Role r ON u.roleId = r.id
     WHERE s.departmentId = ?`,
    [departmentId]
  );
  return rows;
};

export const getDoctors = async () => {
    const [rows] = await pool.query(
      `SELECT 
         s.*,
         d.name AS departmentName,
         u.username,
         r.name AS roleName
       FROM Staff s
       JOIN Department d ON s.departmentId = d.id
       LEFT JOIN User u ON s.userId = u.id
       JOIN Role r ON u.roleId = r.id
       WHERE r.name = 'BACSI'`
    );
    return rows;
  };

export const getNurses = async () => {
    const [rows] = await pool.query(
      `SELECT 
         s.*,
         d.name AS departmentName,
         u.username,
         r.name AS roleName
       FROM Staff s
       JOIN Department d ON s.departmentId = d.id
       LEFT JOIN User u ON s.userId = u.id
       JOIN Role r ON u.roleId = r.id
       WHERE r.name = 'YTA'`
    );
    return rows;
  };

