import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
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
  getStatementOperationUseCase: GetStatementOperationUseCase,
  userId: string;

describe("Create statement use case", () => {
  beforeAll(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(usersRepository);

    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );

    getStatementOperationUseCase = new GetStatementOperationUseCase(
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

  it("Should be able to show a operation by id", async () => {
    const { id: statementId } = await createStatementUseCase.execute({
      user_id: userId,
      type: "deposit" as OperationType,
      amount: 1.000,
      description: "salary",
    });

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: userId,
      statement_id: `${statementId}`,
    });

    expect(statementOperation).toHaveProperty("amount");
    expect(statementOperation).toHaveProperty("description");
    expect(statementOperation).toHaveProperty("type");
  });
});
