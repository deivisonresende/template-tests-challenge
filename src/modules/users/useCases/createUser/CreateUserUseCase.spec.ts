import { AppError } from "../../../../shared/errors/AppError";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";

let createUserUseCase: CreateUserUseCase,
  usersRepositoryInMemory: InMemoryUsersRepository;

describe("Create User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  const user = {
    name: "User Test",
    email: "user.test@example.com",
    password: "*PaSsW0Rd",
  };

  it("Should be able to createa new user", async () => {
    await createUserUseCase.execute(user);
    const userCreated = await usersRepositoryInMemory.findByEmail(user.email);
    expect(userCreated?.name).toMatch(user.name);
  });

  it("Should not be able to create a user with decrypted password", async () => {
    await createUserUseCase.execute(user);
    const userCreated = await usersRepositoryInMemory.findByEmail(user.email);
    const isDecryptedPassword = user.password === userCreated?.password;
    expect(isDecryptedPassword).toBeFalsy();
  });

  it("Should NOT be able to create a new user with email that already exists", async () => {
    expect(async () => {
      await createUserUseCase.execute(user);
      await createUserUseCase.execute(user);
    }).rejects.toBeInstanceOf(AppError);
  });
});
