const projectsRouter = require('express').Router();
const Project = require('../models/project')
const User = require('../models/user')

projectsRouter.get('/', async (request, response) => {
  const {user} = request;
  if (!user) {
    return response.status(401).json({error: 'unauthorized'})
  }
  try {
    const projects = await Project.find({ user: user._id, status: {$ne: 'archived'}}).select('-github.readme -gallery -docsUrl -liveUrl');
    return response.status(200).json(projects)
  } catch (error) {
    console.error('Get projects error:', error);
    return response.status(500).json({error: 'Something went wrong.'})
  }
})

projectsRouter.get('/archived', async (request, response) => {
    const { user } = request;
    if (!user) return response.status(401).json({ error: 'unauthorized' });

    try {
        const projects = await Project.find({ 
            user: user._id,
            status: 'archived'
        }).select('-github.readme -gallery -docsUrl -liveUrl');
        return response.status(200).json(projects);
    } catch (error) {
        return response.status(500).json({ error: 'Something went wrong.' });
    }
});

projectsRouter.get('/:id', async (request, response) => {
  const {user} = request;
  if (!user) {
    return response.status(401).json({error: 'unauthorized'})
  }
  
  try {
    const project = await Project.findOne({
      _id: request.params.id,
      user: user._id
    });

    if (!project) {
      return response.status(404).json({ error: 'Project not found'});
    }

    return response.json(project)
  } catch (error) {
    console.error('Get project error:', error)
    return response.status(500).json({error: 'Something went wrong.'})
  }
})

projectsRouter.post('/', async (request, response) => {
  const {user} = request;
  if (!user) {
    return response.status(401).json({error: 'unauthorized'})
  }

  try {
    const {title, description, status, tags, liveUrl, docsUrl} = request.body;
    if (!title) {
      return response.status(400).json({error: 'Title is required'})
    }
    const project = new Project({
      user: user._id,
      title,
      description,
      status: status || 'active',
      tags: tags || [],
      liveUrl,
      docsUrl
    });
    await project.save();
    return response.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error)
    return response.status(500).json({error: 'Something went wrong.'})
  }
})

projectsRouter.put('/:id', async (request, response) => {
  const { user} = request;
  if (!user) {
    return response.status(401).json({error: 'unauthorized'})
  }

  try {
    const project = await Project.findOne({
      _id: request.params.id,
      user: user._id
    });

    if(!project) {
      return response.status(404).json({error: 'Project no found'})
    }

    const allowedFields = [
      'title', 'description', 'status',
      'tags', 'liveUrl', 'docsUrl', 'gallery'
    ];

    allowedFields.forEach(field => {
      if (request.body[field] !== undefined) {
        project[field] = request.body[field];
      }
    });

    await project.save();
    return response.json(project)
  } catch (error) {
    console.error('Update project error:', error)
    return response.status(500).json({error: 'Something went wrong.'})
  }
})

projectsRouter.patch('/unblock-repo/:repoId', async (request, response) => {
    const { user } = request;
    if (!user) return response.status(401).json({ error: 'unauthorized' });

    try {
        await User.findByIdAndUpdate(user._id, {
            $pull: { 
                'github.blockedRepoIds': parseInt(request.params.repoId) 
            }
        });

        return response.status(200).json({ message: 'Repo unblocked. It will appear on next sync.' });

    } catch (error) {
        return response.status(500).json({ error: 'Something went wrong.' });
    }
});

projectsRouter.patch('/:id/archive', async (request, response) => {
    const { user } = request;
    if (!user) return response.status(401).json({ error: 'unauthorized' });

    try {
        const project = await Project.findOne({
            _id: request.params.id,
            user: user._id
        });

        if (!project) return response.status(404).json({ error: 'Project not found' });

        const updated = await Project.findByIdAndUpdate(
            project._id,
            { $set: { 
                previousStatus: project.status, // remember what it was
                status: 'archived' 
            }},
            { new: true }
        );

        return response.status(200).json(updated);
    } catch (error) {
        return response.status(500).json({ error: 'Something went wrong.' });
    }
});

