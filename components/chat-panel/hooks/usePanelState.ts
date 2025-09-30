import { useCallback, useMemo } from 'react';
import { useAppStore } from '@/store/use-app-store';
import type { ChatPanel } from '@/types';

export function usePanelState(panelId: string) {
  const {
    panels,
    selectedPanelId,
    multiSendIds,
    setSelectedPanel,
    toggleMultiSendPanel,
    updatePanel,
    initializePanels,
  } = useAppStore();

  // Get current panel with null safety
  const panel = useMemo(() => {
    const foundPanel = panels.find(p => p.id === panelId);
    if (!foundPanel) {
      console.error(`Panel ${panelId} not found in store. Available panels:`, panels.map(p => p.id));
      // Initialize panels if none exist
      if (panels.length === 0) {
        console.warn('No panels exist, triggering initialization...');
        initializePanels(2);
      }
      // Return a default panel structure to prevent crash
      return {
        id: panelId,
        modelId: 'google/gemini-2.5-flash-preview-09-2025',
        messages: [],
        isLoading: false,
        error: `Panel ${panelId} initialization error`
      } as ChatPanel;
    }
    return foundPanel;
  }, [panels, panelId, initializePanels]);

  // Selection states
  const isSelected = selectedPanelId === panelId;
  const isMultiSend = multiSendIds.includes(panelId);

  // Panel number for styling
  const panelNumber = useMemo(
    () => panelId.split('-')[1],
    [panelId]
  );

  // Actions
  const selectPanel = useCallback(() => {
    setSelectedPanel(panelId);
  }, [panelId, setSelectedPanel]);

  const toggleMultiSend = useCallback(() => {
    toggleMultiSendPanel(panelId);
  }, [panelId, toggleMultiSendPanel]);

  const setLoading = useCallback((loading: boolean) => {
    updatePanel(panelId, { isLoading: loading });
  }, [panelId, updatePanel]);

  const setError = useCallback((error: string | undefined) => {
    updatePanel(panelId, { error });
  }, [panelId, updatePanel]);

  const setStreamingMessage = useCallback((message: string | undefined) => {
    updatePanel(panelId, { streamingMessage: message });
  }, [panelId, updatePanel]);

  return {
    panel,
    isSelected,
    isMultiSend,
    panelNumber,
    selectPanel,
    toggleMultiSend,
    setLoading,
    setError,
    setStreamingMessage,
  };
}