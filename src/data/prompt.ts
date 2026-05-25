export interface Prompt {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly tags: readonly string[];
  readonly createdAt: number;
  readonly updatedAt: number;
}

export type PromptInput = Pick<Prompt, 'title' | 'content' | 'tags'>;
