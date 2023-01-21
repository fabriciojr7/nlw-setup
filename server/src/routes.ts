import dayjs from 'dayjs'
import {FastifyInstance} from 'fastify'
import {z} from 'zod'
import { prisma } from "./lib/prisma"

export async function appRoutes(app: FastifyInstance){
    app.post('/habits' , async (request) =>{
        const createHabitBody = z.object({
            title: z.string(),
            weekDays: z.array(
                z.number().min(0).max(6)
            )
        })
        const {title, weekDays} = createHabitBody.parse(request.body)

        const today = dayjs().startOf('day').toDate()

        await prisma.habit.create({
            data:{
                title,
                created_at: today,
                weekDays: {
                    create: weekDays.map(week => {
                        return {
                            week_day: week
                        }
                    })
                }
            }
        })
    }) 

    app.get('/day', async (request) => {
        const getDayParams = z.object({
            date: z.coerce.date()
        })

        const {date} = getDayParams.parse(request.query)

        const parsedDate = dayjs(date).startOf('day')
        const weekDay = parsedDate.get('day')

        const possibleHabits = await prisma.habit.findMany({
            where: {
                created_at: {
                    lte: date
                },
                weekDays: {
                    some: {
                        week_day: weekDay
                    }
                }
            }
        })

        const day = await prisma.day.findUnique({
            where:{
                date : parsedDate.toDate()
            },
            include: {
                dayHabits: true
            }
        })

        const completedHabits = day?.dayHabits.map(dayHabit => {
            return dayHabit.habit_id
        }) ?? [];

        return {possibleHabits, completedHabits}
    })

    app.patch('/habits/:id/toggle', async (request) => {
        const toggleHabitParams = z.object({
            id: z.string().uuid()
        })

        const {id} = toggleHabitParams.parse(request.params)

        const today = dayjs().startOf('day').toDate()

        let day = await prisma.day.findUnique({
            where:{
                date: today
            }
        })

        if(!day){
            day = await prisma.day.create({
                data: {
                    date: today
                }
            })
        }

        const dayHabit = await prisma.dayHabit.findUnique({
            where: {
                day_id_habit_id:{
                    day_id: day.id,
                    habit_id: id
                }
            }
        })

        if(dayHabit){
            await prisma.dayHabit.delete({
                where: {
                    id: dayHabit.id
                }
            })
        }else{
            await prisma.dayHabit.create({
                data: {
                    day_id: day.id,
                    habit_id: id,
                }
            })
        }


    })

    app.get('/summary', async (request) => {
        const summary = await prisma.$queryRaw`
            select 
                D.id, 
                D.date,
                (
                    select 
                        cast(count(*) as float)
                    from day_habits DH
                    where DH.day_id = D.id
                ) as completed,
                (
                    select 
                        cast(count(*) as float)
                    from habit_week_days HWD
                    join habits H on H.id = HWD.habit_id
                    where
                        HWD.week_day = cast(strftime('%w', D.date/1000.0, 'unixepoch') as int)
                        and H.created_at <= D.date
                ) as amount
            from days D
        `

        return summary
    })
}