# Ferry Provider Environment Variables Setup

## Required Environment Variables

Add these environment variables to your `.env.local` file:

### Sealink Adventures API Configuration

```env
# Sealink Adventures
SEALINK_API_URL=http://api.dev.gonautika.com:8012/
SEALINK_USERNAME=your_sealink_username
SEALINK_TOKEN=your_sealink_token
SEALINK_AGENCY=ANDAMAN_EXCURSION
```

**How to get Sealink credentials:**

1. Contact Sealink Adventures for API access
2. Request demo login credentials for development
3. Provide your development URL for CORS allowlist
4. They will provide username and token

### Makruzz API Configuration

```env
# Makruzz
MAKRUZZ_API_URL=https://staging.makruzz.com/booking_api/
MAKRUZZ_USERNAME=your_makruzz_username
MAKRUZZ_PASSWORD=your_makruzz_password
```

**How to get Makruzz credentials:**

1. Contact Makruzz for API access
2. Register as an agent with them
3. They will provide agent username and password
4. Use staging environment for testing

### Green Ocean Seaways API Configuration

```env
# Green Ocean Seaways
GREEN_OCEAN_API_URL=https://tickets.greenoceanseaways.com/test-v-1.0-api/
GREEN_OCEAN_PUBLIC_KEY=your_public_key
GREEN_OCEAN_PRIVATE_KEY=your_private_key
```

**How to get Green Ocean credentials:**

1. Contact Green Ocean Seaways for API access
2. They will provide public and private keys
3. Use test API URL for development

### PDF Storage Configuration

```env
# PDF Storage Configuration
PDF_STORAGE_DIR=./public/tickets
PDF_BASE_URL=/tickets
```

### Optional Configuration

```env
# Ferry API Rate Limiting
FERRY_API_RATE_LIMIT=100

# Debugging (development only)
NODE_ENV=development
```

## Testing Configuration

For testing without real API access, you can use these dummy values:

```env
# Dummy values for testing (will cause API errors but won't crash the app)
SEALINK_USERNAME=dummy_user
SEALINK_TOKEN=dummy_token
MAKRUZZ_USERNAME=dummy_user
MAKRUZZ_PASSWORD=dummy_password
GREEN_OCEAN_PUBLIC_KEY=dummy_public_key
GREEN_OCEAN_PRIVATE_KEY=dummy_private_key
```

## Production Configuration

For production deployment:

1. Replace all API URLs with production endpoints:

   - Sealink: `https://api.gonautika.com:8012/`
   - Makruzz: `https://makruzz.com/booking_api/` (confirm with provider)
   - Green Ocean: `https://tickets.greenoceanseaways.com/api/v1/` (confirm with provider)

2. Set proper PDF storage directory:

   ```env
   PDF_STORAGE_DIR=/var/www/tickets
   PDF_BASE_URL=https://yourdomain.com/tickets
   ```

3. Configure rate limiting:
   ```env
   FERRY_API_RATE_LIMIT=200
   ```

## Security Notes

1. **Never commit real credentials** to version control
2. **Use different credentials** for development and production
3. **Store production credentials** securely (e.g., AWS Secrets Manager)
4. **Rotate credentials** regularly
5. **Monitor API usage** to detect unusual activity

## Verification

After setting up environment variables, you can test the configuration:

1. Start your development server
2. Check the ferry health endpoint: `GET /api/ferry/health`
3. Expected response:
   ```json
   {
     "status": "healthy",
     "operators": {
       "sealink": "configured/error",
       "makruzz": "configured/error",
       "greenocean": "configured/error"
     }
   }
   ```

## Troubleshooting

### Common Issues

1. **CORS Errors**

   - Ensure your domain is whitelisted with each provider
   - Contact providers to add your development/production URLs

2. **Authentication Errors**

   - Verify credentials are correct
   - Check if credentials have expired
   - Ensure using correct API endpoints

3. **Rate Limiting**

   - Reduce concurrent requests
   - Implement proper caching
   - Contact providers for higher limits

4. **PDF Storage Issues**
   - Ensure PDF_STORAGE_DIR exists and is writable
   - Check disk space availability
   - Verify file permissions

### Debug Mode

Enable debug mode for detailed logging:

```env
NODE_ENV=development
FERRY_API_DEBUG=true
```

This will log all API requests and responses for troubleshooting.
