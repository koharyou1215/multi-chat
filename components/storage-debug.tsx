"use client";

import { useState, useEffect } from "react";
import { useChatStore } from "@/store/chat-store";

export function StorageDebug() {
  const [storageData, setStorageData] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(true); // Always show for debugging

  // Get current store state
  const store = useChatStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('multi-chat-store');
        if (stored) {
          setStorageData(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to read localStorage:', error);
      }
    }
  }, []);

  const refreshStorage = () => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('multi-chat-store');
        setStorageData(stored ? JSON.parse(stored) : null);
      } catch (error) {
        console.error('Failed to read localStorage:', error);
      }
    }
  };

  const setTestApiKey = () => {
    const testKey = prompt('Enter your OpenRouter API key (sk-or-v1-...):');
    if (testKey && testKey.startsWith('sk-or-')) {
      store.setApiKey('openrouter', testKey);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const resetPrompts = () => {
    if (confirm('プロンプトライブラリをデフォルトにリセットしますか？')) {
      store.resetPrompts();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed top-4 right-4 z-50 px-3 py-1 bg-blue-600 text-white text-xs rounded"
        title="Show Storage Debug"
      >
        🐛 Debug
      </button>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-h-96 overflow-auto bg-gray-900 text-white text-xs p-4 rounded border">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Storage Debug</h3>
        <div className="flex gap-2">
          <button
            onClick={refreshStorage}
            className="px-2 py-1 bg-green-600 rounded"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowDebug(false)}
            className="px-2 py-1 bg-red-600 rounded"
          >
            ×
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <strong className="text-yellow-400">🔑 API Key Status:</strong>
          <div className="bg-gray-800 p-2 rounded mt-1">
            <div className="text-red-400">Store API Key: {store.openRouterApiKey || 'NOT SET'}</div>
            <div className="text-orange-400">Settings API Key: {store.settings?.apiKeys?.openRouter || 'NOT SET'}</div>
            <div className="text-green-400">Storage API Key: {storageData?.state?.openRouterApiKey || 'NOT SET'}</div>
            <button
              onClick={setTestApiKey}
              className="mt-2 px-3 py-1 bg-blue-600 rounded hover:bg-blue-700"
            >
              Set API Key
            </button>
          </div>
        </div>

        <div>
          <strong>Current Store State:</strong>
          <div className="bg-gray-800 p-2 rounded mt-1">
            <div>Panel Count: {store.panels.length}</div>
            <div>Active Panels: {store.activePanels}</div>
            <div className="text-yellow-400">
              Custom Prompts: {store.customPrompts?.length || 0}
              <button
                onClick={resetPrompts}
                className="ml-2 px-2 py-0.5 bg-yellow-600 rounded text-xs hover:bg-yellow-700"
              >
                Reset Prompts
              </button>
            </div>
            <div>Models: {JSON.stringify(store.panels.map(p => ({ id: p.id, modelId: p.modelId })), null, 2)}</div>
          </div>
        </div>

        <div>
          <strong>LocalStorage Data:</strong>
          <div className="bg-gray-800 p-2 rounded mt-1">
            {storageData ? (
              <div>
                <div>Stored Panel Count: {storageData.state?.panels?.length || 0}</div>
                <div className="text-yellow-400">Stored Custom Prompts: {storageData.state?.customPrompts?.length || 0}</div>
                <div>Storage Keys: {storageData.state?.settings?.apiKeys ? JSON.stringify(storageData.state.settings.apiKeys, null, 2) : 'None'}</div>
              </div>
            ) : (
              <div>No storage data found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}