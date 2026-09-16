import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private attemptCount = 0;

  async sendEmail(to: string, template: string): Promise<void> {
    this.attemptCount++;
    this.logger.log(`Email attempt #${this.attemptCount} → ${to}`);

    // Simulate failure on every 10th attempt
    if (this.attemptCount % 10 === 0) {
      this.logger.error(`Mock email failure on attempt #${this.attemptCount}`);

      throw new Error('Mock email service failure');
    }
    this.logger.log(`Mock email sent successfully to ${to}`);
  }
}
