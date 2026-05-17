// src/components/DeveloperSummary.jsx
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiZap } from 'react-icons/fi'

// ================================================================
// DATA HELPERS
// ================================================================

const getTopEntries = (map, limit = 3) => {
    if (!map || typeof map !== 'object') return []
    return Object.entries(map)
        .filter(([k, v]) => k && k !== 'undefined' && v > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([name]) => name)
}

const getTopEntry = (map) => getTopEntries(map, 1)[0] || null

const getLanguageBreakdown = (githubLanguages) => {
    if (!githubLanguages || typeof githubLanguages !== 'object') return null
    const entries = Object.entries(githubLanguages).filter(([_, v]) => v > 0)
    if (entries.length === 0) return null
    const total = entries.reduce((s, [_, v]) => s + v, 0)
    const sorted = entries.sort((a, b) => b[1] - a[1])
    return sorted.map(([lang, bytes]) => ({
        language: lang,
        percent: Math.round((bytes / total) * 100)
    }))
}

const getDaysSince = (dateStr) => {
    if (!dateStr) return null
    const diff = Date.now() - new Date(dateStr).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
}

const getHoursSince = (dateStr) => {
    if (!dateStr) return null
    const diff = Date.now() - new Date(dateStr).getTime()
    return Math.floor(diff / (1000 * 60 * 60))
}

const formatHours = (seconds) => {
    if (!seconds) return '0'
    const h = seconds / 3600
    if (h < 1) return `${Math.round(h * 60)} minutes`
    if (h < 10) return `${h.toFixed(1)} hours`
    return `${Math.round(h).toLocaleString()} hours`
}

const formatNumber = (n) => {
    if (!n) return '0'
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
    return n.toLocaleString()
}

const getStyleProfile = (ratio) => {
    if (ratio === null || ratio === undefined) return null
    const pct = Math.round(ratio * 100)
    if (ratio >= 0.9) return { label: 'deep typer', pct, desc: 'almost everything hand-typed', intensity: 'very high' }
    if (ratio >= 0.75) return { label: 'manual coder', pct, desc: 'mostly hand-typed with occasional shortcuts', intensity: 'high' }
    if (ratio >= 0.55) return { label: 'balanced developer', pct, desc: 'mixing manual typing with AI and autocomplete', intensity: 'balanced' }
    if (ratio >= 0.35) return { label: 'AI-augmented developer', pct, desc: 'leaning on AI and tools to accelerate output', intensity: 'augmented' }
    if (ratio >= 0.15) return { label: 'AI-first developer', pct, desc: 'AI handles most of the generation, you handle the thinking', intensity: 'ai-first' }
    return { label: 'vibe coder', pct, desc: 'fully AI-driven — you architect, AI builds', intensity: 'vibe' }
}

const getEditorLabel = (editors) => {
    const top = getTopEntries(editors, 3)
    if (top.length === 0) return null
    if (top.length === 1) return top[0]
    if (top.length === 2) return `${top[0]} and ${top[1]}`
    return `${top[0]}, ${top[1]}, and ${top[2]}`
}

const getPrimaryEditor = (editors) => getTopEntry(editors)

const getTimeOfDay = () => {
    const h = new Date().getHours()
    if (h < 12) return 'morning'
    if (h < 17) return 'afternoon'
    if (h < 21) return 'evening'
    return 'night'
}

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)]

// ================================================================
// SENTENCE BUILDERS — each returns string or null
// ================================================================

