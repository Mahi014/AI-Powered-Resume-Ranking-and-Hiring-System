# app/db.py
import psycopg2
import psycopg2.extras
from typing import List
from .config import DB_DSN

def get_db_conn():
    return psycopg2.connect(DB_DSN)

def fetch_job_and_applicants(job_id: int):
    q_job = "SELECT job_title, job_description, job_role FROM job_description WHERE job_id = %s"

    q_apps = """
        SELECT 
            ja.id AS application_id,
            ja.job_seeker_id,
            js.name,
            js.degree,
            js.college,
            js.graduation_year,
            js.resume_name,
            js.resume_data,
            ja.rank
        FROM job_applied ja
        JOIN job_seeker js 
            ON ja.job_seeker_id = js.job_seeker_id
        WHERE ja.job_id = %s
        ORDER BY ja.rank ASC NULLS LAST
    """

    conn = get_db_conn()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(q_job, (job_id,))
            job = cur.fetchone()

            cur.execute(q_apps, (job_id,))
            apps = cur.fetchall()

    finally:
        conn.close()

    return job, apps


def update_ranks(job_id: int, ordered_job_seeker_ids: List[int]):
    conn = get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("UPDATE job_applied SET rank = 0 WHERE job_id = %s", (job_id,))
            for idx, jsid in enumerate(ordered_job_seeker_ids, start=1):
                cur.execute(
                    "UPDATE job_applied SET rank = %s WHERE job_id = %s AND job_seeker_id = %s",
                    (idx, job_id, jsid),
                )
        conn.commit()
    finally:
        conn.close()
