const authService = require('../services/authService');
const sendEmail = require('../utils/sendEmail');
const fs = require('fs');
const path = require('path');

const isDatabaseUnavailable = (error) => {
    const details = `${error?.code || ''} ${error?.message || ''}`.toLowerCase();
    return [
        'p1001',
        'p1000',
        "can't reach database server",
        'database server',
        'connection refused',
        'authentication failed',
    ].some((needle) => details.includes(needle));
};

const register = async (req, res) => {
    try {
        const result = await authService.signup(req.body);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: result,
        });
    } catch (error) {
        if (error.message?.includes('JWT_SECRET')) {
            return res.status(500).json({ success: false, message: 'Server configuration error' });
        }
        const msg = error?.message || 'Registration failed';
        const status = error?.code === 'P2023' || msg.includes('exist') ? 500 : 400;
        const message = isDatabaseUnavailable(error)
            ? 'Database is not available. Check the PostgreSQL connection settings.'
            : msg;
        return res.status(status).json({ success: false, message });
    }
};

const login = async (req, res) => {
    try {
        const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
        const password = req.body?.password;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }
        const result = await authService.login(email, password);

        if (result.requiresEmailVerification) {
            try {
                await sendEmail({
                    email: result.email,
                    subject: 'Your RentFlow verification code',
                    message: `Your RentFlow verification code is ${result.verificationCode}. It expires in 10 minutes.`,
                    html: `
                        <h1>Verify your email</h1>
                        <p>Use this code to verify your RentFlow account:</p>
                        <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">${result.verificationCode}</p>
                        <p>This code expires in 10 minutes. Do not share it with anyone.</p>
                    `,
                });
            } catch (emailError) {
                console.error('Verification email error:', emailError.message);
                return res.status(503).json({
                    success: false,
                    message: 'Email verification is unavailable. Configure SMTP settings and try again.',
                });
            }

            return res.status(403).json({
                success: false,
                requiresEmailVerification: true,
                email: result.email,
                message: 'Enter the six-digit code sent to your email.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: result,
        });
    } catch (error) {
        if (error.message?.includes('JWT_SECRET')) {
            return res.status(500).json({ success: false, message: 'Server configuration error' });
        }
        const msg = error?.message || 'Login failed';
        const status = error?.code === 'P2023' || msg.includes('exist') ? 500 : 400;
        const message = isDatabaseUnavailable(error)
            ? 'Database is not available. Check the PostgreSQL connection settings.'
            : msg;
        return res.status(status).json({ success: false, message });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body || {};
        await authService.verifyEmail(email, code);
        return res.status(200).json({
            success: true,
            message: 'Email verified. You can now sign in.',
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await authService.getMe(req.user.userId);
        res.status(200).json({
            success: true,
            data: { user },
        });
    } catch (error) {
        const msg = error?.message || 'Failed to get user';
        const status = msg === 'User not found' ? 404 : 500;
        return res.status(status).json({ success: false, message: msg });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const email = req.body.email;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const result = await authService.forgotPassword(email);
        
        // If result is null, user not found, but we still say email sent to avoid enumeration
        if (!result) {
            return res.status(200).json({
                success: true,
                message: 'The password reset link has been sent to your email.',
            });
        }

        const { user, resetToken } = result;

        // Create reset URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

        console.log('---------------------------------------------------');
        console.log('PASSWORD RESET LINK (DEV MODE):');
        console.log(resetUrl);
        console.log('---------------------------------------------------');

        // Log to file for convenience
        try {
            const logPath = path.join(__dirname, '../../reset-link.txt');
            fs.writeFileSync(logPath, `Last generated reset link:\n${resetUrl}\n\nGenerated at: ${new Date().toISOString()}`);
            console.log(`Reset link also written to: ${logPath}`);
        } catch (fileErr) {
            console.error('Failed to write reset link to file:', fileErr.message);
        }

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click on the following link, or paste this into your browser to complete the process:\n\n ${resetUrl}`;
        const html = `
            <h1>Password Reset Request</h1>
            <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
            <p>Please click on the following link, or paste this into your browser to complete the process:</p>
            <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Token',
                message,
                html,
            });

            res.status(200).json({
                success: true,
                message: 'The password reset link has been sent to your email.',
            });
        } catch (err) {
            console.error('Email send error:', err.message);
            // In development, we might still want to allow the flow even if email fails, 
            // provided we logged the link above.
            // But for now, let's return success but with a warning in message if we are in dev/hackathon mode?
            // Actually, better to just return success if we logged it, but warn in console.
            
            // For this Hackathon, let's assume if email fails, we still return success 
            // so the user can use the console log link.
            res.status(200).json({
                success: true,
                message: 'Email service failed (check server logs for link), but reset token generated.',
            });
        }

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ success: false, message: 'Token and password are required' });
        }
        
        await authService.resetPassword(token, password);
        
        res.status(200).json({
            success: true,
            message: 'Password updated successfully. You can now login.',
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    register,
    login,
    verifyEmail,
    getMe,
    forgotPassword,
    resetPassword,
};
