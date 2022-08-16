import { hash } from "bcryptjs";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AppError } from "../../../../shared/errors/AppError";

let createUserUseCase: CreateUserUseCase,
  usersRepositoryInMemory: InMemoryUsersRepository,
  authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate User Use Case", () => {
  let saltHash = 8,
    user = {
      name: "User Test",
      email: "user.test@example.com",
      password: "*PaSsW0Rd",
    };

  beforeAll(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepositoryInMemory
    );

    user["password"] = await hash(user["password"], saltHash);
    await createUserUseCase.execute(user);
  });

  it("Shloud be able to authenticate a existent user", async () => {
    const { email, password } = user;
    const response = await authenticateUserUseCase.execute({ email, password });
    expect(response).toHaveProperty("token");
  });

  it("Should NOT be able to authenticate user when email does not exist", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "user.test@example.com",
        password: "*PaSsW0Rd",
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("Should NOT be able to authenticate user when password no matched", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "user.test@example.com",
        password: "*PaSs",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
