# Route Optimizer Setup Guide

## Required Dependencies

The route optimizer requires two additional packages that are not yet installed:

### 1. expo-sqlite
For local SQLite database storage of historical performance data.

```bash
npx expo install expo-sqlite
```

### 2. @aws-sdk/client-bedrock-runtime
For Amazon Bedrock AI integration (required for weight adjustment learning).

```bash
npm install @aws-sdk/client-bedrock-runtime
```

## Verification

After installation, verify the packages are in your `package.json`:

```json
{
  "dependencies": {
    "expo-sqlite": "...",
    "@aws-sdk/client-bedrock-runtime": "..."
  }
}
```

## AWS Configuration

For Amazon Bedrock to work, you'll need to configure AWS credentials. Add to your `.env` file:

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

Or use IAM roles if deploying to AWS infrastructure.

## Database Initialization

The database will be automatically initialized on first use. The schema includes:

- `route_performances` table: Stores historical route performance data
- `weight_adjustments` table: Tracks metric weight adjustment history

## Next Steps

After installing dependencies:

1. Run `npm install` to ensure all dependencies are installed
2. Proceed with Task 2: Implement Historical Performance Store
3. Test database connectivity with the provided test suite

## Troubleshooting

### expo-sqlite not found
Make sure you're using Expo SDK 50 or later. Run `expo upgrade` if needed.

### AWS SDK errors
Ensure your AWS credentials have permissions for `bedrock:InvokeModel` action.
