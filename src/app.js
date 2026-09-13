const express = require('express');
const app = express();

const candidateRoutes = require('./routes/candidate.route');
const jobRoutes = require('./routes/job.routes');
const jobScoreRoutes = require("./routes/jobScrore.routes");


app.use(express.json());
app.use('/api/candidates', candidateRoutes);
app.use('/api/jobs', jobRoutes);
app.use("/api/jobScores", jobScoreRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Job Recommendation Engine API');
});

module.exports = app;