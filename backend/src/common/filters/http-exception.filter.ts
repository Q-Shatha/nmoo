import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = isHttpException ? exception.getResponse() : null;

    response.status(status).json({
      success: false,
      statusCode: status,
      path: request.url,
      message:
        typeof exceptionResponse === "object" && exceptionResponse && "message" in exceptionResponse
          ? exceptionResponse.message
          : isHttpException
            ? exception.message
            : "Internal server error",
      timestamp: new Date().toISOString(),
    });
  }
}
