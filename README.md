# Job Recommendation Engine

A Node.js and Express API that stores candidates and jobs in MongoDB and returns ranked job recommendations based on skills, experience, location, and salary expectations.

## Requirements

- Node.js 20.19 or later
- MongoDB running locally or a MongoDB connection string 
- npm

## Installation

Clone or open the project, then install all dependencies listed in `package.json`:

```bash
npm install
```

The project uses these packages:

| Package | Purpose |
| --- | --- |
| `express` | Creates the HTTP server and API routes |
| `mongoose` | Connects to MongoDB and defines database schemas |
| `dotenv` | Loads environment variables from `.env` |
| `nodemon` | Restarts the server automatically during development |

To install the packages manually instead of using `package.json`, run:

```bash
npm install express mongoose dotenv
npm install --save-dev nodemon
```

Create a `.env` file in the project root:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/job-recommendation-engine
```

## Run Locally

After installation and MongoDB setup, start the API in development mode:

Development mode with automatic restart:

```bash
npm run dev
```

Standard mode:

```bash
npm run server
```

The API runs at `http://localhost:3000` by default.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the server with Nodemon |
| `npm run server` | Starts the server with Node.js |
| `npm install` | Installs dependencies |

## API Endpoints

### Health Check

```http
GET /
```

Response:

```text
Welcome to the Job Recommendation Engine API
```

### Create a Candidate

```http
POST /api/candidates/createCandidate
Content-Type: application/json
```

Request body:

```json
{
  "name": "Aarav Sharma",
  "skills": ["JavaScript", "Node.js", "MongoDB"],
  "yearsOfExperience": 4,
  "location": "Bengaluru",
  "expectedSalary": 1200000
}
```

Example request:

```http
POST http://localhost:3000/api/candidates/createCandidate
Content-Type: application/json
```

```json
{
  "name": "Yuvraj Singh",
  "skills": [
    "python"
  ],
  "yearsOfExperience": 2,
  "location": "Gurugram",
  "expectedSalary": 900000
}
```

Required fields:

| Field | Type | Description |
| --- | --- | --- |
| `name` | string | Candidate name |
| `skills` | string[] | Candidate skills |
| `yearsOfExperience` | number | Minimum `0` |
| `location` | string | Candidate location |
| `expectedSalary` | number | Minimum `0` |

Success response: `201 Created`

```json

{
    "success": true,
    "message": "Candidate created successfully",
    "data": {
        "name": "Yuvraj Singh",
        "skills": [
            "python"
        ],
        "yearsOfExperience": 2,
        "location": "Gurugram",
        "expectedSalary": 900000,
        "_id": "6aa6e0b8577b834e6d95fa1c",
        "createdAt": "2026-09-13T17:43:20.175Z",
        "updatedAt": "2026-09-13T17:43:20.175Z",
        "__v": 0
    }
}
```

### Create a Job

```http
POST /api/jobs/createJob
Content-Type: application/json
```

Request body:

```json
{
  "title": "Backend Developer",
  "requiredSkills": [
    {
      "name": "Node.js",
      "type": "must-have"
    },
    {
      "name": "MongoDB",
      "type": "nice-to-have"
    }
  ],
  "minYearsExperience": 3,
  "location": "Bengaluru",
  "salaryRange": {
    "min": 1000000,
    "max": 1800000
  },
  "remoteAllowed": true
}
```

Example request:

```http
POST http://localhost:3000/api/jobs/createJob
Content-Type: application/json
```

```json
{
  "title": "Full Stack Developer",
  "requiredSkills": [
    {
      "name": "javascript",
      "type": "must-have"
    },
    {
      "name": "react",
      "type": "must-have"
    },
    {
      "name": "node.js",
      "type": "must-have"
    },
    {
      "name": "typescript",
      "type": "nice-to-have"
    },
    {
      "name": "docker",
      "type": "nice-to-have"
    }
  ],
  "minYearsExperience": 2,
  "location": "Gurugram",
  "salaryRange": {
    "min": 700000,
    "max": 1200000
  },
  "remoteAllowed": true
}
```

Required fields:

