import { div } from 'framer-motion/client';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
function CustomRadarTooltip({ active, payload }) {
    if (active && payload && payload.length) {
        return (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <p className='text-base font-bold' style={{ color: '#3B82F6' }}>{payload[0].payload.subject}</p>
                <p className='text-2xl font-bold text-gray-900 dark:text-gray-400'>{payload[0].value} minutes</p>
            </div>
        )
    }
}
export default function LanguageRadarChart(props) {
    const techTotals = {}
    props.sessions.forEach(session => {
        for (let i = 0; i < session.technologies.length; i++) {
            if (techTotals[session.technologies[i]]) {
                techTotals[session.technologies[i]] += session.duration;
            } else {
                techTotals[session.technologies[i]] = session.duration;
            }
        }
    });

    const arrayFormat = Object.entries(techTotals);
    const biggest = arrayFormat.reduce((accumulator, current) => Math.max(accumulator, current[1]), 0);
    const required = arrayFormat.map(subarray => {
        return {
            subject: subarray[0],
            duration: subarray[1],
            fullMark: biggest
        }
    })

    return (
        <div style={{ width: '100%', height: 400 }}>
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-800 dark:text-slate-200">Technology Focus</h2>

            {/* The container that makes it responsive */}
            <ResponsiveContainer>
                <table className="sr-only">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Technology Focus</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* You need to map over your formattedData here */}
                        {required.map((session, index) => (
                            <tr key={index}>
                                <td>{session.subject}</td>
                                <td>{session.duration}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* The main chart component. We pass our data to this. */}
                <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    data={required} // <-- Here is where you use your perfect data
                >

                    {/* This draws the circular grid lines */}
                    <PolarGrid stroke="#374151" />

                    {/* This creates the labels around the outside (React, Vite, etc.) */}
                    {/* It uses the 'subject' key from your data. */}
                    <PolarAngleAxis dataKey="subject" tick={{ className: "fill-gray-500 dark:fill-gray-400" }} />

                    {/* This creates the number scale from the center (0, 500, 1000) */}
                    {/* It is optional, but makes the chart easier to read. */}
                    <PolarRadiusAxis angle={30} domain={[0, biggest]} tick={{ fill: 'none' }} axisLine={{ stroke: 'none' }} />

                    {/* This is the actual blue "web" shape that plots your data */}
                    <Radar
                        name="Time Spent (minutes)"
                        dataKey="duration" // Tell it to use the 'duration' property for the value
                        stroke="#3B82F6"   // A nice blue color for the line
                        fill="#3B82F6"     // A nice blue color for the fill
                        fillOpacity={0.6}  // Make the fill slightly transparent
                    />

                    {/* And a tooltip, just like our other charts! */}
                    <Tooltip content={<CustomRadarTooltip />} />

                </RadarChart>
            </ResponsiveContainer>
        </div>
    )
}