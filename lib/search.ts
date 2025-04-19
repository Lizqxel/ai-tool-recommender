import Fuse from 'fuse.js';
import { AITool } from '@/types/ai-tool';
import aiTools from '@/data/ai_tools.json';

const fuse = new Fuse(aiTools as AITool[], {
  keys: ['name', 'description', 'features', 'useCases', 'category', 'subcategory'],
  threshold: 0.3,
  includeScore: true
});

export const searchTools = (query: string): AITool[] => {
  if (!query.trim()) {
    return aiTools as AITool[];
  }

  const results = fuse.search(query);
  return results.map(result => result.item as AITool);
};

export const getToolById = (id: string): AITool | undefined => {
  return (aiTools as AITool[]).find((tool: AITool) => tool.id === id);
}; 