const net = require('net');
const { promisify } = require('util');
const { resolveMx } = require('dns').promises;
const nodemailer = require('nodemailer');
const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Your routes and middleware setup here

// Function to perform SMTP handshake and verify email
async function verifyEmail(email) {
    // Extract domain from email
    const domain = email.split('@')[1];

    try {
        // Resolve the MX records for the recipient domain
        const mxRecords = await resolveMx(domain);
        const mxHostname = mxRecords[0].exchange;

        // Connect to the SMTP server
        const client = net.createConnection({ port: 25, host: mxHostname });

        client.setEncoding('utf8');

        client.on('connect', () => {
            console.log('Connected to SMTP server');
        });

        client.on('data', async (data) => {
            console.log(data);

            if (data.startsWith('220')) {
                // Server is ready, send EHLO command
                client.write(`EHLO mydomain.com\r\n`);
            } else if (data.startsWith('250')) {
                // EHLO response received, send MAIL FROM
                client.write(`MAIL FROM: <me@mydomain.com>\r\n`);
            } else if (data.startsWith('250')) {
                // MAIL FROM response received, send RCPT TO
                client.write(`RCPT TO: <${email}>\r\n`);
            } else if (data.startsWith('250')) {
                // RCPT TO response received, email is valid
                console.log(`Email ${email} exists`);
                client.end();
            } else {
                console.log('Unexpected response from server');
                client.end();
            }
        });

        client.on('end', () => {
            console.log('Disconnected from SMTP server');
        });

        client.on('error', (err) => {
            console.error('Error:', err);
        });
    } catch (err) {
        console.error('Error resolving MX records:', err);
    }
}

// Example usage
const emailToVerify = 'aaron@automote.io';
verifyEmail(emailToVerify);
