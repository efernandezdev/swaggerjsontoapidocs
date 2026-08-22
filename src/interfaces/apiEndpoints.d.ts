export interface apiEndpoints {
  endpoint: string;
  methods: methods[];
  apiEndpoint: string;
}

export interface methods {
  verb: string;
  summary: string | undefined;
  responses?: {
    [key: string]: {
      content: {
        [key: string]: {
          schema?: { type: string; items: { $ref: string } };
        };
      };
    };
  };
  requestBody?: {
    content?: {
      [key: string]: {
        schema?: {
          $ref: string;
        };
      };
    };
  };
}
