const resetPasswordRouter = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

resetPasswordRouter.post('/', async (request, response) => {
    const { token, password } = request.body;

    if (!token || !password) {
        return response.status(400).json({ error: 'Token and password are required' });
    }

    if (password.length < 8) {
        return response.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() } // token not expired
        });

        if (!user) {
            return response.status(400).json({ error: 'This link is invalid or has expired.' });
        }

        user.passwordHash = await bcrypt.hash(password, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        return response.status(200).json({ message: 'Password reset successfully.' });

    } catch (error) {
        console.error('Reset password error:', error);
        response.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
});

module.exports = resetPasswordRouter;