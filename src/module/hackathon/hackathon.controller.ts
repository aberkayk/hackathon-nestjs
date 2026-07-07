import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BetterAuthGuard, CurrentUserSession } from 'nestjs-better-auth';
import { Roles } from '../../common/decorators/roles.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '../../generated/prisma/enums';
import type { AuthSession } from '../../lib/auth/auth.types';
import { CreateHackathonDto } from './dto/create-hackathon.dto';
import { UpdateHackathonDto } from './dto/update-hackathon.dto';
import { HackathonService } from './hackathon.service';

@Controller('hackathon')
@UseGuards(BetterAuthGuard)
export class HackathonController {
  constructor(private readonly hackathonService: HackathonService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ResponseMessage('Hackathon created')
  create(
    @CurrentUserSession('user') user: AuthSession['user'],
    @Body() dto: CreateHackathonDto,
  ) {
    return this.hackathonService.create(user.id, dto);
  }

  @Get()
  findAll() {
    return this.hackathonService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hackathonService.findById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ResponseMessage('Hackathon updated')
  update(@Param('id') id: string, @Body() dto: UpdateHackathonDto) {
    return this.hackathonService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ResponseMessage('Hackathon deleted')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.hackathonService.remove(id);
  }

  @Post(':id/join')
  @UseGuards(RolesGuard)
  @Roles(Role.PARTICIPANT)
  @ResponseMessage('Joined hackathon')
  join(
    @Param('id') id: string,
    @CurrentUserSession('user') user: AuthSession['user'],
  ) {
    return this.hackathonService.join(id, user.id);
  }
}
