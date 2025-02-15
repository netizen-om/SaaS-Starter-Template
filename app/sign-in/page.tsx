"use client"
import { SignIn, useSignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"


function signIn() {

    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const {isLoaded, signIn, setActive } = useSignIn()
    const router = useRouter()

    if(!isLoaded) {
        return null
    }

    const submit = async(e : React.FormEvent) => {
        e.preventDefault()
        if (!isLoaded) {
            return;
        }

        try {
            const result = await signIn.create({
                identifier : emailAddress, password
            })  

            if(result.status === "complete") {
                await setActive({session : result.createdSessionId})
                router.push("/dashboard")
            } else {
                console.log(JSON.stringify(result, null, 2));
            }
        } catch (error : any) {
            setError(error.errors[0].message)
            console.error("Error : " + error)

        }
    }

  return (
    <div>signIn</div>
  )
}

export default signIn