// src/components/TinySparkline.jsx
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function TinySparkline({ data = [] }) {
    // expects simple numeric array or small array of numbers
    const formatted = data.map((v, i) => ({ i, v }));
    if (!formatted.length) return <div className="w-20 h-6" aria-hidden="true" />;
    return (
        <div className="w-24 h-6" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatted}>
                    <Line dot={false} isAnimationActive={false} dataKey="v" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
