import { UserRole } from "@prisma/client";
import { Request } from "express";

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
};

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};
