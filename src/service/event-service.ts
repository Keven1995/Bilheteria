import pool from "../db";

export class EventService {
  async create(data: {
    name: string;
    description: string | null;
    date: Date;
    location: string;
    partnerId: number;
    userId: number;
  }) {
    const { name, description, date, location, partnerId } = data;

    const connection = await pool.connect();

    try {
      // Inserir evento no banco
      const eventDate = new Date(date);
      const createdAt = new Date();
      const eventQuery = `
        INSERT INTO events (partner_id, name, description, date, created_at, location)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      const eventResult = await connection.query(eventQuery, [
        partnerId,
        name,
        description,
        eventDate,
        createdAt,
        location,
      ]);

      // Retorna o evento criado
      return eventResult.rows[0];
    } catch (error) {
      console.error("Erro ao criar evento:", error);
      throw error; // Lança o erro original
    } finally {
      connection.release();
    }
  }

  async findAll(partnerId?: number) {
    const connection = await pool.connect();

    try {
      // Define a query condicionalmente com base no `partnerId`
      const query = partnerId
        ? "SELECT * FROM events WHERE partner_id = $1"
        : "SELECT * FROM events";
      const params = partnerId ? [partnerId] : [];

      // Executa a consulta
      const eventResult = await connection.query(query, params);

      return eventResult.rows; // Retorna todos os eventos
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      throw error; // Lança o erro para ser tratado no Controller
    } finally {
      connection.release();
    }
  }

  async findById(eventId: number) {
    const connection = await pool.connect();

    const eventQuery = `
        SELECT * FROM events WHERE id = $1;
      `;
    const eventResult = await connection.query(eventQuery, [eventId]);

    if (eventResult.rows.length === 0) {
      throw new Error("Event not found");
    }

    return eventResult.rows[0]; // Retorna o evento encontrado
  }
}
