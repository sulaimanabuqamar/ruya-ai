/**
 * Amazon Bedrock integration data models
 */

export interface BedrockRequest {
  modelId: string; // e.g., "anthropic.claude-3-sonnet-20240229-v1:0"
  prompt: string;
  parameters: {
    temperature: number;
    topP: number;
    maxTokens: number;
  };
}

export interface BedrockResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}
