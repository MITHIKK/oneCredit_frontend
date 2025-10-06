const database = require('../config/database');
const { passwordUtils, validation, dbUtils, dateUtils } = require('../utils/helpers');

class User {
    constructor(userData = {}) {
        this.data = userData;
    }

    /**
     * User schema definition
     * @returns {Object} User schema structure
     */
    static getSchema() {
        return {
            _id: 'ObjectId',
            username: 'string',
            email: 'string',
            password: 'string',
            profile: {
                firstName: 'string',
                lastName: 'string',
                dateOfBirth: 'Date',
                phone: 'string',
                address: {
                    street: 'string',
                    city: 'string',
                    state: 'string',
                    zipCode: 'string',
                    country: 'string'
                },
                profilePicture: 'string',
                bio: 'string',
                preferences: {
                    language: 'string',
                    currency: 'string',
                    notifications: {
                        email: 'boolean',
                        sms: 'boolean',
                        push: 'boolean'
                    }
                }
            },
            authentication: {
                isEmailVerified: 'boolean',
                isPhoneVerified: 'boolean',
                emailVerificationToken: 'string',
                phoneVerificationToken: 'string',
                resetPasswordToken: 'string',
                resetPasswordExpires: 'Date',
                lastLogin: 'Date',
                loginAttempts: 'number',
                lockUntil: 'Date'
            },
            social: {
                googleId: 'string',
                facebookId: 'string',
                twitterId: 'string'
            },
            status: 'string',
            role: 'string',
            createdAt: 'Date',
            updatedAt: 'Date'
        };
    }

