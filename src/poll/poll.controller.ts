import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaginatedPolls, PollsService } from './poll.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { PollParamsDto } from './entities/poll-params.dto';
import { JwtAuthGuard } from 'src/Guards/jwt-auth.guard';
import { RolesGuard } from 'src/Guards/roles.guard';
import { Roles } from 'src/Decorators/roles.decorator';
import { CurrentUser } from 'src/Decorators/current-user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user.type';
import { Poll } from './entities/poll.entity';

@Controller({ path: 'polls', version: '1' })
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  // Admin only: Create poll
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreatePollDto,
    @CurrentUser() user: AuthUser,
  ): Promise<Poll> {
    return this.pollsService.create(user.id, dto);
  }

  // Public: List all polls with pagination
  @Get()
  async findAll(@Query() params: PollParamsDto): Promise<PaginatedPolls> {
    return this.pollsService.findAll(params);
  }

  // Public: Get single poll
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Poll> {
    return this.pollsService.findOne(id);
  }

  // Admin only: Update poll (creator only)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePollDto,
    @CurrentUser() user: AuthUser,
  ): Promise<Poll> {
    return this.pollsService.update(user.id, id, dto);
  }

  // Admin only: Close poll (creator only)
  @Post(':id/close')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async close(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<Poll> {
    return this.pollsService.close(user.id, id);
  }

  // Admin only: Delete poll (creator only)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    return this.pollsService.remove(user.id, id);
  }
}
