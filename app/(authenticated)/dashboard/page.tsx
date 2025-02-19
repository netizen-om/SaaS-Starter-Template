"use client"

import { useUser } from '@clerk/nextjs'
import { Todo } from '@prisma/client'
import React, { useCallback, useEffect, useState } from 'react'
import { useDebounceValue } from "usehooks-ts"

async function Dashboard() {

    const {user} =  await useUser()
    const [todos, setTodos] = useState<Todo[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(false)
    const [totalPages, setTotalPages] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [isSubscribed, setIsSubscribed] = useState(false)

    const [debounceSearchTerm] = useDebounceValue(searchTerm,300)

    const fetchTodos = useCallback(async (page:number) => {
        try {
            setLoading(true)
            const response = await fetch(`/api/todos?page=${page}&search=${debounceSearchTerm}`)

            if(!response.ok){
                throw new Error("An error occurred while fetching the data")
            }

            const data = await response.json()
            setTodos(data.todos)
            setTotalPages(data.totalItems)
            setCurrentPage(data.currentPage)
            setTotalItems(data.totalItems)

            setLoading(false)

        } catch (error) {
            setLoading(false)
            throw new Error("An error occurred while fetching the data")
        }
    }, [debounceSearchTerm])

    const fetchSubscriptionStatus = async() => {
        const response = await fetch("/api/subscription")
        if(!response.ok) {
            throw new Error("An error occurred while fetching subscription data")
        }
        const data = await response.json()
        setIsSubscribed(data.isSubscribed)
    }

    const handleAddTodo = async(title:string) => {
        try {
            const response = await fetch("/api/todos", {
                method : "POST",
                headers : { "Content-Type" : "application/json" },
                body : JSON.stringify({ title }) 
            } )
    
            if(!response.ok) {
                throw new Error("An error occurred while adding todo")
            }
    
            await fetchTodos(currentPage)
        } catch (error) {
            throw new Error("An error occurred while adding todo")
        }
    }

    const handleUpadteTodo = async(id:string, completed:boolean) => {
        try {
            const response = await fetch(`/api/todos/${id}`, {
                method :  "PUT",
                headers : { "Content-Type" : "application/json" },
                body : JSON.stringify( { completed } )
            })

            if(!response.ok) {
                throw new Error("An error occurred while updating todo")
            }

            await fetchTodos(currentPage)

        } catch (error) {
            throw new Error("An error occurred while updating todo")
        }
    }

    const handeldeleteTodo = async(id:string) => {
        try {
            const response = await fetch(`/api/todos/${id}`, {
                method : "DELETE"
            })

            if(!response.ok) {
                throw new Error("An error occurred while deleting todo")
            }
            
            await fetchTodos(currentPage)
            
        } catch (error) {
            throw new Error("An error occurred while deleting todo")
        }
    }

    useEffect(() => {
        fetchTodos(1)
        fetchSubscriptionStatus()
    }, [])



  return (
    <div>Dashboard</div>
  )
}

export default Dashboard