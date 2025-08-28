export default function StatCard(props) {

    const key = props.dataKey
    const totalValue = props.sessions.reduce((total, current) => total + current[key], 0);

    let display;
    switch (props.dataKey) {
        case 'duration':
            const hours = Math.floor(totalValue / 60);
            const mins = totalValue % 60;
            display = `${hours}:${mins < 10 ? '0' : ''}${mins}`;
            break
        case 'keystrokes':
        case 'linesAdded':
            display = totalValue.toLocaleString();
            break;
        default:
            display = totalValue;
    }


    return <div className="bg-slate-100 dark:bg-gray-800 p-6 rounded-xl">
        <p className="text-sm text-gray-600 dark:text-gray-400">{props.title}</p>
        <h2 className="text-4xl font-bold text-slate-900 dark:text-white">{display}</h2>
        {/* <h2>{hours}:{mins < 10 && '0'}{mins}</h2> */}
    </div>
}