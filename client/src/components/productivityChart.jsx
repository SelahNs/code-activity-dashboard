import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
// This is our custom tooltip component
const CustomTooltip = ({ active, payload, label, dataKey }) => { // 1. Accept dataKey
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const value = data[dataKey]; // 2. Get the value using the dynamic dataKey

        // 3. Create a dynamic label
        const dataLabel = dataKey.charAt(0).toUpperCase() + dataKey.slice(1);

        return (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-800 dark:text-white font-bold">{`Date: ${label}`}</p>
                <p className="text-sm text-indigo-600 dark:text-indigo-400">{`Project: ${data.project}`}</p>
                <p className="text-sm text-sky-700 dark:text-sky-400">{`Language: ${data.language}`}</p>
                {/* 4. Use the dynamic label and value */}
                <p className="text-sm text-gray-600 dark:text-gray-300">{`${dataLabel}: ${value.toLocaleString()}`}</p>
            </div>
        );
    }
    return null;
};
export default function ProductivityChart({ sessions, dataKey = "duration", strokeColor = "#8884d8", title }) {
    const formattedData = sessions.map(session => ({
        ...session, // 1. Copy all the properties from the original session
        formattedDate: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) // 2. Add our new property
    })); return (<div className='w-full h-full'>
        <h2 className="text-xl font-semibold mb-4 text-center text-gray-800 dark:text-slate-200">Productivity: {title}</h2>

        <ResponsiveContainer width="100%" height={400}>
            <table className="sr-only">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>{title}</th>
                    </tr>
                </thead>
                <tbody>
                    {/* You need to map over your formattedData here */}
                    {formattedData.map((session, index) => (
                        <tr key={index}>
                            <td>{session.formattedDate}</td>
                            <td>{session[dataKey]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>

                {/* Added tick and stroke colors for dark mode */}
                <XAxis
                    dataKey="formattedDate"
                    // Add angle and textAnchor to the tick prop
                    tick={{ className: "fill-gray-600 dark:fill-gray-400", angle: -45, textAnchor: 'end' }}
                    stroke="#374151"
                    height={60}
                >
                    <Label value="Date" dy={15} position='insideBottom' style={{ textAnchor: 'middle', fill: '#888' }} />
                </XAxis>

                {/* Added tick and stroke colors for dark mode */}
                <YAxis tick={{ className: "fill-gray-600 dark:fill-gray-400" }} stroke="#374151">
                    <Label value="Minutes Coded" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#888888' }} />
                </YAxis>

                <Tooltip content={props => <CustomTooltip {...props} dataKey={dataKey} />} />
                {/* Changed grid color to be more subtle in dark mode */}
                <CartesianGrid stroke="#374151" strokeDasharray="5 5" />

                <Line
                    type="monotone"
                    dataKey={dataKey}      // Use the prop here
                    stroke={strokeColor}    // Use the prop here
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                />

            </LineChart>
        </ResponsiveContainer>
    </div>
    )
}