require("dotenv").config();
const express = require('express');

const app = require('./app');

const PORT = process.env.PORT || 3000;
const dbConnect = require('./db/database');

app.listen(PORT,()=>{
    try {
        console.log(`Server is running on port ${PORT}`);
        dbConnect();



    }
    catch (error) {
        console.error('Error running server:', error);
        process.exit(1);
    }
    

});
