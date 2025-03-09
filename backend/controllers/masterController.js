const { Pool } = require('pg');
const winston = require('winston');
const DateConverter = require('../utils/dateConverter');

// Initialize database connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

class MasterController {
    /**
     * Country Management
     */
    static async createCountry(req, res) {
        const client = await pool.connect();
        try {
            const { name, code } = req.body;

            const result = await client.query(
                'INSERT INTO countries (name, code) VALUES ($1, $2) RETURNING *',
                [name, code]
            );

            res.status(201).json({
                status: 'success',
                data: result.rows[0]
            });
        } catch (error) {
            winston.error('Error creating country:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to create country'
            });
        } finally {
            client.release();
        }
    }

    static async getCountries(req, res) {
        try {
            const result = await pool.query(
                'SELECT * FROM countries ORDER BY name'
            );

            res.json({
                status: 'success',
                data: result.rows
            });
        } catch (error) {
            winston.error('Error fetching countries:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to fetch countries'
            });
        }
    }

    /**
     * Unit Management
     */
    static async createUnit(req, res) {
        const client = await pool.connect();
        try {
            const { name, code, description } = req.body;

            const result = await client.query(
                'INSERT INTO units (name, code, description) VALUES ($1, $2, $3) RETURNING *',
                [name, code, description]
            );

            res.status(201).json({
                status: 'success',
                data: result.rows[0]
            });
        } catch (error) {
            winston.error('Error creating unit:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to create unit'
            });
        } finally {
            client.release();
        }
    }

    static async getUnits(req, res) {
        try {
            const result = await pool.query(
                'SELECT * FROM units ORDER BY name'
            );

            res.json({
                status: 'success',
                data: result.rows
            });
        } catch (error) {
            winston.error('Error fetching units:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to fetch units'
            });
        }
    }

    /**
     * Branch Management
     */
    static async createBranch(req, res) {
        const client = await pool.connect();
        try {
            const {
                name,
                code,
                address,
                contactPerson,
                phone,
                email
            } = req.body;

            const result = await client.query(
                `INSERT INTO branches 
                (name, code, address, contact_person, phone, email) 
                VALUES ($1, $2, $3, $4, $5, $6) 
                RETURNING *`,
                [name, code, address, contactPerson, phone, email]
            );

            res.status(201).json({
                status: 'success',
                data: result.rows[0]
            });
        } catch (error) {
            winston.error('Error creating branch:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to create branch'
            });
        } finally {
            client.release();
        }
    }

    static async getBranches(req, res) {
        try {
            const result = await pool.query(
                'SELECT * FROM branches ORDER BY name'
            );

            res.json({
                status: 'success',
                data: result.rows
            });
        } catch (error) {
            winston.error('Error fetching branches:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to fetch branches'
            });
        }
    }

    /**
     * Godown Management
     */
    static async createGodown(req, res) {
        const client = await pool.connect();
        try {
            const {
                name,
                code,
                address,
                capacity,
                branchId
            } = req.body;

            const result = await client.query(
                `INSERT INTO godowns 
                (name, code, address, capacity, branch_id) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING *`,
                [name, code, address, capacity, branchId]
            );

            res.status(201).json({
                status: 'success',
                data: result.rows[0]
            });
        } catch (error) {
            winston.error('Error creating godown:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to create godown'
            });
        } finally {
            client.release();
        }
    }

    static async getGodowns(req, res) {
        try {
            const result = await pool.query(
                `SELECT g.*, b.name as branch_name 
                FROM godowns g 
                LEFT JOIN branches b ON g.branch_id = b.id 
                ORDER BY g.name`
            );

            res.json({
                status: 'success',
                data: result.rows
            });
        } catch (error) {
            winston.error('Error fetching godowns:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to fetch godowns'
            });
        }
    }

    /**
     * Series Setup Management
     */
    static async createSeriesSetup(req, res) {
        const client = await pool.connect();
        try {
            const {
                branchId,
                documentType,
                prefix,
                startingNumber
            } = req.body;

            const result = await client.query(
                `INSERT INTO series_setup 
                (branch_id, document_type, prefix, starting_number, current_number) 
                VALUES ($1, $2, $3, $4, $4) 
                RETURNING *`,
                [branchId, documentType, prefix, startingNumber]
            );

            res.status(201).json({
                status: 'success',
                data: result.rows[0]
            });
        } catch (error) {
            winston.error('Error creating series setup:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to create series setup'
            });
        } finally {
            client.release();
        }
    }

    static async getSeriesSetup(req, res) {
        try {
            const { branchId } = req.params;

            const result = await pool.query(
                `SELECT s.*, b.name as branch_name 
                FROM series_setup s 
                LEFT JOIN branches b ON s.branch_id = b.id 
                WHERE s.branch_id = $1 
                ORDER BY s.document_type`,
                [branchId]
            );

            res.json({
                status: 'success',
                data: result.rows
            });
        } catch (error) {
            winston.error('Error fetching series setup:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to fetch series setup'
            });
        }
    }

    /**
     * Generate Next Document Number
     */
    static async getNextDocumentNumber(req, res) {
        const client = await pool.connect();
        try {
            const { branchId, documentType } = req.params;

            await client.query('BEGIN');

            // Get current series setup
            const seriesResult = await client.query(
                `SELECT * FROM series_setup 
                WHERE branch_id = $1 AND document_type = $2`,
                [branchId, documentType]
            );

            if (seriesResult.rows.length === 0) {
                throw new Error('Series setup not found');
            }

            const series = seriesResult.rows[0];
            const nextNumber = series.current_number + 1;

            // Update current number
            await client.query(
                `UPDATE series_setup 
                SET current_number = $1, 
                    updated_at = CURRENT_TIMESTAMP 
                WHERE id = $2`,
                [nextNumber, series.id]
            );

            // Generate document number
            const documentNumber = series.prefix 
                ? `${series.prefix}${nextNumber}` 
                : nextNumber.toString();

            await client.query('COMMIT');

            res.json({
                status: 'success',
                data: {
                    documentNumber,
                    numericValue: nextNumber
                }
            });
        } catch (error) {
            await client.query('ROLLBACK');
            winston.error('Error generating document number:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to generate document number'
            });
        } finally {
            client.release();
        }
    }
}

module.exports = MasterController;
