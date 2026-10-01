export interface apiEndpoints {
  endpoint: string;
  methods: methods[];
  apiEndpoint: string;
}

export interface methods {
  verb: string;
  summary: string | undefined;
  parameters?: { in: 'path' | 'query' }[];
  deprecated?: boolean;
  responses?: {
    [key: string]: {
      $ref?: string;
      content?: {
        [key: string]: {
          schema?: {
            type?: string;
            $ref?: string;
            items?: { type?: string; $ref?: string };
          };
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
