import { Pool } from "pg";
import pool from "../db";
import bcrypt from "bcrypt";

export class UserModel {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: Date;

  constructor(data: Partial<UserModel> = {}) {
    this.fill(data);
  }

  static async create(
    data: {
      name: string;
      email: string;
      password: string;
    },
    options?: { connection?: Pool }
  ): Promise<UserModel> {
    const db = options?.connection ?? pool;
    const created_at = new Date();
    const hashedPassword = UserModel.hashPassword(data.password);
    const query = `
      INSERT INTO users (name, email, password, created_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [data.name, data.email, hashedPassword, created_at];
    const result = await db.query(query, values);
    if (result.rows.length === 0) {
      throw new Error("Failed to create user");
    }
    const user = new UserModel({
      ...data,
      password: hashedPassword,
      created_at,
      id: result.rows[0].id,
    });

    return user;
  }

  static async findById(id: number): Promise<UserModel | null> {
    const db = pool;

    const query = `
      SELECT * FROM users WHERE id = $1;
    `;
    const result = await db.query(query, [id]);

    return result.rows.length ? new UserModel(result.rows[0]) : null;
  }

  static async findByEmail(email: string): Promise<UserModel | null> {
    const db = pool;

    const query = `
      SELECT * FROM users WHERE email = $1;
    `;
    const result = await db.query(query, [email]);

    return result.rows.length ? new UserModel(result.rows[0]) : null;
  }

  static async findAll(): Promise<UserModel[]> {
    const db = pool;

    const query = `
      SELECT * FROM users;
    `;
    const result = await db.query(query);

    return result.rows.map((row: Partial<UserModel>) => new UserModel(row));
  }

  static hashPassword(password: string): string {
    // Hash password here
    return bcrypt.hashSync(password, 10);
  }

  static verifyPassword(password: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(password, hashedPassword);
  }

  async update(): Promise<void> {
    const db = pool;

    const query = `
      UPDATE users
      SET name = $1, email = $2, password = $3
      WHERE id = $4
      RETURNING *;
    `;
    const values = [this.name, this.email, this.password, this.id];
    const result = await db.query(query, values);

    if (result.rowCount === 0) {
      throw new Error("User not found");
    }
  }

  async delete(): Promise<void> {
    const db = pool;

    const query = `
      DELETE FROM users WHERE id = $1;
    `;
    const result = await db.query(query, [this.id]);

    if (result.rowCount === 0) {
      throw new Error("User not found");
    }
  }

  fill(data: Partial<UserModel>): void {
    if (data.id !== undefined) this.id = data.id;
    if (data.name !== undefined) this.name = data.name;
    if (data.email !== undefined) this.email = data.email;
    if (data.password !== undefined) this.password = data.password;
    if (data.created_at !== undefined) this.created_at = data.created_at;
  }
}