| Field | Type | Description |
| --- | --- | --- |
| `title` | string | Job title |
| `requiredSkills` | object[] | Required and optional skills |
| `requiredSkills[].name` | string | Skill name |
| `requiredSkills[].type` | string | `must-have` or `nice-to-have` |
| `minYearsExperience` | number | Minimum `0` |
| `location` | string | Job location |
| `salaryRange.min` | number | Minimum salary, `0` or greater |
| `salaryRange.max` | number | Maximum salary, `0` or greater |
| `remoteAllowed` | boolean | Whether remote work is allowed |

Success response: `201 Created`

```json
{
    "success": true,
    "data": {
        "title": "Full Stack Developer",
        "requiredSkills": [
            {
                "name": "javascript",
                "type": "must-have"
            },
            {
                "name": "react",
                "type": "must-have"
            },
            {
                "name": "node.js",
                "type": "must-have"
            },
            {
                "name": "typescript",
                "type": "nice-to-have"
            },
            {
                "name": "docker",
                "type": "nice-to-have"
            }
        ],
        "minYearsExperience": 2,
        "location": "Gurugram",
        "salaryRange": {
            "min": 700000,
            "max": 1200000
        },
        "remoteAllowed": true,
        "_id": "6aa6e2ca577b834e6d95fa1d",
        "createdAt": "2026-09-13T17:52:10.563Z",
        "updatedAt": "2026-09-13T17:52:10.563Z",
        "__v": 0
    }
}
```

### Get Job Recommendations

```http
GET /api/jobScores/candidates/:candidateId/recommendations
```

Example:

```http
GET http://localhost:3000/api/jobScores/candidates/6aa6e0b8577b834e6d95fa1c/recommendations
```

By default, the endpoint returns up to 10 eligible recommendations. Use the optional `limit` query parameter to request the top results:

```http
# Top 1 recommendation
GET http://localhost:3000/api/jobScores/candidates/6aa6e0b8577b834e6d95fa1c/recommendations?limit=1

# Top 2 recommendations
GET http://localhost:3000/api/jobScores/candidates/6aa6e0b8577b834e6d95fa1c/recommendations?limit=2
```

The response includes eligible jobs sorted by descending score. Jobs missing any `must-have` skill are excluded.

Success response: `200 OK`

```json
{
  "success": true,
  "candidate": {
    "id": "candidate-id",
    "name": "Aarav Sharma"
  },
  "count": 1,
  "recommendations": [
    {
      "job": {
        "_id": "job-id",
        "title": "Backend Developer"
      },
      "eligible": true,
      "score": 92.5,
      "breakdown": {
        "skills": {
          "score": 50,
          "maxScore": 50
        },
        "experience": {
          "score": 20,
          "maxScore": 20
        },
        "location": {
          "score": 15,
          "maxScore": 15
        },
        "salary": {
          "score": 7.5,
          "maxScore": 15
        }
      }
    }
  ]
}
```

## Scoring Logic

Each eligible job receives a score out of `100`:

```text
total score = skills score + experience score + location score + salary score
```

The weights are:

| Factor | Maximum score | Reasoning |
| --- | ---: | --- |
| Skills | `50` | Skills are the strongest indicator that a candidate can perform the job. Must-have skills are also used as a hard eligibility filter. |
| Experience | `20` | Experience is important, but a candidate who has the required skills can still be a reasonable match with slightly less experience. |
| Location | `15` | Location affects practical fit and work arrangements, while remote work can reduce the impact of a location mismatch. |
| Salary | `15` | Salary expectations help rank otherwise suitable jobs without outweighing the candidate's actual ability to perform the work. |

### 1. Skills Score: 50 Points

Skills are normalized by trimming whitespace and converting them to lowercase.

- Every `must-have` skill must match a candidate skill. If any are missing, the job is marked ineligible and receives no recommendation.
- When both skill types exist:
  - Matched must-have skills: up to `40` points.
  - Matched nice-to-have skills: up to `10` points.

```text
must-have score = (matched must-have skills / total must-have skills) * 40
nice-to-have score = (matched nice-to-have skills / total nice-to-have skills) * 10
skills score = must-have score + nice-to-have score
```

If a job has no must-have skills, its nice-to-have skills can contribute all `50` points. If a job has no nice-to-have skills, matching all must-have skills contributes all `50` points.

