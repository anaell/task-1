import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import { PostRequestDTO } from './app.dto';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('profiles')
  async postRequest(@Body() postRequestBody: PostRequestDTO) {
    const name = postRequestBody.name;

    return this.appService.ProcessPostRequestFunction(name);
  }

  @Get('profiles')
  async filter(
    @Query('gender') gender: string,
    @Query('country_id') country_id: string,
    @Query('age_group') age_group: string,
  ) {
    return this.appService.GetAllProfileWithOptionalFilters(
      gender,
      country_id,
      age_group,
    );
  }

  @Get('profiles/:id')
  async fetchSingleProfile(@Param('id') id: string) {
    return this.appService.ProcessGetProfileUsingId(id);
  }

  @HttpCode(204)
  @Delete('profiles/:id')
  async deleteProfile(@Param('id') id: string) {
    this.appService.DeleteProfileFunction(id);
  }
}
