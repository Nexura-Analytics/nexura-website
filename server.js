const http = require('http');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const PORT = 8080;
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nexuraanalytics@gmail.com',
    pass: process.env.EMAIL_APP_PASSWORD // Use environment variable for security
  }
});

const server = http.createServer((req, res) => {
  // Handle CORS for API requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // Handle email API
  if (req.url === '/api/contact' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { name, email, projectType, message } = data;

        // Email options
        const mailOptions = {
          from: 'nexuraanalytics@gmail.com',
          to: 'nexuraanalytics@gmail.com',
          subject: `New Contact Form Submission - ${projectType}`,
          replyTo: email,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #00d4ff; border-bottom: 2px solid #00d4ff; padding-bottom: 10px;">
                New Message from Nexura Analytics Website
              </h2>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                  <td style="padding: 10px; font-weight: bold; width: 150px;">Name:</td>
                  <td style="padding: 10px;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-weight: bold;">Email:</td>
                  <td style="padding: 10px;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-weight: bold;">Project Type:</td>
                  <td style="padding: 10px;">${projectType}</td>
                </tr>
              </table>
              <div style="margin: 20px 0;">
                <h3 style="color: #7c3aed;">Message:</h3>
                <p style="line-height: 1.6; color: #333;">${message}</p>
              </div>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              <p style="color: #888; font-size: 12px;">
                This email was sent from the Nexura Analytics website contact form.
                <br>Reply directly to: ${email}
              </p>
            </div>
          `
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Email send error:', error);
            res.writeHead(500, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ 
              success: false, 
              error: 'Failed to send email' 
            }));
          } else {
            console.log('Email sent successfully:', info.messageId);
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ 
              success: true, 
              messageId: info.messageId 
            }));
          }
        });
      } catch (error) {
        console.error('Parse error:', error);
        res.writeHead(400, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ 
          success: false, 
          error: 'Invalid request data' 
        }));
      }
    });
    return;
  }

  // Serve static files
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('Not Found');
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
  console.log(`Access from mobile: http://192.168.0.108:${PORT}`);
  console.log('\n📧 Email service configured for: nexuraanalytics@gmail.com');
  console.log('⚠️  Set EMAIL_APP_PASSWORD environment variable for Gmail');
});
