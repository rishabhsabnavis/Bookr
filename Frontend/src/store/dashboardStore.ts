import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Call, HoldStatus } from '../types/calls';
import { callsClient } from '../lib/callsClient';

interface DashboardState {
  calls: Call[];
  holdState: Record<string, HoldStatus>;
  activeView: 'overview' | 'calls' | 'watch';
  openId: string | null;
  loadCalls: () => Promise<void>;
  decideHold: (id: string, decision: 'approve' | 'pass') => Promise<void>;
  setView: (view: DashboardState['activeView']) => void;
  setOpenId: (id: string | null) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      calls: [],
      holdState: {},
      activeView: 'overview',
      openId: null,

      loadCalls: async () => {
        const calls = await callsClient.listCalls();
        const holdState: Record<string, HoldStatus> = {};
        for (const c of calls) {
          if (c.outcome === 'hold' || c.outcome === 'booked') {
            holdState[c.id] =
              c.holdApproved === true ? 'booked'
              : c.holdApproved === false ? 'declined'
              : 'pending';
          }
        }
        set({ calls, holdState });
      },

      decideHold: async (id, decision) => {
        await callsClient.decideHold(id, decision);
        set((state: DashboardState) => ({
          holdState: {
            ...state.holdState,
            [id]: decision === 'approve' ? 'booked' : 'declined',
          },
          calls: state.calls.map((c: Call) =>
            c.id === id
              ? { ...c, outcome: decision === 'approve' ? 'booked' as const : 'declined' as const, holdApproved: decision === 'approve' }
              : c
          ),
        }));
      },

      setView: (view) => set({ activeView: view }),
      setOpenId: (id) => set({ openId: id }),
    }),
    {
      name: 'bookr.dash',
      storage: createJSONStorage(() => localStorage),
      partialize: (state: DashboardState) => ({
        holdState: state.holdState,
        activeView: state.activeView,
      }),
    }
  )
);
