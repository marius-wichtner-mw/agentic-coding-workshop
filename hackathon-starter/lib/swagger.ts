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
      PlayerStats: {
        type: 'object',
        properties: {
          player_id: {
            type: 'integer',
            description: 'Player user ID',
          },
          username: {
            type: 'string',
            description: 'Player username',
          },
          games_played: {
            type: 'integer',
            description: 'Total number of games played',
          },
          wins: {
            type: 'integer',
            description: 'Number of wins',
          },
          losses: {
            type: 'integer',
            description: 'Number of losses',
          },
          win_rate: {
            type: 'number',
            format: 'float',
            description: 'Win rate percentage (0-100)',
          },
          current_streak: {
            type: 'integer',
            description: 'Current winning/losing streak (positive for wins, negative for losses)',
          },
          longest_streak: {
            type: 'integer',
            description: 'Longest winning streak',
          },
          total_score: {
            type: 'integer',
            description: 'Total accumulated score',
          },
          avg_score: {
            type: 'number',
            format: 'float',
            description: 'Average score per game',
          },
        },
        required: ['player_id', 'username', 'games_played', 'wins', 'losses', 'win_rate', 'current_streak', 'longest_streak', 'total_score', 'avg_score'],
      },
      GameScoreboard: {
        type: 'object',
        properties: {
          game_id: {
            type: 'integer',
            description: 'Game ID',
          },
          game_name: {
            type: 'string',
            description: 'Game name',
          },
          players: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/PlayerStats',
            },
            description: 'Array of player statistics for this game',
          },
        },
        required: ['game_id', 'game_name', 'players'],
      },
      GlobalScoreboard: {
        type: 'object',
        properties: {
          players: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/PlayerStats',
            },
            description: 'Array of player statistics across all games',
          },
          summary: {
            type: 'object',
            properties: {
              total_players: {
                type: 'integer',
                description: 'Total number of players',
              },
              total_games_played: {
                type: 'integer',
                description: 'Total number of games played',
              },
              games_available: {
                type: 'array',
                items: {
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
                      description: 'Game type',
                    },
                    total_games: {
                      type: 'integer',
                      description: 'Total games played for this game type',
                    },
                    unique_players: {
                      type: 'integer',
                      description: 'Number of unique players for this game',
                    },
                  },
                },
                description: 'Available games with statistics',
              },
            },
            required: ['total_players', 'total_games_played', 'games_available'],
          },
        },
        required: ['players', 'summary'],
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