# AI-Powered-Resume-Ranking-and-Hiring-System

A full-stack web application that streamlines the hiring workflow for employers and job seekers.
Employers can post jobs, view applicants, and evaluate them efficiently. Job seekers can create profiles, upload resumes, and apply to posted opportunities.
The system now includes a resume ranking engine built using FastAPI, NLP, TF-IDF, cosine similarity, and skill-matching.

## Tech Stack

- **Frontend:** React, Tailwind CSS  
- **Backend:** Express.js for authentication, job management, and resume storage; FastAPI for AI-based resume ranking and report generation  
- **Database:** PostgreSQL

## System Capabilities

### Job Seeker
- Create profile  
- Upload resume (PDF/DOCX)  
- Apply to jobs with auto-attached resume  

### Employer
- Create company profile  
- Post new job openings  
- View applicant list with ranked + unranked separation  
- Open applicant resumes directly in the browser  
- Generate HTML or Excel-based reports  

### AI-Powered Resume Ranking
- Extracts text from PDF/DOCX resumes  
- Preprocesses using tokenization, stopword removal, and lemmatization  
- Converts the Job Description (JD) and resumes into TF-IDF vectors (1–2 gram range)  
- Calculates cosine similarity between JD and resumes  
- Performs automatic skill extraction from the JD  
- Computes a final weighted score:  
  **final_score = (1 − w) × cosine_similarity + w × skill_match_ratio**  
- Automatically updates applicant ranks inside PostgreSQL  
- Supports **HTML-based report preview** (opens in a new tab) and **Excel report download**


