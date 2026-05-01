import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to Naij Polls Api. the one trusted source for unbiased polls, public opinion judgement.';
  }
}
