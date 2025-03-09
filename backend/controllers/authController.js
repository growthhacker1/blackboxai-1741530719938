const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const winston = require('winston');

// Initialize database connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

class AuthController {
    /**
     * User Registration
     */
    static async register(req, res) {
        const client = await pool.connect();
        try {
            const {
                username,
                password,
                fullName,
                email,
                mobile,
                roleId,
                branchId
            } = req.body;

            // Check if username already exists
            const existingUser = await client.query(
                'SELECT id FROM users WHERE username = $1',
                [username]
            );

            if (existingUser.rows.length > 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Username already exists'
                });
            }

            // Hash password
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            await client.query('BEGIN');

            // Create user
            const result = await client.query(
                `INSERT INTO users 
                (username, password_hash, full_name, email, mobile, role_id, branch_id) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) 
                RETURNING id, username, full_name, email, mobile, role_id, branch_id`,
                [username, passwordHash, fullName, email, mobile, roleId, branchId]
            );

            // If branch access is provided, create branch access entries
            if (req.body.branchAccess && Array.isArray(req.body.branchAccess)) {
                for (const branchId of req.body.branchAccess) {
                    await client.query(
                        'INSERT INTO user_branch_access (user_id, branch_id) VALUES ($1, $2)',
                        [result.rows[0].id, branchId]
                    );
                }
            }

            await client.query('COMMIT');

            res.status(201).json({
                status: 'success',
                data: result.rows[0]
            });
        } catch (error) {
            await client.query('ROLLBACK');
            winston.error('Error registering user:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to register user'
            });
        } finally {
            client.release();
        }
    }

    /**
     * User Login
     */
    static async login(req, res) {
        try {
            const { username, password } = req.body;

            // Get user with role and permissions
            const result = await pool.query(
                `SELECT u.*, r.name as role_name,
                    ARRAY_AGG(DISTINCT p.name) as permissions,
                    ARRAY_AGG(DISTINCT uba.branch_id) as branch_access
                FROM users u
                LEFT JOIN roles r ON u.role_id = r.id
                LEFT JOIN role_permissions rp ON r.id = rp.role_id
                LEFT JOIN permissions p ON rp.permission_id = p.id
                LEFT JOIN user_branch_access uba ON u.id = uba.user_id
                WHERE u.username = $1 AND u.is_active = true
                GROUP BY u.id, r.name`,
                [username]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid credentials'
                });
            }

            const user = result.rows[0];

            // Verify password
            const validPassword = await bcrypt.compare(password, user.password_hash);
            if (!validPassword) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid credentials'
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: user.id,
                    username: user.username,
                    role: user.role_name,
                    permissions: user.permissions,
                    branchAccess: user.branch_access
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Update last login
            await pool.query(
                'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
                [user.id]
            );

            res.json({
                status: 'success',
                data: {
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        fullName: user.full_name,
                        email: user.email,
                        role: user.role_name,
                        permissions: user.permissions,
                        branchAccess: user.branch_access
                    }
                }
            });
        } catch (error) {
            winston.error('Error logging in:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to login'
            });
        }
    }

    /**
     * Change Password
     */
    static async changePassword(req, res) {
        const client = await pool.connect();
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.userId; // From auth middleware

            // Get current user
            const result = await client.query(
                'SELECT password_hash FROM users WHERE id = $1',
                [userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }

            // Verify current password
            const validPassword = await bcrypt.compare(
                currentPassword,
                result.rows[0].password_hash
            );

            if (!validPassword) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Current password is incorrect'
                });
            }

            // Hash new password
            const saltRounds = 10;
            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

            // Update password
            await client.query(
                `UPDATE users 
                SET password_hash = $1,
                    password_changed_at = CURRENT_TIMESTAMP
                WHERE id = $2`,
                [newPasswordHash, userId]
            );

            res.json({
                status: 'success',
                message: 'Password changed successfully'
            });
        } catch (error) {
            winston.error('Error changing password:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to change password'
            });
        } finally {
            client.release();
        }
    }

    /**
     * Client Portal User Registration
     */
    static async registerClientPortalUser(req, res) {
        const client = await pool.connect();
        try {
            const {
                username,
                password,
                ledgerAccountId
            } = req.body;

            // Check if username already exists
            const existingUser = await client.query(
                'SELECT id FROM client_portal_users WHERE username = $1',
                [username]
            );

            if (existingUser.rows.length > 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Username already exists'
                });
            }

            // Hash password
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            // Create client portal user
            const result = await client.query(
                `INSERT INTO client_portal_users 
                (username, password_hash, ledger_account_id) 
                VALUES ($1, $2, $3) 
                RETURNING id, username, ledger_account_id`,
                [username, passwordHash, ledgerAccountId]
            );

            res.status(201).json({
                status: 'success',
                data: result.rows[0]
            });
        } catch (error) {
            winston.error('Error registering client portal user:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to register client portal user'
            });
        } finally {
            client.release();
        }
    }

    /**
     * Client Portal Login
     */
    static async clientPortalLogin(req, res) {
        try {
            const { username, password } = req.body;

            // Get client portal user
            const result = await pool.query(
                `SELECT cpu.*, la.name as ledger_name
                FROM client_portal_users cpu
                JOIN ledger_accounts la ON cpu.ledger_account_id = la.id
                WHERE cpu.username = $1 AND cpu.is_active = true`,
                [username]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid credentials'
                });
            }

            const user = result.rows[0];

            // Verify password
            const validPassword = await bcrypt.compare(password, user.password_hash);
            if (!validPassword) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid credentials'
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: user.id,
                    username: user.username,
                    ledgerAccountId: user.ledger_account_id,
                    isClientPortal: true
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Update last login
            await pool.query(
                'UPDATE client_portal_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
                [user.id]
            );

            res.json({
                status: 'success',
                data: {
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        ledgerAccountId: user.ledger_account_id,
                        ledgerName: user.ledger_name
                    }
                }
            });
        } catch (error) {
            winston.error('Error logging in to client portal:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to login to client portal'
            });
        }
    }
}

module.exports = AuthController;
