import OpenAI from "openai";
import {
  CalledFunction,
  FunctionCall,
  Gpt,
  InferenceOptions,
} from "../interfaces/Gpt";

export class OpenAiGpt implements Gpt {
  private openai: OpenAI;

  constructor({ openai }: { openai: OpenAI }) {
    this.openai = openai;
  }

  public async evalFunctions({
    prompt,
    functions,

    options,
  }: {
    prompt: string;

    functions: FunctionCall[];

    options?: InferenceOptions;
  }): Promise<CalledFunction[]> {
    const tools: OpenAI.Chat.Completions.ChatCompletionTool[] =
      functions.length === 0
        ? ({ type: "object", properties: {} } as any)
        : functions.map((f) => ({
            function: {
              name: f.name,
              description: f.description,

              parameters: {
                type: "object",
                properties: {
                  ...f.parameters,
                },
                required: ["moves"],
              },
            },
            type: "function",
          }));

    const response = await this.openai.chat.completions.create({
      tools,
      messages: [
        {
          content: prompt,
          role: "user",
        },
      ],
      max_tokens: options?.maxTokens || 500,
      temperature: options?.temperature || 0.5,
      top_p: options?.topP || 1,
      model: options?.model || "gpt-3.5-turbo-1106",
      stream: false,
    });

    console.log(JSON.stringify(response, null, 2));

    const choices = response.choices;
    if (!choices) {
      throw new Error("No choices");
    }

    const choice = choices[0];
    const toolCalls = choice.message.tool_calls;
    if (!toolCalls) {
      throw new Error("No tool calls");
    }

    const calledFunctions: CalledFunction[] = toolCalls.map((tc) => {
      const tool = tc.function.name;
      if (!tool) {
        throw new Error("No tool");
      }

      try {
        const functionDefinition = JSON.parse(tc.function.arguments);

        return {
          name: tool,
          parameters: functionDefinition.parameters,
        };
      } catch (e) {
        console.error(`Error parsing function definition: ${e}`);
        throw new Error("Error parsing function definition");
      }
    });

    return calledFunctions;
  }
}
