import { useSignUp } from '@clerk/nextjs'
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
import { json } from 'stream/consumers'


function Signup() {

    const {isLoaded, signUp, setActive} = useSignUp()
    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState("");

    const router = useRouter()

    async function submit(e : React.FormEvent){
      e.preventDefault();
      
      if(!isLoaded){
        return;
      }

      try {
        await signUp.create({
          emailAddress,
          password
        })

        await signUp.prepareEmailAddressVerification({
          strategy : "email_code"
        })

        setPendingVerification(true)

      } catch (error : any) {
        console.log(JSON.stringify(error, null, 2));
        setError(error.errors[0])
      }

    }

    async function onPressVerify(e : React.FormEvent) {
      e.preventDefault()
      if(!isLoaded) {
        return
      }

      try {
        const completeSigUp = await signUp.attemptEmailAddressVerification({code})

        if(completeSigUp.status !== "complete"){
          console.log(JSON.stringify(completeSigUp, null, 2));
          setError("Email verification fail")
        }

        if(completeSigUp.status === "complete") {
          await setActive({session : completeSigUp.createdSessionId})
          router.push("/dashboard")
        }

      } catch (error : any) {
        console.log(JSON.stringify(error, null, 2));
        setError(error.errors[0])
      }

    }
}

export default Signup