projectsRouter.patch('/:id/restore', async (request, response) => {
    const { user } = request;
    if (!user) return response.status(401).json({ error: 'unauthorized' });

    try {
        const project = await Project.findOne({
            _id: request.params.id,
            user: user._id
        });

        if (!project) return response.status(404).json({ error: 'Project not found' });

        const updated = await Project.findByIdAndUpdate(
            project._id,
            { $set: { 
                status: project.previousStatus || 'active', // restore to what it was
                previousStatus: null
            }},
            { new: true }
        );

        return response.status(200).json(updated);
    } catch (error) {
        return response.status(500).json({ error: 'Something went wrong.' });
    }
});

projectsRouter.patch('/:id/link-github', async (request, response) => {
    const { user } = request;
    if (!user) return response.status(401).json({ error: 'unauthorized' });

    const { repoId } = request.body;

    try {
        // Check this repo isn't already linked to another project
        const alreadyLinked = await Project.findOne({
            user: user._id,
            'github.repoId': repoId,
            _id: { $ne: request.params.id } // not this project
        });

        if (alreadyLinked) {
            return response.status(400).json({ 
                error: 'This repo is already linked to another project' 
            });
        }

        const dbUser = await User.findById(user._id).select('+github.accessToken');
        const repoResponse = await fetch(
            `https://api.github.com/repositories/${repoId}`,
            {
                headers: {
                    'Authorization': `Bearer ${dbUser.github.accessToken}`,
                    'Accept': 'application/json',
                    'User-Agent': 'CodeDash-App'
                }
            }
        );

        if (!repoResponse.ok) {
            return response.status(400).json({ error: 'Could not fetch repo from GitHub' });
        }

        const repo = await repoResponse.json();

        let readme = null;
        try {
            const readmeResponse = await fetch(
                `https://api.github.com/repos/${repo.full_name}/readme`,
                {
                    headers: {
                        'Authorization': `Bearer ${dbUser.github.accessToken}`,
                        'Accept': 'application/vnd.github.raw',
                        'User-Agent': 'CodeDash-App'
                    }
                }
            );
            if (readmeResponse.ok) readme = await readmeResponse.text();
        } catch (e) {}

        const updated = await Project.findOneAndUpdate(
            { _id: request.params.id, user: user._id },
            {
                $set: {
                    'github.repoId': repo.id,
                    'github.fullName': repo.full_name,
                    'github.url': repo.html_url,
                    'github.stars': repo.stargazers_count,
                    'github.forks': repo.forks_count,
                    'github.language': repo.language,
                    'github.lastCommit': repo.pushed_at,
                    'github.readme': readme,
                    'visibility': repo.private ? 'private' : 'public'
                }
            },
            { new: true }
        );

        return response.status(200).json(updated);

    } catch (error) {
        console.error('Link GitHub error:', error);
        return response.status(500).json({ error: 'Something went wrong.' });
    }
});

projectsRouter.patch('/:id/unlink-github', async(request, response) => {
  const {user} = request;
  if (!user) return response.status(401).json({error: 'unauthorized'})

  try {
    const updated = await Project.findOneAndUpdate(
      {_id: request.params.id, user: user._id},
      {
        $unset: {github: ''}
      },
      {new: true}
    );

    if (!updated) return response.status(404).json({error: 'Project not found'})
    return response.status(200).json(updated);
  } catch (error) {
    console.error('Unlink GitHub error:', error)
    return response.status(500).json({ error: 'Something went wrong.'})
  }
})

projectsRouter.delete('/:id', async (request, response) => {
    const { user } = request;
    if (!user) return response.status(401).json({ error: 'unauthorized' });

    try {
        const project = await Project.findOne({
            _id: request.params.id,
            user: user._id
        });

        if (!project) return response.status(404).json({ error: 'Project not found' });

        // If linked to GitHub, block that repo from future syncs
        if (project.github?.repoId) {
            await User.findByIdAndUpdate(user._id, {
                $addToSet: { 
                    'github.blockedRepoIds': project.github.repoId 
                }
            });
        }

        // Hard delete the project
        await Project.findByIdAndDelete(project._id);

        return response.status(200).json({ 
            message: 'Project deleted.',
            repoBlocked: !!project.github?.repoId
        });

    } catch (error) {
        console.error('Delete project error:', error);
        return response.status(500).json({ error: 'Something went wrong.' });
    }
});

module.exports = projectsRouter