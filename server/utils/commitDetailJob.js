const Commit = require('../models/commit');
const User = require('../models/user');

const fetchCommitDetails = async () => {
    try {
        // Get all users who have pending commits
        const usersWithPending = await Commit.distinct('user', { 
            detailsFetched: false 
        });

        if (usersWithPending.length === 0) return;

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

                    if (!detailResponse.ok) continue;
                    const detail = await detailResponse.json();

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
    }
};

module.exports = { fetchCommitDetails };