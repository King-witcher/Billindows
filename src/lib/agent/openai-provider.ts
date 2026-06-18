import OpenAI from 'openai'
import * as z from 'zod'
import type { FunctionCallRowProvider } from '../database/types/function-call-row'
import type { DefaultContainer } from '../injector/dependencies'
import type { IAgentProvider, ProviderCompletionResult } from './agent-provider'
import type { Tool } from './tool'
import type { AgentChatMessage } from './types'

type ResponseInputItem = OpenAI.Responses.ResponseInputItem
type ResponsesModel = OpenAI.ResponsesModel

export class OpenAiProvider implements IAgentProvider<ResponseInputItem, OpenAI.Responses.Tool> {
  constructor(private model: ResponsesModel) {}

  private openai = new OpenAI()

  public get providerName(): FunctionCallRowProvider {
    return 'openai'
  }

  async complete(
    instructions: string,
    history: ResponseInputItem[],
    tools: OpenAI.Responses.Tool[] = [],
  ): Promise<ProviderCompletionResult> {
    const response = await this.openai.responses.create({
      model: this.model,
      instructions,
      input: history,
      tools,
      parallel_tool_calls: true,
    })

    const openaiToolCalls = response.output.filter((item) => item.type === 'function_call')
    if (openaiToolCalls.length > 0) {
      return {
        inputTokens: response.usage?.input_tokens ?? 0,
        outputTokens: response.usage?.output_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0,
        toolRequests: openaiToolCalls.map((call) => ({
          name: call.name,
          arguments: JSON.parse(call.arguments),
          callId: call.call_id,
        })),
        outputText: response.output_text || null,
      }
    } else {
      return {
        inputTokens: response.usage?.input_tokens ?? 0,
        outputTokens: response.usage?.output_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0,
        toolRequests: [],
        outputText: response.output_text,
      }
    }
  }

  async getProviderTools(tools: Tool[], ctx: DefaultContainer): Promise<OpenAI.Responses.Tool[]> {
    const openaiTools = await Promise.all(
      tools.map(async (tool): Promise<OpenAI.Responses.Tool> => {
        const schema = typeof tool.schema === 'function' ? await tool.schema(ctx) : tool.schema
        return {
          type: 'function',
          name: tool.name,
          description: tool.description,
          parameters: z.toJSONSchema(schema),
          strict: true,
        }
      }),
    )
    return openaiTools
  }

  getProviderHistory(databaseHistory: AgentChatMessage[]) {
    const result: ResponseInputItem[] = []

    for (const item of databaseHistory) {
      switch (item.role) {
        case 'function_call': {
          for (const call of item.function_calls ?? []) {
            result.push({
              type: 'function_call',
              name: call.function_name,
              arguments: JSON.stringify(call.arguments),
              call_id: call.call_id,
            })
          }

          for (const call of item.function_calls ?? []) {
            result.push({
              type: 'function_call_output',
              output: call.result,
              call_id: call.call_id,
            })
          }
          break
        }

        default: {
          result.push({
            type: 'message',
            role: item.role,
            content: item.content ?? '',
          })
        }
      }
    }

    return result
  }
}
