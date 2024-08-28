import type { Task, TaskQueryActions } from '~/types';

interface CustomEventMap {
  projectChange: CustomEvent<string>;
  taskChange: CustomEvent<{ taskId: string; direction: number; projectId: string }>;
  taskCardClick: CustomEvent<{ taskId: string; clickTarget: HTMLElement }>;
  toggleCard: CustomEvent<string>;
  toggleTaskEditing: CustomEvent<{ state: boolean; id: string }>;
  toggleSelectTask: CustomEvent<{ selected: boolean; taskId: string }>;
  openTaskCardPreview: CustomEvent<string>;
  searchDropDownClose: Event;
  updateUserCover: CustomEvent<string>;
  updateOrganizationCover: CustomEvent<string>;
  updateWorkspaceCover: CustomEvent<string>;

  taskTableCRUD: CustomEvent<{
    array: Task[] | { id: string }[];
    action: TaskQueryActions;
  }>;
  taskCRUD: CustomEvent<{
    array: Task[] | { id: string }[];
    action: TaskQueryActions;
  }>;
}

type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;

declare global {
  interface WindowEventMap extends CustomEventMap {}
}

type CustomEventsWithData = {
  [K in keyof CustomEventMap as CustomEventMap[K] extends CustomEvent<infer DetailData>
    ? IfAny<DetailData, never, K>
    : never]: CustomEventMap[K] extends CustomEvent<infer DetailData> ? DetailData : never;
};

export function dispatchCustomEvent(eventName: Exclude<keyof CustomEventMap, keyof CustomEventsWithData>): void;
export function dispatchCustomEvent<EventName extends keyof CustomEventsWithData>(
  eventName: EventName,
  eventData: CustomEventsWithData[EventName],
): void;
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function dispatchCustomEvent(eventName: string, eventData?: any): void {
  window.dispatchEvent(new CustomEvent(eventName, { detail: eventData }));
}
