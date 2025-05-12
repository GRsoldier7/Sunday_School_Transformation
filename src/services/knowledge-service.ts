/**
 * Knowledge Service
 * 
 * Service for interacting with the Knowledge server for knowledge base and information management.
 */

import { knowledgeConfig } from '@/config/mcp-servers';
import { BaseMCPService } from './base-mcp-service';

export interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  categories: string[];
  tags: string[];
  author: string;
  publishedAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'archived';
  relatedArticles?: string[];
  metadata?: Record<string, any>;
}

export interface SearchParams {
  query: string;
  categories?: string[];
  tags?: string[];
  author?: string;
  publishedAfter?: string;
  publishedBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
  status?: 'draft' | 'published' | 'archived';
  limit?: number;
  offset?: number;
}

export interface ArticleCreateParams {
  title: string;
  content: string;
  summary: string;
  categories: string[];
  tags: string[];
  author: string;
  status: 'draft' | 'published' | 'archived';
  metadata?: Record<string, any>;
}

export interface ArticleUpdateParams {
  title?: string;
  content?: string;
  summary?: string;
  categories?: string[];
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  metadata?: Record<string, any>;
}

export interface CategorizeParams {
  content: string;
  maxCategories?: number;
}

export interface RecommendParams {
  articleId: string;
  userId?: string;
  limit?: number;
}

export class KnowledgeService extends BaseMCPService {
  constructor() {
    super(knowledgeConfig);
  }

  /**
   * Search for articles
   * @param params - Search parameters
   */
  async search(params: SearchParams): Promise<Article[]> {
    return this.post<Article[]>('search', params);
  }

  /**
   * Get an article by ID
   * @param id - Article ID
   */
  async getArticle(id: string): Promise<Article> {
    return this.get<Article>('getArticle', { id });
  }

  /**
   * Create a new article
   * @param params - Article creation parameters
   */
  async createArticle(params: ArticleCreateParams): Promise<Article> {
    return this.post<Article>('createArticle', params);
  }

  /**
   * Update an article
   * @param id - Article ID
   * @param params - Article update parameters
   */
  async updateArticle(id: string, params: ArticleUpdateParams): Promise<Article> {
    return this.put<Article>('updateArticle', params, { id });
  }

  /**
   * Delete an article
   * @param id - Article ID
   */
  async deleteArticle(id: string): Promise<void> {
    return this.delete<void>('deleteArticle', { id });
  }

  /**
   * Categorize content using AI
   * @param params - Categorization parameters
   */
  async categorize(params: CategorizeParams): Promise<string[]> {
    return this.post<string[]>('categorize', params);
  }

  /**
   * Get article recommendations
   * @param params - Recommendation parameters
   */
  async getRecommendations(params: RecommendParams): Promise<Article[]> {
    return this.post<Article[]>('recommend', params);
  }
}
