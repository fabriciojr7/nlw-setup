import { useEffect, useState } from 'react';
import * as CheckBox from '@radix-ui/react-checkbox';
import { Check } from 'phosphor-react';

import { api } from '../lib/axios';
import dayjs from 'dayjs';

interface HabitListProps {
    date: Date;
    onCompletedChange: (completed: number) => void
}

interface HabitsInfo {
    possibleHabits: Array<{
        id: string;
        title: string;
        created_at: string;
    }>,
    completedHabits: string[]
}

export function HabitList({date, onCompletedChange} : HabitListProps){
    const [habitInfo, setHabitInfo] = useState<HabitsInfo>()

    useEffect(() => {
        api.get('/day', {
            params: {
                date: date.toISOString()
            }    
        }).then(response => {
            setHabitInfo(response.data)
        })
    }, []);

    async function handleToggleHabit(habitId: string){
        await api.patch(`/habits/${habitId}/toggle`)

        const isHabitAlreadyCompleted = habitInfo!.completedHabits.includes(habitId)

        let completedHabits : string[] = []
        
        if(isHabitAlreadyCompleted){
            completedHabits = habitInfo!.completedHabits.filter(id => id !== habitId)
        }else{
            completedHabits = [...habitInfo!.completedHabits, habitId]
        }

        setHabitInfo({
            possibleHabits: habitInfo!.possibleHabits,
            completedHabits
        })

        onCompletedChange(completedHabits.length)
    }

    const isDayInPast = dayjs(date).endOf('day').isBefore(new Date())

    return (
        <div className='mt-6 flex flex-col gap-3'>
            {habitInfo?.possibleHabits.map(habit => {
                return(
                    <CheckBox.Root 
                    key={habit.id}
                    onCheckedChange={() => handleToggleHabit(habit.id)}
                    checked={habitInfo.completedHabits.includes(habit.id)}
                    disabled={isDayInPast}  
                    className='flex items-center gap-3 group focus:outline-none disabled:cursor-not-allowed'
                    >
                        <div 
                            className='h-8 w-8 rounded-lg flex items-center justify-center bg-zinc-900 border-2 border-zinc-800 group-data-[state=checked]:bg-green-500 group-data-[state=checked]:border-green-500 transition-colors group-focus:ring-2 group-focus:ring-violet-600 group-focus:ring-offset-2 group-focus:ring-offset-background'
                        >
                            <CheckBox.Indicator>
                                <Check size={20} className='text-white'/>
                            </CheckBox.Indicator>
                        </div>
                        
        
                        <span className='font-semibold text-xl text-white leading-tight group-data-[state=checked]:line-through group-data-[state=checked]:text-zinc-400'>
                            {habit.title}
                        </span>
                    </CheckBox.Root>
                )
            })}

        </div>
    )
}