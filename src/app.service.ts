import {
  BadGatewayException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  AgifyAPIResponseType,
  GenderizeAPIResponseType,
  NationalizeAPIResponseType,
  ProcessPostRequestFunctionType,
} from './app.type';
import { uuidv7 } from 'uuidv7';
import { DatabaseRepository } from './app.repository';

@Injectable()
export class AppService {
  constructor(private readonly databaseRepository: DatabaseRepository) {}

  async GenderizeRequestFunction(
    name: string,
  ): Promise<GenderizeAPIResponseType> {
    try {
      const genderize_response = await fetch(
        `https://api.genderize.io?name=${name}`,
      );

      if (!genderize_response.ok) {
        throw new BadGatewayException({
          status: '502',
          message: 'Agify returned an invalid response',
        });
      }

      const genderize_data: GenderizeAPIResponseType =
        await genderize_response.json();

      console.log(genderize_data);

      if (genderize_data.count === 0 || genderize_data.gender === null) {
        throw new BadGatewayException({
          status: '502',
          message: `Genderize returned an invalid response`,
        });
      }

      return genderize_data;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException({
        status: 'error',
        message: 'Something went wrong try again later.',
      });
    }
  }

  async AgifyRequestFunction(name: string): Promise<AgifyAPIResponseType> {
    try {
      const agify_response = await fetch(`https://api.agify.io?name=${name}`);

      if (!agify_response.ok) {
        throw new BadGatewayException({
          status: '502',
          message: 'Agify returned an invalid response',
        });
      }

      const agify_data: AgifyAPIResponseType = await agify_response.json();
      console.log(agify_data);

      if (agify_data.age === null) {
        throw new BadGatewayException({
          status: '502',
          message: 'Agify returned an invalid response',
        });
      }

      return agify_data;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException({
        status: 'error',
        message: 'Something went wrong try again later.',
      });
    }
  }

  async NationalizeRequestFunction(
    name: string,
  ): Promise<NationalizeAPIResponseType> {
    try {
      const nationalize_response = await fetch(
        `https://api.nationalize.io?name=${name}`,
      );

      if (!nationalize_response.ok) {
        throw new BadGatewayException({
          status: '502',
          message: 'Agify returned an invalid response',
        });
      }

      const nationalize_data: NationalizeAPIResponseType =
        await nationalize_response.json();

      console.log(nationalize_data);

      if (!nationalize_data.country[0]) {
        throw new BadGatewayException({
          status: '502',
          message: 'Agify returned an invalid response',
        });
      }

      return nationalize_data;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException({
        status: 'error',
        message: 'Something went wrong try again later.',
      });
    }
  }

  async ProcessPostRequestFunction(
    profileName: string,
  ): Promise<ProcessPostRequestFunctionType | any> {
    try {
      const name = profileName.toLowerCase();
      const userExists = await this.databaseRepository.checkUserExists(name);

      if (userExists) {
        const user = await this.databaseRepository.fetchUserByName(name);

        return {
          status: 'success',
          message: 'Profile already exists',
          data: user,
        };
      }

      const genderize_data: GenderizeAPIResponseType =
        await this.GenderizeRequestFunction(name);

      const agify_data: AgifyAPIResponseType =
        await this.AgifyRequestFunction(name);

      const nationalize_data: NationalizeAPIResponseType =
        await this.NationalizeRequestFunction(name);

      // To classify using the age
      function classifyAge(age) {
        switch (true) {
          case age >= 0 && age <= 12:
            return 'child';
          case age >= 13 && age <= 19:
            return 'teenager';
          case age >= 20 && age <= 59:
            return 'adult';
          case age >= 60:
            return 'senior';
          default:
            return 'unknown';
        }
      }

      const age_group = classifyAge(agify_data.age);

      const country_sorted = nationalize_data.country.sort((a, b) => {
        return a.probability - b.probability;
      });
      const country = country_sorted[country_sorted.length - 1];

      const processed_data = {
        id: uuidv7(),
        name,
        gender: genderize_data.gender,
        gender_probability: genderize_data.probability,
        sample_size: genderize_data.count,
        age: agify_data.age,
        age_group,
        country_id: country.country_id,
        country_probability: country.probability,
      };

      const created_user_data =
        await this.databaseRepository.createUser(processed_data);

      return { status: 'success', data: { ...created_user_data } };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException({
        status: 'error',
        message: 'Something went wrong try again later.',
      });
    }
  }

  async ProcessGetProfileUsingId(id: string) {
    try {
      const checkUserExists =
        await this.databaseRepository.checkUserExistsWithId(id);
      if (!checkUserExists) {
        throw new NotFoundException({
          status: 'error',
          message: 'Profile not found',
        });
      }
      const user = await this.databaseRepository.fetchUserById(id);

      return { status: 'success', data: user };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException({
        status: 'error',
        message: 'Something went wrong try again later.',
      });
    }
  }

  async DeleteProfileFunction(id: string) {
    try {
      const checkUserExists =
        await this.databaseRepository.checkUserExistsWithId(id);
      if (!checkUserExists) {
        throw new NotFoundException({
          status: 'error',
          message: 'Profile not found',
        });
      }
      await this.databaseRepository.deleteUser(id);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException({
        status: 'error',
        message: 'Something went wrong try again later.',
      });
    }
  }

  async GetAllProfileWithOptionalFilters(
    gender?: string,
    country_id?: string,
    age_group?: string,
  ) {
    try {
      const users = await this.databaseRepository.fetchUsersWithOptionalFilters(
        gender?.toLowerCase(),
        country_id?.toLowerCase(),
        age_group?.toLowerCase(),
      );

      return { status: 'success', count: users.length, data: users };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException({
        status: 'error',
        message: 'Something went wrong try again later.',
      });
    }
  }
}