    /**
     * Validate user data before saving
     * @param {Object} userData - User data to validate
     * @returns {Object} Validation result
     */
    static validate(userData) {
        const errors = [];

        if (!userData.username) {
            errors.push('Username is required');
        } else {
            const usernameValidation = validation.validateUsername(userData.username);
            if (!usernameValidation.isValid) {
                errors.push(...usernameValidation.errors);
            }
        }

        if (!userData.email) {
            errors.push('Email is required');
        } else if (!validation.isValidEmail(userData.email)) {
            errors.push('Invalid email format');
        }

        if (!userData.password) {
            errors.push('Password is required');
        } else {
            const passwordValidation = validation.validatePassword(userData.password);
            if (!passwordValidation.isValid) {
                errors.push(...passwordValidation.errors);
            }
        }

        if (userData.profile?.phone && !validation.isValidPhone(userData.profile.phone)) {
            errors.push('Invalid phone number format');
        }

        if (userData.profile?.dateOfBirth && !dateUtils.isFutureDate(new Date().setFullYear(new Date().getFullYear() - 13))) {
            if (new Date(userData.profile.dateOfBirth) > new Date().setFullYear(new Date().getFullYear() - 13)) {
                errors.push('User must be at least 13 years old');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Create a new user
     * @param {Object} userData - User data
     * @returns {Promise<Object>} Created user
     */
    static async create(userData) {
        try {

            const validationResult = this.validate(userData);
            if (!validationResult.isValid) {
                throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
            }

            const existingUser = await this.findByEmailOrUsername(userData.email, userData.username);
            if (existingUser) {
                throw new Error('User with this email or username already exists');
            }

            const hashedPassword = await passwordUtils.hashPassword(userData.password);

            const userDocument = {
                username: userData.username,
                email: userData.email.toLowerCase(),
                password: hashedPassword,
                profile: {
                    firstName: userData.profile?.firstName || '',
                    lastName: userData.profile?.lastName || '',
                    dateOfBirth: userData.profile?.dateOfBirth ? new Date(userData.profile.dateOfBirth) : null,
                    phone: userData.profile?.phone || '',
                    address: {
                        street: userData.profile?.address?.street || '',
                        city: userData.profile?.address?.city || '',
                        state: userData.profile?.address?.state || '',
                        zipCode: userData.profile?.address?.zipCode || '',
                        country: userData.profile?.address?.country || ''
                    },
                    profilePicture: userData.profile?.profilePicture || '',
                    bio: userData.profile?.bio || '',
                    preferences: {
                        language: userData.profile?.preferences?.language || 'en',
                        currency: userData.profile?.preferences?.currency || 'USD',
                        notifications: {
                            email: userData.profile?.preferences?.notifications?.email !== false,
                            sms: userData.profile?.preferences?.notifications?.sms !== false,
                            push: userData.profile?.preferences?.notifications?.push !== false
                        }
                    }
                },
                authentication: {
                    isEmailVerified: false,
                    isPhoneVerified: false,
                    emailVerificationToken: null,
                    phoneVerificationToken: null,
                    resetPasswordToken: null,
                    resetPasswordExpires: null,
                    lastLogin: null,
                    loginAttempts: 0,
                    lockUntil: null
                },
                social: {
                    googleId: userData.social?.googleId || null,
                    facebookId: userData.social?.facebookId || null,
                    twitterId: userData.social?.twitterId || null
                },
                status: 'active',
                role: userData.role || 'user',
                createdAt: dateUtils.getCurrentTimestamp(),
                updatedAt: dateUtils.getCurrentTimestamp()
            };

            const collection = database.getUsersCollection();
            const result = await collection.insertOne(userDocument);

            const { password, ...userWithoutPassword } = userDocument;
            userWithoutPassword._id = result.insertedId;

            return userWithoutPassword;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    /**
     * Find user by email or username
     * @param {string} email - Email address
     * @param {string} username - Username
     * @returns {Promise<Object|null>} User document or null
     */
    static async findByEmailOrUsername(email, username) {
        try {
            const collection = database.getUsersCollection();
            const user = await collection.findOne({
                $or: [
                    { email: email.toLowerCase() },
                    { username: username }
                ]
            });
            return user;
        } catch (error) {
            console.error('Error finding user:', error);
            throw error;
        }
    }

    /**
     * Find user by ID
     * @param {string} userId - User ID
     * @returns {Promise<Object|null>} User document or null
     */
    static async findById(userId) {
        try {
            if (!dbUtils.isValidObjectId(userId)) {
                return null;
            }

            const collection = database.getUsersCollection();
            const user = await collection.findOne({ _id: dbUtils.toObjectId(userId) });
            return user;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }

    /**
     * Find user by email
     * @param {string} email - Email address
     * @returns {Promise<Object|null>} User document or null
     */
    static async findByEmail(email) {
        try {
            const collection = database.getUsersCollection();
            const user = await collection.findOne({ email: email.toLowerCase() });
            return user;
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    /**
     * Authenticate user with email/username and password
     * @param {string} identifier - Email or username
     * @param {string} password - Plain text password
     * @returns {Promise<Object>} Authentication result
     */
    static async authenticate(identifier, password) {
        try {

            const user = await this.findByEmailOrUsername(identifier, identifier);
            if (!user) {
                throw new Error('Invalid credentials');
            }

            if (user.status !== 'active') {
                throw new Error('Account is not active');
            }

            if (user.authentication.lockUntil && user.authentication.lockUntil > new Date()) {
                throw new Error('Account is temporarily locked. Please try again later.');
            }

            const isPasswordValid = await passwordUtils.comparePassword(password, user.password);
            if (!isPasswordValid) {

                await this.incrementLoginAttempts(user._id);
                throw new Error('Invalid credentials');
            }

            await this.resetLoginAttempts(user._id);

            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (error) {
            console.error('Error authenticating user:', error);
            throw error;
        }
    }

    /**
     * Update user profile
     * @param {string} userId - User ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated user
     */
    static async updateProfile(userId, updateData) {
        try {
            if (!dbUtils.isValidObjectId(userId)) {
                throw new Error('Invalid user ID');
            }

            const sanitizedData = dbUtils.sanitizeInput(updateData);
            
            sanitizedData.updatedAt = dateUtils.getCurrentTimestamp();

            const collection = database.getUsersCollection();
            const result = await collection.updateOne(
                { _id: dbUtils.toObjectId(userId) },
                { $set: sanitizedData }
            );

            if (result.matchedCount === 0) {
                throw new Error('User not found');
            }

            return await this.findById(userId);
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    }

    /**
     * Increment login attempts and lock account if necessary
     * @param {string} userId - User ID
     */
    static async incrementLoginAttempts(userId) {
        try {
            const collection = database.getUsersCollection();
            const user = await this.findById(userId);
            
            const loginAttempts = (user.authentication.loginAttempts || 0) + 1;
            const updateData = {
                'authentication.loginAttempts': loginAttempts,
                updatedAt: dateUtils.getCurrentTimestamp()
            };

            if (loginAttempts >= 5) {
                updateData['authentication.lockUntil'] = new Date(Date.now() + 15 * 60 * 1000);
            }

            await collection.updateOne(
                { _id: dbUtils.toObjectId(userId) },
                { $set: updateData }
            );
        } catch (error) {
            console.error('Error incrementing login attempts:', error);
        }
    }

    /**
     * Reset login attempts
     * @param {string} userId - User ID
     */
    static async resetLoginAttempts(userId) {
        try {
            const collection = database.getUsersCollection();
            await collection.updateOne(
                { _id: dbUtils.toObjectId(userId) },
                { 
                    $set: { 
                        'authentication.loginAttempts': 0,
                        'authentication.lockUntil': null,
                        'authentication.lastLogin': dateUtils.getCurrentTimestamp(),
                        updatedAt: dateUtils.getCurrentTimestamp()
                    }
                }
            );
        } catch (error) {
            console.error('Error resetting login attempts:', error);
        }
    }

    /**
     * Delete user
     * @param {string} userId - User ID
     * @returns {Promise<boolean>} Success status
     */
    static async delete(userId) {
        try {
            if (!dbUtils.isValidObjectId(userId)) {
                throw new Error('Invalid user ID');
            }

            const collection = database.getUsersCollection();
            const result = await collection.deleteOne({ _id: dbUtils.toObjectId(userId) });
            
            return result.deletedCount > 0;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
}

module.exports = User;
