# Agentic Route Optimizer

AI-powered carpooling route optimization system that learns from historical performance data to continuously improve route recommendations.

## Structure

```
src/route-optimizer/
├── types/              # TypeScript interfaces and type definitions
│   ├── core.ts        # Geographic and time primitives
│   ├── route.ts       # Route-related models
│   ├── metrics.ts     # Metrics and evaluation models
│   ├── traffic.ts     # Traffic data models
│   ├── performance.ts # Historical performance models
│   ├── bedrock.ts     # Amazon Bedrock integration models
│   └── index.ts       # Central type exports
├── config/            # Configuration and constants
│   ├── constants.ts   # Default values and configuration
│   └── index.ts       # Central config exports
├── database/          # SQLite database setup
│   ├── schema.ts      # Database schema definitions
│   ├── connection.ts  # Database connection management
│   └── index.ts       # Central database exports
└── index.ts           # Main module entry point
```

## Key Components (To Be Implemented)

- **TrafficDataService**: Retrieves and caches traffic information
- **RouteGenerator**: Creates multiple distinct route options
- **MetricCalculator**: Computes time, distance, and reliability metrics
- **RouteEvaluator**: Scores and ranks routes using weighted metrics
- **HistoricalPerformanceStore**: Persists and queries route performance data
- **WeightAdjuster**: Uses AI to analyze patterns and adjust metric weights
- **BedrockClient**: Interfaces with AWS Bedrock foundation models
- **RouteOptimizer**: Orchestrates all components

## Requirements

- expo-sqlite: For local database storage
- @aws-sdk/client-bedrock-runtime: For Amazon Bedrock integration
- @react-native-async-storage/async-storage: For configuration storage (already installed)

## Installation

```bash
npx expo install expo-sqlite
npm install @aws-sdk/client-bedrock-runtime
```

## Configuration

Default configuration is defined in `config/constants.ts`:

- **Default Weights**: time=0.4, distance=0.3, reliability=0.3
- **Weight Adjustment**: Runs daily, requires 50+ completed routes
- **Traffic Cache**: 5-minute TTL
- **Data Retention**: 90 days

## Database Schema

### route_performances
Stores historical route performance data for learning.

### weight_adjustments
Tracks the history of metric weight adjustments.

## Usage

```typescript
import { getDatabase } from './route-optimizer';

// Initialize database
const db = await getDatabase();
```

## Development Status

✅ Task 1: Project structure and core data models - COMPLETE
- Directory structure created
- TypeScript interfaces defined
- Configuration constants set up
- SQLite database schema created

Next: Task 2 - Implement Historical Performance Store
