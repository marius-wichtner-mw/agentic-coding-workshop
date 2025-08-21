import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'data', 'game-tracker.db')
const db = new Database(dbPath)

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('video', 'table', 'card')),
    image_url TEXT,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS game_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    started_by INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('setup', 'in_progress', 'completed', 'cancelled')) DEFAULT 'setup',
    total_rounds INTEGER NOT NULL DEFAULT 1,
    current_round INTEGER NOT NULL DEFAULT 1,
    player1_id INTEGER NOT NULL,
    player2_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (game_id) REFERENCES games (id),
    FOREIGN KEY (started_by) REFERENCES users (id),
    FOREIGN KEY (player1_id) REFERENCES users (id),
    FOREIGN KEY (player2_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS game_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    game_id INTEGER NOT NULL,
    player1_id INTEGER NOT NULL,
    player2_id INTEGER NOT NULL,
    player1_score INTEGER NOT NULL,
    player2_score INTEGER NOT NULL,
    winner_id INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (session_id) REFERENCES game_sessions (id),
    FOREIGN KEY (game_id) REFERENCES games (id),
    FOREIGN KEY (player1_id) REFERENCES users (id),
    FOREIGN KEY (player2_id) REFERENCES users (id),
    FOREIGN KEY (winner_id) REFERENCES users (id)
  );

  -- Insert sample data if tables are empty
  INSERT OR IGNORE INTO users (id, username, created_at) VALUES 
    (1, 'alice_gamer', '2024-01-01T00:00:00Z'),
    (2, 'bob_player', '2024-01-02T00:00:00Z'),
    (3, 'charlie_pro', '2024-01-03T00:00:00Z'),
    (4, 'diana_ace', '2024-01-04T00:00:00Z'),
    (5, 'evan_master', '2024-01-05T00:00:00Z'),
    (6, 'fiona_legend', '2024-01-06T00:00:00Z'),
    (7, 'george_rookie', '2024-01-07T00:00:00Z'),
    (8, 'hannah_champ', '2024-01-08T00:00:00Z'),
    (9, 'ivan_ninja', '2024-01-09T00:00:00Z'),
    (10, 'jade_warrior', '2024-01-10T00:00:00Z');

  -- Insert sample games
  INSERT OR IGNORE INTO games (id, name, type, image_url, created_by, created_at) VALUES
    (1, 'Chess Master', 'table', NULL, 1, '2024-01-01T00:00:00Z'),
    (2, 'Street Fighter 6', 'video', NULL, 2, '2024-01-02T00:00:00Z'),
    (3, 'Poker Night', 'card', NULL, 3, '2024-01-03T00:00:00Z'),
    (4, 'FIFA 24', 'video', NULL, 4, '2024-01-04T00:00:00Z'),
    (5, 'Monopoly', 'table', NULL, 5, '2024-01-05T00:00:00Z'),
    (6, 'Blackjack', 'card', NULL, 6, '2024-01-06T00:00:00Z'),
    (7, 'Rocket League', 'video', NULL, 7, '2024-01-07T00:00:00Z'),
    (8, 'Scrabble', 'table', NULL, 8, '2024-01-08T00:00:00Z'),
    (9, 'Texas Hold''em', 'card', NULL, 9, '2024-01-09T00:00:00Z'),
    (10, 'Super Smash Bros', 'video', NULL, 10, '2024-01-10T00:00:00Z');

  -- Insert sample game sessions
  INSERT OR IGNORE INTO game_sessions (id, game_id, started_by, status, player1_id, player2_id, created_at, completed_at) VALUES
    -- Chess sessions
    (1, 1, 1, 'completed', 1, 2, '2024-01-15T10:00:00Z', '2024-01-15T10:45:00Z'),
    (2, 1, 3, 'completed', 3, 4, '2024-01-16T14:00:00Z', '2024-01-16T14:30:00Z'),
    (3, 1, 5, 'completed', 5, 6, '2024-01-17T16:00:00Z', '2024-01-17T16:50:00Z'),
    (4, 1, 1, 'completed', 1, 3, '2024-01-18T11:00:00Z', '2024-01-18T11:40:00Z'),
    
    -- Street Fighter sessions
    (5, 2, 2, 'completed', 2, 7, '2024-01-15T20:00:00Z', '2024-01-15T20:15:00Z'),
    (6, 2, 8, 'completed', 8, 9, '2024-01-16T19:00:00Z', '2024-01-16T19:20:00Z'),
    (7, 2, 2, 'completed', 2, 8, '2024-01-17T21:00:00Z', '2024-01-17T21:18:00Z'),
    
    -- Poker sessions
    (8, 3, 3, 'completed', 3, 10, '2024-01-15T22:00:00Z', '2024-01-15T23:30:00Z'),
    (9, 3, 4, 'completed', 4, 5, '2024-01-16T20:00:00Z', '2024-01-16T21:45:00Z'),
    
    -- FIFA sessions
    (10, 4, 4, 'completed', 4, 6, '2024-01-17T15:00:00Z', '2024-01-17T15:25:00Z'),
    (11, 4, 7, 'completed', 7, 1, '2024-01-18T18:00:00Z', '2024-01-18T18:30:00Z'),
    
    -- Monopoly sessions
    (12, 5, 5, 'completed', 5, 9, '2024-01-19T13:00:00Z', '2024-01-19T15:30:00Z'),
    
    -- More recent sessions for variety
    (13, 1, 1, 'completed', 1, 8, '2024-01-20T10:00:00Z', '2024-01-20T10:35:00Z'),
    (14, 2, 9, 'completed', 9, 10, '2024-01-20T19:00:00Z', '2024-01-20T19:12:00Z'),
    (15, 6, 6, 'completed', 6, 7, '2024-01-20T21:00:00Z', '2024-01-20T21:45:00Z');

  -- Insert sample game results
  INSERT OR IGNORE INTO game_results (id, session_id, game_id, player1_id, player2_id, player1_score, player2_score, winner_id, timestamp, notes) VALUES
    -- Chess results (typically 1-0 or 0.5-0.5)
    (1, 1, 1, 1, 2, 1, 0, 1, '2024-01-15T10:45:00Z', 'Great opening strategy by Alice'),
    (2, 2, 1, 3, 4, 0, 1, 4, '2024-01-16T14:30:00Z', 'Diana with excellent endgame'),
    (3, 3, 1, 5, 6, 1, 0, 5, '2024-01-17T16:50:00Z', 'Evan dominated the middle game'),
    (4, 4, 1, 1, 3, 1, 0, 1, '2024-01-18T11:40:00Z', 'Alice continues her winning streak'),
    
    -- Street Fighter results (rounds won out of best of 3/5)
    (5, 5, 2, 2, 7, 3, 1, 2, '2024-01-15T20:15:00Z', 'Bob with perfect combos'),
    (6, 6, 2, 8, 9, 2, 3, 9, '2024-01-16T19:20:00Z', 'Ivan clutch comeback'),
    (7, 7, 2, 2, 8, 3, 2, 2, '2024-01-17T21:18:00Z', 'Close match, Bob takes it'),
    
    -- Poker results (chip count)
    (8, 8, 3, 3, 10, 2500, 1500, 3, '2024-01-15T23:30:00Z', 'Charlie with aggressive play'),
    (9, 9, 3, 4, 5, 1800, 2200, 5, '2024-01-16T21:45:00Z', 'Evan read the bluffs perfectly'),
    
    -- FIFA results (goals scored)
    (10, 10, 4, 4, 6, 3, 1, 4, '2024-01-17T15:25:00Z', 'Diana unstoppable in attack'),
    (11, 11, 4, 7, 1, 1, 2, 1, '2024-01-18T18:30:00Z', 'Alice with late winner'),
    
    -- Monopoly results (final money amount)
    (12, 12, 5, 5, 9, 3200, 1800, 5, '2024-01-19T15:30:00Z', 'Evan bought all the railroads'),
    
    -- Recent results
    (13, 13, 1, 1, 8, 1, 0, 1, '2024-01-20T10:35:00Z', 'Alice extends chess dominance'),
    (14, 14, 2, 9, 10, 3, 0, 9, '2024-01-20T19:12:00Z', 'Ivan perfect game'),
    (15, 15, 6, 6, 7, 85, 76, 6, '2024-01-20T21:45:00Z', 'Fiona wins close blackjack match');
`)

export default db

export interface User {
  id: number
  username: string
  created_at: string
}

export interface Game {
  id: number
  name: string
  type: 'video' | 'table' | 'card'
  image_url: string | null
  created_by: number
  created_at: string
}

export interface GameSession {
  id: number
  game_id: number
  started_by: number
  status: 'setup' | 'in_progress' | 'completed' | 'cancelled'
  total_rounds: number
  current_round: number
  player1_id: number
  player2_id: number
  created_at: string
  completed_at: string | null
}

export interface GameResult {
  id: number
  session_id: number
  game_id: number
  player1_id: number
  player2_id: number
  player1_score: number
  player2_score: number
  winner_id: number
  timestamp: string
  notes: string | null
}

export interface PlayerStats {
  player_id: number
  username: string
  games_played: number
  wins: number
  losses: number
  win_rate: number
  current_streak: number
  longest_streak: number
  total_score: number
  avg_score: number
}

export interface GameScoreboard {
  game_id: number
  game_name: string
  players: PlayerStats[]
}