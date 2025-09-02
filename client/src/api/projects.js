// src/api/projects.js
import { mockProjects } from "../data/mockProjects";

const DELAY = 350;

let _projects = JSON.parse(JSON.stringify(mockProjects)); // local in-memory store (dev only)

export async function fetchProjects({ search = "", status = "all", tags = [], sort = "newest" } = {}) {
    await new Promise(r => setTimeout(r, DELAY));
    let list = [..._projects];

    if (status !== "all") list = list.filter(p => p.status === status);
    if (search) list = list.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
    if (tags && tags.length > 0) list = list.filter(p => p.tags.some(t => tags.includes(t)));

    switch (sort) {
        case "newest": list.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)); break;
        case "oldest": list.sort((a, b) => new Date(a.lastUpdated) - new Date(b.lastUpdated)); break;
        case "popularity": list.sort((a, b) => (b.stars || 0) - (a.stars || 0)); break;
        case "alphabetical_asc": list.sort((a, b) => a.title.localeCompare(b.title)); break;
        case "alphabetical_desc": list.sort((a, b) => b.title.localeCompare(a.title)); break;
        default: break;
    }

    // always place pinned first
    const pinned = list.filter(p => p.isPinned);
    const unpinned = list.filter(p => !p.isPinned);
    return [...pinned, ...unpinned];
}

export async function fetchProjectById(id) {
    await new Promise(r => setTimeout(r, DELAY));
    const found = _projects.find(p => p.id === id);
    if (!found) throw new Error("Not found");
    return found;
}

export async function createProject(data) {
    await new Promise(r => setTimeout(r, DELAY));
    const newProj = {
        ...data,
        id: `proj${Date.now()}`,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stars: 0,
        isPinned: false,
        meta: { impactScore: 10, maintenance: "Dormant" }
    };
    _projects = [newProj, ..._projects];
    return newProj;
}

export async function togglePin(projectId) {
    await new Promise(r => setTimeout(r, 150));
    _projects = _projects.map(p => p.id === projectId ? { ...p, isPinned: !p.isPinned } : p);
    return _projects.find(p => p.id === projectId);
}

/**
 * Simulated server-side GitHub import: backend should:
 *  - validate repoUrl
 *  - call GitHub API for repo metadata (name, description, languages, stars)
 *  - create / update project record
 *
 * Here we just fake that behavior.
 */
export async function importFromGitHub(repoUrl) {
    await new Promise(r => setTimeout(r, 700));
    // naive parse owner/repo from url
    try {
        const match = repoUrl.match(/github.com\/([^/]+)\/([^/]+)/i);
        if (!match) throw new Error("Invalid GitHub URL");
        const owner = match[1], repo = match[2];
        const id = `gh-${owner}-${repo}`.replace(/\W/g, '-');
        const newProject = {
            id,
            title: `${repo} (imported)`,
            description: `<p>Imported from <strong>${owner}/${repo}</strong></p>`,
            status: "In-progress",
            tags: [],
            githubUrl: `https://github.com/${owner}/${repo}`,
            liveUrl: null,
            lastUpdated: new Date().toISOString(),
            stars: Math.floor(Math.random() * 500),
            isPinned: false,
            gallery: [],
            github: {
                repoFullName: `${owner}/${repo}`,
                stars: Math.floor(Math.random() * 500),
                forks: Math.floor(Math.random() * 30),
                primaryLanguage: "JavaScript",
                weeklyCommits: Array.from({ length: 7 }, () => Math.floor(Math.random() * 6))
            },
            source: "github",
            meta: { impactScore: Math.floor(Math.random() * 80) + 20, maintenance: "Active" },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        _projects = [newProject, ..._projects];
        return newProject;
    } catch (err) {
        throw err;
    }
}