### 2. Experience Score: 20 Points

Candidates who meet or exceed the minimum experience receive the full score. Candidates below the minimum receive a proportional score.

```text
if candidate experience >= required experience:
    experience score = 20
else:
    experience score = (candidate experience / required experience) * 20
```

Jobs requiring zero years of experience automatically award the full `20` points.

### 3. Location Score: 15 Points

```text
same location                  = 15 points
different location + remote    = 10 points
different location + on-site   = 0 points
```

Location comparison is case-insensitive and ignores surrounding whitespace.

### 4. Salary Score: 15 Points

- If the job's maximum salary is below the candidate's expectation, the score is `0`.
- If the candidate's expectation is within the salary range:

```text
position = (expected salary - minimum salary) / (maximum salary - minimum salary)
salary score = 10 + (1 - position) * 5
```

This gives a score from `15` near the lower end of the range to `10` at the upper end. If the minimum and maximum salary are equal, the score is `15`.
- If the job's minimum salary is higher than the candidate's expectation, the score is `15`.
- All other cases receive `0` points.

Recommendations are filtered to eligible jobs, sorted from highest to lowest total score, and then limited by the optional `limit` query parameter.

If the candidate does not exist, the endpoint returns `404`. Database or server errors return `500`.

## Project Structure

```text
src/
├── app.js
├── server.js
├── controllers/
├── db/
├── models/
├── routes/
├── scoring/
└── services/
```

## Notes

- Skill matching is case-insensitive.
- A candidate must have every `must-have` skill to be recommended for a job.
- A matching location receives the full location score.
- A remote job can receive a partial location score when the locations differ.
- MongoDB must be running and `MONGO_URI` must be configured before starting the server.

## Assumptions

The recommendation engine makes the following assumptions:

* Salary values are annual compensation amounts in **INR**.
* Candidate skills and job skills are compared case-insensitively.
* Leading and trailing spaces in skill names are ignored.
* Every `must-have` skill is mandatory. Missing any must-have skill makes the job ineligible.
* Missing a nice-to-have skill does not make a job ineligible.
* Candidates below the required experience are penalized but are not completely excluded.
* A remote job can partially compensate for a location mismatch.
* An exact location match receives the highest location score.
* Salary matching is based on the candidate's expected salary and the job's minimum/maximum salary range.
* All eligible jobs are evaluated and ranked by their final score.
* The scoring system is intentionally rule-based and explainable rather than ML-based.

## Future Improvements

With more time, the following improvements could be added:

* **Configurable scoring weights** so different use cases can prioritize skills, experience, location, or salary differently.
* **Skill aliases and synonyms**, such as treating `Node` and `Node.js` as equivalent.
* **More detailed location matching**, such as city, state, country, distance, and relocation preferences.
* **Pagination and database indexing** for efficiently handling a large number of candidates and jobs.
* **Reverse recommendations** to find the best candidates for a specific job.
* **Authentication and authorization** for protecting candidate and job APIs.
* **Swagger/OpenAPI documentation** for easier API exploration and integration.
* **Docker support with PostgreSQL** for a production-like deployment setup.
* **Additional scoring tests** covering more edge cases and boundary conditions.
* **Versioned scoring strategies** so different recommendation formulas can be tested and compared.

## AI Usage

AI tools were used as a development assistant during the implementation of this project.

AI assistance was used for:

* Project scaffolding and development guidance.
* Reviewing implementation approaches.
* Identifying edge cases in the scoring logic.
* Generating and improving test cases.
* Debugging implementation issues.
* Improving README documentation and explaining design decisions.

The generated suggestions were reviewed and adapted manually rather than being used blindly.

The final implementation decisions, including:

* The **50/20/15/15 scoring weights**
* Must-have skill hard filtering
* Nice-to-have skill scoring
* Experience penalty
* Location scoring
* Salary scoring
* Recommendation ranking
* `limit` support
* Scoring tests

were reviewed and implemented according to the assignment requirements.

The scoring approach was kept intentionally transparent and deterministic so that every recommendation can be explained through its score breakdown.

# Use of Ai 
I used AI  to make all this readme document and writing different test cases for me.Although I required to do some changes as per my requirement because I was trying to make it more understandable

