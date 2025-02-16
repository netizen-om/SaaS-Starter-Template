import { Webhook } from "svix"
import { headers } from "next/headers"
import { WebhookEvent } from "@clerk/clerk-sdk-node"
// import { Prisma } from "@prisma/client"
import prisma from "@/lib/prisma"
import { error } from "console"

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

    if(!WEBHOOK_SECRET) {
        throw new Error("Please add webhook secret")
    }
    
    const headerPayload = await headers()
    const svix_id = headerPayload.get("svix-id")
    const svix_timestamp = headerPayload.get("svix-timestamp")
    const svix_signature = headerPayload.get("svix-signature")
    
    if(!svix_id || !svix_signature || !svix_timestamp) {
        return new Response("Error occured - No Svix Headers")
    }
    
    const playload = await req.json()
    const body = JSON.stringify(playload)

    const wh = new Webhook(WEBHOOK_SECRET);

    //creating event of type Webhook-Event
    let evt:WebhookEvent;

    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent
    } catch (error) {
        console.error("Error verifying webhook" , error);
        return new Response("Error occured", { status : 400 })
    }

    const { id } = evt.data
    const eventType = evt.type

    //logs
    if(eventType === "user.created") {
        try {
            const { email_addresses, primary_email_address_id } = evt.data
            console.log(email_addresses);
            console.log(primary_email_address_id);

            const primaryEmail = email_addresses.find(
                (email) => email.id === primary_email_address_id
            )

            if(!primaryEmail) {
                return new Response("No primary email found", { status : 400 })
            }
            
            //create user in DB
            const newUser = await prisma.user.create({
                data : {
                    id : evt.data.id,
                    email : primaryEmail.email_address,
                    isSubscribed : false
                }
            })
            console.log("New user created", newUser);
            
        } catch (error) {
            return new Response("Error creating user in DB", { status : 400 })
        }

    } 

    return new Response("Webhook received successfully", { status : 200 })

}