// --- Streak sentences ---
const buildStreakSentence = (currentStreak, longestStreak, lastActiveDate, hasAnyData) => {
    if (!hasAnyData) return null
    const daysSince = getDaysSince(lastActiveDate)
    const hoursSince = getHoursSince(lastActiveDate)
    const isToday = daysSince === 0
    const isYesterday = daysSince === 1

    if (currentStreak === 0 && daysSince === null) {
        return `Open your editor and write your first line — that's all it takes to start a streak.`
    }

    if (currentStreak === 0 && isToday && hoursSince !== null && hoursSince < 3) {
        return `You coded earlier today — keep going to lock in day one of a new streak.`
    }

    if (currentStreak === 0 && isToday) {
        return `You're active today but no streak yet — code again tomorrow to start building one.`
    }

    if (currentStreak === 0 && isYesterday) {
        return pickRandom([
            `Your streak ended yesterday. The best time to restart is right now.`,
            `Yesterday broke the streak. Today is a fresh start — don't let another day slip.`,
            `You were active yesterday but the streak reset. Code today and start fresh.`
        ])
    }

    if (currentStreak === 0 && daysSince !== null && daysSince <= 5) {
        return pickRandom([
            `It's been ${daysSince} days since your last session. No judgment — but your next line of code starts a new streak.`,
            `You stepped away ${daysSince} days ago. Whenever you're ready, a new streak is one session away.`,
            `${daysSince} days since your last session. Streaks are easy to restart — hard to maintain. Give it another shot.`
        ])
    }

    if (currentStreak === 0 && daysSince !== null && daysSince > 5) {
        return pickRandom([
            `It's been ${daysSince} days. Life happens. When you're back, CodeDash will be here tracking every session.`,
            `${daysSince} days away from the keyboard. Whenever you return, your history stays exactly where you left it.`
        ])
    }

    if (currentStreak === 1) {
        return pickRandom([
            `One day down. Streaks are built one session at a time.`,
            `Day one of a new streak — the hardest part is already done.`,
            `You're back. One session in, streak started.`
        ])
    }

    if (currentStreak >= 2 && currentStreak < 7) {
        if (currentStreak === longestStreak) {
            return `${currentStreak}-day streak — and this is already your personal best. You're in good form.`
        }
        return pickRandom([
            `${currentStreak} days in a row. You're building momentum.`,
            `${currentStreak}-day streak active. Consistency is underrated.`,
            `${currentStreak} consecutive days — keep the rhythm going.`
        ])
    }

    if (currentStreak >= 7 && currentStreak < 14) {
        if (currentStreak === longestStreak) {
            return `${currentStreak}-day streak — your longest ever. A full week of consistent coding is no small thing.`
        }
        return pickRandom([
            `A full week of coding and you're still going — ${currentStreak} days straight.`,
            `${currentStreak}-day streak. Past the one-week mark, this is becoming a real habit.`
        ])
    }

    if (currentStreak >= 14 && currentStreak < 30) {
        if (currentStreak === longestStreak) {
            return `${currentStreak}-day streak — your personal best. Two weeks of daily coding is a genuine achievement.`
        }
        return `${currentStreak} days straight. At this point it's not a streak — it's a routine.`
    }

    if (currentStreak >= 30) {
        if (currentStreak === longestStreak) {
            return `${currentStreak}-day streak — your longest ever and still going. A month of daily coding is exceptional.`
        }
        return `${currentStreak} consecutive days. ${longestStreak > currentStreak
            ? `${longestStreak - currentStreak} more days to beat your record.`
            : `This is the kind of consistency that compounds.`
        }`
    }

    return null
}

// --- Activity / hours sentences ---
const buildActivitySentence = (totalSecondsCoded, hasVSCode, topEditor) => {
    if (!hasVSCode || !totalSecondsCoded) return null
    const hours = totalSecondsCoded / 3600
    const editor = topEditor || 'your editor'

    if (hours < 0.5) return `Your first session is logged in ${editor}. The tracker is running.`
    if (hours < 5) return `${formatHours(totalSecondsCoded)} of coding tracked in ${editor} so far — you're just getting started.`
    if (hours < 20) return `${formatHours(totalSecondsCoded)} logged in ${editor}. Early days, but the data is already telling a story.`
    if (hours < 50) return `${formatHours(totalSecondsCoded)} of coding tracked in ${editor}.`
    if (hours < 100) return pickRandom([
        `${formatHours(totalSecondsCoded)} tracked in ${editor}. That's real time investment.`,
        `You've put in ${formatHours(totalSecondsCoded)} in ${editor}. The hours are adding up.`
    ])
    if (hours < 500) return pickRandom([
        `${formatHours(totalSecondsCoded)} of coding in ${editor} — you're well into serious territory.`,
        `${formatHours(totalSecondsCoded)} logged across your sessions in ${editor}.`
    ])
    if (hours < 1000) return `${formatHours(totalSecondsCoded)} of tracked coding time in ${editor}. That's hundreds of hours of focused work.`
    return pickRandom([
        `${formatHours(totalSecondsCoded)} — you've crossed a thousand hours in ${editor}. That's a significant body of work.`,
        `Over ${formatHours(totalSecondsCoded)} tracked in ${editor}. At this level, the craft shows.`
    ])
}

