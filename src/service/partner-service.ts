import pool from "../db";
import { PartnerModel } from "../model/partner-model";
import { UserModel } from "../model/user-model";

export class PartnerService {
  async register(data: {
    name: string;
    email: string;
    password: string;
    company_name: string;
  }) {
    const { name, email, password, company_name } = data;
    const connection = await pool.connect();

    try {
      await connection.query("BEGIN");

      const user = await UserModel.create({ name, email, password });

      const partner = await PartnerModel.create({
        user_id: user.id,
        company_name,
      });

      await connection.query("COMMIT");
      return {
        id: partner.id,
        name,
        user_id: user.id,
        company_name,
        created_at: partner.created_at,
      };
    } catch (e) {
      await connection.query("ROLLBACK");
      throw e;
    } finally {
      connection.release();
    }
  }

  async findByUserId(userId: number) {
    return PartnerModel.findByUserId(userId);
  }
}
