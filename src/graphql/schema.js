const { buildSchema } = require('graphql');

const schema = buildSchema(`
  type Program {
    id: ID!
    name: String!
    description: String!
    startDate: String!
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  type ProgramList {
    items: [Program!]!
    total: Int!
  }

  type Query {
    programs(filter: String, page: Int, limit: Int): ProgramList!
    program(id: ID!): Program
  }

  type Mutation {
    createProgram(name: String!, description: String!, startDate: String!): Program!
    updateProgram(id: ID!, name: String, description: String, startDate: String, status: String): Program!
    deleteProgram(id: ID!): Boolean!
  }
`);

module.exports = schema;