// --- Coding style sentences ---
const buildStyleSentence = (ratio, editors) => {
    if (ratio === null || ratio === undefined) return null
    const profile = getStyleProfile(ratio)
    const editorLabel = getEditorLabel(editors)
    const primaryEditor = getPrimaryEditor(editors)
    const editorStr = editorLabel || 'your editor'
    const primaryStr = primaryEditor || 'your editor'

    switch (profile.intensity) {
        case 'very high':
            return pickRandom([
                `In ${editorStr}, ${profile.pct}% of your code is hand-typed — you're a ${profile.label} who writes every character deliberately.`,
                `Your keystroke intensity in ${primaryStr} is ${profile.pct}% — almost nothing comes from paste or AI. Pure craft.`,
                `${profile.pct}% manual input in ${editorStr}. You're the kind of developer who types everything out — and that's a distinct skill.`
            ])
        case 'high':
            return pickRandom([
                `You're a ${profile.label} — ${profile.pct}% of your code in ${editorStr} is typed manually, with light use of tools on the side.`,
                `${profile.pct}% keystroke intensity in ${primaryStr}. Mostly manual, occasionally assisted — a solid balance tilted toward craft.`,
                `In ${editorStr}, ${profile.pct}% of your characters are hand-typed. You trust your own hands more than the tools.`
            ])
        case 'balanced':
            return pickRandom([
                `You're a ${profile.label} — ${profile.pct}% manual in ${editorStr}, blending your own typing with AI and autocomplete naturally.`,
                `${profile.pct}% of your code in ${editorStr} is hand-typed. You're comfortable with both styles — adapting to what the task needs.`,
                `In ${primaryStr}, you split roughly ${profile.pct}/${100 - profile.pct} between manual typing and AI-assisted code. A flexible workflow.`
            ])
        case 'augmented':
            return pickRandom([
                `You're an ${profile.label} — ${profile.pct}% manual input in ${editorStr}, with AI doing significant heavy lifting on the rest.`,
                `${profile.pct}% of your code in ${primaryStr} is hand-typed. You're letting AI accelerate your output — and it's working.`,
                `In ${editorStr}, AI generates most of your characters while you stay in control of direction and architecture. ${profile.pct}% manual.`
            ])
        case 'ai-first':
            return pickRandom([
                `You're an ${profile.label} — only ${profile.pct}% of characters in ${editorStr} are hand-typed. AI is your primary tool, thinking is your primary skill.`,
                `${profile.pct}% manual input in ${primaryStr}. You've fully embraced AI-assisted development — high output, high leverage.`,
                `In ${editorStr}, ${100 - profile.pct}% of your code comes from AI or paste. You're a director, not a transcriber.`
            ])
        case 'vibe':
            return pickRandom([
                `You're a ${profile.label} — in ${editorStr}, almost all your code is AI-generated. You think in systems, not syntax.`,
                `${profile.pct}% manual input in ${primaryStr}. At this level, you're essentially a product architect using AI as a build layer.`,
                `In ${editorStr}, the AI writes and you direct. ${profile.pct}% of characters are yours — the important ones.`
            ])
        default:
            return null
    }
}

