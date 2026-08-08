import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import type { RequestWithUser } from '../auth/request-with-user';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiTags('Audit')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @ApiOperation({
    summary: 'Get audit logs',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated audit logs.',
  })
  @Get()
  findAll(
    @Req() req: RequestWithUser,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.auditService.findAll(
      req.user.userId,
      Number(page),
      Number(limit),
    );
  }
}
