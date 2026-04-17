import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createUserType, fetchUsersWithOptionalFiltersType } from './app.type';
import { prisma } from '../lib/prisma';
import { User } from '../generated/prisma/client';

@Injectable()
export class DatabaseRepository {
  async createUser(data: createUserType): Promise<User> {
    try {
      const user = await prisma.user.create({ data });

      return user;
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database could not be reached. Try again later.',
      });
    }
  }

  async checkUserExists(name: string): Promise<boolean> {
    try {
      const userExists = await prisma.user.findFirst({ where: { name: name } });

      return !!userExists;
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database could not be reached. Try again later.',
      });
    }
  }

  async checkUserExistsWithId(id: string): Promise<boolean> {
    try {
      const userExists = await prisma.user.findFirst({ where: { id } });

      return !!userExists;
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database could not be reached. Try again later.',
      });
    }
  }

  async fetchUserByName(name: string): Promise<User | null> {
    try {
      const user = await prisma.user.findFirst({ where: { name } });

      return user;
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database could not be reached. Try again later.',
      });
    }
  }

  async fetchUserById(id: string): Promise<User | null> {
    try {
      const user = await prisma.user.findFirst({ where: { id } });

      return user;
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database could not be reached. Try again later.',
      });
    }
  }

  async deleteUser(id: string) {
    try {
      await prisma.user.delete({ where: { id } });
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database could not be reached. Try again later.',
      });
    }
  }

  async fetchUsersWithOptionalFilters(
    gender?: string,
    country_id?: string,
    age_group?: string,
  ): Promise<fetchUsersWithOptionalFiltersType[]> {
    try {
      // To build 'where' dynamically
      const where: any = {};

      if (gender) {
        where.gender = {
          equals: gender,
          mode: 'insensitive',
        };
      }

      if (country_id) {
        where.country_id = {
          equals: country_id,
          mode: 'insensitive',
        };
      }

      if (age_group) {
        where.age_group = {
          equals: age_group,
          mode: 'insensitive',
        };
      }

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          gender: true,
          age: true,
          age_group: true,
          country_id: true,
        },
      });

      return users;
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Database could not be reached. Try again later.',
      });
    }
  }
}
