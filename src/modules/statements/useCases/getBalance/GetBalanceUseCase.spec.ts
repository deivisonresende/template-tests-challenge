import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let getBalanceUseCase: GetBalanceUseCase,
  statementsRepository: InMemoryStatementsRepository,
  usersRepository: InMemoryUsersRepository,
  createUserUseCase: CreateUserUseCase,
  userId: string;

describe("Get Balance Use Cases", () => {
  beforeAll(async () => {
    statementsRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepository,
      usersRepository
    );
    createUserUseCase = new CreateUserUseCase(usersRepository);

    const user = {
        name: "User Test",
        email: "user.test@example.com",
        password: "*PaSsW0Rd",
      },
      userCreated = await createUserUseCase.execute(user);

    userId = `${userCreated.id}`;
  });

  it("Should be able to show a balance", async () => {
    const balance = await getBalanceUseCase.execute({ user_id: userId })
    expect(balance).toHaveProperty("balance");
    expect(balance).toHaveProperty("statement");
  })
});
