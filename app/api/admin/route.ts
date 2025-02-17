import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

async function isAdmin(userId : any) {
    await clerkClient.users.getUser(userId)
    return userId.privateMetadata.role === "admin"
}

