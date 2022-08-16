import { Connection, createConnection } from "typeorm";
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;

describe("Create User Controllers", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.dropDatabase();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "User test",
      email: "test@example.com",
      password: "*paSsW0Rd",
    });

    expect(response.status).toBe(201);
  });
});
