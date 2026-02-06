export interface apiEndpoints {
  endpoint: string;
  methods: methods[];
  apiEndpoint: string;
}

export interface methods {
  verb: string;
  summary: string | undefined;
}
