import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util.js';
import { APP_CONSTANTS } from '../constants/app-constants.js';
import { ApiResult } from '../types/index.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    console.log(host.getArgs());
    const response = ctx.getResponse();
    let code = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = APP_CONSTANTS.ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
    if (exception instanceof HttpException) {
      code = exception.getStatus();
      message = exception.message;
    }
    const errorResponse: ApiResult = {
      success: false,
      error: {
        code,
        message,
      },
    };
    response.status(code).json(errorResponse);
  }
}
