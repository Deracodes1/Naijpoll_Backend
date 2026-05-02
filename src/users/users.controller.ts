import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/Guards/jwt-auth.guard';
import { RolesGuard } from 'src/Guards/roles.guard';
import { Roles } from 'src/Decorators/roles.decorator';
import { CurrentUser } from 'src/Decorators/current-user.decorator';

@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Admin only endpoint
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll() {
    return this.usersService.findAll();
  }

  // Any authenticated user can view their own profile
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(
    @Param('id') id: string,
    @CurrentUser('userId') currentUserId: string,
  ) {
    if (id !== currentUserId) throw new ForbiddenException();
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
