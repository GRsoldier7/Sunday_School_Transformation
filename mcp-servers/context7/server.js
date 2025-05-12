/**
 * Context7 MCP Server
 * 
 * This server provides context management functionality for the Bible Study Tracker.
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('json-body-parser');
const fs = require('fs');
const path = require('path');

// Create Express app
const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage (for demo purposes)
// In a real implementation, this would be a database
const contextStore = {};

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load data from file on startup
try {
  const dataFile = path.join(dataDir, 'context.json');
  if (fs.existsSync(dataFile)) {
    const data = fs.readFileSync(dataFile, 'utf8');
    Object.assign(contextStore, JSON.parse(data));
    console.log('Loaded context data from file');
  }
} catch (error) {
  console.error('Error loading context data:', error);
}

// Save data to file periodically
setInterval(() => {
  try {
    const dataFile = path.join(dataDir, 'context.json');
    fs.writeFileSync(dataFile, JSON.stringify(contextStore, null, 2), 'utf8');
    console.log('Saved context data to file');
  } catch (error) {
    console.error('Error saving context data:', error);
  }
}, 60000); // Save every minute

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Context7',
    timestamp: new Date().toISOString()
  });
});

// Store context
app.post('/api/context', (req, res) => {
  try {
    const { key, data, tags } = req.body;
    
    if (!key || !data) {
      return res.status(400).json({
        error: 'Key and data are required'
      });
    }
    
    // Store the context
    contextStore[key] = {
      data,
      tags: tags || [],
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      key,
      timestamp: contextStore[key].timestamp
    });
  } catch (error) {
    console.error('Error storing context:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Get context
app.get('/api/context', (req, res) => {
  try {
    const { key, tags } = req.query;
    
    if (key) {
      // Get context by key
      const context = contextStore[key];
      
      if (!context) {
        return res.status(404).json({
          error: 'Context not found'
        });
      }
      
      // Filter by tags if provided
      if (tags) {
        const tagList = tags.split(',');
        if (!tagList.some(tag => context.tags.includes(tag))) {
          return res.status(404).json({
            error: 'Context not found with specified tags'
          });
        }
      }
      
      res.json({
        key,
        data: context.data,
        tags: context.tags,
        timestamp: context.timestamp
      });
    } else if (tags) {
      // Get all contexts with specified tags
      const tagList = tags.split(',');
      const contexts = Object.entries(contextStore)
        .filter(([_, context]) => 
          tagList.some(tag => context.tags.includes(tag))
        )
        .map(([key, context]) => ({
          key,
          data: context.data,
          tags: context.tags,
          timestamp: context.timestamp
        }));
      
      res.json({
        contexts,
        count: contexts.length
      });
    } else {
      // Get all contexts (keys only)
      const keys = Object.keys(contextStore);
      
      res.json({
        keys,
        count: keys.length
      });
    }
  } catch (error) {
    console.error('Error getting context:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Delete context
app.delete('/api/context/:key', (req, res) => {
  try {
    const { key } = req.params;
    
    if (!contextStore[key]) {
      return res.status(404).json({
        error: 'Context not found'
      });
    }
    
    delete contextStore[key];
    
    res.json({
      success: true,
      key
    });
  } catch (error) {
    console.error('Error deleting context:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Context7 server listening on port ${port}`);
});
