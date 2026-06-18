import type { LLMChatMessageRowFunctionCall } from '../database/types/llm-message-row'
import type { DefaultContainer } from '../injector/dependencies'
import type { IAgentProvider } from './agent-provider'
import type { Tool } from './tool'
import type { AgentChatMessage } from './types'

export type RunAgentOutput<ToolName extends string> = {
  output: AgentChatMessage[]
  outputText: string
  toolCallsCount: Partial<Record<ToolName, number>>
  tokens: number
}

export type Agentconfig<ToolName extends string = string> = {
  instructions?: string
  history?: AgentChatMessage[]
  tools?: (Tool & { name: ToolName })[]
  ctx: DefaultContainer
  provider: IAgentProvider
}

export class Agent<ToolName extends string = string> {
  private instructions: string
  private history: AgentChatMessage[]
  private toolsMap: Map<ToolName, Tool & { name: ToolName }>
  private ctx: DefaultContainer
  private provider: IAgentProvider

  constructor(config: Agentconfig<ToolName>) {
    this.instructions = config.instructions ?? ''
    this.history = [...(config.history ?? [])]
    this.toolsMap = new Map((config.tools ?? []).map((tool) => [tool.name, tool]))
    this.ctx = config.ctx
    this.provider = config.provider
  }

  async run(input: string): Promise<RunAgentOutput<ToolName>> {
    // Add user input to history
    this.history.push({
      content: input,
      function_calls: null,
      role: 'user',
    })

    // Define output variables
    const output: AgentChatMessage[] = []
    let outputText = ''
    const toolCallsCount: Partial<Record<ToolName, number>> = {}
    let tokensUsed = 0

    // Get provider-specific tool definitions
    const providerTools = await this.provider.getProviderTools(
      [...this.toolsMap.values()],
      this.ctx,
    )

    // Loop until the agent responds with text and doesn't request any more tool calls
    while (true) {
      // Get provider-specific history format
      const providerHistory = this.provider.getProviderHistory(this.history)

      // Get the agent's response from the provider
      const completionResult = await this.provider.complete(
        this.instructions,
        providerHistory,
        providerTools,
      )
      tokensUsed += completionResult.totalTokens

      if (completionResult.outputText) {
        outputText = completionResult.outputText
        // Breaks the loop since the agent has finished its response and is not requesting any more tools to be called
        break
      }

      // Calls the functions requested by the agent
      const functionCalls = await Promise.all(
        completionResult.toolRequests.map(
          async (toolRequest): Promise<LLMChatMessageRowFunctionCall> => {
            const tool = this.toolsMap.get(toolRequest.name as ToolName)

            // Should never happen
            if (!tool) {
              return {
                arguments: toolRequest.arguments,
                call_id: toolRequest.callId,
                function_name: toolRequest.name,
                result: `Tool ${toolRequest.name} does not exist.`,
                provider: this.provider.providerName,
              }
            }

            // FIXME: Unnecessary query
            const schema =
              typeof tool.schema === 'function' ? await tool.schema(this.ctx) : tool.schema

            const toolResult = await tool.execute(toolRequest.arguments, this.ctx, schema)
            toolCallsCount[tool.name] = (toolCallsCount[tool.name] ?? 0) + 1

            return {
              arguments: toolRequest.arguments,
              call_id: toolRequest.callId,
              function_name: toolRequest.name,
              result: toolResult,
              provider: this.provider.providerName,
            }
          },
        ),
      )

      // Push a message with the function call results to the history, so that the agent can see the results in the next iteration
      const message: AgentChatMessage = {
        content: null,
        function_calls: functionCalls,
        role: 'function_call',
      }

      this.history.push(message)
      output.push(message)
    }

    // Push the final assistant message to the history
    const message: AgentChatMessage = {
      content: outputText,
      function_calls: null,
      role: 'assistant',
    }
    output.push(message)
    this.history.push(message)

    return {
      output,
      outputText,
      toolCallsCount,
      tokens: tokensUsed,
    }
  }
}
