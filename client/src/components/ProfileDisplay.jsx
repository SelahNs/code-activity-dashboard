export default function ProfileDisplay({ formData, onEditClick }) {
    return (
        <section>
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Profile</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">This is how others will see you on the site.</p>
            </div>
            <div className="mt-6 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm bg-white dark:bg-slate-800">
                <div className="p-6">
                    <h3>{formData.fullName}</h3>
                    <p>@{formData.username}</p>
                    <p>{formData.bio}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 text-right rounded-b-lg ">
                    <button onClick={onEditClick}>
                        Edit Profile
                    </button>
                </div>

            </div>
        </section>
    )
}