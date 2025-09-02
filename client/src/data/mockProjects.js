// src/data/mockProjects.js
export const mockProjects = [
    {
        id: "proj1",
        title: "Code Activity Dashboard",
        description: `<p>A full-stack application to visualize coding habits and showcase work. Real-time charts, GitHub import, VS Code integration and a beautiful UI.</p>`,
        status: "In-progress",
        tags: ["React", "Tailwind", "Django", "Framer Motion"],
        githubUrl: "https://github.com/yourname/code-activity-dashboard",
        liveUrl: "https://your-live-demo.netlify.app",
        lastUpdated: "2025-08-28T12:00:00Z",
        stars: 150,
        isPinned: false,
        gallery: [
            { type: "image", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80" },
            { type: "gif", url: "https://media.giphy.com/media/3o7TKsQfi1X9fJ8p6k/giphy.gif" }
        ],
        github: {
            repoFullName: "yourname/code-activity-dashboard",
            stars: 150,
            forks: 8,
            primaryLanguage: "JavaScript",
            weeklyCommits: [2, 3, 1, 5, 10, 8, 6] // last 7 weeks sample
        },
        source: "github",
        meta: { impactScore: 78, maintenance: "Active" },
        createdAt: "2025-06-01T09:00:00Z",
        updatedAt: "2025-08-28T12:00:00Z"
    },
    {
        id: "proj2",
        title: "AI Note Taking App",
        description: `<p>An intelligent note-taking concept with summarization and search.</p>`,
        status: "Planned",
        tags: ["AI", "Next.js", "Python"],
        githubUrl: null,
        liveUrl: null,
        lastUpdated: "2025-07-15T09:00:00Z",
        stars: 899,
        isPinned: false,
        gallery: [],
        github: null,
        source: "manual",
        meta: { impactScore: 45, maintenance: "Dormant" },
        createdAt: "2025-05-21T10:00:00Z",
        updatedAt: "2025-07-15T09:00:00Z"
    },
    {
        id: "proj3",
        title: "E-Commerce Storefront",
        description: `<p>Modern e-commerce storefront built with React and GraphQL.</p>`,
        status: "Finished",
        tags: ["React", "GraphQL", "Shopify"],
        githubUrl: "https://github.com/yourname/ecommerce-storefront",
        liveUrl: "https://ecommerce-demo.example.com",
        lastUpdated: "2024-12-20T09:00:00Z",
        stars: 42,
        isPinned: false,
        gallery: [],
        github: {
            repoFullName: "yourname/ecommerce-storefront",
            stars: 42,
            forks: 6,
            primaryLanguage: "TypeScript",
            weeklyCommits: [0, 1, 0, 0, 2, 1, 0]
        },
        source: "github",
        meta: { impactScore: 33, maintenance: "Dormant" },
        createdAt: "2023-11-10T09:00:00Z",
        updatedAt: "2024-12-20T09:00:00Z"
    }
];
