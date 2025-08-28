export default function ProjectFilter(props) {
    const isActive = props.array.reduce((accumulator, name) => {
        accumulator[name] = props.selectedProject.includes(name);
        return accumulator;
    }, {});

    return <div className='flex gap-4 flex-wrap mb-8 '>
        <button className={`
      px-4 py-2 rounded-lg font-semibold transition-colors duration-200 
      ${props.selectedProject.length === 0 ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}
    `}
            onClick={props.handleClick} value=''>All projects</button>
        {props.array.map(name => (
            <button className={`
      px-4 py-2 rounded-lg font-semibold transition-colors duration-200 
      ${isActive[name] ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}
    `}
                onClick={props.handleClick} key={name} value={name} >
                {name}
            </button >
        ))
        }
    </div>



}