import { Global, Module } from '@nestjs/common';
import { PrismaService } from './db.service.js';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DbModule {}
