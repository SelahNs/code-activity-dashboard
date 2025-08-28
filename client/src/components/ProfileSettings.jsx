import { avatarOptions } from "../data/avatar";
import { AiFillGithub, AiFillLinkedin, AiFillTwitterCircle } from 'react-icons/ai';


export default function ProfileSettings({ formData, handleChange, handleSubmit, saveStatus, onCancel, setFormData, handleSocialChange }) {



    return (
        // This <section> is now just a simple container, no styles
        <section>
            {/* 1. The Header for the section */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Profile</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">This is how others will see you on the site.</p>
            </div>

            {/* 2. The Card itself, containing the form */}
            <div className="mt-6 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm bg-white dark:bg-slate-800">
                <form onSubmit={handleSubmit}>
                    {/* We add padding to a div INSIDE the form for better structure */}
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Full Name Input */}
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Full Name
                            </label>
                            <div className="mt-1">
                                <input
                                    onChange={handleChange}
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    id="fullName"
                                    className="block w-full text-slate-900 dark:text-slate-100 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="Your Name"
                                />
                            </div>
                        </div>

                        {/* ... Your other inputs (Username, Bio) go here, unchanged ... */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Username
                            </label>
                            <div className="mt-1">
                                <input
                                    onChange={handleChange}
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    id="username"
                                    className="block text-slate-900 dark:text-slate-100 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="your-username"
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <label htmlFor="bio" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Bio
                            </label>
                            <div className="mt-1">
                                <textarea
                                    onChange={handleChange}
                                    id="bio"
                                    name="bio"
                                    rows={3}
                                    value={formData.bio}
                                    className="block w-full text-slate-900 dark:text-slate-100 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="A short bio about yourself..."
                                />
                            </div>
                        </div>
                        <div className='lg:col-span-2 flex flex-col'>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Choose your Avatar
                            </label>
                            <div className="flex flex-wrap mt-2 gap-2">
                                {avatarOptions.map(avatar => <button onClick={() => setFormData(prevState => ({ ...prevState, avatarUrl: avatar }))} type='button'><img src={avatar} className={`w-12 h-12 rounded-full ${formData.avatarUrl === avatar ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}></img></button>)}
                            </div>

                        </div>
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <div className="md:col-span-2 ">
                                <label htmlFor="" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    <h3 className="font-medium">Available for work</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Let others know you are open to new opportunities.</p>
                                </label>
                            </div>
                            <label htmlFor="isHireable" className="md:justify-self-end relative inline-flex items-center cursor-pointer">
                                <span className={`mr-3 text-sm font-medium transition-colors ${formData.isHireable ? 'text-blue-600' : 'text-slate-400'}`}>{formData.isHireable ? 'ON' : 'OFF'}</span>
                                <input id="isHireable" type="checkbox" className="sr-only peer" name='isHireable' checked={formData.isHireable} onChange={handleChange} />

                                <div className="w-11 h-6 bg-gray-200 rounded-full dark:bg-gray-700 transition-colors peer-checked:bg-blue-600">

                                </div>
                                <div className="absolute top-0.5 left-[37px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-all peer-checked:translate-x-full"></div>


                            </label>


                        </div>
                        <div className="lg:col-span-2">
                            <label htmlFor="" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Social Links
                            </label>
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="relative">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <AiFillGithub className="h-10 w-10 text-gray-400" />
                                        </div>
                                        <input placeholder="your-username" className="pl-20 text-slate-900 dark:text-slate-100 block w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            name='github' value={formData.socialLinks.github} onChange={handleSocialChange} type="text" />
                                    </div>
                                    <p className="pl-5 mt-1 text-xs text-slate-400 dark:text-slate-500">github.com/your-username</p>

                                </div>
                                <div className="relative">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <AiFillLinkedin className="h-10 w-10 text-gray-400" />
                                        </div>
                                        <input placeholder="your-username" className="pl-20 block w-full rounded-md text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            name='linkedin' value={formData.socialLinks.linkedin} onChange={handleSocialChange} type="text"

                                        />
                                    </div>
                                    <p className="pl-5 mt-1 text-xs text-slate-400 dark:text-slate-500">linkedin.com/in/your-profile</p>
                                </div>
                                <div className="relative">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <AiFillTwitterCircle className="h-10 w-10 text-gray-400" />
                                        </div>
                                        <input placeholder="your-username" className="pl-20 block w-full rounded-md border border-slate-200 text-slate-900 dark:text-slate-100 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            name='twitter' value={formData.socialLinks.twitter} onChange={handleSocialChange} type="text" />
                                    </div>
                                    <p className="pl-5 mt-1 text-xs text-slate-400 dark:text-slate-500">twitter.com/your-handle</p>

                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. The Footer for the card, with its own background and padding */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 flex justify-end gap-3 rounded-b-lg ">
                        <button
                            type="submit"
                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-transform focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={(saveStatus === 'saving' || saveStatus === 'success')}
                        >
                            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : 'Save Changes'}
                        </button>
                        <button
                            className="rounded-md py-2 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
                            onClick={onCancel}
                            type='button'
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}