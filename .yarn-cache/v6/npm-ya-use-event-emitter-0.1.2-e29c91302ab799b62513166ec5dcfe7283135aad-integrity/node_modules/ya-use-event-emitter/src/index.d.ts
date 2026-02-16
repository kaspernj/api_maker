declare interface EventEmitterLike {
  addListener(event: string, listener: (...args: unknown[]) => void): void
  removeListener(event: string, listener: (...args: unknown[]) => void): void
}

export default function useEventEmitter(
  events: EventEmitterLike | null | undefined,
  event: string,
  onCalled: (...args: unknown[]) => void
): void
