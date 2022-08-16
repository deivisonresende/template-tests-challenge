import request from "supertest";
import { app } from "../../../../app";
import { Connection, createConnection } from "typeorm";
import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";

let connection: Connection, auth: any;

describe("Show User Profile Controller", () => {
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

    auth = response?.body;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to show a user profile", async () => {
    const response = await request(app)
      .get("/api/v1/profile")
      .send({ id: auth?.user?.id })
      .set({ Authorization: `Bearer ${ auth?.token}`});

    expect(response.body).toHaveProperty("email");
  });
});
