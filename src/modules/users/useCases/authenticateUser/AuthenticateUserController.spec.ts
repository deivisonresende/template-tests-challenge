import request from "supertest";
import { app } from "../../../../app";
import { Connection, createConnection } from "typeorm";
import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";

let connection: Connection;

describe("Authenticate User Controller", () => {
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
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to authenticate an existent user", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "user.test@test.com.br", password: "*PaSsW0Rd" });
    expect(response.body).toHaveProperty("token");
  });

  it("Should NOT be able to authenticate user when email does not exist", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "user@test.com", password: "*PaSsW0Rd" });
    expect(response?.status).toBe(401);
  });

  it("Should NOT be able to authenticate user when password no matched", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "user.test@test.com.br", password: "password" });
    expect(response?.status).toBe(401);
  });
});
