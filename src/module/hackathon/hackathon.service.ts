import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service';
import { CreateHackathonDto } from './dto/create-hackathon.dto';
import { UpdateHackathonDto } from './dto/update-hackathon.dto';

@Injectable()
export class HackathonService {
  constructor(private readonly prisma: PrismaService) {}

  create(authorId: string, dto: CreateHackathonDto) {
    const { startsAt, endsAt, ...rest } = dto;

    return this.prisma.hackathon.create({
      data: {
        ...rest,
        startDate: startsAt,
        endDate: endsAt,
        authorId,
      },
    });
  }

  findAll() {
    return this.prisma.hackathon.findMany();
  }

  async findById(id: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id },
    });

    if (!hackathon) {
      throw new NotFoundException(`Hackathon ${id} not found`);
    }

    return hackathon;
  }

  async update(id: string, dto: UpdateHackathonDto) {
    await this.findById(id);

    const { startsAt, endsAt, ...rest } = dto;

    return this.prisma.hackathon.update({
      where: { id },
      data: {
        ...rest,
        startDate: startsAt,
        endDate: endsAt,
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);

    await this.prisma.hackathon.delete({ where: { id } });
  }
}
