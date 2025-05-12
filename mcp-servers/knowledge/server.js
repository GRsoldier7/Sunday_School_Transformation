/**
 * Knowledge MCP Server
 * 
 * This server provides Bible reference information and resources for the Bible Study Tracker.
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('json-body-parser');
const fs = require('fs');
const path = require('path');

// Create Express app
const app = express();
const port = process.env.PORT || 3006;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Sample Bible reference data (for demo purposes)
// In a real implementation, this would be a database or API
const bibleReferences = {
  'John 3:16': {
    text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
    crossReferences: ['Romans 5:8', '1 John 4:9-10', 'Romans 8:32'],
    resources: [
      {
        type: 'commentary',
        title: 'Matthew Henry Commentary',
        url: 'https://www.biblestudytools.com/commentaries/matthew-henry-complete/john/3.html'
      },
      {
        type: 'video',
        title: 'John 3:16 Explained',
        url: 'https://www.youtube.com/watch?v=example'
      }
    ]
  },
  'Romans 5:8': {
    text: 'But God demonstrates his own love for us in this: While we were still sinners, Christ died for us.',
    crossReferences: ['John 3:16', 'John 15:13', '1 John 4:10'],
    resources: [
      {
        type: 'commentary',
        title: 'Matthew Henry Commentary',
        url: 'https://www.biblestudytools.com/commentaries/matthew-henry-complete/romans/5.html'
      }
    ]
  },
  'Matthew 28:19-20': {
    text: 'Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you. And surely I am with you always, to the very end of the age.',
    crossReferences: ['Acts 1:8', 'Mark 16:15-16', 'John 20:21'],
    resources: [
      {
        type: 'commentary',
        title: 'Matthew Henry Commentary',
        url: 'https://www.biblestudytools.com/commentaries/matthew-henry-complete/matthew/28.html'
      },
      {
        type: 'article',
        title: 'The Great Commission',
        url: 'https://www.gotquestions.org/great-commission.html'
      }
    ]
  }
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Knowledge',
    timestamp: new Date().toISOString()
  });
});

// Get Bible reference
app.get('/api/bible', (req, res) => {
  try {
    const { reference } = req.query;
    
    if (!reference) {
      return res.status(400).json({
        error: 'Reference is required'
      });
    }
    
    // Find the reference (case-insensitive)
    const referenceKey = Object.keys(bibleReferences).find(
      key => key.toLowerCase() === reference.toLowerCase()
    );
    
    if (!referenceKey) {
      return res.status(404).json({
        error: 'Reference not found'
      });
    }
    
    const referenceData = bibleReferences[referenceKey];
    
    res.json({
      reference: referenceKey,
      text: referenceData.text,
      crossReferences: referenceData.crossReferences
    });
  } catch (error) {
    console.error('Error getting Bible reference:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Get cross-references
app.get('/api/bible/cross-references', (req, res) => {
  try {
    const { reference } = req.query;
    
    if (!reference) {
      return res.status(400).json({
        error: 'Reference is required'
      });
    }
    
    // Find the reference (case-insensitive)
    const referenceKey = Object.keys(bibleReferences).find(
      key => key.toLowerCase() === reference.toLowerCase()
    );
    
    if (!referenceKey) {
      return res.status(404).json({
        error: 'Reference not found'
      });
    }
    
    const crossReferences = bibleReferences[referenceKey].crossReferences;
    
    // Get the text for each cross-reference
    const crossReferencesWithText = crossReferences.map(ref => {
      const refData = bibleReferences[ref];
      return {
        reference: ref,
        text: refData ? refData.text : 'Text not available'
      };
    });
    
    res.json({
      reference: referenceKey,
      cross_references: crossReferencesWithText
    });
  } catch (error) {
    console.error('Error getting cross-references:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Get resources
app.get('/api/resources', (req, res) => {
  try {
    const { reference, type } = req.query;
    
    if (!reference) {
      return res.status(400).json({
        error: 'Reference is required'
      });
    }
    
    // Find the reference (case-insensitive)
    const referenceKey = Object.keys(bibleReferences).find(
      key => key.toLowerCase() === reference.toLowerCase()
    );
    
    if (!referenceKey) {
      return res.status(404).json({
        error: 'Reference not found'
      });
    }
    
    let resources = bibleReferences[referenceKey].resources;
    
    // Filter by type if provided
    if (type) {
      resources = resources.filter(resource => resource.type === type);
    }
    
    res.json({
      reference: referenceKey,
      resources
    });
  } catch (error) {
    console.error('Error getting resources:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Knowledge server listening on port ${port}`);
});
