const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
require('dotenv').config();

const passwordUtils = {
    /**
     * Hash a password using bcrypt
     * @param {string} password - Plain text password
     * @returns {Promise<string>} Hashed password
     */
    async hashPassword(password) {
        const saltRounds = parseInt(process.env.SALT_ROUNDS) || 12;
        return await bcrypt.hash(password, saltRounds);
    },

    /**
     * Compare password with hash
     * @param {string} password - Plain text password
     * @param {string} hash - Hashed password
     * @returns {Promise<boolean>} True if password matches
     */
    async comparePassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }
};

const jwtUtils = {
    /**
     * Generate JWT token
     * @param {Object} payload - Token payload
     * @returns {string} JWT token
     */
    generateToken(payload) {
        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        });
    },

    /**
     * Verify JWT token
     * @param {string} token - JWT token
     * @returns {Object} Decoded token payload
     */
    verifyToken(token) {
        return jwt.verify(token, process.env.JWT_SECRET);
    }
};

const validation = {
    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {Object} Validation result with isValid and errors
     */
    validatePassword(password) {
        const errors = [];
        
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        
        if (!/(?=.*[a-z])/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        
        if (!/(?=.*[A-Z])/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        
        if (!/(?=.*\d)/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        
        if (!/(?=.*[@$!%*?&])/.test(password)) {
            errors.push('Password must contain at least one special character (@$!%*?&)');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    /**
     * Validate username
     * @param {string} username - Username to validate
     * @returns {Object} Validation result
     */
    validateUsername(username) {
        const errors = [];
        
        if (!username || username.length < 3) {
            errors.push('Username must be at least 3 characters long');
        }
        
        if (username.length > 20) {
            errors.push('Username must be no more than 20 characters long');
        }
        
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            errors.push('Username can only contain letters, numbers, and underscores');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    /**
     * Validate phone number
     * @param {string} phone - Phone number to validate
     * @returns {boolean} True if valid phone
     */
    isValidPhone(phone) {
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
    }
};

const dbUtils = {
    /**
     * Check if ObjectId is valid
     * @param {string} id - ID to validate
     * @returns {boolean} True if valid ObjectId
     */
    isValidObjectId(id) {
        return ObjectId.isValid(id);
    },

    /**
     * Convert string to ObjectId
     * @param {string} id - String ID
     * @returns {ObjectId} MongoDB ObjectId
     */
    toObjectId(id) {
        return new ObjectId(id);
    },

    /**
     * Sanitize user input to prevent injection
     * @param {Object} input - Input object to sanitize
     * @returns {Object} Sanitized object
     */
    sanitizeInput(input) {
        if (typeof input !== 'object' || input === null) {
            return input;
        }

        const sanitized = {};
        for (const [key, value] of Object.entries(input)) {

            if (!key.startsWith('$')) {
                sanitized[key] = typeof value === 'object' ? this.sanitizeInput(value) : value;
            }
        }
        return sanitized;
    }
};

const dateUtils = {
    /**
     * Get current timestamp
     * @returns {Date} Current date
     */
    getCurrentTimestamp() {
        return new Date();
    },

    /**
     * Format date for display
     * @param {Date} date - Date to format
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    /**
     * Check if date is in the future
     * @param {Date} date - Date to check
     * @returns {boolean} True if date is in future
     */
    isFutureDate(date) {
        return new Date(date) > new Date();
    }
};

module.exports = {
    passwordUtils,
    jwtUtils,
    validation,
    dbUtils,
    dateUtils
};
