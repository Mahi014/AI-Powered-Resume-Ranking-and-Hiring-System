CREATE TABLE login (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20)
);

CREATE TABLE job_seeker (
    job_seeker_id INTEGER PRIMARY KEY REFERENCES login(id),
    name VARCHAR(255),
    college TEXT,
    degree TEXT,
    graduation_year INTEGER,
    resume_name VARCHAR(255),
    resume_data BYTEA
);

CREATE TABLE employer (
    employer_id INTEGER PRIMARY KEY REFERENCES login(id),
    name VARCHAR(255),
    company TEXT,
    post TEXT
);

CREATE TABLE job_description (
    job_id SERIAL PRIMARY KEY,
    employer_id INTEGER REFERENCES employer(employer_id),
    job_title TEXT,
    job_description TEXT,
    job_role TEXT
);

CREATE TABLE job_applied (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES job_description(job_id),
    job_seeker_id INTEGER REFERENCES job_seeker(job_seeker_id)
    rank INTEGER DEFAULT 0
);