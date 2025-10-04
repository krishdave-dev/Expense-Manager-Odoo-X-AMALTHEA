# 📧 Email Configuration Guide

## Gmail Setup (Recommended for Development)

### Step 1: Enable 2-Factor Authentication
1. Go to your [Google Account](https://myaccount.google.com/)
2. Click **Security** in the left sidebar
3. Under "How you sign in to Google", click **2-Step Verification**
4. Follow the steps to enable 2FA if not already enabled

### Step 2: Generate App Password
1. In your Google Account Security settings
2. Under "How you sign in to Google", click **App passwords**
3. Select app: **Mail**
4. Select device: **Other (custom name)** → Enter "Expense Manager"
5. Click **Generate**
6. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update Your .env File
```env
# Mail Configuration (Gmail)
MAIL_HOST="smtp.gmail.com"
MAIL_PORT=587
MAIL_USER="your-email@gmail.com"
MAIL_PASS="abcd efgh ijkl mnop"  # Your 16-character app password
MAIL_FROM="noreply@yourcompany.com"
```

## Alternative Email Providers

### SendGrid (Production Recommended)
```env
MAIL_HOST="smtp.sendgrid.net"
MAIL_PORT=587
MAIL_USER="apikey"
MAIL_PASS="your-sendgrid-api-key"
MAIL_FROM="noreply@yourdomain.com"
```

### Mailgun
```env
MAIL_HOST="smtp.mailgun.org"
MAIL_PORT=587
MAIL_USER="your-mailgun-smtp-user"
MAIL_PASS="your-mailgun-smtp-password"
MAIL_FROM="noreply@yourdomain.com"
```

### Microsoft Outlook/Hotmail
```env
MAIL_HOST="smtp-mail.outlook.com"
MAIL_PORT=587
MAIL_USER="your-email@outlook.com"
MAIL_PASS="your-password"  # Use app password if 2FA enabled
MAIL_FROM="noreply@yourcompany.com"
```

## Testing Email Configuration

### Method 1: Check Server Logs
When creating a user, check the backend console for email delivery status.

### Method 2: Test Endpoint (Development Only)
Add this temporary test endpoint to your AuthController:

```typescript
@Public()
@Post('test-email')
async testEmail(@Body() body: { email: string }) {
  await this.mailService.sendTemporaryPassword(
    body.email,
    'Test User',
    'temp123',
    'Test Company'
  );
  return { message: 'Test email sent' };
}
```

Test with:
```bash
curl -X POST http://localhost:3001/auth/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com"}'
```

## Current Behavior

### ✅ Email Configuration Present
- User created successfully
- Email sent with temporary password
- User can log in and must change password

### ⚠️ Email Configuration Missing/Invalid
- User still created successfully
- Temporary password logged to server console
- Admin can manually share credentials
- No error thrown - system continues to work

## Troubleshooting

### Common Issues

1. **"Invalid login: Application-specific password required"**
   - Solution: Generate Gmail App Password (see Step 2 above)

2. **"EAUTH authentication failed"**
   - Check email/password are correct
   - Ensure 2FA is enabled for Gmail
   - Verify app password is used (not regular password)

3. **"Connection timeout"**
   - Check MAIL_HOST and MAIL_PORT settings
   - Verify firewall/network connectivity

4. **"Invalid recipient"**
   - Verify MAIL_FROM is properly configured
   - Some providers require verified sender domains

### Development Without Email
If you don't want to set up email for development:

1. Leave email configuration empty in `.env`
2. Check server logs for temporary passwords when creating users
3. Manually share credentials with test users

## Production Recommendations

1. **Use Professional Email Service**
   - SendGrid, Mailgun, or AWS SES
   - Better deliverability and reliability

2. **Configure SPF/DKIM Records**
   - Improves email deliverability
   - Reduces spam filtering

3. **Use Custom Domain**
   - More professional appearance
   - Better brand recognition

4. **Monitor Email Delivery**
   - Set up webhooks for delivery status
   - Track bounce rates and opens

## Security Notes

- Never commit email passwords to version control
- Use environment variables for all sensitive data
- Rotate app passwords periodically
- Use dedicated email accounts for system notifications