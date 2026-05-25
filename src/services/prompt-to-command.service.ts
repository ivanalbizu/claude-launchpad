import type { Prompt } from '@/data/prompt.ts';

export interface ConvertedSlashCommand {
  readonly slug: string;
  readonly label: string;
  readonly description: string;
  readonly content: string;
}

export function promptToSlashCommand(prompt: Prompt): ConvertedSlashCommand {
  const slug = slugify(prompt.title) || prompt.id.slice(0, 8);
  return {
    slug,
    label: `/${slug}`,
    description: prompt.title.trim() || 'Prompt personalizado',
    content: prompt.content,
  };
}

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}
