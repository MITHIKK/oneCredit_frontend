const database = require('../config/database');
const { dbUtils, dateUtils, validation } = require('../utils/helpers');

class Trip {
    constructor(tripData = {}) {
        this.data = tripData;
    }

    /**
     * Trip schema definition
     * @returns {Object} Trip schema structure
     */
    static getSchema() {
        return {
            _id: 'ObjectId',
            userId: 'ObjectId',
            title: 'string',
            description: 'string',
            destination: {
                name: 'string',
                country: 'string',
                city: 'string',
                state: 'string',
                coordinates: {
                    latitude: 'number',
                    longitude: 'number'
                },
                timezone: 'string'
            },
            dates: {
                startDate: 'Date',
                endDate: 'Date',
                duration: 'number',
                isFlexible: 'boolean'
            },
            budget: {
                totalBudget: 'number',
                spentAmount: 'number',
                currency: 'string',
                budgetBreakdown: {
                    accommodation: 'number',
                    transportation: 'number',
                    food: 'number',
                    activities: 'number',
                    shopping: 'number',
                    other: 'number'
                }
            },
            transportation: {
                mode: 'string',
                details: {
                    departure: {
                        location: 'string',
                        dateTime: 'Date'
                    },
                    arrival: {
                        location: 'string',
                        dateTime: 'Date'
                    },
                    bookingReference: 'string',
                    cost: 'number'
                }
            },
            accommodation: {
                type: 'string',
                name: 'string',
                address: 'string',
                checkIn: 'Date',
                checkOut: 'Date',
                bookingReference: 'string',
                cost: 'number',
                amenities: ['string']
            },
            participants: [{
                userId: 'ObjectId',
                name: 'string',
                email: 'string',
                phone: 'string',
                role: 'string',
                status: 'string',
                joinedAt: 'Date'
            }],
            itinerary: [{
                day: 'number',
                date: 'Date',
                activities: [{
                    time: 'string',
                    title: 'string',
                    description: 'string',
                    location: 'string',
                    cost: 'number',
                    category: 'string',
                    bookingRequired: 'boolean',
                    bookingReference: 'string'
                }]
            }],
            photos: [{
                url: 'string',
                caption: 'string',
                uploadedBy: 'ObjectId',
                uploadedAt: 'Date',
                location: 'string'
            }],
            documents: [{
                name: 'string',
                type: 'string',
                url: 'string',
                uploadedBy: 'ObjectId',
                uploadedAt: 'Date',
                expiryDate: 'Date'
            }],
            packing: {
                items: [{
                    name: 'string',
                    category: 'string',
                    isPacked: 'boolean',
                    addedBy: 'ObjectId'
                }],
                sharedItems: [{
                    name: 'string',
                    assignedTo: 'ObjectId',
                    isPacked: 'boolean'
                }]
            },
            weather: {
                forecast: [{
                    date: 'Date',
                    temperature: {
                        high: 'number',
                        low: 'number',
                        unit: 'string'
                    },
                    condition: 'string',
                    humidity: 'number',
                    windSpeed: 'number'
                }],
                lastUpdated: 'Date'
            },
            notes: [{
                text: 'string',
                addedBy: 'ObjectId',
                addedAt: 'Date',
                isPrivate: 'boolean'
            }],
            expenses: [{
                description: 'string',
                amount: 'number',
                currency: 'string',
                category: 'string',
                date: 'Date',
                paidBy: 'ObjectId',
                splitAmong: ['ObjectId'],
                receipt: 'string'
            }],
            settings: {
                isPublic: 'boolean',
                allowParticipantInvites: 'boolean',
                requireApprovalForChanges: 'boolean'
            },
            status: 'string',
            tags: ['string'],
            createdAt: 'Date',
            updatedAt: 'Date'
        };
    }

