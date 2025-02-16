import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req : NextRequest) {
    const { userId } = await auth()

    if(!userId) {
        return NextResponse.json({error : "Unauthorized"}, { status : 401 })
    }
    
    //capture payment
    
    try {
        const user = await prisma.user.findUnique({where : {id: userId}})

        if(!user){
            return NextResponse.json({error : "User not found"}, { status : 404 })
        }

        const subscriptionEnds = new Date()
        subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1)

        const updatedUser = await prisma.user.update({
            where: {id: userId},
            data : {
                isSubscribed : true,
                subscriptionEnds : subscriptionEnds
            }
        })

        return NextResponse.json({
            message: "subscription successfully granted",
            subscriptionEnds : updatedUser.subscriptionEnds
            },
            { status : 200 }
        )

    } catch (error) {
        console.error("Error updating subscription : " + error);
        return NextResponse.json({ error : "Internal server error"}, { status : 500 })
    }
}

export async function GET(req : NextRequest) {
    const { userId } = await auth()

    if(!userId) {
        return NextResponse.json({error : "Unauthorized"}, { status : 401 })
    }

    try {
        const user = await prisma.user.findUnique(
            {
                where : {id: userId},
                select : {
                    isSubscribed : true,
                    subscriptionEnds : true
                }
            },
        )

        if(!user){
            return NextResponse.json({error : "User not found"}, { status : 404 })
        }

        const now = new Date()

        if(user.subscriptionEnds && user.subscriptionEnds < now) {
            await prisma.user.update({
                where : { id : userId},
                data : {
                    isSubscribed : false,
                    subscriptionEnds : null
                }
            })
            return NextResponse.json( 
                { 
                    isSubscribed : false,
                    subscriptionEnds : null
                } 
            )
        }

        return NextResponse.json(
            {
                isSubscribed : user.isSubscribed,
                subscriptionEnds : user.subscriptionEnds
            }
        )

    } catch (error) {
        console.error("Error geting subscription status : " + error);
        return NextResponse.json({ error : "Internal server error"}, { status : 500 })
    }
}