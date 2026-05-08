const User = require('../models/user');
const Project = require('../models/project');
const Commit = require('../models/commit');
const Repo = require('../models/repo');

const syncGitHubData = async (userId, accessToken, githubUsername) => {
    try {
        console.log(`Starting GitHub sync for user ${userId}`);

        await User.findByIdAndUpdate(userId, {
            $set: { 'github.accessToken': accessToken }
        });

        const dbUser = await User.findById(userId);
        const blockedRepoIds = dbUser.github?.blockedRepoIds || [];

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

        const remaining = parseInt(reposResponse.headers.get('x-ratelimit-remaining'));
        const resetTime = reposResponse.headers.get('x-ratelimit-reset');
        console.log(`GitHub API: ${remaining} requests remaining, resets at ${new Date(resetTime * 1000).toISOString()}`);

        const repos = await reposResponse.json();
        const filteredRepos = repos.filter(repo => !blockedRepoIds.includes(repo.id));

        await Promise.all(filteredRepos.map(async (repo) => {
            try {
                const repoDoc = await Repo.findOne({ githubId: repo.id });
                
                const hasNewPushes = !repoDoc?.pushedAt || 
                    new Date(repo.pushed_at) > new Date(repoDoc.pushedAt);

                let readme = repoDoc?.readme || null;
                if (hasNewPushes) {
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
                        if (readmeResponse.ok) readme = await readmeResponse.text();
                    } catch (e) {}
                }

                // ---- Sync Repo document ----
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
                            url: repo.html_url,
                            readme,
                            lastSyncedAt: new Date()
                        }
                    },
                    { upsert: true, new: true }
                );

                // ---- Sync Project document ----
                const existingProject = await Project.findOne({
                    user: userId,
                    'github.repoId': repo.id
                });

                const daysSinceLastPush = (Date.now() - new Date(repo.pushed_at)) / (1000 * 60 * 60 * 24);
                const derivedStatus = daysSinceLastPush > 30 ? 'paused' : 'active';

                if (existingProject) {
                    const updateFields = {
                        'github.stars': repo.stargazers_count,
                        'github.forks': repo.forks_count,
                        'github.lastCommit': repo.pushed_at,
                        'github.language': repo.language,
                        'github.fullName': repo.full_name,
                        'github.url': repo.html_url,
                        'github.readme': readme,
                    };

                    const manuallyEdited = existingProject.manuallyEdited || [];

                    if (!manuallyEdited.includes('title')) {
                        updateFields['title'] = repo.name;
                    }
                    if (!manuallyEdited.includes('description')) {
                        updateFields['description'] = repo.description || '';
                    }
                    if (!manuallyEdited.includes('visibility')) {
                        updateFields['visibility'] = repo.private ? 'private' : 'public';
                    }
                    if (!manuallyEdited.includes('status') && 
                        existingProject.status !== 'completed' && 
                        existingProject.status !== 'archived') {
                        updateFields['status'] = derivedStatus;
                    }

                    await Project.findByIdAndUpdate(existingProject._id, {
                        $set: updateFields
                    });

                } else {
                    await Project.create({
                        user: userId,
                        title: repo.name,
                        description: repo.description || '',
                        status: derivedStatus,
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

                if (hasNewPushes) {
                    let commitsUrl = `https://api.github.com/repos/${repo.full_name}/commits?per_page=100&author=${githubUsername}`;

                    if (repoDoc?.lastSyncedAt) {
                        commitsUrl += `&since=${repoDoc.lastSyncedAt.toISOString()}`;
                    }

                    const commitsResponse = await fetch(commitsUrl, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Accept': 'application/json',
                            'User-Agent': 'CodeDash-App'
                        }
                    });

                    if (!commitsResponse.ok) return;
                    const commits = await commitsResponse.json();

                    for (const commit of commits) {
                        const existingCommit = await Commit.findOne({ sha: commit.sha });
                        if (existingCommit) continue;

                        await Commit.create({
                            user: userId,
                            sha: commit.sha,
                            message: commit.commit.message,
                            timestamp: commit.commit.author.date,
                            branch: repo.default_branch,
                            repo: repo.full_name,
                            repoId: repo.id,
                            url: commit.html_url,
                            detailsFetched: false
                        });
                    }
                }

            } catch (e) {
                console.error(`Failed to sync repo ${repo.full_name}:`, e.message);
            }
        }));

        console.log(`GitHub sync complete for user ${userId} — ${filteredRepos.length} repos processed`);

    } catch (error) {
        console.error('GitHub sync error:', error);
    }
};

module.exports = { syncGitHubData };