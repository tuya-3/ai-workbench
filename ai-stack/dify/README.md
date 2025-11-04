# Dify Integration

This directory contains Dify workflow integration examples and configurations.

## What is Dify?

Dify is an open-source LLM app development platform that combines AI workflow orchestration, RAG pipeline, agent capabilities, model management, and observability features. It allows you to build production-ready AI applications quickly.

## Setup

1. **Create a Dify Account**
   - Visit [Dify Cloud](https://cloud.dify.ai) or self-host
   - Create a new workspace

2. **Create an Application**
   - Choose application type (Chatbot, Agent, or Workflow)
   - Configure your workflow using the visual editor

3. **Get API Credentials**
   - Navigate to your application settings
   - Copy the API key
   - Add to `.env.local`:
     ```
     NEXT_PUBLIC_DIFY_API_URL=https://api.dify.ai/v1
     DIFY_API_KEY=app-xxxxxxxxxxxxx
     ```

## Example Workflow

The `example-workflow.json` file contains a sample workflow that:
- Accepts user input
- Processes through an LLM
- Returns structured output

You can import this into Dify or use it as a reference.

## Client Integration

The example files in this folder (`client-example.ts`) are reference implementations showing how to integrate Dify into your Next.js application. These files are excluded from the main TypeScript compilation and should be copied/adapted into your actual application code when needed.

See `client-example.ts` for TypeScript code to:
- Initialize Dify client
- Send messages to workflows
- Handle streaming responses
- Manage conversation sessions

## API Endpoints

### Chat Messages
```typescript
POST /chat-messages
{
  "inputs": {},
  "query": "Your question here",
  "response_mode": "streaming",
  "conversation_id": "",
  "user": "user-id"
}
```

### Workflow Runs
```typescript
POST /workflows/run
{
  "inputs": {
    "query": "Your input"
  },
  "response_mode": "blocking",
  "user": "user-id"
}
```

## Best Practices

1. **Error Handling**: Always implement retry logic for API calls
2. **Rate Limiting**: Respect API rate limits
3. **Streaming**: Use streaming mode for better UX
4. **Conversation Management**: Track conversation_id for multi-turn chats
5. **Security**: Never expose API keys in client-side code

## Resources

- [Dify Documentation](https://docs.dify.ai)
- [API Reference](https://docs.dify.ai/getting-started/api-reference)
- [Workflow Guide](https://docs.dify.ai/guides/workflow)
