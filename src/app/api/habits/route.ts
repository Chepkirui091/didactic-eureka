import { NextResponse } from 'next/server';
import {prisma} from "../../../../lib/prisma";


export async function GET() {
    const habits = await prisma.habit.findMany({ orderBy: { id: 'asc' } });
    return NextResponse.json(habits);
}

export async function POST(req: Request) {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });


    const newHabit = await prisma.habit.create({
        data: { name, completedToday: false, week: [0,0,0,0,0,0,0] }
    });


    return NextResponse.json(newHabit, { status: 201 });
}
