const Commit = require('../models/commit');
const User = require('../models/user');

let isRunning = false

const fetchCommitDetails = async () => {
    if (isRunning) return;
    isRunning = true;
    try {
        // Get all users who have pending commits
        const usersWithPending = await Commit.distinct('user', {
            detailsFetched: false
        });

        for (const userId of usersWithPending) {
            // Get this user's access token
            const user = await User.findById(userId)
                .select('+github.accessToken');

            if (!user?.github?.accessToken) continue;

            // Get 10 pending commits for THIS user only
            const pendingCommits = await Commit.find({
                user: userId,
                detailsFetched: false
            }).limit(10);

            for (const commit of pendingCommits) {
                try {
                    const detailResponse = await fetch(
                        `https://api.github.com/repos/${commit.repo}/commits/${commit.sha}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${user.github.accessToken}`,
                                'Accept': 'application/json',
                                'User-Agent': 'CodeDash-App'
                            }
                        }
                    );

                    if (!detailResponse.ok) {
                        if (detailResponse.status === 403) {
                            console.log(`User ${userId} rate limited, skipping`);
                            break; // stop this user, move to next
                        }
                        continue;
                    }
                    const detail = await detailResponse.json();

                    const remaining = parseInt(detailResponse.headers.get('X-RateLimit-Remaining'));
                    if (remaining < 100) {
                        console.log(`User ${userId} rate limit low, stopping`);
                        break; // stop processing this user's commits
                    }

                    await Commit.findByIdAndUpdate(commit._id, {
                        $set: {
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
                            detailsFetched: true
                        }
                    });

                    await new Promise(resolve => setTimeout(resolve, 1000));

                } catch (e) {
                    console.error(`Failed commit ${commit.sha}:`, e.message);
                }
            }
        }

    } catch (error) {
        console.error('Commit detail job error:', error);
    } finally {
        isRunning = false;
    }
};

module.exports = { fetchCommitDetails };