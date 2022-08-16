import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AppError } from "../../../../shared/errors/AppError";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

let createUserUseCase: CreateUserUseCase,
  createStatementUseCase: CreateStatementUseCase,
  statementsRepository: InMemoryStatementsRepository,
  usersRepository: InMemoryUsersRepository,
  userId: string;

describe("Create statement use case", () => {
  beforeAll(async () => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);

    statementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );

    const user = {
      name: "User Test",
      email: "user.test@example.com",
      password: "*PaSsW0Rd",
    };

    const userCreated = await createUserUseCase.execute(user);
    userId = `${userCreated.id}`;
  });

  it("Should be able to create a new deposit", async () => {
    const statement = await createStatementUseCase.execute({
      user_id: userId,
      type: "deposit" as OperationType,
      amount: 1000,
      description: "salary",
    });

    expect(statement.description).toBe("salary");
    expect(statement.amount).toBe(1000);
  });

  it("Should be able to create a new withdraw when has sufficient balance", async () => {
    const statement = await createStatementUseCase.execute({
      user_id: userId,
      type: "withdraw" as OperationType,
      amount: 500,
      description: "energy",
    });

    expect(statement.description).toBe("energy");
    expect(statement.amount).toBe(500);
  });

  it("Should NOT be able to create a new withdraw when hasn't sufficient balance", async () => {
    expect(async ()=> {
       await createStatementUseCase.execute({
        user_id: userId,
        type: "withdraw" as OperationType,
        amount: 5000,
        description: "energy",
      });
    }).rejects.toBeInstanceOf(AppError)
  });
  
});
