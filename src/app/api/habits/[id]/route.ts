//delete

import {NextResponse} from "next/server";
import {prisma} from "../../../../../lib/prisma";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });


    await prisma.habit.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
}
