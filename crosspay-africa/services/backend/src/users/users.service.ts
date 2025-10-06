import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: [
        { email: createUserDto.email },
        { phoneNumber: createUserDto.phoneNumber },
      ],
    });

    if (existingUser) {
      throw new ConflictException(
        "Un utilisateur avec cet email ou ce numéro de téléphone existe déjà"
      );
    }

    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Utilisateur avec ID ${id} non trouvé`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingEmail) {
        throw new ConflictException(
          "Un utilisateur avec cet email existe déjà"
        );
      }
    }

    if (
      updateUserDto.phoneNumber &&
      updateUserDto.phoneNumber !== user.phoneNumber
    ) {
      const existingPhone = await this.usersRepository.findOne({
        where: { phoneNumber: updateUserDto.phoneNumber },
      });
      if (existingPhone) {
        throw new ConflictException(
          "Un utilisateur avec ce numéro de téléphone existe déjà"
        );
      }
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}
