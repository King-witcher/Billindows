import type {
  Tool as OpenAITool,
  Response,
  ResponseInput,
} from 'openai/resources/responses/responses.mjs'
import type { ResponsesModel } from 'openai/resources/shared.mjs'
import * as zod from 'zod'
import { openai } from './openai'
import type { Tool } from './tools/tool'

export type CreateAgentParams<TToolName extends string = string> = {
  model?: ResponsesModel
  instructions: string
  tools: (Tool & { name: TToolName })[]
  history?: ResponseInput
}

export type AgentResult<TToolName extends string = string> = {
  response: string
  tokens: number
  toolCalls: Partial<Record<TToolName, number>>
}

export class Agent<TToolName extends string = string> {
  private toolsMap: Map<string, Tool & { name: TToolName }>
  private model: ResponsesModel
  private instructions: string
  private history: ResponseInput = []

  constructor({ model, instructions, tools, history = [] }: CreateAgentParams<TToolName>) {
    this.model = model || process.env.OPENAI_MODEL!
    this.instructions = instructions
    this.history = history
    this.toolsMap = new Map(tools.map((tool) => [tool.name, tool]))
  }

  async run(input: string): Promise<AgentResult<TToolName>> {
    this.history.push({
      role: 'user',
      content: input,
    })

    const openaiTools: OpenAITool[] = this.toolsMap
      .values()
      .toArray()
      .map((tool) => ({
        strict: true,
        type: 'function',
        name: tool.name,
        description: tool.description,
        parameters: zod.toJSONSchema(tool.schema),
      }))

    const toolCalls: Partial<Record<TToolName, number>> = {}
    let response: Response
    let tokens = 0

    while (true) {
      response = await openai.responses.create({
        model: this.model,
        instructions: this.instructions,
        input: this.history,
        tools: openaiTools,
      })

      tokens += response.usage?.total_tokens ?? 0

      let toolCalled = false
      for (const item of response.output) {
        this.history.push(item)

        if (item.type === 'function_call') {
          toolCalled = true
          toolCalls[item.name as TToolName] = (toolCalls[item.name as TToolName] || 0) + 1
          console.info('Calling tool:', item.name)

          const tool = this.toolsMap.get(item.name)!
          const args = JSON.parse(item.arguments)
          console.info('With arguments:', item.arguments)
          const result = await tool.execute(args)

          console.debug('Tool result:', result)
          this.history.push({
            type: 'function_call_output',
            call_id: item.call_id,
            output: result,
          })
        }
      }

      if (!toolCalled) break
    }

    return {
      response: response.output_text,
      tokens,
      toolCalls,
    }
  }
}
