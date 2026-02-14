# Implementation Plan: Agentic Route Optimizer

## Overview

This implementation plan breaks down the agentic route optimizer into incremental coding tasks. The system will be built in layers: data models and storage, traffic integration, route generation and evaluation, and finally the AI-powered learning components. Each task builds on previous work and includes testing to validate functionality early.

## Tasks

- [x] 1. Set up project structure and core data models
  - Create directory structure: `src/route-optimizer/`
  - Define TypeScript interfaces for all core data models (Location, Route, RouteMetrics, MetricWeights, etc.)
  - Create configuration constants and default values
  - Set up SQLite database schema for route_performances and weight_adjustments tables
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 2. Implement Historical Performance Store
  - [x] 2.1 Create HistoricalPerformanceStore class with SQLite integration
    - Implement recordPerformance() method to persist route performance data
    - Implement queryPerformance() method to retrieve historical data
    - Implement getPerformanceStats() method for aggregate statistics
    - _Requirements: 4.1, 4.2, 4.3, 4.6_
  
  - [x] 2.2 Write property test for performance data persistence
    - **Property 12: Performance data persistence**
    - **Validates: Requirements 4.1, 4.2, 4.6**
  
  - [ ] 2.3 Write property test for historical data retrieval
    - **Property 13: Historical data retrieval**
    - **Validates: Requirements 4.3**
  
  - [ ] 2.4 Write unit tests for edge cases
    - Test empty database queries
    - Test data retention (90-day limit)
    - Test database error handling
    - _Requirements: 4.5_

- [ ] 3. Implement Traffic Data Service
  - [ ] 3.1 Create TrafficDataService class with API integration
    - Implement getCurrentTraffic() with caching (5-minute TTL)
    - Implement getHistoricalTraffic() for historical patterns
    - Implement exponential backoff for API failures
    - Add fallback to cached data when API unavailable
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ] 3.2 Write property test for traffic data structure
    - **Property 2: Traffic data structure validation**
    - **Validates: Requirements 1.4**
  
  - [ ] 3.3 Write property test for data validation
    - **Property 3: Traffic data validation before use**
    - **Validates: Requirements 1.5**
  
  - [ ] 3.4 Write unit tests for error handling
    - Test API unavailable scenario with cache fallback
    - Test exponential backoff behavior
    - Test cache expiration
    - _Requirements: 1.3_

- [ ] 4. Checkpoint - Ensure storage and traffic integration tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 5. Implement Metric Calculator
  - [ ] 5.1 Create MetricCalculator class
    - Implement calculateMetrics() method
    - Implement time calculation using traffic data and segment distances
    - Implement distance calculation as sum of all segments
    - Implement reliability calculation using coefficient of variation
    - Add time-weighted variance calculation (recent measurements weighted more)
    - Handle insufficient data case (< 10 measurements) with default reliability
    - _Requirements: 2.1, 2.2, 2.3, 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ] 5.2 Write property test for route metrics calculation
    - **Property 4: Route metrics calculation**
    - **Validates: Requirements 2.1, 2.2, 2.3**
  
  - [ ] 5.3 Write property test for reliability calculation
    - **Property 21: Reliability calculation from variance**
    - **Validates: Requirements 7.1, 7.2, 7.4, 7.5**
  
  - [ ] 5.4 Write unit test for insufficient data edge case
    - Test default reliability score when < 10 measurements
    - _Requirements: 7.3_

- [ ] 6. Implement Route Evaluator
  - [ ] 6.1 Create RouteEvaluator class
    - Implement evaluateRoutes() method
    - Implement min-max normalization for metrics across routes
    - Implement weighted score calculation
    - Sort routes by score in descending order
    - _Requirements: 2.4, 2.5, 2.6_
  
  - [ ] 6.2 Write property test for metric normalization
    - **Property 7: Metric normalization bounds**
    - **Validates: Requirements 2.6**
  
  - [ ] 6.3 Write property test for weighted score calculation
    - **Property 5: Weighted score calculation**
    - **Validates: Requirements 2.4**
  
  - [ ] 6.4 Write property test for score recalculation
    - **Property 6: Score recalculation on weight change**
    - **Validates: Requirements 2.5**
  
  - [ ] 6.5 Write property test for route ranking
    - **Property 11: Route ranking order**
    - **Validates: Requirements 3.4**

- [ ] 7. Implement Route Generator
  - [ ] 7.1 Create RouteGenerator class
    - Implement generateRoutes() method
    - Use permutation-based approach for waypoint orderings
    - Implement pathfinding algorithm (A* or Dijkstra) for segments
    - Apply route constraints (max detour, time windows)
    - Generate at least 3 distinct routes when possible
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ] 7.2 Write property test for minimum route generation
    - **Property 8: Minimum route generation**
    - **Validates: Requirements 3.1**
  
  - [ ] 7.3 Write property test for route completeness
    - **Property 9: Route completeness**
    - **Validates: Requirements 3.2**
  
  - [ ] 7.4 Write property test for route distinctness
    - **Property 10: Route distinctness**
    - **Validates: Requirements 3.3**
  
  - [ ] 7.5 Write unit test for insufficient routes case
    - Test when fewer than 3 routes can be generated
    - Verify logging of constraint
    - _Requirements: 3.5_

