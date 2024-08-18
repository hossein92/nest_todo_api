import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    // const request = ctx.getRequest();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Check if the message is an object (which may contain "message", "error", and "statusCode")
    if (typeof message === 'object' && message !== null) {
      if (message['message']) {
        message = message['message']; // Extract the message string
      }
    }

    response.status(status).json({
      statusCode: status,
      message, // Only the message is returned
    });
  }
}
