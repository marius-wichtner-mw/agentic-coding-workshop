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

  -- Insert some sample data if tables are empty
  INSERT OR IGNORE INTO users (id, username, created_at) VALUES 
    (1, 'alice_gamer', '2024-01-01T00:00:00Z'),
    (2, 'bob_player', '2024-01-02T00:00:00Z'),
    (3, 'charlie_pro', '2024-01-03T00:00:00Z');
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