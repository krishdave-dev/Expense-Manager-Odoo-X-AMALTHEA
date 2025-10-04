import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    private createTransporter;
    sendTemporaryPassword(email: string, name: string, tempPassword: string, companyName: string): Promise<void>;
}
