'use client';

import { useEffect, useState, useCallback, JSX } from 'react';
import { Card } from 'fumadocs-ui/components/card';
import { Tabs, Tab } from 'fumadocs-ui/components/tabs';
import { Callout } from 'fumadocs-ui/components/callout';

interface ModelCapabilities {
  supports_function_calling: boolean;
  supports_vision: boolean;
  supports_streaming: boolean;
  supports_structured_output: boolean;
}

interface ModelPricing {
  input_tokens_cost_per_million: number;
  output_tokens_cost_per_million: number;
  currency: string; 
}

interface Model {
  id: string;
  object: string;
  type: string;
  created?: number;
  created_at?: string;
  owned_by: string;
  display_name: string;
  capabilities: ModelCapabilities;
  pricing: ModelPricing;
  context_length: number;
  max_output_tokens: number;
}

const API_KEY = 'sk-mega-25f8b5b41a531921b24bf59daa8ccc0d38da68364662fb8956d972333b8d86b9';
const API_ENDPOINT = 'https://ai.megallm.io/v1/models';

export default function ModelsCatalog() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchModels = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINT, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }

      const data = await response.json();
      setModels(data.data || []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels();

    if (autoRefresh) {
      const interval = setInterval(fetchModels, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [fetchModels, autoRefresh]);

  const formatContextWindow = (context: number): string => {
    if (!context) return 'N/A';
    if (context >= 1000000) return `${Math.round(context / 1000000)}M`;
    if (context >= 1000) return `${Math.round(context / 1000)}K`;
    return context.toString();
  };

  const formatMaxOutput = (tokens: number): string => {
    if (!tokens) return 'N/A';
    if (tokens >= 1000) return `${Math.round(tokens / 1000)}K`;
    return tokens.toString();
  };

  const formatPrice = (price: number | undefined): string => {
    if (price === undefined || price === null || price === 0) return 'N/A';
    return `$${price}`;
  };

  const formatDiscountedPrice = (price: number | undefined): JSX.Element => {
    if (price === undefined || price === null || price === 0) return <span>N/A</span>;

    const originalPrice = Math.round(price * 100) / 100; // Round to 2 decimal places to fix precision issues
    const discountedPrice = originalPrice * 0.05; // 90% off means 10% of original price

    // Format to remove unnecessary trailing zeros
    const formatPrice = (val: number) => {
      return val % 1 === 0 ? val.toString() : val.toFixed(3).replace(/\.?0+$/, '');
    };

    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2 min-h-[20px]">
          <span className="text-xs line-through text-gray-400 font-medium flex-shrink-0">${formatPrice(originalPrice)}</span>
          <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide shadow-sm flex-shrink-0 leading-tight">
            95% OFF
          </span>
        </div>
        <div className="text-green-600 font-bold text-sm leading-none">
          ${formatPrice(discountedPrice)}
        </div>
      </div>
    );
  };

  const getFeatureIcons = (capabilities: ModelCapabilities): string => {
    const icons: string[] = [];
    if (capabilities.supports_function_calling) icons.push('🎯');
    if (capabilities.supports_vision) icons.push('🖼️');
    if (capabilities.supports_streaming) icons.push('📡');
    if (capabilities.supports_structured_output) icons.push('🔧');
    return icons.join('');
  };

  const filterModelsByProvider = (provider: string) => {
    if (provider === 'All') return models;
    return models.filter(model => {
      const owner = model.owned_by.toLowerCase();
      switch(provider) {
        case 'OpenAI':
          return owner.includes('openai') || owner.includes('azure');
        case 'Anthropic':
          return owner.includes('anthropic');
        case 'Google':
          return owner.includes('google');
        case 'xAI':
          return owner.includes('xai');
        case 'Meta':
          return owner.includes('meta');
        case 'Mistral':
          return owner.includes('mistral');
        case 'Alibaba':
          return owner.includes('alibaba');
        default:
          return false;
      }
    });
  };

  const embeddingModels = models.filter(model =>
    model.id.includes('embedding') || model.display_name.toLowerCase().includes('embedding')
  );
  const chatModels = models.filter(model =>
    !model.id.includes('embedding') && !model.display_name.toLowerCase().includes('embedding')
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading models from MegaLLM API...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Callout type="error">
        <div className="flex flex-col gap-2">
          <p><strong>Failed to load models:</strong> {error}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchModels();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-fit"
          >
            Retry
          </button>
        </div>
      </Callout>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            🔴 Live Data - {models.length} models available
          </span>
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Auto-refresh (30s)</span>
          </label>
          <button
            onClick={() => {
              setLoading(true);
              fetchModels();
            }}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh Now
          </button>
        </div>
      </div>

      <Callout type="info">
        <strong>Important</strong>: Always use the Model ID (not display name) when making API calls. For example, use `gpt-4o-mini` not "GPT-4o mini".
      </Callout>

      <Tabs items={["All Models", "OpenAI", "Anthropic", "Google", "xAI", "Meta", "Other", "Embedding"]}>
        <Tab value="All Models">
          <h3 className="text-xl font-semibold mb-4">Complete Model Listing</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Model ID</th>
                  <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Provider</th>
                  <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Context</th>
                  <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Max Output</th>
                  <th className="px-2 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Input $/M</th>
                  <th className="px-2 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Output $/M</th>
                  <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Features</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {chatModels.map((model) => (
                  <tr key={model.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-3 py-4 text-sm font-mono text-blue-600 dark:text-blue-400">{model.id}</td>
                    <td className="px-3 py-4 text-sm">{model.owned_by}</td>
                    <td className="px-3 py-4 text-sm text-center">{formatContextWindow(model.context_length)}</td>
                    <td className="px-3 py-4 text-sm text-center">{formatMaxOutput(model.max_output_tokens)}</td>
                    <td className="px-2 py-4 text-sm w-28">{formatDiscountedPrice(model.pricing?.input_tokens_cost_per_million)}</td>
                    <td className="px-2 py-4 text-sm w-28">{formatDiscountedPrice(model.pricing?.output_tokens_cost_per_million)}</td>
                    <td className="px-3 py-4 text-sm text-center">{getFeatureIcons(model.capabilities)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <strong>Legend</strong>: 🎯 Function Calling | 🖼️ Vision | 📡 Streaming | 🔧 Structured Output
          </p>
        </Tab>

        <Tab value="OpenAI">
          <h3 className="text-xl font-semibold mb-4">OpenAI Models</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Model ID</th>
                  <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Context Window</th>
                  <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Max Output</th>
                  <th className="px-2 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Input $/M tokens</th>
                  <th className="px-2 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Output $/M tokens</th>
                  <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Features</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filterModelsByProvider('OpenAI').filter(m => !m.id.includes('embedding')).map((model) => (
                  <tr key={model.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-blue-600 dark:text-blue-400">{model.id}</td>
                    <td className="px-4 py-3 text-sm">{formatContextWindow(model.context_length)}</td>
                    <td className="px-4 py-3 text-sm">{formatMaxOutput(model.max_output_tokens)}</td>
                    <td className="px-4 py-3 text-sm">{formatDiscountedPrice(model.pricing?.input_tokens_cost_per_million)}</td>
                    <td className="px-4 py-3 text-sm">{formatDiscountedPrice(model.pricing?.output_tokens_cost_per_million)}</td>
                    <td className="px-4 py-3 text-sm">{getFeatureIcons(model.capabilities)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tab>

        <Tab value="Anthropic">
          <h3 className="text-xl font-semibold mb-4">Anthropic Claude Models</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Model ID</th>
                  <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Context Window</th>
                  <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Max Output</th>
                  <th className="px-2 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Input $/M tokens</th>
                  <th className="px-2 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Output $/M tokens</th>
                  <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Features</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filterModelsByProvider('Anthropic').map((model) => (
                  <tr key={model.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-blue-600 dark:text-blue-400">{model.id}</td>
                    <td className="px-4 py-3 text-sm">{formatContextWindow(model.context_length)}</td>
                    <td className="px-4 py-3 text-sm">{formatMaxOutput(model.max_output_tokens)}</td>
                    <td className="px-4 py-3 text-sm">{formatDiscountedPrice(model.pricing?.input_tokens_cost_per_million)}</td>
                    <td className="px-4 py-3 text-sm">{formatDiscountedPrice(model.pricing?.output_tokens_cost_per_million)}</td>
                    <td className="px-4 py-3 text-sm">{getFeatureIcons(model.capabilities)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tab>

        <Tab value="Google">
          <h3 className="text-xl font-semibold mb-4">Google Gemini Models</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Model ID</th>
                  <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Context Window</th>
                  <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Max Output</th>
                  <th className="px-2 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Input $/M tokens</th>
                  <th className="px-2 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Output $/M tokens</th>
                  <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Features</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filterModelsByProvider('Google').map((model) => (
                  <tr key={model.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-blue-600 dark:text-blue-400">{model.id}</td>
                    <td className="px-4 py-3 text-sm">{formatContextWindow(model.context_length)}</td>
                    <td className="px-4 py-3 text-sm">{formatMaxOutput(model.max_output_tokens)}</td>
                    <td className="px-4 py-3 text-sm">{formatDiscountedPrice(model.pricing?.input_tokens_cost_per_million)}</td>
                    <td className="px-4 py-3 text-sm">{formatDiscountedPrice(model.pricing?.output_tokens_cost_per_million)}</td>
                    <td className="px-4 py-3 text-sm">{getFeatureIcons(model.capabilities)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tab>

        <Tab value="xAI">
          <h3 className="text-xl font-semibold mb-4">xAI Models</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Model ID</th>
                  <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Context Window</th>
                  <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Max Output</th>
                  <th className="px-2 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Input $/M tokens</th>
                  <th className="px-2 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Output $/M tokens</th>
                  <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Features</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filterModelsByProvider('xAI').map((model) => (
                  <tr key={model.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-blue-600 dark:text-blue-400">{model.id}</td>
                    <td className="px-4 py-3 text-sm">{formatContextWindow(model.context_length)}</td>
                    <td className="px-4 py-3 text-sm">{formatMaxOutput(model.max_output_tokens)}</td>
                    <td className="px-4 py-3 text-sm">{formatDiscountedPrice(model.pricing?.input_tokens_cost_per_million)}</td>
                    <td className="px-4 py-3 text-sm">{formatDiscountedPrice(model.pricing?.output_tokens_cost_per_million)}</td>
                    <td className="px-4 py-3 text-sm">{getFeatureIcons(model.capabilities)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tab>

        <Tab value="Meta">
          <h3 className="text-xl font-semibold mb-4">Meta Llama Models</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Model ID</th>
                  <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Context Window</th>
                  <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Max Output</th>
                  <th className="px-2 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Input $/M tokens</th>
                  <th className="px-2 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Output $/M tokens</th>
                  <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Features</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filterModelsByProvider('Meta').map((model) => (
                  <tr key={model.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-blue-600 dark:text-blue-400">{model.id}</td>
                    <td className="px-4 py-3 text-sm">{formatContextWindow(model.context_length)}</td>
                    <td className="px-4 py-3 text-sm">{formatMaxOutput(model.max_output_tokens)}</td>
                    <td className="px-4 py-3 text-sm">{formatDiscountedPrice(model.pricing?.input_tokens_cost_per_million)}</td>
                    <td className="px-4 py-3 text-sm">{formatDiscountedPrice(model.pricing?.output_tokens_cost_per_million)}</td>
                    <td className="px-4 py-3 text-sm">{getFeatureIcons(model.capabilities)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tab>

        <Tab value="Other">
          <h3 className="text-xl font-semibold mb-4">Other Models (Mistral, Alibaba, etc.)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Model ID</th>
                  <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Provider</th>
                  <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Context Window</th>
                  <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Max Output</th>
                  <th className="px-2 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Input $/M tokens</th>
                  <th className="px-2 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Output $/M tokens</th>
                  <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Features</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {chatModels.filter(m => {
                  const owner = m.owned_by.toLowerCase();
                  return owner.includes('mistral') || owner.includes('alibaba') ||
                         (!owner.includes('openai') && !owner.includes('azure') &&
                          !owner.includes('anthropic') && !owner.includes('google') &&
                          !owner.includes('meta') && !owner.includes('xai'));
                }).map((model) => (
                  <tr key={model.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-3 py-4 text-sm font-mono text-blue-600 dark:text-blue-400">{model.id}</td>
                    <td className="px-3 py-4 text-sm">{model.owned_by}</td>
                    <td className="px-3 py-4 text-sm text-center">{formatContextWindow(model.context_length)}</td>
                    <td className="px-3 py-4 text-sm text-center">{formatMaxOutput(model.max_output_tokens)}</td>
                    <td className="px-2 py-4 text-sm w-28">{formatDiscountedPrice(model.pricing?.input_tokens_cost_per_million)}</td>
                    <td className="px-2 py-4 text-sm w-28">{formatDiscountedPrice(model.pricing?.output_tokens_cost_per_million)}</td>
                    <td className="px-3 py-4 text-sm text-center">{getFeatureIcons(model.capabilities)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tab>

        <Tab value="Embedding">
          <h3 className="text-xl font-semibold mb-4">Embedding Models</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Model ID</th>
                  <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Provider</th>
                  <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Context</th>
                  <th className="px-2 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Input $/M tokens</th>
                  <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Features</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {embeddingModels.map((model) => (
                  <tr key={model.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-3 py-4 text-sm font-mono text-blue-600 dark:text-blue-400">{model.id}</td>
                    <td className="px-3 py-4 text-sm">{model.owned_by}</td>
                    <td className="px-3 py-4 text-sm text-center">{formatContextWindow(model.context_length)}</td>
                    <td className="px-2 py-4 text-sm w-28">{formatDiscountedPrice(model.pricing?.input_tokens_cost_per_million)}</td>
                    <td className="px-3 py-4 text-sm text-center">{getFeatureIcons(model.capabilities)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}