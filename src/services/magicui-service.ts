/**
 * MagicUI Service
 * 
 * Service for interacting with the MagicUI server for UI components and design system.
 */

import { magicUIConfig } from '@/config/mcp-servers';
import { BaseMCPService } from './base-mcp-service';

export interface UIComponent {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  props: {
    name: string;
    type: string;
    description: string;
    required: boolean;
    defaultValue?: any;
  }[];
  code: string;
  previewUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  colors: Record<string, string>;
  typography: {
    fontFamily: string;
    headings: Record<string, any>;
    body: Record<string, any>;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  animations: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'icon' | 'video' | 'audio' | 'document';
  url: string;
  thumbnailUrl?: string;
  size: number;
  format: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ComponentQueryParams {
  category?: string;
  tags?: string[];
  search?: string;
  limit?: number;
  offset?: number;
}

export interface AssetQueryParams {
  type?: 'image' | 'icon' | 'video' | 'audio' | 'document';
  tags?: string[];
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ThemeUpdateParams {
  name?: string;
  colors?: Record<string, string>;
  typography?: {
    fontFamily?: string;
    headings?: Record<string, any>;
    body?: Record<string, any>;
  };
  spacing?: Record<string, string>;
  borderRadius?: Record<string, string>;
  shadows?: Record<string, string>;
  animations?: Record<string, any>;
}

export class MagicUIService extends BaseMCPService {
  constructor() {
    super(magicUIConfig);
  }

  /**
   * Get all UI components, optionally filtered
   * @param params - Query parameters
   */
  async getComponents(params?: ComponentQueryParams): Promise<UIComponent[]> {
    return this.post<UIComponent[]>('getComponents', params || {});
  }

  /**
   * Get a specific UI component by ID
   * @param id - Component ID
   */
  async getComponent(id: string): Promise<UIComponent> {
    return this.get<UIComponent>('getComponent', { id });
  }

  /**
   * Get the current theme configuration
   */
  async getTheme(): Promise<ThemeConfig> {
    return this.get<ThemeConfig>('getTheme');
  }

  /**
   * Update the theme configuration
   * @param params - Theme update parameters
   */
  async updateTheme(params: ThemeUpdateParams): Promise<ThemeConfig> {
    return this.put<ThemeConfig>('updateTheme', params);
  }

  /**
   * Get assets, optionally filtered
   * @param params - Query parameters
   */
  async getAssets(params?: AssetQueryParams): Promise<Asset[]> {
    return this.post<Asset[]>('getAssets', params || {});
  }
}
