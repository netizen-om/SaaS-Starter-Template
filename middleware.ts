import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { clerkClient } from '@clerk/clerk-sdk-node';

const publicRoute = createRouteMatcher([
  "/",
  "/api/webhooks/register",
  "/sign-in",
  "/sign-up",
])

export default clerkMiddleware(async(auth, req) => {
  const { userId } = await auth()
  //handel unauthorised user to visit protected routes
  if(!userId && !publicRoute(req)) {
    return NextResponse.redirect(new URL("/sign-in", req.url))
  }
  
  if(userId) {
    try {
      const user = await clerkClient.users.getUser(userId)
      const role = user.publicMetadata.role as string | undefined
  
      //admin role redirection
      if(role === "admin" && req.nextUrl.pathname === "/dashboard"){
        return NextResponse.redirect(new URL("/admin/dashboard", req.url))
      }
      
      //prevent non-admin user to access admin routes
      if(role !== "admin" && req.nextUrl.pathname.startsWith("/admin")){
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
      
      //redirect authenticated user trying to access sign up/in routes
      if(userId && publicRoute(req)) {
        return NextResponse.redirect(
          new URL(
            role === "admin" ? "/admin/dashboard" : "/dashboard",
            req.url
          )
        )
      }
    } catch (error : any) {
      console.error(error)
      return NextResponse.redirect(new URL("/error", req.url))
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}