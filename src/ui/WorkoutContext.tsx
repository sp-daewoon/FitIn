import { createContext, useContext } from 'react';
import type { useWorkoutController } from './useWorkoutController';
const Context = createContext<ReturnType<typeof useWorkoutController> | null>(null);
export const WorkoutUIProvider = Context.Provider;
export function useWorkoutUI() {
  const value = useContext(Context);
  if (!value) throw new Error('Workout provider missing');
  return value;
}
