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

  it("Should be able to show a operation by id", async () => {
    const {
      body: { id: statementId },
    } = await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 1.5, description: "Salary" })
      .set({ Authorization: `Bearer ${token}` });

    const { body } = await request(app)
      .get(`/api/v1/statements/${statementId}`)
      .send()
      .set({ Authorization: `Bearer ${token}` });

    expect(body).toHaveProperty("amount");
    expect(body).toHaveProperty("description");
    expect(body).toHaveProperty("type");
  });
});
