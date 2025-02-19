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

    useEffect(() => {
        fetchTodos(1)
    }, [])

    

  return (
    <div>Dashboard</div>
  )
}

export default Dashboard