- [ ] 8. Checkpoint - Ensure route generation and evaluation tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 9. Implement Amazon Bedrock Client
  - [ ] 9.1 Create BedrockClient class with AWS SDK integration
    - Install @aws-sdk/client-bedrock-runtime dependency
    - Implement invokeModel() method
    - Configure model parameters (temperature, top_p, maxTokens)
    - Implement exponential backoff for rate limiting (429 errors)
    - Set 30-second timeout for requests
    - Parse JSON responses from model outputs
    - _Requirements: 6.1, 6.3, 6.5_
  
  - [ ] 9.2 Write property test for Bedrock request configuration
    - **Property 19: Bedrock request configuration**
    - **Validates: Requirements 6.5**
  
  - [ ] 9.3 Write property test for response validation
    - **Property 20: Bedrock response validation**
    - **Validates: Requirements 6.6**
  
  - [ ] 9.4 Write unit tests for error handling
    - Test rate limiting with exponential backoff
    - Test timeout handling
    - Test invalid response handling
    - _Requirements: 6.3_

- [ ] 10. Implement Weight Adjuster
  - [ ] 10.1 Create WeightAdjuster class
    - Implement analyzeAndAdjust() method
    - Check minimum data threshold (50 completed routes)
    - Query historical performance data
    - Calculate correlations between weights and outcomes
    - Build structured prompt for Bedrock
    - Invoke Bedrock for weight recommendations
    - Implement fallback heuristic-based adjustment
    - Validate proposed weights (sum = 1.0, non-negative)
    - Apply incremental adjustment (0.7 × old + 0.3 × proposed)
    - Log weight changes with justification
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.4_
  
  - [ ] 10.2 Write property test for Bedrock invocation
    - **Property 14: Bedrock invocation for analysis**
    - **Validates: Requirements 5.2, 6.1**
  
  - [ ] 10.3 Write property test for weight proposal
    - **Property 15: Weight proposal generation**
    - **Validates: Requirements 5.3**
  
  - [ ] 10.4 Write property test for weight validation
    - **Property 16: Weight constraint validation**
    - **Validates: Requirements 5.4**
  
  - [ ] 10.5 Write property test for incremental adjustment
    - **Property 17: Incremental weight adjustment**
    - **Validates: Requirements 5.5**
  
  - [ ] 10.6 Write property test for adjustment logging
    - **Property 18: Weight adjustment logging**
    - **Validates: Requirements 5.6**
  
  - [ ] 10.7 Write unit tests for edge cases
    - Test insufficient data (< 50 routes) - no adjustment
    - Test Bedrock unavailable - fallback to heuristics
    - Test invalid proposed weights - keep current weights
    - _Requirements: 5.1, 6.4_

- [ ] 11. Implement Route Optimizer (Orchestrator)
  - [ ] 11.1 Create RouteOptimizer class
    - Implement optimizeRoute() method to orchestrate all components
    - Load current weights from AsyncStorage on initialization
    - Coordinate: traffic retrieval → route generation → evaluation
    - Implement recordActualPerformance() to store completed route data
    - Add error handling with graceful degradation
    - Log all operations for debugging
    - _Requirements: 8.3, 8.5_
  
  - [ ] 11.2 Write property test for error logging
    - **Property 22: Error logging with context**
    - **Validates: Requirements 8.5**
  
  - [ ] 11.3 Write integration tests
    - Test end-to-end route optimization flow
    - Test weight loading on initialization
    - Test performance recording flow
    - _Requirements: 8.3_

- [ ] 12. Implement configuration and API endpoints
  - [ ] 12.1 Create configuration management
    - Implement ConfigManager class using AsyncStorage
    - Add methods to get/set adjustment interval, min routes threshold
    - Load configuration on system startup
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ] 12.2 Create API endpoints
    - Add GET /weights endpoint to retrieve current weights
    - Add GET /weights/history endpoint for adjustment history
    - Add POST /routes/optimize endpoint for route optimization
    - Add POST /routes/performance endpoint to record actual performance
    - _Requirements: 8.6_
  
  - [ ] 12.3 Write unit tests for configuration
    - Test configuration loading on startup
    - Test default values when no config exists
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ] 12.4 Write unit tests for API endpoints
    - Test weights retrieval endpoint
    - Test weight history endpoint
    - _Requirements: 8.6_

- [ ] 13. Implement scheduled weight adjustment
  - [ ] 13.1 Create scheduler for periodic weight adjustment
    - Implement background task to run weight adjustment at configured intervals
    - Use configurable interval (default: 24 hours)
    - Handle errors gracefully without crashing scheduler
    - _Requirements: 5.7_
  
  - [ ] 13.2 Write unit tests for scheduler
    - Test scheduler runs at correct intervals
    - Test error handling doesn't stop scheduler
    - _Requirements: 5.7_

- [ ] 14. Final integration and wiring
  - [ ] 14.1 Wire all components together
    - Connect RouteOptimizer with all dependencies
    - Set up dependency injection for testability
    - Configure AWS credentials for Bedrock
    - Initialize database on first run
    - _Requirements: All_
  
  - [ ] 14.2 Write end-to-end integration tests
    - Test complete optimization cycle with mocked external services
    - Test weight adjustment cycle with real database
    - Test error recovery scenarios
    - _Requirements: All_

- [ ] 15. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples and edge cases
- Integration tests validate component interactions
- The implementation follows a bottom-up approach: storage → data processing → AI learning
