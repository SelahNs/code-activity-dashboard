// src/data/mockProjectDetail.js

export const mockProjectDetail = {
    id: "proj1",
    title: "Code Activity Dashboard",
    description: `
        <p>The Code Activity Dashboard is a full-stack web application designed to provide developers with a comprehensive and visually engaging way to track, analyze, and showcase their coding habits. Built with a modern tech stack, it aims to be a central hub for personal productivity and a professional portfolio piece.</p>
        <p>The core idea is to move beyond simple commit counts and provide meaningful insights into how a developer invests their time, which languages they are mastering, and how their productivity evolves over time.</p>
        <h3>Key Features:</h3>
        <ul>
            <li>Real-time, interactive charts and visualizations.</li>
            <li>Secure user authentication and detailed profile management.</li>
            <li>A public-facing profile page to showcase work to recruiters or peers.</li>
            <li>Planned integration with the GitHub API to automate project and data ingestion.</li>
        </ul>
    `,
    status: "In-progress",
    tags: ["React", "Tailwind", "Django", "Framer Motion", "Full-Stack", "Zod", "Recharts"],
    githubUrl: "https://github.com/SelahNs/code-activity-dashboard", // Use your real repo link
    liveUrl: "https://codedash.netlify.app", // Use your future live link
    docsUrl: "#", // Placeholder
    gallery: [
        { type: 'image', url: ' https://images.unsplash.com/photo-1551288049-bebda4e38f71' },
        { type: 'gif', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3V3bjh6ZGJzZ3h0MmN2eTlkcDF2eGVxb2FhdmxnM3p4Nmd3c2VpNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/lqFgz1iS3p2x3bVb4S/giphy.gif' },
        { type: 'image', url: ' https://images.unsplash.com/photo-1587440871875-191322ee64b0' },
    ],
    isPinned: false
};