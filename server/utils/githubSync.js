const User = require('../models/user');
const Project = require('../models/project');
const Repo = require('../models/repo');
const Commit = require('../models/commit');
const PullRequest = require('../models/pullRequest');
const Release = require('../models/release');
const { githubCommitQueue, githubPRQueue } = require('./queue');

const GITHUB_HEADERS = (accessToken) => ({
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json',
    'User-Agent': 'CodeDash-App'
})

// ================================================================
// LAYER 1 — FAST SYNC (profile + repos)
// ================================================================
const syncFast = async (userId, accessToken, githubUsername) => {
    try {
        console.log(`Fast sync starting for user ${userId}`);

        await User.findByIdAndUpdate(userId, {
    $set: { 'github.accessToken': accessToken }
});

const dbUser = await User.findById(userId);
const blockedRepoIds = dbUser.github?.blockedRepoIds || [];

// fetch profile and repos simultaneously — independent of each other
const [reposResponse, profileRes] = await Promise.all([
    fetch('https://api.github.com/user/repos?per_page=100&sort=pushed&affiliation=owner', { headers: GITHUB_HEADERS(accessToken) }),
    fetch('https://api.github.com/user', { headers: GITHUB_HEADERS(accessToken) })
])


if (profileRes.ok) {
    const profile = await profileRes.json()
    const manuallyEdited = dbUser.manuallyEdited || []

    const profileUpdate = {}
    if (!manuallyEdited.includes('fullName')) profileUpdate['profile.fullName'] = profile.name || null
    if (!manuallyEdited.includes('bio')) profileUpdate['profile.bio'] = profile.bio || null
    if (!manuallyEdited.includes('location')) profileUpdate['profile.location'] = profile.location || null
    if (!manuallyEdited.includes('company')) profileUpdate['profile.company'] = profile.company || null
    if (!manuallyEdited.includes('website')) profileUpdate['profile.website'] = profile.blog || null
    if (!manuallyEdited.includes('avatarUrl')) profileUpdate['profile.avatarUrl'] = profile.avatar_url || null

    await User.findByIdAndUpdate(userId, { $set: profileUpdate })
}

    if (!reposResponse.ok) {
            console.error('Failed to fetch repos');
            return;
        }
        const repos = await reposResponse.json();
        const filteredRepos = repos.filter(r => !blockedRepoIds.includes(r.id));

        // process 10 repos at a time
        for (let i = 0; i < filteredRepos.length; i += 10) {
            const batch = filteredRepos.slice(i, i + 10);
            await Promise.all(batch.map(async (repo) => {
                try {
                    const repoDoc = await Repo.findOne({ githubId: repo.id });
                    const hasNewPushes = !repoDoc?.pushedAt ||
                        new Date(repo.pushed_at) > new Date(repoDoc.pushedAt);

                    let readme = repoDoc?.readme || null;
                    if (hasNewPushes) {
                        try {
                            const readmeRes = await fetch(
                                `https://api.github.com/repos/${repo.full_name}/readme`,
                                { headers: { ...GITHUB_HEADERS(accessToken), 'Accept': 'application/vnd.github.raw' } }
                            );
                            if (readmeRes.ok) readme = await readmeRes.text();
                        } catch (e) {}
                    }

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
                        if (!manuallyEdited.includes('title')) updateFields.title = repo.name;
                        if (!manuallyEdited.includes('description')) updateFields.description = repo.description || '';
                        if (!manuallyEdited.includes('visibility')) updateFields.visibility = repo.private ? 'private' : 'public';
                        if (!manuallyEdited.includes('status') &&
                            existingProject.status !== 'completed' &&
                            existingProject.status !== 'archived') {
                            updateFields.status = derivedStatus;
                        }
                        await Project.findByIdAndUpdate(existingProject._id, { $set: updateFields });
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
                } catch (e) {
                    console.error(`Fast sync failed for repo ${repo.full_name}:`, e.message);
                }
            }));
        }

        // queue layer 2
        await githubCommitQueue.add({ userId, accessToken, githubUsername });
        console.log(`Fast sync complete for user ${userId}`);

    } catch (error) {
        console.error('syncFast error:', error.message);
    }
};

