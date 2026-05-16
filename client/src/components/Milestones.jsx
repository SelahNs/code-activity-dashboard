// src/components/Milestones.jsx
import { useEffect, useState } from 'react'
import { FiAward, FiZap, FiCode, FiTrendingUp } from 'react-icons/fi'
import { apiClient } from '../lib/api'
import useUserStore from '../stores/useUserStore'

const MilestoneItem = ({ icon, title, value, subtitle }) => (
    <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-lg">
            {icon}
        </div>
        <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{title}</p>
            <p className="font-semibold text-slate-700 dark:text-slate-200">{value}</p>
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
    </div>
)

const formatDuration = (ms) => {
    const seconds = ms / 1000
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
}

export default function Milestones() {
    const [bests, setBests] = useState(null)
    const { userData } = useUserStore()

    useEffect(() => {
        apiClient.getBests()
            .then(data => setBests(data))
            .catch(e => console.error('Failed to fetch bests:', e))
    }, [])

    const stats = userData?.stats

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                    Personal Bests
                </h3>
            </div>
            <div className="p-6 space-y-5">
                <MilestoneItem
                    icon={<FiAward className="w-5 h-5 text-amber-500" />}
                    title="Most Productive Day"
                    value={bests?.mostProductiveDay
                        ? new Date(bests.mostProductiveDay._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'
                    }
                    subtitle={bests?.mostProductiveDay
                        ? `${bests.mostProductiveDay.totalLines.toLocaleString()} lines added`
                        : null
                    }
                />
                <MilestoneItem
                    icon={<FiZap className="w-5 h-5 text-blue-500" />}
                    title="Longest Session"
                    value={bests?.longestSession
                        ? formatDuration(bests.longestSession.duration)
                        : '—'
                    }
                    subtitle={bests?.longestSession
                        ? new Date(bests.longestSession.capturedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : null
                    }
                />
                <MilestoneItem
                    icon={<FiTrendingUp className="w-5 h-5 text-emerald-500" />}
                    title="Longest Streak"
                    value={stats?.longestStreak ? `${stats.longestStreak} days` : '—'}
                    subtitle="consecutive coding days"
                />
                <MilestoneItem
                    icon={<FiCode className="w-5 h-5 text-purple-500" />}
                    title="Total Lines Added"
                    value={stats?.totalLinesAdded
                        ? stats.totalLinesAdded.toLocaleString()
                        : '—'
                    }
                    subtitle="all time"
                />
            </div>
        </div>
    )
}