import bcrypt from "bcrypt";
import pool from "../db";
import { UserModel } from "../model/user-model";
import { CustomerModel } from "../model/customer-model";

export class CustomerService {
  async register(data: {
    name: string;
    email: string;
    password: string;
    address: string;
    phone: string;
  }) {
    const { name, email, password, address, phone } = data;

    const connection = await pool.connect(); 

    try {
      await connection.query("BEGIN");

      const hashedPassword = bcrypt.hashSync(password, 10);

      const user = await UserModel.create({
        name,
        email,
        password: hashedPassword,
      }); 

      const customer = await CustomerModel.create({
        user_id: user.id,
        address,
        phone,
      });

      await connection.query("COMMIT");

      return {
        id: customer.id,
        name,
        user_id: user.id,
        address,
        phone,
        created_at: customer.created_at,
      };
    } catch (e) {
      await connection.query("ROLLBACK");
      throw e;
    }
  }
}