// ================================================================
// LAYER 2 — COMMIT SYNC
// ================================================================
const syncCommits = async (userId, accessToken, githubUsername) => {
    try {
        console.log(`Commit sync starting for user ${userId}`);

        const dbUser = await User.findById(userId);
        const blockedRepoIds = dbUser.github?.blockedRepoIds || [];
        const repos = await Repo.find({ user: userId });
        const filteredRepos = repos.filter(r => !blockedRepoIds.includes(r.githubId));

        for (let i = 0; i < filteredRepos.length; i += 10) {
            const batch = filteredRepos.slice(i, i + 10);
            await Promise.all(batch.map(async (repo) => {
                try {
                    const hasNewPushes = !repo.lastSyncedAt ||
                        new Date(repo.pushedAt) > new Date(repo.lastSyncedAt);
                    if (!hasNewPushes) return;

                    let commitsUrl = `https://api.github.com/repos/${repo.fullName}/commits?per_page=100&author=${githubUsername}`;
                    if (repo.lastSyncedAt) {
                        commitsUrl += `&since=${repo.lastSyncedAt.toISOString()}`;
                    }

                    const commitsRes = await fetch(commitsUrl, { headers: GITHUB_HEADERS(accessToken) });
                    if (!commitsRes.ok) return;

                    const commits = await commitsRes.json();
                    for (const commit of commits) {
                        await Commit.findOneAndUpdate(
                            { sha: commit.sha },
                            {
                                $setOnInsert: {
                                    user: userId,
                                    sha: commit.sha,
                                    message: commit.commit.message,
                                    timestamp: commit.commit.author.date,
                                    branch: repo.defaultBranch,
                                    repo: repo.fullName,
                                    repoId: repo.githubId,
                                    url: commit.html_url,
                                    detailsFetched: false
                                }
                            },
                            { upsert: true }
                        );
                    }
                } catch (e) {
                    console.error(`Commit sync failed for ${repo.fullName}:`, e.message);
                }
            }));
        }

        await githubPRQueue.add({ userId, accessToken });
        console.log(`Commit sync complete for user ${userId}`);

    } catch (error) {
        console.error('syncCommits error:', error.message);
    }
};

// ================================================================
// LAYER 3 — PR + RELEASE SYNC
// ================================================================
const syncPRsAndReleases = async (userId, accessToken) => {
    try {
        console.log(`PR/Release sync starting for user ${userId}`);

        const dbUser = await User.findById(userId);
        const blockedRepoIds = dbUser.github?.blockedRepoIds || [];
        const repos = await Repo.find({ user: userId });
        const filteredRepos = repos.filter(r => !blockedRepoIds.includes(r.githubId));

        for (let i = 0; i < filteredRepos.length; i += 10) {
            const batch = filteredRepos.slice(i, i + 10);
            await Promise.all(batch.map(async (repo) => {
                try {
                    // PRs
                    const prsRes = await fetch(
                        `https://api.github.com/repos/${repo.fullName}/pulls?per_page=100&state=all`,
                        { headers: GITHUB_HEADERS(accessToken) }
                    );
                    if (prsRes.ok) {
                        const prs = await prsRes.json();
                        for (const pr of prs) {
                            const isOwnRepo = pr.user?.id === dbUser.github?.id;
                            await PullRequest.findOneAndUpdate(
                                { githubId: pr.id },
                                {
                                    $setOnInsert: {
                                        user: userId,
                                        repo: repo.fullName,
                                        repoId: repo.githubId,
                                        githubId: pr.id,
                                        title: pr.title,
                                        state: pr.merged_at ? 'merged' : pr.state,
                                        merged: !!pr.merged_at,
                                        role: isOwnRepo ? 'author' : 'owner',
                                        authorGithubId: pr.user?.id,
                                        authorUsername: pr.user?.login,
                                        repoOwnerId: repo.owner?.id,
                                        repoOwnerUsername: repo.owner?.login,
                                        isOwnRepo,
                                        targetBranch: pr.base?.ref,
                                        sourceBranch: pr.head?.ref,
                                        openedAt: new Date(pr.created_at),
                                        mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
                                        closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
                                    }
                                },
                                { upsert: true }
                            );
                        }
                    }

                    // Releases
                    const releasesRes = await fetch(
                        `https://api.github.com/repos/${repo.fullName}/releases?per_page=100`,
                        { headers: GITHUB_HEADERS(accessToken) }
                    );
                    if (releasesRes.ok) {
                        const releases = await releasesRes.json();
                        for (const release of releases) {
                            await Release.findOneAndUpdate(
                                { githubId: release.id },
                                {
                                    $setOnInsert: {
                                        user: userId,
                                        repo: repo.fullName,
                                        repoId: repo.githubId,
                                        githubId: release.id,
                                        tagName: release.tag_name,
                                        title: release.name,
                                        description: release.body,
                                        isPrerelease: release.prerelease,
                                        publishedAt: new Date(release.published_at)
                                    }
                                },
                                { upsert: true }
                            );
                        }
                    }
                } catch (e) {
                    console.error(`PR/Release sync failed for ${repo.fullName}:`, e.message);
                }
            }));
        }

        console.log(`PR/Release sync complete for user ${userId}`);

    } catch (error) {
        console.error('syncPRsAndReleases error:', error.message);
    }
};

module.exports = { syncFast, syncCommits, syncPRsAndReleases };