// --- Language sentences ---
const buildLanguageSentence = (githubLanguages) => {
    const breakdown = getLanguageBreakdown(githubLanguages)
    if (!breakdown || breakdown.length === 0) return null

    const top = breakdown[0]
    const second = breakdown[1]
    const third = breakdown[2]

    if (breakdown.length === 1) {
        return pickRandom([
            `Your entire codebase is ${top.language} — you go deep rather than wide.`,
            `${top.language} is your only tracked language. 100% focused.`,
            `All your repos are ${top.language}. Specialist territory.`
        ])
    }

    if (top.percent >= 80) {
        return pickRandom([
            `${top.language} dominates your codebase at ${top.percent}%${second ? ` — ${second.language} shows up occasionally` : ''}.`,
            `You're primarily a ${top.language} developer — ${top.percent}% of your repos are written in it.`,
            `${top.percent}% of your codebase is ${top.language}. That's specialization, not coincidence.`
        ])
    }

    if (top.percent >= 50) {
        const rest = second
            ? ` with ${second.language}${third ? ` and ${third.language}` : ''} alongside it`
            : ''
        return pickRandom([
            `${top.language} is your primary language at ${top.percent}%${rest}.`,
            `Your stack is led by ${top.language} (${top.percent}%)${second ? `, followed by ${second.language} (${second.percent}%)` : ''}.`,
            `More than half your codebase is ${top.language} — you know it well.`
        ])
    }

    if (top.percent >= 30) {
        const others = breakdown.slice(1, 3).map(l => `${l.language} (${l.percent}%)`).join(', ')
        return pickRandom([
            `You work across multiple languages — ${top.language} leads at ${top.percent}%${others ? `, alongside ${others}` : ''}.`,
            `A polyglot stack: ${top.language} at ${top.percent}%${second ? `, ${second.language} at ${second.percent}%` : ''}${third ? `, ${third.language} at ${third.percent}%` : ''}.`,
            `Your repos show a diverse stack — ${top.language} is most common but you move comfortably between languages.`
        ])
    }

    // Very distributed
    const topThree = breakdown.slice(0, 3).map(l => l.language).join(', ')
    return pickRandom([
        `Your codebase is evenly distributed — ${topThree} all appear frequently. A true generalist.`,
        `No single language dominates your repos. You work across ${topThree} and more.`,
        `You're language-agnostic in practice — ${topThree} are all well represented.`
    ])
}

// --- GitHub activity sentences ---
const buildGitHubSentence = (totals) => {
    if (!totals) return null
    const { commits, mergedPRs, repos, stars } = totals

    if (!commits && !repos) return null

    const parts = []

    if (commits > 0) {
        if (commits === 1) parts.push(`1 commit`)
        else if (commits < 10) parts.push(`${commits} commits`)
        else if (commits < 100) parts.push(`${commits} commits`)
        else parts.push(`${formatNumber(commits)} commits`)
    }

    if (mergedPRs > 0) {
        parts.push(`${mergedPRs} merged PR${mergedPRs > 1 ? 's' : ''}`)
    }

    if (repos > 0) {
        parts.push(`${repos} repo${repos > 1 ? 's' : ''}`)
    }

    if (stars > 0) {
        parts.push(`${formatNumber(stars)} star${stars > 1 ? 's' : ''}`)
    }

    if (parts.length === 0) return null

    const sentence = parts.length === 1
        ? parts[0]
        : parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1]

    return pickRandom([
        `Across GitHub you've shipped ${sentence}.`,
        `Your GitHub shows ${sentence} — a solid body of work.`,
        `On GitHub: ${sentence}.`
    ])
}

