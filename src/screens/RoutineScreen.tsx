
import React from 'react';






import { RoutinePlanner } from '../RoutinePlanner';









import { useWorkoutUI } from '../ui/WorkoutContext';

export function RoutineScreen(){ const { data, setTab, items, setGuide, session, routine, saveTemplate, resetTemplate, chooseRoutine, openExternal } = useWorkoutUI(); return (<RoutinePlanner
                preferences={data.preferences}
                history={data.history}
                routine={session?.routine ?? routine}
                today={items}
                session={session}
                onChoose={chooseRoutine}
                onGuide={setGuide}
                onToday={() => setTab('today')}
                onHistory={() => setTab('history')}
                onSaveTemplate={saveTemplate}
                onResetTemplate={resetTemplate}
                onSource={() =>
                  openExternal(
                    'https://acsm.org/effective-resistance-training-program-infographic/',
                  )
                }
              />); }

