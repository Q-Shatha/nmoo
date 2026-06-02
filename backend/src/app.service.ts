import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHealth() {
    return {
      name: "nmoo نمو API",
      status: "ok",
      version: "0.0.1",
    };
  }
}
