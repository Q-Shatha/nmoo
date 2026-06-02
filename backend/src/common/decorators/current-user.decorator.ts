import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthenticatedUser, AuthenticatedRequest } from "../types/authenticated-user";

export const CurrentUser = createParamDecorator<keyof AuthenticatedUser | undefined>(
  (data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!data) {
      return request.user;
    }

    return request.user?.[data];
  },
);
