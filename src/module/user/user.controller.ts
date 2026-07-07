import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BetterAuthGuard } from 'nestjs-better-auth';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '../../generated/prisma/enums';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(BetterAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }
}
