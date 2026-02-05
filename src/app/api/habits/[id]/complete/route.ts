//patch

import {NextResponse} from "next/server";
import {prisma} from "../../../../../../lib/prisma";

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });


    const habit = await prisma.habit.findUnique({ where: { id } });
    if (!habit) return NextResponse.json({ error: 'Not found' }, { status: 404 });


    const today = new Date().getDay();
    const week = Array.isArray(habit.week) ? habit.week : JSON.parse(String(habit.week));
    week[today] = week[today] === 1 ? 0 : 1;


    const updated = await prisma.habit.update({
        where: { id },
        data: { week, completedToday: week[today] === 1 }
    });


    return NextResponse.json(updated);
}
