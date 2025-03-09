const { Pool } = require('pg');
const winston = require('winston');
const DateConverter = require('../utils/dateConverter');

// Initialize database connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

class LedgerController {
    /**
     * Create a new ledger account
     */
    static async createLedgerAccount(req, res) {
        const client = await pool.connect();
        try {
            const {
                name,
                code,
                groupId,
                allowSubledger,
                transactionTypes,
                address,
                city,
                state,
                countryId,
                phone,
                email,
                mobile,
                alternateMobile,
                panNumber,
                panType,
                creditLimit,
                creditDays,
                contactPerson,
                bankName,
                bankAccountNo,
                openingBalance = 0
            } = req.body;

            await client.query('BEGIN');

            // Create ledger account
            const result = await client.query(
                `INSERT INTO ledger_accounts 
                (name, code, group_id, allow_subledger, transaction_types, 
                address, city, state, country_id, phone, email, mobile, 
                alternate_mobile, pan_number, pan_type, credit_limit, 
                credit_days, contact_person, bank_name, bank_account_no, 
                opening_balance, current_balance) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 
                        $13, $14, $15, $16, $17, $18, $19, $20, $21, $21) 
                RETURNING *`,
                [name, code, groupId, allowSubledger, transactionTypes, 
                address, city, state, countryId, phone, email, mobile, 
                alternateMobile, panNumber, panType, creditLimit, 
                creditDays, contactPerson, bankName, bankAccountNo, 
                openingBalance]
            );

            // If opening balance is not 0, create an opening balance transaction
            if (openingBalance !== 0) {
                const today = new Date();
                const todayNP = DateConverter.convertADToBS(today);
                
                await client.query(
                    `INSERT INTO transactions 
                    (transaction_date, transaction_date_np, ledger_account_id, 
                    type, amount, description) 
                    VALUES ($1, $2, $3, $4, $5, $6)`,
                    [
                        today,
                        todayNP,
                        result.rows[0].id,
                        openingBalance > 0 ? 'credit' : 'debit',
                        Math.abs(openingBalance),
                        'Opening Balance'
                    ]
                );
            }

            await client.query('COMMIT');

            res.status(201).json({
                status: 'success',
                data: result.rows[0]
            });
        } catch (error) {
            await client.query('ROLLBACK');
            winston.error('Error creating ledger account:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to create ledger account'
            });
        } finally {
            client.release();
        }
    }

    /**
     * Get all ledger accounts
     */
    static async getLedgerAccounts(req, res) {
        try {
            const { groupId, type } = req.query;

            let query = `
                SELECT la.*, ag.name as group_name, ag.type as account_type,
                    c.name as country_name
                FROM ledger_accounts la
                LEFT JOIN account_groups ag ON la.group_id = ag.id
                LEFT JOIN countries c ON la.country_id = c.id
            `;

            const params = [];
            const conditions = [];

            if (groupId) {
                conditions.push(`la.group_id = $${params.length + 1}`);
                params.push(groupId);
            }

            if (type) {
                conditions.push(`ag.type = $${params.length + 1}`);
                params.push(type);
            }

            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }

            query += ' ORDER BY la.name';

            const result = await pool.query(query, params);

            res.json({
                status: 'success',
                data: result.rows
            });
        } catch (error) {
            winston.error('Error fetching ledger accounts:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to fetch ledger accounts'
            });
        }
    }

    /**
     * Get ledger account details
     */
    static async getLedgerAccount(req, res) {
        try {
            const { id } = req.params;

            const result = await pool.query(
                `SELECT la.*, ag.name as group_name, ag.type as account_type,
                    c.name as country_name
                FROM ledger_accounts la
                LEFT JOIN account_groups ag ON la.group_id = ag.id
                LEFT JOIN countries c ON la.country_id = c.id
                WHERE la.id = $1`,
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Ledger account not found'
                });
            }

            res.json({
                status: 'success',
                data: result.rows[0]
            });
        } catch (error) {
            winston.error('Error fetching ledger account:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to fetch ledger account'
            });
        }
    }

    /**
     * Update ledger account
     */
    static async updateLedgerAccount(req, res) {
        const client = await pool.connect();
        try {
            const { id } = req.params;
            const {
                name,
                code,
                groupId,
                allowSubledger,
                transactionTypes,
                address,
                city,
                state,
                countryId,
                phone,
                email,
                mobile,
                alternateMobile,
                panNumber,
                panType,
                creditLimit,
                creditDays,
                contactPerson,
                bankName,
                bankAccountNo
            } = req.body;

            await client.query('BEGIN');

            const result = await client.query(
                `UPDATE ledger_accounts 
                SET name = $1, code = $2, group_id = $3, allow_subledger = $4,
                    transaction_types = $5, address = $6, city = $7, state = $8,
                    country_id = $9, phone = $10, email = $11, mobile = $12,
                    alternate_mobile = $13, pan_number = $14, pan_type = $15,
                    credit_limit = $16, credit_days = $17, contact_person = $18,
                    bank_name = $19, bank_account_no = $20,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $21
                RETURNING *`,
                [name, code, groupId, allowSubledger, transactionTypes,
                address, city, state, countryId, phone, email, mobile,
                alternateMobile, panNumber, panType, creditLimit,
                creditDays, contactPerson, bankName, bankAccountNo, id]
            );

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({
                    status: 'error',
                    message: 'Ledger account not found'
                });
            }

            await client.query('COMMIT');

            res.json({
                status: 'success',
                data: result.rows[0]
            });
        } catch (error) {
            await client.query('ROLLBACK');
            winston.error('Error updating ledger account:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to update ledger account'
            });
        } finally {
            client.release();
        }
    }

    /**
     * Get ledger account statement
     */
    static async getLedgerStatement(req, res) {
        try {
            const { id } = req.params;
            const { startDate, endDate } = req.query;

            // Convert dates to Nepali format
            const startDateNP = DateConverter.convertADToBS(startDate);
            const endDateNP = DateConverter.convertADToBS(endDate);

            // Get account details
            const accountResult = await pool.query(
                'SELECT * FROM ledger_accounts WHERE id = $1',
                [id]
            );

            if (accountResult.rows.length === 0) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Ledger account not found'
                });
            }

            // Get transactions within date range
            const transactions = await pool.query(
                `SELECT * FROM transactions 
                WHERE ledger_account_id = $1 
                AND transaction_date_np BETWEEN $2 AND $3 
                ORDER BY transaction_date, id`,
                [id, startDateNP, endDateNP]
            );

            // Calculate running balance
            let runningBalance = accountResult.rows[0].opening_balance;
            const statement = transactions.rows.map(transaction => {
                runningBalance += transaction.type === 'credit' ? 
                    transaction.amount : -transaction.amount;
                
                return {
                    ...transaction,
                    running_balance: runningBalance
                };
            });

            res.json({
                status: 'success',
                data: {
                    account: accountResult.rows[0],
                    transactions: statement,
                    summary: {
                        openingBalance: accountResult.rows[0].opening_balance,
                        closingBalance: runningBalance,
                        totalCredits: statement.reduce((sum, t) => 
                            sum + (t.type === 'credit' ? t.amount : 0), 0),
                        totalDebits: statement.reduce((sum, t) => 
                            sum + (t.type === 'debit' ? t.amount : 0), 0)
                    }
                }
            });
        } catch (error) {
            winston.error('Error getting ledger statement:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to get ledger statement'
            });
        }
    }
}

module.exports = LedgerController;