// --- Multi-editor sentences ---
const buildMultiEditorSentence = (editors) => {
    const topEditors = getTopEntries(editors, 3)
    if (topEditors.length < 2) return null

    if (topEditors.length === 2) {
        return pickRandom([
            `You split your time between ${topEditors[0]} and ${topEditors[1]} — a flexible setup.`,
            `${topEditors[0]} and ${topEditors[1]} are both in your toolkit.`,
            `You work across ${topEditors[0]} and ${topEditors[1]} depending on the task.`
        ])
    }

    return pickRandom([
        `You use ${topEditors[0]}, ${topEditors[1]}, and ${topEditors[2]} — you pick the right tool for the job.`,
        `Three editors tracked: ${topEditors[0]}, ${topEditors[1]}, and ${topEditors[2]}. A well-equipped workflow.`,
        `Your toolkit spans ${topEditors[0]}, ${topEditors[1]}, and ${topEditors[2]}.`
    ])
}

// --- Framework / library hint sentence ---
const buildFrameworkSentence = (frameworks) => {
    // frameworks will come from extension in future
    // For now returns null — structure ready for when data exists
    if (!frameworks || typeof frameworks !== 'object') return null
    const topFrameworks = getTopEntries(frameworks, 3)
    if (topFrameworks.length === 0) return null

    if (topFrameworks.length === 1) {
        return `Your primary framework is ${topFrameworks[0]}.`
    }

    const list = topFrameworks.slice(0, -1).join(', ') + ' and ' + topFrameworks[topFrameworks.length - 1]
    return `Your stack includes ${list}.`
}

// --- Onboarding / nudge sentences ---
const buildNudgeSentence = (hasGitHub, hasVSCode, topEditor) => {
    if (hasGitHub && hasVSCode) return null

    if (!hasGitHub && hasVSCode) {
        const editor = topEditor || 'your editor'
        return pickRandom([
            `Your ${editor} extension is active and tracking. Connect GitHub to add commit history, shipping activity, and your full language breakdown.`,
            `Coding sessions are being tracked in ${editor}. Linking GitHub will complete the picture — commits, PRs, and repos all in one place.`,
            `${editor} data is flowing in. GitHub connection would unlock the rest of your developer story.`
        ])
    }

    if (hasGitHub && !hasVSCode) {
        return pickRandom([
            `GitHub is connected and your repos are synced. Install the coding extension to layer in session time, keystrokes, and your coding style fingerprint.`,
            `Your GitHub activity is fully tracked. Add the coding extension to see how long you actually spend writing each day.`,
            `Commits, PRs, and repos are all synced from GitHub. The extension fills in what happens between pushes.`
        ])
    }

    return null
}

// --- Level / XP sentence ---
const buildLevelSentence = (level, xp) => {
    if (!level || level <= 1) return null

    if (level <= 5) return `You're at Level ${level} — ${xp?.toLocaleString() || 0} XP earned from your coding sessions.`
    if (level <= 10) return `Level ${level}, ${xp?.toLocaleString() || 0} XP. You're past the early stages.`
    if (level <= 20) return `Level ${level} with ${xp?.toLocaleString() || 0} XP — solidly mid-range and climbing.`
    if (level <= 50) return `Level ${level}. ${xp?.toLocaleString() || 0} XP puts you in advanced territory.`
    return `Level ${level} — ${xp?.toLocaleString() || 0} XP. That's a serious amount of time at the keyboard.`
}

// ================================================================
// ACTION SUGGESTIONS
// ================================================================

const buildActions = (hasGitHub, hasVSCode, currentStreak, totals) => {
    const actions = []

    if (!hasGitHub) actions.push({ text: 'Connect GitHub', to: '/settings' })
    if (!hasVSCode) actions.push({ text: 'Install the extension', to: '/settings' })
    if (hasGitHub && hasVSCode && currentStreak === 0) {
        actions.push({ text: 'Start a session to open your streak', to: null })
    }
    if (hasGitHub && (totals?.repos ?? 0) === 0) {
        actions.push({ text: 'Create your first repo', to: null })
    }

    return actions.slice(0, 2)
}

// ================================================================
// MAIN COMPONENT
// ================================================================

