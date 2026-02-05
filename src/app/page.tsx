"use client";
import React, { useEffect, useState } from 'react';


type Habit = { id: number; name: string; completedToday: boolean; week: number[] };


export default function HabitsPage() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [name, setName] = useState('');


    async function fetchHabits() {
        const res = await fetch('/api/habits');
        setHabits(await res.json());
    }


    useEffect(() => { fetchHabits(); }, []);


    async function createHabit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;
        await fetch('/api/habits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
        setName('');
        fetchHabits();
    }


    async function toggleComplete(id: number) {
        await fetch(`/api/habits/${id}/complete`, { method: 'PATCH' });
        fetchHabits();
    }


    async function deleteHabit(id: number) {
        await fetch(`/api/habits/${id}`, { method: 'DELETE' });
        fetchHabits();
    }


    return (
        <main style={{ padding: 24 }}>
            <h1>Mini Habit Tracker</h1>
            <form onSubmit={createHabit}>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="New habit" />
                <button type="submit">Add</button>
            </form>
            <ul>
                {habits.map(h => (
                    <li key={h.id}>
                        <strong>{h.name}</strong>
                        <button onClick={() => toggleComplete(h.id)}>{h.completedToday ? 'Undo' : 'Complete'}</button>
                        <button onClick={() => deleteHabit(h.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </main>
    );
}
