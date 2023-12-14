export type ParameterTypes =
  | "string"
  | "number"
  | "boolean"
  | "object"
  | "array";

export interface FunctionCall {
  name: string;
  description: string;
  parameters: {
    [key: string]: {
      type: ParameterTypes;
      description?: string;

      items?: {
        type: ParameterTypes;
        description?: string;
      };
    };
  };
}

export interface CalledFunction {
  name: string;
  parameters: {
    [key: string]: any;
  };
}

export interface InferenceOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  model: string;
}

export interface Gpt {
  evalFunctions(opt: {
    prompt: string;
    functions: FunctionCall[];

    options: InferenceOptions;
  }): Promise<CalledFunction[]>;
}
