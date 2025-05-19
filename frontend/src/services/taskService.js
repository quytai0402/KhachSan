import api from './api';

const taskService = {
  /**
   * Get all tasks
   * @param {Object} filters - Optional filters for status, priority, etc.
   * @returns {Promise} Promise with tasks data
   */
  getTasks: async (filters = {}) => {
    try {
      let query = '';
      if (Object.keys(filters).length > 0) {
        query = '?' + new URLSearchParams(filters).toString();
      }
      const response = await api.get(`/tasks${query}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  /**
   * Get task statistics
   * @returns {Promise} Promise with task stats data
   */
  getTaskStats: async () => {
    try {
      const response = await api.get('/tasks/stats');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  /**
   * Create a new task
   * @param {Object} taskData - Task data (roomNumber, taskType, priority, notes)
   * @returns {Promise} Promise with created task data
   */
  createTask: async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  /**
   * Update a task
   * @param {string} taskId - ID of the task to update
   * @param {Object} taskData - Updated task data
   * @returns {Promise} Promise with updated task data
   */
  updateTask: async (taskId, taskData) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  /**
   * Delete a task
   * @param {string} taskId - ID of the task to delete
   * @returns {Promise} Promise with success message
   */
  deleteTask: async (taskId) => {
    try {
      const response = await api.delete(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  /**
   * Assign a task to a staff member
   * @param {string} taskId - ID of the task
   * @param {string} staffId - ID of the staff member
   * @returns {Promise} Promise with updated task data
   */
  assignTask: async (taskId, staffId) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, { 
        assignedTo: staffId,
        status: 'in-progress' 
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  /**
   * Complete a task
   * @param {string} taskId - ID of the task
   * @param {string} notes - Optional notes about completion
   * @returns {Promise} Promise with updated task data
   */
  completeTask: async (taskId, notes = '') => {
    try {
      const updateData = { 
        status: 'completed'
      };
      
      if (notes) {
        updateData.notes = notes;
      }
      
      const response = await api.put(`/tasks/${taskId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  }
};

export default taskService;
