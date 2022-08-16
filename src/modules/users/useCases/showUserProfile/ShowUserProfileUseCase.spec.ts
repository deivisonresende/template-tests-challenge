import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";

let usersRepository: InMemoryUsersRepository,
  showUserProfileUseCase: ShowUserProfileUseCase,
  createUserUseCase: CreateUserUseCase,
  user_id: string;

  describe("Show User Profile Use Case", () => {
    beforeAll(async ()=> {
      usersRepository = new InMemoryUsersRepository()
      createUserUseCase = new CreateUserUseCase(usersRepository)
      showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository)

      let userCreated = await createUserUseCase.execute({
        name: "User",
        email: "user@example.com",
        password: "*PaSsW0Rd",
      })

      user_id = `${userCreated.id}`
    })

    it("Should be able to show user profile", async () => {
      let userProfile = await showUserProfileUseCase.execute(user_id)
      expect(userProfile.email).toBe("user@example.com")
    })
  })
