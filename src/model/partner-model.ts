import { Pool } from "pg";
import pool from "../db";
import { UserModel } from "./user-model";

export class PartnerModel {
  id: number;
  user_id: number;
  company_name: string;
  created_at: Date;
  user?: UserModel;

  constructor(data: Partial<PartnerModel> = {}) {
    this.fill(data);
  }

  static async create(
    data: { user_id: number; company_name: string },
    options?: { connection?: Pool }
  ): Promise<PartnerModel> {
    const db = options?.connection ?? pool;
    const created_at = new Date();

    const query = `
      INSERT INTO partners (user_id, company_name, created_at)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [data.user_id, data.company_name, created_at];

    const result = await db.query(query, values);
    return new PartnerModel(result.rows[0]);
  }

  static async findById(
    id: number,
    options?: { user?: boolean }
  ): Promise<PartnerModel | null> {
    const db = pool;

    let query = "SELECT * FROM partners WHERE id = $1";
    const values = [id];

    if (options?.user) {
      query = `
        SELECT p.*, 
               u.id as user_id, 
               u.name as user_name, 
               u.email as user_email
        FROM partners p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = $1;
      `;
    }

    const result = await db.query(query, values);

    if (result.rows.length === 0) return null;

    const partner = new PartnerModel(result.rows[0]);

    if (options?.user) {
      partner.user = new UserModel({
        id: result.rows[0].user_id,
        name: result.rows[0].user_name,
        email: result.rows[0].user_email,
      });
    }

    return partner;
  }

  static async findByUserId(
    userId: number,
    options?: { user?: boolean }
  ): Promise<PartnerModel | null> {
    const db = pool;

    let query = "SELECT * FROM partners WHERE user_id = $1";
    const values = [userId];

    if (options?.user) {
      query = `
        SELECT p.*, 
               u.id as user_id, 
               u.name as user_name, 
               u.email as user_email
        FROM partners p
        JOIN users u ON p.user_id = u.id
        WHERE p.user_id = $1;
      `;
    }

    const result = await db.query(query, values);

    if (result.rows.length === 0) return null;

    const partner = new PartnerModel(result.rows[0]);

    if (options?.user) {
      partner.user = new UserModel({
        id: result.rows[0].user_id,
        name: result.rows[0].user_name,
        email: result.rows[0].user_email,
      });
    }

    return partner;
  }

  static async findAll(): Promise<PartnerModel[]> {
    const db = pool;
    const query = "SELECT * FROM partners";

    const result = await db.query(query);
    return result.rows.map((row) => new PartnerModel(row));
  }

  async update(): Promise<void> {
    const db = pool;

    const query = `
      UPDATE partners
      SET user_id = $1, company_name = $2
      WHERE id = $3
      RETURNING *;
    `;
    const values = [this.user_id, this.company_name, this.id];

    const result = await db.query(query, values);

    if (result.rowCount === 0) {
      throw new Error("Partner not found");
    }
  }

  async delete(): Promise<void> {
    const db = pool;

    const query = `
      DELETE FROM partners WHERE id = $1;
    `;
    const values = [this.id];

    const result = await db.query(query, values);

    if (result.rowCount === 0) {
      throw new Error("Partner not found");
    }
  }

  fill(data: Partial<PartnerModel>): void {
    if (data.id !== undefined) this.id = data.id;
    if (data.user_id !== undefined) this.user_id = data.user_id;
    if (data.company_name !== undefined) this.company_name = data.company_name;
    if (data.created_at !== undefined) this.created_at = data.created_at;
  }
}
