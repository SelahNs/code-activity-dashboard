const PullRequest = require('../models/pullRequest');
const User = require('../models/user');

let isRunning = false;

const fetchPRDetails = async () => {
    if (isRunning) return;
    isRunning = true;

    try {
        const usersWithPending = await PullRequest.distinct('user', {
            merged: true,
            commits: null  // commits is null means details not fetched yet
        });

        for (const userId of usersWithPending) {
            const user = await User.findById(userId).select('+github.accessToken');
            if (!user?.github?.accessToken) continue;

            const pendingPRs = await PullRequest.find({
                user: userId,
                merged: true,
                commits: null
            }).limit(10);

            for (const pr of pendingPRs) {
                try {
                    const res = await fetch(
                        `https://api.github.com/repos/${pr.repo}/pulls/${pr.githubId}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${user.github.accessToken}`,
                                'Accept': 'application/json',
                                'User-Agent': 'CodeDash-App'
                            }
                        }
                    );

                    if (!res.ok) {
                        if (res.status === 403) {
                            console.log(`User ${userId} rate limited, skipping`);
                            break;
                        }
                        continue;
                    }

                    const detail = await res.json();

                    const remaining = parseInt(res.headers.get('X-RateLimit-Remaining'));
                    if (remaining < 100) {
                        console.log(`User ${userId} rate limit low, stopping`);
                        break;
                    }

                    await PullRequest.findByIdAndUpdate(pr._id, {
                        $set: {
                            commits: detail.commits,
                            additions: detail.additions,
                            deletions: detail.deletions,
                            changedFiles: detail.changed_files
                        }
                    });

                    await new Promise(resolve => setTimeout(resolve, 1000));

                } catch (e) {
                    console.error(`Failed PR ${pr.githubId}:`, e.message);
                }
            }
        }

    } catch (error) {
        console.error('PR detail job error:', error.message);
    } finally {
        isRunning = false;
    }
};

module.exports = { fetchPRDetails };