export default function DeveloperSummary({ userData, githubStats }) {
    const stats = userData?.stats
    const hasGitHub = !!(userData?.github?.username || userData?.github?.id)
    const hasVSCode = (stats?.totalSecondsCoded ?? 0) > 0
    const editors = userData?.skills?.editors || {}
    const topEditor = getPrimaryEditor(editors)
    const editorCount = Object.keys(editors).filter(k => editors[k] > 0).length
    const githubLanguages = userData?.skills?.githubLanguages || {}
    const frameworks = userData?.skills?.frameworks || {} // ready for future data
    const totals = githubStats?.totals || {}
    const hasAnyData = hasGitHub || hasVSCode

    const { paragraphs, actions } = useMemo(() => {
        // Complete empty state
        if (!hasAnyData) {
            return {
                paragraphs: [
                    `Welcome to CodeDash. Connect GitHub to sync your repositories, commits, and language breakdown. Install the coding extension to track your sessions, keystrokes, and coding style.`,
                    `Once you're set up, this summary updates automatically every time you code — giving you a plain-language picture of how you work, not just the numbers.`
                ],
                actions: buildActions(hasGitHub, hasVSCode, 0, totals)
            }
        }

        // Build all available sentences
        const streakSentence = buildStreakSentence(
            stats?.currentStreak ?? 0,
            stats?.longestStreak ?? 0,
            userData?.lastActiveDate,
            hasAnyData
        )

        const activitySentence = buildActivitySentence(
            stats?.totalSecondsCoded,
            hasVSCode,
            topEditor
        )

        const styleSentence = buildStyleSentence(
            hasVSCode ? stats?.humanCyborgRatio : null,
            editors
        )

        const multiEditorSentence = editorCount >= 2
            ? buildMultiEditorSentence(editors)
            : null

        const languageSentence = hasGitHub
            ? buildLanguageSentence(githubLanguages)
            : null

        const githubSentence = hasGitHub
            ? buildGitHubSentence(totals)
            : null

        const nudgeSentence = buildNudgeSentence(hasGitHub, hasVSCode, topEditor)

        const levelSentence = buildLevelSentence(stats?.level, stats?.xp)

        const frameworkSentence = buildFrameworkSentence(frameworks)

        // Paragraph 1: Performance — streak, activity, level
        const para1Parts = [streakSentence, activitySentence, levelSentence]
            .filter(Boolean)
        const para1 = para1Parts.join(' ')

        // Paragraph 2: Identity — style, multi-editor, frameworks
        const para2Parts = [styleSentence, multiEditorSentence, frameworkSentence]
            .filter(Boolean)
        const para2 = para2Parts.join(' ')

        // Paragraph 3: GitHub — languages, commits, PRs
        const para3Parts = [languageSentence, githubSentence]
            .filter(Boolean)
        const para3 = para3Parts.join(' ')

        // Paragraph 4: Nudge — what's missing
        const para4 = nudgeSentence || null

        const paragraphs = [para1, para2, para3, para4]
            .filter(p => p && p.trim().length > 0)

        return {
            paragraphs,
            actions: buildActions(hasGitHub, hasVSCode, stats?.currentStreak ?? 0, totals)
        }
    }, [userData, githubStats])

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Your Summary
                </h3>
            </div>

            {/* Paragraphs */}
            <div className="space-y-3">
                {paragraphs.map((para, i) => (
                    <motion.p
                        key={i}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08, duration: 0.25 }}
                        className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed"
                    >
                        {para}
                    </motion.p>
                ))}
            </div>

            {/* Action suggestions */}
            {actions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-3">
                    {actions.map((action, i) => (
                        action.to ? (
                            <Link
                                key={i}
                                to={action.to}
                                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                {action.text}
                                <FiArrowRight className="w-3 h-3" />
                            </Link>
                        ) : (
                            <span
                                key={i}
                                className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500"
                            >
                                <FiZap className="w-3 h-3" />
                                {action.text}
                            </span>
                        )
                    ))}
                </div>
            )}
        </div>
    )
}