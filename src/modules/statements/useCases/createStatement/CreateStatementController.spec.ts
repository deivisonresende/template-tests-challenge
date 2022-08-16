import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";
import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";

let connection: Connection, token: string;

describe("Create statement controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.dropDatabase();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("*PaSsW0Rd", 8);
    await connection.query(`
      INSERT INTO users
      (id, name, email, password)
      VALUES ('${id}','User Test','user.test@test.com.br','${password}')
    `);

    const response = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "user.test@test.com.br", password: "*PaSsW0Rd" });

    token = response?.body?.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a new deposit", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 150.0, description: "Salary" })
      .set({ Authorization: `Bearer ${token}` });

      expect(response.status).toBe(201);

    const {
      body: { balance },
    } = await request(app)
      .get("/api/v1/statements/balance")
      .send()
      .set({ Authorization: `Bearer ${token}` });

      expect(balance).toEqual(150);
  });

  it("Should be able to create a new withdraw", async () => {
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({ amount: 100.0, description: "energy" })
      .set({ Authorization: ` Bearer ${token}` });

      expect(response.status).toBe(201);

      const {
        body: { balance },
      }  = await request(app)
      .get("/api/v1/statements/balance")
      .send()
      .set({ Authorization: `Bearer ${token}` });

      expect(balance).toEqual(50);
  });

  it("Should NOT be able to create a new withdraw when hasn't sufficient balance", async () => {
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({ amount: 350.0, description: "tax" })
      .set({ Authorization: ` Bearer ${token}` });

      expect(response.status).toBe(400);
  });
});
