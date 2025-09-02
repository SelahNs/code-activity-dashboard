// src/components/ProductivityChart.jsx
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';
import { FiClock } from 'react-icons/fi'; // Adding an icon for the tooltip

// --- HELPER: Intelligently formats Y-Axis ticks from minutes to hours ---
const formatYAxisTick = (minutes) => {
    if (minutes === 0) return '0h';
    if (minutes < 60) return `${minutes}m`;
    const hours = minutes / 60;
    // Show one decimal place only if it's not a whole number
    return `${hours % 1 === 0 ? hours : hours.toFixed(1)}h`;
};

// --- Polished Custom Tooltip with an icon ---
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const currentData = payload[0].payload;
        const currentValue = currentData.value;
        // The ghost data is the second item in the payload
        const previousValue = payload[1] ? payload[1].value : null;

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.15 }}
                className="p-3.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700"
            >
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
                <div className="flex items-center gap-2">
                    <FiClock className="text-blue-500" />
                    <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                        {formatYAxisTick(currentValue)}
                    </p>
                </div>
                {previousValue !== null && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        vs. {formatYAxisTick(previousValue)} last period
                    </p>
                )}
            </motion.div>
        );
    }
    return null;
};

// --- Our beautiful glowing active dot ---
const CustomActiveDot = ({ cx, cy, stroke }) => {
    if (!cx || !cy) return null;
    return (
        <g>
            <circle cx={cx} cy={cy} r={10} fill={stroke} fillOpacity={0.2} />
            <circle cx={cx} cy={cy} r={5} fill={stroke} />
        </g>
    );
};

// --- Main Chart Component ---
export default function ProductivityChart({ sessions, previousSessions = [], dataKey = "duration" }) {

    // --- Data Aggregation Logic ---
    const aggregateData = (data) => {
        const aggregated = data.reduce((acc, session) => {
            const date = new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!acc[date]) acc[date] = { date, value: 0 };
            acc[date].value += session[dataKey];
            return acc;
        }, {});
        return Object.values(aggregated);
    };

    const formattedData = aggregateData(sessions);
    const ghostData = aggregateData(previousSessions);

    // Combine data for consistent axis scaling
    const combinedData = formattedData.map((current, index) => ({
        ...current,
        // Match by index for a week-over-week comparison
        previousValue: ghostData[index] ? ghostData[index].value : 0,
    }));
    
    // Calculate the average for the reference line
    const average = formattedData.reduce((sum, item) => sum + item.value, 0) / (formattedData.length || 1);

    // --- No Data State ---
    if (formattedData.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-800/20 rounded-lg">
                <p className="text-slate-500">Not enough activity data for this period.</p>
            </div>
        );
    }

    const gradientColor = "#4f46e5";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
        >
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combinedData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={gradientColor} stopOpacity={0.6}/>
                            <stop offset="95%" stopColor={gradientColor} stopOpacity={0.05}/>
                        </linearGradient>
                        <linearGradient id="ghostGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#64748b" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                        </linearGradient>
                    </defs>

                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={formatYAxisTick} />

                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: gradientColor, strokeWidth: 1, strokeDasharray: '4 4' }} />

                    {/* The "Ghost" Chart for previous period context */}
                    <Area type="monotone" dataKey="previousValue" stroke="none" fill="url(#ghostGradient)" />

                    {/* The Main Chart */}
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={gradientColor}
                        strokeWidth={2.5}
                        fill="url(#colorGradient)"
                        activeDot={<CustomActiveDot />}
                        animationDuration={1200}
                    />

                    {/* The Average Line */}
                    <ReferenceLine y={average} stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1.5}>
                        <label value="Avg" position="right" fill="#94a3b8" fontSize="10" />
                    </ReferenceLine>
                </AreaChart>
            </ResponsiveContainer>
        </motion.div>
    );
}