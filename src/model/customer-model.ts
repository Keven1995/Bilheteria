import { Pool } from "pg";
import pool from "../db";
import { UserModel } from "./user-model";

export class CustomerModel {
  id: number;
  user_id: number;
  address: string;
  phone: string;
  created_at: Date;
  user?: UserModel;

  constructor(data: Partial<CustomerModel> = {}) {
    this.fill(data);
  }

  static async create(
    data: { user_id: number; address: string; phone: string },
    options?: { connection?: Pool }
  ): Promise<CustomerModel> {
    const db = options?.connection ?? pool;
    const created_at = new Date();

    const query = `
      INSERT INTO customers (user_id, address, phone, created_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [data.user_id, data.address, data.phone, created_at];

    const result = await db.query(query, values);
    return new CustomerModel(result.rows[0]);
  }

  static async findById(
    id: number,
    options?: { user?: boolean }
  ): Promise<CustomerModel | null> {
    const db = pool;

    let query = "SELECT * FROM customers WHERE id = $1";
    const values = [id];

    if (options?.user) {
      query = `
        SELECT c.*, 
               u.id as user_id, 
               u.name as user_name, 
               u.email as user_email
        FROM customers c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = $1;
      `;
    }

    const result = await db.query(query, values);

    if (result.rows.length === 0) return null;

    const customer = new CustomerModel(result.rows[0]);

    if (options?.user) {
      customer.user = new UserModel({
        id: result.rows[0].user_id,
        name: result.rows[0].user_name,
        email: result.rows[0].user_email,
      });
    }

    return customer;
  }

  static async findByUserId(
    user_id: number,
    options?: { user?: boolean }
  ): Promise<CustomerModel | null> {
    const db = pool;

    let query = "SELECT * FROM customers WHERE user_id = $1";
    const values = [user_id];

    if (options?.user) {
      query = `
        SELECT c.*, 
               u.id as user_id, 
               u.name as user_name, 
               u.email as user_email
        FROM customers c
        JOIN users u ON c.user_id = u.id
        WHERE c.user_id = $1;
      `;
    }

    const result = await db.query(query, values);

    if (result.rows.length === 0) return null;

    const customer = new CustomerModel(result.rows[0]);

    if (options?.user) {
      customer.user = new UserModel({
        id: result.rows[0].user_id,
        name: result.rows[0].user_name,
        email: result.rows[0].user_email,
      });
    }

    return customer;
  }

  static async findAll(): Promise<CustomerModel[]> {
    const db = pool;

    const query = "SELECT * FROM customers";
    const result = await db.query(query);

    return result.rows.map((row) => new CustomerModel(row));
  }

  async update(): Promise<void> {
    const db = pool;

    const query = `
      UPDATE customers
      SET user_id = $1, address = $2, phone = $3
      WHERE id = $4
      RETURNING *;
    `;
    const values = [this.user_id, this.address, this.phone, this.id];

    const result = await db.query(query, values);

    if (result.rowCount === 0) {
      throw new Error("Customer not found");
    }
  }

  async delete(): Promise<void> {
    const db = pool;

    const query = `
      DELETE FROM customers WHERE id = $1;
    `;
    const values = [this.id];

    const result = await db.query(query, values);

    if (result.rowCount === 0) {
      throw new Error("Customer not found");
    }
  }

  fill(data: Partial<CustomerModel>): void {
    if (data.id !== undefined) this.id = data.id;
    if (data.user_id !== undefined) this.user_id = data.user_id;
    if (data.address !== undefined) this.address = data.address;
    if (data.phone !== undefined) this.phone = data.phone;
    if (data.created_at !== undefined) this.created_at = data.created_at;
  }
}
