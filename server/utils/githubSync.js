const User = require('../models/user');
const Project = require('../models/project');
const Commit = require('../models/commit');
const Repo = require('../models/repo');

const syncGitHubData = async (userId, accessToken) => {
    try {
        console.log(`Starting GitHub sync for user ${userId}`);

        // ================================================================
        // 1. SYNC USER PROFILE
        // ================================================================
        const profileResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
                'User-Agent': 'CodeDash-App'
            }
        });

        if (!profileResponse.ok) {
            console.error('Failed to fetch GitHub profile');
            return;
        }

        const githubUser = await profileResponse.json();

        await User.findByIdAndUpdate(userId, {
            $set: {
                'github.username': githubUser.login,
                'github.accessToken': accessToken,
                ...(githubUser.name && { 'profile.fullName': githubUser.name }),
                ...(githubUser.avatar_url && { 'profile.avatarUrl': githubUser.avatar_url }),
                ...(githubUser.bio && { 'profile.bio': githubUser.bio }),
                ...(githubUser.location && { 'profile.location': githubUser.location }),
                ...(githubUser.company && { 'profile.company': githubUser.company }),
                ...(githubUser.blog && { 'profile.website': githubUser.blog }),
                ...(githubUser.html_url && { 'profile.socials.github': githubUser.html_url }),
            }
        });

        console.log(`Profile synced for ${githubUser.login}`);

        // ================================================================
        // 2. SYNC REPOS
        // ================================================================
        const reposResponse = await fetch(
            'https://api.github.com/user/repos?per_page=100&sort=pushed&affiliation=owner',
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json',
                    'User-Agent': 'CodeDash-App'
                }
            }
        );

        if (!reposResponse.ok) {
            console.error('Failed to fetch GitHub repos');
            return;
        }

        const repos = await reposResponse.json();

        // Get the user to check blocked repos
        const dbUser = await User.findById(userId);
        const blockedRepoIds = dbUser.github?.blockedRepoIds || [];

        for (const repo of repos) {
            // Skip blocked repos
            if (blockedRepoIds.includes(repo.id)) {
                continue;
            }

            // ---- Update or create Repo document ----
            await Repo.findOneAndUpdate(
                { githubId: repo.id },
                {
                    $set: {
                        user: userId,
                        githubId: repo.id,
                        name: repo.name,
                        fullName: repo.full_name,
                        description: repo.description || '',
                        private: repo.private,
                        language: repo.language,
                        stars: repo.stargazers_count,
                        forks: repo.forks_count,
                        openIssues: repo.open_issues_count,
                        topics: repo.topics || [],
                        size: repo.size,
                        defaultBranch: repo.default_branch,
                        pushedAt: repo.pushed_at,
                        createdAt: repo.created_at,
                        updatedAt: repo.updated_at,
                        url: repo.html_url,
                    }
                },
                { upsert: true, new: true } // create if doesn't exist, update if it does
            );

            // ---- Update or create Project document ----
            const existingProject = await Project.findOne({
                user: userId,
                'github.repoId': repo.id
            });

            if (existingProject) {
                // Just refresh GitHub data
                await Project.findByIdAndUpdate(existingProject._id, {
                    $set: {
                        'github.stars': repo.stargazers_count,
                        'github.forks': repo.forks_count,
                        'github.lastCommit': repo.pushed_at,
                        'github.language': repo.language,
                    }
                });
            } else {
                // Fetch README for new projects
                let readme = null;
                try {
                    const readmeResponse = await fetch(
                        `https://api.github.com/repos/${repo.full_name}/readme`,
                        {
                            headers: {
                                'Authorization': `Bearer ${accessToken}`,
                                'Accept': 'application/vnd.github.raw',
                                'User-Agent': 'CodeDash-App'
                            }
                        }
                    );
                    if (readmeResponse.ok) {
                        readme = await readmeResponse.text();
                    }
                } catch (e) {
                    // no readme, fine
                }

                await Project.create({
                    user: userId,
                    title: repo.name,
                    description: repo.description || '',
                    status: 'active',
                    tags: repo.topics || [],
                    visibility: repo.private ? 'private' : 'public',
                    github: {
                        repoId: repo.id,
                        fullName: repo.full_name,
                        url: repo.html_url,
                        stars: repo.stargazers_count,
                        forks: repo.forks_count,
                        language: repo.language,
                        lastCommit: repo.pushed_at,
                        readme
                    }
                });
            }

            // ---- Sync recent commits for this repo ----
            try {
                const commitsResponse = await fetch(
                    `https://api.github.com/repos/${repo.full_name}/commits?per_page=50&author=${githubUser.login}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Accept': 'application/json',
                            'User-Agent': 'CodeDash-App'
                        }
                    }
                );

                if (!commitsResponse.ok) continue;

                const commits = await commitsResponse.json();

                for (const commit of commits) {
                    // Skip if already stored — sha is unique
                    const existing = await Commit.findOne({ sha: commit.sha });
                    if (existing) continue;

                    // Fetch full commit details for additions/deletions
                    const detailResponse = await fetch(
                        `https://api.github.com/repos/${repo.full_name}/commits/${commit.sha}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${accessToken}`,
                                'Accept': 'application/json',
                                'User-Agent': 'CodeDash-App'
                            }
                        }
                    );

                    if (!detailResponse.ok) continue;
                    const detail = await detailResponse.json();

                    await Commit.create({
                        user: userId,
                        sha: commit.sha,
                        message: commit.commit.message,
                        timestamp: commit.commit.author.date,
                        branch: repo.default_branch,
                        repo: repo.full_name,
                        repoId: repo.id,
                        filesAdded: detail.files
                            ?.filter(f => f.status === 'added')
                            .map(f => f.filename) || [],
                        filesRemoved: detail.files
                            ?.filter(f => f.status === 'removed')
                            .map(f => f.filename) || [],
                        filesModified: detail.files
                            ?.filter(f => f.status === 'modified')
                            .map(f => f.filename) || [],
                        additions: detail.stats?.additions || 0,
                        deletions: detail.stats?.deletions || 0,
                        url: commit.html_url,
                    });
                }
            } catch (e) {
                console.error(`Failed to sync commits for ${repo.full_name}:`, e.message);
                // continue to next repo even if commits fail
            }
        }

        console.log(`GitHub sync complete for user ${userId} — ${repos.length} repos processed`);

    } catch (error) {
        console.error('GitHub sync error:', error);
    }
};

module.exports = { syncGitHubData };