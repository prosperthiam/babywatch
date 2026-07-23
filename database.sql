CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar VARCHAR(10) DEFAULT '👤',
  phone VARCHAR(20),
  city VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sitter_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  hourly_rate DECIMAL(5,2) DEFAULT 12,
  rating DECIMAL(3,2) DEFAULT 0,
  total_missions INTEGER DEFAULT 0,
  available BOOLEAN DEFAULT true,
  accepts_camera BOOLEAN DEFAULT true,
  skills TEXT[] DEFAULT '{}'
);

CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  parent_id INTEGER REFERENCES users(id),
  sitter_id INTEGER REFERENCES users(id),
  date DATE NOT NULL,
  time_start TIME NOT NULL,
  duration INTEGER NOT NULL,
  address TEXT,
  children INTEGER DEFAULT 1,
  notes TEXT,
  camera BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'pending',
  price DECIMAL(8,2),
  rating INTEGER,
  review TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE camera_sessions (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id),
  room_name VARCHAR(255),
  active BOOLEAN DEFAULT false,
  started_at TIMESTAMP,
  ended_at TIMESTAMP
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id),
  sender_id INTEGER REFERENCES users(id),
  content TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW()
);