CREATE TABLE genres (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO genres (name) VALUES
  ('Action'),('Drama'),('Comedy'),('Sci-Fi'),
  ('Horror'),('Thriller'),('Animation'),('Documentary'),
  ('Romance'),('Fantasy');

CREATE TABLE content (
    id             SERIAL PRIMARY KEY,
    title          VARCHAR(200) NOT NULL,
    type           VARCHAR(10)  NOT NULL CHECK (type IN ('movie','show')),
    genre_id       INTEGER REFERENCES genres(id),
    year           SMALLINT,
    director       VARCHAR(100),
    description    TEXT,
    poster_url     VARCHAR(500),
    total_seasons  SMALLINT,
    total_episodes SMALLINT,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE watchlog (
    id              SERIAL PRIMARY KEY,
    content_id      INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    status          VARCHAR(10) NOT NULL CHECK (status IN ('plan','watching','watched')),
    rating          SMALLINT CHECK (rating BETWEEN 1 AND 10),
    notes           TEXT,
    current_season  SMALLINT,
    current_episode SMALLINT,
    started_date    DATE,
    finished_date   DATE,
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_watchlog_status  ON watchlog(status);
CREATE INDEX idx_watchlog_updated ON watchlog(updated_at DESC);
CREATE INDEX idx_content_genre    ON content(genre_id);

-- Seed data: 10 items (mix of movies/shows, all 3 statuses)
INSERT INTO content (title, type, genre_id, year, director, description, poster_url, total_seasons, total_episodes) VALUES
  ('Inception',          'movie', 4,  2010, 'Christopher Nolan',  'A thief who steals corporate secrets through dream-sharing technology.', '', NULL, NULL),
  ('Breaking Bad',       'show',  2,  2008, 'Vince Gilligan',     'A chemistry teacher turned methamphetamine producer.', '', 5, 62),
  ('The Dark Knight',    'movie', 1,  2008, 'Christopher Nolan',  'Batman faces the Joker, a criminal mastermind.', '', NULL, NULL),
  ('Stranger Things',    'show',  4,  2016, 'The Duffer Brothers','Kids encounter supernatural forces in their small town.', '', 4, 34),
  ('Parasite',           'movie', 6,  2019, 'Bong Joon-ho',       'A poor family schemes to become employed by a wealthy household.', '', NULL, NULL),
  ('The Office',         'show',  3,  2005, 'Greg Daniels',       'A mockumentary about office life at a paper company.', '', 9, 201),
  ('Interstellar',       'movie', 4,  2014, 'Christopher Nolan',  'A team of explorers travel through a wormhole in space.', '', NULL, NULL),
  ('Chernobyl',          'show',  8,  2019, 'Johan Renck',        'The true story of the Chernobyl nuclear disaster.', '', 1, 5),
  ('Get Out',            'movie', 5,  2017, 'Jordan Peele',       'A young African-American visits his white girlfriend''s family estate.', '', NULL, NULL),
  ('Severance',          'show',  6,  2022, 'Ben Stiller',        'Employees have their memories surgically divided between work and personal life.', '', 2, 19);

INSERT INTO watchlog (content_id, status, rating, notes, current_season, current_episode, started_date, finished_date) VALUES
  (1,  'watched',  9,  'Mind-blowing ending',              NULL, NULL, '2024-01-10', '2024-01-10'),
  (2,  'watched',  10, 'Best show ever made',              NULL, NULL, '2023-11-01', '2024-02-15'),
  (3,  'watched',  10, 'Incredible performance by Ledger', NULL, NULL, '2024-03-01', '2024-03-01'),
  (4,  'watching', NULL, 'On season 4 now',                4,    5,    '2024-12-01', NULL),
  (5,  'watched',  9,  'Deserved every award',             NULL, NULL, '2024-04-20', '2024-04-20'),
  (6,  'watched',  8,  'Classic comfort watch',            NULL, NULL, '2023-06-01', '2023-09-30'),
  (7,  'watching', NULL, 'Just started it',                NULL, NULL, '2025-01-05', NULL),
  (8,  'watched',  10, 'Haunting and important',           NULL, NULL, '2024-07-01', '2024-07-10'),
  (9,  'plan',     NULL, 'Heard great things',             NULL, NULL, NULL, NULL),
  (10, 'plan',     NULL, 'Apple TV recommendation',        NULL, NULL, NULL, NULL);
