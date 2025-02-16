import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req : NextRequest,
    {params} : {params: {id: string}}
) {
    const { userId } = await auth()

    if(!userId) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }

    try {
        const todoId = params.id

        const todo = await prisma.todo.findUnique({
            where: {
                id: todoId
            }
        })

        if(!todo) {
            return NextResponse.json({error: "Todo not found"}, {status: 404})
        }

        if(todo.userId !== userId) {
            return NextResponse.json({error: "Forbidden"}, {status: 401})
        }

        const deletedTodo = await prisma.todo.delete({
            where: {
                id: todoId
            }
        })

        return NextResponse.json({ message : "Todo Deleted successfuly" }, { status: 200})

    } catch (error) {
        console.log("Error deleting Todos" + error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500})
    }

}