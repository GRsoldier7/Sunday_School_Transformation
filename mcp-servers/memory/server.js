/**
 * Memory MCP Server
 * 
 * This server provides memory/caching functionality for the Bible Study Tracker.
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('json-body-parser');

// Create Express app
const app = express();
const port = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage
const memoryStore = {};

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Memory',
    timestamp: new Date().toISOString()
  });
});

// Store data
app.post('/api/memory', (req, res) => {
  try {
    const { key, value, expires_in } = req.body;
    
    if (!key) {
      return res.status(400).json({
        error: 'Key is required'
      });
    }
    
    // Store the value
    memoryStore[key] = {
      value,
      timestamp: Date.now()
    };
    
    // Set expiration if provided
    if (expires_in) {
      memoryStore[key].expires_at = Date.now() + (expires_in * 1000);
      
      // Set timeout to delete the key when it expires
      setTimeout(() => {
        if (memoryStore[key] && memoryStore[key].expires_at <= Date.now()) {
          delete memoryStore[key];
          console.log(`Key ${key} expired and was removed`);
        }
      }, expires_in * 1000);
    }
    
    res.json({
      success: true,
      key,
      expires_in: expires_in || null
    });
  } catch (error) {
    console.error('Error storing data:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Retrieve data
app.get('/api/memory', (req, res) => {
  try {
    const { key } = req.query;
    
    if (!key) {
      // Return all keys (without values)
      const keys = Object.keys(memoryStore);
      return res.json({
        keys,
        count: keys.length
      });
    }
    
    // Check if the key exists
    if (!memoryStore[key]) {
      return res.status(404).json({
        error: 'Key not found'
      });
    }
    
    // Check if the key has expired
    if (memoryStore[key].expires_at && memoryStore[key].expires_at <= Date.now()) {
      delete memoryStore[key];
      return res.status(404).json({
        error: 'Key expired'
      });
    }
    
    res.json({
      key,
      value: memoryStore[key].value,
      timestamp: memoryStore[key].timestamp,
      expires_at: memoryStore[key].expires_at
    });
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Delete data
app.delete('/api/memory/:key', (req, res) => {
  try {
    const { key } = req.params;
    
    if (!memoryStore[key]) {
      return res.status(404).json({
        error: 'Key not found'
      });
    }
    
    delete memoryStore[key];
    
    res.json({
      success: true,
      key
    });
  } catch (error) {
    console.error('Error deleting data:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Clear expired keys periodically
setInterval(() => {
  const now = Date.now();
  let expiredCount = 0;
  
  Object.keys(memoryStore).forEach(key => {
    if (memoryStore[key].expires_at && memoryStore[key].expires_at <= now) {
      delete memoryStore[key];
      expiredCount++;
    }
  });
  
  if (expiredCount > 0) {
    console.log(`Cleared ${expiredCount} expired keys`);
  }
}, 60000); // Run every minute

// Start the server
app.listen(port, () => {
  console.log(`Memory server listening on port ${port}`);
});