    /**
     * Validate trip data before saving
     * @param {Object} tripData - Trip data to validate
     * @returns {Object} Validation result
     */
    static validate(tripData) {
        const errors = [];

        if (!tripData.title || tripData.title.trim().length === 0) {
            errors.push('Trip title is required');
        }

        if (!tripData.userId || !dbUtils.isValidObjectId(tripData.userId)) {
            errors.push('Valid user ID is required');
        }

        if (!tripData.destination?.name) {
            errors.push('Destination name is required');
        }

        if (!tripData.dates?.startDate) {
            errors.push('Start date is required');
        } else {
            const startDate = new Date(tripData.dates.startDate);
            if (isNaN(startDate.getTime())) {
                errors.push('Invalid start date format');
            }
        }

        if (!tripData.dates?.endDate) {
            errors.push('End date is required');
        } else {
            const endDate = new Date(tripData.dates.endDate);
            if (isNaN(endDate.getTime())) {
                errors.push('Invalid end date format');
            }

            if (tripData.dates.startDate && endDate <= new Date(tripData.dates.startDate)) {
                errors.push('End date must be after start date');
            }
        }

        if (tripData.budget?.totalBudget && (typeof tripData.budget.totalBudget !== 'number' || tripData.budget.totalBudget < 0)) {
            errors.push('Budget must be a positive number');
        }

        if (tripData.participants && Array.isArray(tripData.participants)) {
            tripData.participants.forEach((participant, index) => {
                if (!participant.name) {
                    errors.push(`Participant ${index + 1} name is required`);
                }
                if (participant.email && !validation.isValidEmail(participant.email)) {
                    errors.push(`Participant ${index + 1} has invalid email format`);
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Create a new trip
     * @param {Object} tripData - Trip data
     * @returns {Promise<Object>} Created trip
     */
    static async create(tripData) {
        try {

            const validationResult = this.validate(tripData);
            if (!validationResult.isValid) {
                throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
            }

            const startDate = new Date(tripData.dates.startDate);
            const endDate = new Date(tripData.dates.endDate);
            const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

            const tripDocument = {
                userId: dbUtils.toObjectId(tripData.userId),
                title: tripData.title.trim(),
                description: tripData.description || '',
                destination: {
                    name: tripData.destination.name,
                    country: tripData.destination.country || '',
                    city: tripData.destination.city || '',
                    state: tripData.destination.state || '',
                    coordinates: {
                        latitude: tripData.destination.coordinates?.latitude || null,
                        longitude: tripData.destination.coordinates?.longitude || null
                    },
                    timezone: tripData.destination.timezone || ''
                },
                dates: {
                    startDate: startDate,
                    endDate: endDate,
                    duration: duration,
                    isFlexible: tripData.dates.isFlexible || false
                },
                budget: {
                    totalBudget: tripData.budget?.totalBudget || 0,
                    spentAmount: 0,
                    currency: tripData.budget?.currency || 'USD',
                    budgetBreakdown: {
                        accommodation: tripData.budget?.budgetBreakdown?.accommodation || 0,
                        transportation: tripData.budget?.budgetBreakdown?.transportation || 0,
                        food: tripData.budget?.budgetBreakdown?.food || 0,
                        activities: tripData.budget?.budgetBreakdown?.activities || 0,
                        shopping: tripData.budget?.budgetBreakdown?.shopping || 0,
                        other: tripData.budget?.budgetBreakdown?.other || 0
                    }
                },
                transportation: tripData.transportation || {},
                accommodation: tripData.accommodation || {},
                participants: [{
                    userId: dbUtils.toObjectId(tripData.userId),
                    role: 'organizer',
                    status: 'confirmed',
                    joinedAt: dateUtils.getCurrentTimestamp()
                }],
                itinerary: tripData.itinerary || [],
                photos: [],
                documents: [],
                packing: {
                    items: [],
                    sharedItems: []
                },
                weather: {
                    forecast: [],
                    lastUpdated: null
                },
                notes: [],
                expenses: [],
                settings: {
                    isPublic: tripData.settings?.isPublic || false,
                    allowParticipantInvites: tripData.settings?.allowParticipantInvites || true,
                    requireApprovalForChanges: tripData.settings?.requireApprovalForChanges || false
                },
                status: 'planning',
                tags: tripData.tags || [],
                createdAt: dateUtils.getCurrentTimestamp(),
                updatedAt: dateUtils.getCurrentTimestamp()
            };

            if (tripData.participants && Array.isArray(tripData.participants)) {
                tripData.participants.forEach(participant => {
                    tripDocument.participants.push({
                        userId: participant.userId ? dbUtils.toObjectId(participant.userId) : null,
                        name: participant.name,
                        email: participant.email || '',
                        phone: participant.phone || '',
                        role: participant.role || 'participant',
                        status: participant.status || 'invited',
                        joinedAt: dateUtils.getCurrentTimestamp()
                    });
                });
            }

            const collection = database.getTripsCollection();
            const result = await collection.insertOne(tripDocument);

            tripDocument._id = result.insertedId;
            return tripDocument;
        } catch (error) {
            console.error('Error creating trip:', error);
            throw error;
        }
    }

    /**
     * Find trip by ID
     * @param {string} tripId - Trip ID
     * @returns {Promise<Object|null>} Trip document or null
     */
    static async findById(tripId) {
        try {
            if (!dbUtils.isValidObjectId(tripId)) {
                return null;
            }

            const collection = database.getTripsCollection();
            const trip = await collection.findOne({ _id: dbUtils.toObjectId(tripId) });
            return trip;
        } catch (error) {
            console.error('Error finding trip by ID:', error);
            throw error;
        }
    }

    /**
     * Find trips by user ID
     * @param {string} userId - User ID
     * @param {Object} options - Query options (limit, skip, sort)
     * @returns {Promise<Array>} Array of trip documents
     */
    static async findByUserId(userId, options = {}) {
        try {
            if (!dbUtils.isValidObjectId(userId)) {
                return [];
            }

            const collection = database.getTripsCollection();
            
            const query = {
                $or: [
                    { userId: dbUtils.toObjectId(userId) },
                    { 'participants.userId': dbUtils.toObjectId(userId) }
                ]
            };

            let cursor = collection.find(query);

            cursor = cursor.sort(options.sort || { createdAt: -1 });

            if (options.skip) cursor = cursor.skip(options.skip);
            if (options.limit) cursor = cursor.limit(options.limit);

            return await cursor.toArray();
        } catch (error) {
            console.error('Error finding trips by user ID:', error);
            throw error;
        }
    }

    /**
     * Update trip
     * @param {string} tripId - Trip ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated trip
     */
    static async update(tripId, updateData) {
        try {
            if (!dbUtils.isValidObjectId(tripId)) {
                throw new Error('Invalid trip ID');
            }

            const sanitizedData = dbUtils.sanitizeInput(updateData);
            
            sanitizedData.updatedAt = dateUtils.getCurrentTimestamp();

            if (sanitizedData.dates?.startDate && sanitizedData.dates?.endDate) {
                const startDate = new Date(sanitizedData.dates.startDate);
                const endDate = new Date(sanitizedData.dates.endDate);
                sanitizedData.dates.duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            }

            const collection = database.getTripsCollection();
            const result = await collection.updateOne(
                { _id: dbUtils.toObjectId(tripId) },
                { $set: sanitizedData }
            );

            if (result.matchedCount === 0) {
                throw new Error('Trip not found');
            }

            return await this.findById(tripId);
        } catch (error) {
            console.error('Error updating trip:', error);
            throw error;
        }
    }

    /**
     * Add participant to trip
     * @param {string} tripId - Trip ID
     * @param {Object} participantData - Participant data
     * @returns {Promise<Object>} Updated trip
     */
    static async addParticipant(tripId, participantData) {
        try {
            if (!dbUtils.isValidObjectId(tripId)) {
                throw new Error('Invalid trip ID');
            }

            const participant = {
                userId: participantData.userId ? dbUtils.toObjectId(participantData.userId) : null,
                name: participantData.name,
                email: participantData.email || '',
                phone: participantData.phone || '',
                role: participantData.role || 'participant',
                status: participantData.status || 'invited',
                joinedAt: dateUtils.getCurrentTimestamp()
            };

            const collection = database.getTripsCollection();
            const result = await collection.updateOne(
                { _id: dbUtils.toObjectId(tripId) },
                { 
                    $push: { participants: participant },
                    $set: { updatedAt: dateUtils.getCurrentTimestamp() }
                }
            );

            if (result.matchedCount === 0) {
                throw new Error('Trip not found');
            }

            return await this.findById(tripId);
        } catch (error) {
            console.error('Error adding participant:', error);
            throw error;
        }
    }

    /**
     * Add expense to trip
     * @param {string} tripId - Trip ID
     * @param {Object} expenseData - Expense data
     * @returns {Promise<Object>} Updated trip
     */
    static async addExpense(tripId, expenseData) {
        try {
            if (!dbUtils.isValidObjectId(tripId)) {
                throw new Error('Invalid trip ID');
            }

            const expense = {
                description: expenseData.description,
                amount: expenseData.amount,
                currency: expenseData.currency || 'USD',
                category: expenseData.category || 'other',
                date: new Date(expenseData.date) || dateUtils.getCurrentTimestamp(),
                paidBy: dbUtils.toObjectId(expenseData.paidBy),
                splitAmong: expenseData.splitAmong ? expenseData.splitAmong.map(id => dbUtils.toObjectId(id)) : [],
                receipt: expenseData.receipt || ''
            };

            const collection = database.getTripsCollection();
            
            const result = await collection.updateOne(
                { _id: dbUtils.toObjectId(tripId) },
                { 
                    $push: { expenses: expense },
                    $inc: { 'budget.spentAmount': expense.amount },
                    $set: { updatedAt: dateUtils.getCurrentTimestamp() }
                }
            );

            if (result.matchedCount === 0) {
                throw new Error('Trip not found');
            }

            return await this.findById(tripId);
        } catch (error) {
            console.error('Error adding expense:', error);
            throw error;
        }
    }

    /**
     * Delete trip
     * @param {string} tripId - Trip ID
     * @returns {Promise<boolean>} Success status
     */
    static async delete(tripId) {
        try {
            if (!dbUtils.isValidObjectId(tripId)) {
                throw new Error('Invalid trip ID');
            }

            const collection = database.getTripsCollection();
            const result = await collection.deleteOne({ _id: dbUtils.toObjectId(tripId) });
            
            return result.deletedCount > 0;
        } catch (error) {
            console.error('Error deleting trip:', error);
            throw error;
        }
    }

    /**
     * Search trips by destination or title
     * @param {string} searchTerm - Search term
     * @param {Object} options - Search options
     * @returns {Promise<Array>} Array of matching trips
     */
    static async search(searchTerm, options = {}) {
        try {
            const collection = database.getTripsCollection();
            
            const query = {
                $or: [
                    { title: { $regex: searchTerm, $options: 'i' } },
                    { 'destination.name': { $regex: searchTerm, $options: 'i' } },
                    { 'destination.city': { $regex: searchTerm, $options: 'i' } },
                    { 'destination.country': { $regex: searchTerm, $options: 'i' } },
                    { tags: { $in: [new RegExp(searchTerm, 'i')] } }
                ]
            };

            if (!options.includePrivate) {
                query['settings.isPublic'] = true;
            }

            let cursor = collection.find(query);
            cursor = cursor.sort({ createdAt: -1 });

            if (options.limit) cursor = cursor.limit(options.limit);

            return await cursor.toArray();
        } catch (error) {
            console.error('Error searching trips:', error);
            throw error;
        }
    }
}

module.exports = Trip;
