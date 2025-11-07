const Program = require('../models/Program');

const resolvers = {
  Query: {
    programs: async (_, { filter = '', page = 1, limit = 10 }) => {
      try {
        const skip = (page - 1) * limit;
        
        const query = filter ? { 
          $or: [
            { name: { $regex: filter, $options: 'i' } },
            { description: { $regex: filter, $options: 'i' } }
          ]
        } : {};

        const [items, total] = await Promise.all([
          Program.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
          Program.countDocuments(query),
        ]);

        return { items, total };
      } catch (error) {
        throw new Error('Failed to fetch programs');
      }
    },

    program: async (_, { id }) => {
      try {
        const program = await Program.findById(id);
        if (!program) {
          throw new Error('Program not found');
        }
        return program;
      } catch (error) {
        throw new Error('Failed to fetch program');
      }
    },
  },

  Mutation: {
    createProgram: async (_, { name, description, startDate }) => {
      try {
        const program = await Program.create({
          name,
          description,
          startDate: new Date(startDate),
        });
        return program;
      } catch (error) {
        throw new Error('Failed to create program');
      }
    },

    updateProgram: async (_, { id, ...updateData }) => {
      try {
        const program = await Program.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        );
        
        if (!program) {
          throw new Error('Program not found');
        }
        
        return program;
      } catch (error) {
        throw new Error('Failed to update program');
      }
    },

    deleteProgram: async (_, { id }) => {
      try {
        const program = await Program.findByIdAndDelete(id);
        
        if (!program) {
          throw new Error('Program not found');
        }
        
        return true;
      } catch (error) {
        throw new Error('Failed to delete program');
      }
    },
  },
};

module.exports = resolvers;