import pool from "../db";

export class UserService {
  async findById(userId: number) {
    const connection = await pool.connect();

    try {
      const userQuery = `
        SELECT * FROM users WHERE id = $1;
      `;

      const result = await connection.query(userQuery, [userId]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      connection.release();
    }
  }
}
