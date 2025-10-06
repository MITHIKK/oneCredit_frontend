import { api } from './api';

export const tripService = {
  
  getTrips: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/trips?${queryString}` : '/trips';
      
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch trips');
    }
  },

  getTripById: async (tripId) => {
    try {
      const response = await api.get(`/trips/${tripId}`);
      return response.trip;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch trip');
    }
  },

  createTrip: async (tripData) => {
    try {
      const response = await api.post('/trips', tripData);
      return response.trip;
    } catch (error) {
      throw new Error(error.message || 'Failed to create trip');
    }
  },

  updateTrip: async (tripId, updates) => {
    try {
      const response = await api.put(`/trips/${tripId}`, updates);
      return response.trip;
    } catch (error) {
      throw new Error(error.message || 'Failed to update trip');
    }
  },

  deleteTrip: async (tripId) => {
    try {
      const response = await api.delete(`/trips/${tripId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete trip');
    }
  },

  addTravelers: async (tripId, travelers) => {
    try {
      const response = await api.post(`/trips/${tripId}/travelers`, { travelers });
      return response.trip;
    } catch (error) {
      throw new Error(error.message || 'Failed to add travelers');
    }
  },

  updateAccommodations: async (tripId, accommodations) => {
    try {
      const response = await api.put(`/trips/${tripId}/accommodations`, { accommodations });
      return response.trip;
    } catch (error) {
      throw new Error(error.message || 'Failed to update accommodations');
    }
  },

  updateItinerary: async (tripId, itinerary) => {
    try {
      const response = await api.put(`/trips/${tripId}/itinerary`, { itinerary });
      return response.trip;
    } catch (error) {
      throw new Error(error.message || 'Failed to update itinerary');
    }
  },

  getTripStats: async () => {
    try {
      const response = await api.get('/trips/stats/overview');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch trip statistics');
    }
  },

  getTripsByStatus: async (status) => {
    try {
      return await tripService.getTrips({ status });
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch trips by status');
    }
  },

  getUpcomingTrips: async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      return await tripService.getTrips({ 
        status: 'planned,booked',
        startDate: today 
      });
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch upcoming trips');
    }
  },

  getCompletedTrips: async () => {
    try {
      return await tripService.getTrips({ status: 'completed' });
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch completed trips');
    }
  },

  searchTrips: async (searchTerm) => {
    try {
      
      return await tripService.getTrips({ search: searchTerm });
    } catch (error) {
      throw new Error(error.message || 'Failed to search trips');
    }
  },

  formatTripForDisplay: (trip) => {
    return {
      ...trip,
      formattedStartDate: new Date(trip.startDate).toLocaleDateString(),
      formattedEndDate: new Date(trip.endDate).toLocaleDateString(),
      durationDays: Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)),
      destination: `${trip.destination.city}, ${trip.destination.country}`,
      statusLabel: trip.status.charAt(0).toUpperCase() + trip.status.slice(1).replace('_', ' '),
      totalBudget: trip.budget?.totalBudget || 0,
      totalSpent: trip.totalSpent || 0,
      budgetRemaining: (trip.budget?.totalBudget || 0) - (trip.totalSpent || 0)
    };
  },

  validateTripData: (tripData) => {
    const errors = [];

    if (!tripData.title || tripData.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters long');
    }

    if (!tripData.destination?.country) {
      errors.push('Destination country is required');
    }

    if (!tripData.destination?.city) {
      errors.push('Destination city is required');
    }

    if (!tripData.startDate) {
      errors.push('Start date is required');
    }

    if (!tripData.endDate) {
      errors.push('End date is required');
    }

    if (tripData.startDate && tripData.endDate) {
      const startDate = new Date(tripData.startDate);
      const endDate = new Date(tripData.endDate);
      
      if (endDate <= startDate) {
        errors.push('End date must be after start date');
      }

      if (startDate < new Date().setHours(0, 0, 0, 0)) {
        errors.push('Start date cannot be in the past');
      }
    }

    if (!tripData.tripType) {
      errors.push('Trip type is required');
    }

    if (!tripData.budget?.totalBudget || tripData.budget.totalBudget < 0) {
      errors.push('Budget must be a positive number');
    }

    return errors;
  }
};

export default tripService;
