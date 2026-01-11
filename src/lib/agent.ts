import { ResponsesModel } from 'openai/resources/shared.mjs'
import { ZodObject } from 'zod'
import * as zod from 'zod'
import { openai } from './openai'
import {
  Tool as OpenAITool,
  Response,
  ResponseInput,
} from 'openai/resources/responses/responses.mjs'

export type Tool<T extends ZodObject = ZodObject> = {
  schema: T
  name: string
  description: string
  execute: (args: zod.infer<T>) => Promise<string>
}

const schema = zod.object({
  message: zod.string(),
})

const obj: zod.infer<typeof schema> = {
  message: 'Hello, World!',
}

const tool: Tool = {
  schema: schema,
  name: 'example_tool',
  description: 'An example tool that returns a greeting message.',
  execute: async (args) => {
    return `Greeting: ${args.message}`
  },
}

export type CreateAgentParams = {
  model?: ResponsesModel
  instructions: string
  tools: Tool[]
  history?: ResponseInput
}

export class Agent {
  private toolsMap: Map<string, Tool>
  private model: ResponsesModel
  private instructions: string
  private history: ResponseInput = []

  constructor({ model, instructions, tools, history = [] }: CreateAgentParams) {
    this.model = model || process.env.OPENAI_MODEL!
    this.instructions = instructions
    this.history = history
    this.toolsMap = new Map<string, Tool>(
      tools.map((tool) => [tool.name, tool])
    )
  }

  async run(input: string): Promise<string> {
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

    let response: Response

    while (true) {
      response = await openai.responses.create({
        model: this.model,
        instructions: this.instructions,
        input: this.history,
        tools: openaiTools,
      })

      let toolCalled = false
      for (const item of response.output) {
        if (item.type === 'function_call') {
          this.history.push(item)
          toolCalled = true
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

    this.history.push({
      role: 'assistant',
      content: response.output_text,
    })

    return response.output_text
  }
}
