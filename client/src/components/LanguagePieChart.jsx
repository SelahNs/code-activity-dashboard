import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CustomPieTooltip = ({ active, payload, total }) => {
    if (active && payload && payload.length) {
        const lang = payload[0].name;
        const number = payload[0].value;
        const percent = ((payload[0].value / total) * 100).toFixed(0);

        return <div className="flex flex-col gap-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <p className='text-lg font-bold' style={{ color: payload[0].payload.fill }}>{lang}</p>
            <p className='text-sm text-gray-600 dark:text-gray-400'>{number} minutes</p>
            <p className='font-bold text-3xl text-gray-900 dark:text-gray-300'>{percent}%</p>
        </div>
    }

    // contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '10px' }}
    //                     formatter={(value, name, props) => [`${value} minutes`, name]} // Customizes the tooltip text
}

export default function LanguagePieChart(props) {
    const totalDuration = props.sessions.reduce((accumulator, current) => accumulator + current.duration, 0);

    const required = Object.entries(props.sessions.reduce((accumulator, value) => {
        if (accumulator[value.language]) {
            accumulator[value.language] += value.duration;
        } else {
            accumulator[value.language] = value.duration
        }
        return accumulator
    }, {})).map(subarray => {
        return {
            name: subarray[0],
            value: subarray[1]
        }
    })

    // A more modern, vibrant color palette
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    // (blue, green, amber, red, purple)

    // In LanguagePieChart.jsx

    return (
        <div style={{ width: '100%', height: 400 }}>
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-800 dark:text-slate-200">Language Breakdown</h2>
            <ResponsiveContainer>
                <table className="sr-only">
                    <thead>
                        <tr>
                            <th>Language Name</th>
                            <th>Total Minutes</th>
                            <th>Percent</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* You need to map over your formattedData here */}
                        {required.map((session, index) => (
                            <tr key={index}>
                                <td>{session.name}</td>
                                <td>{session.value}</td>
                                <td>{((session.value / totalDuration) * 100).toFixed(0)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <PieChart>

                    {/* This is the component that renders the actual pie slices */}
                    <Pie
                        data={required}      // 1. We pass in our perfectly formatted data
                        // 2. We tell it the key for the label is "name"
                        nameKey="name"         // 3. We tell it the key for the name (used in tooltip) is also "name"
                        valueKey="value"       // 4. We tell it the key for the value (size of the slice) is "value"
                        cx="50%"             // 5. Center X-coordinate of the pie
                        cy="50%"             // 6. Center Y-coordinate of the pie
                        outerRadius={120}      // 7. How big the pie is
                        // 8. A default fill color
                        label                  // 9. This tells it to render labels on the slices
                    >
                        {/* 
            This is the magic part for colors.
            We map over our data and create a <Cell> for each slice.
            Each <Cell> gets a unique color from our COLORS array.
          */}
                        {required.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>

                    {/* The tooltip that shows up on hover */}
                    <Tooltip
                        content={<CustomPieTooltip total={totalDuration} />}
                    />

                    {/* The legend that shows which color corresponds to which language */}
                    <Legend verticalAlign="bottom" height={50} />

                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}