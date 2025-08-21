import swaggerJSDoc from 'swagger-jsdoc'

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Game Tracker API',
    version: '1.0.0',
    description: 'API for tracking game results and player rankings',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'User ID',
          },
          username: {
            type: 'string',
            description: 'Username (3-20 characters, alphanumeric, underscores, hyphens)',
            minLength: 3,
            maxLength: 20,
            pattern: '^[a-zA-Z0-9_-]+$',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'User creation timestamp',
          },
        },
        required: ['id', 'username', 'created_at'],
      },
      Game: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'Game ID',
          },
          name: {
            type: 'string',
            description: 'Game name',
          },
          type: {
            type: 'string',
            enum: ['video', 'table', 'card'],
            description: 'Game type',
          },
          image_url: {
            type: 'string',
            nullable: true,
            description: 'Game image URL',
          },
          created_by: {
            type: 'integer',
            description: 'ID of user who created the game',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Game creation timestamp',
          },
        },
        required: ['id', 'name', 'type', 'created_by', 'created_at'],
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message',
          },
        },
        required: ['error'],
      },
    },
  },
}

const options = {
  swaggerDefinition,
  apis: ['./app/api/**/*.ts'], // Path to the API files
}

export const swaggerSpec = swaggerJSDoc(options)