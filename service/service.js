/**
 * Moonfin Tizen Service Application
 * Handles Jellyseerr proxy requests with cookie management
 * 
 * This service runs as a background application on Samsung Tizen TVs
 * and provides HTTP proxy functionality with proper cookie handling.
 */

'use strict';

var http = require('http');
var https = require('https');
var url = require('url');

// Cookie storage per user
var cookieJars = {};

// Service port
var SERVICE_PORT = 8765;

/**
 * Parse Set-Cookie headers and store cookies
 */
function storeCookies(userId, headers, requestUrl) {
    if (!headers || !headers['set-cookie']) {
        return;
    }
    
    if (!cookieJars[userId]) {
        cookieJars[userId] = [];
    }
    
    var setCookieHeaders = Array.isArray(headers['set-cookie']) 
        ? headers['set-cookie'] 
        : [headers['set-cookie']];
    
    var domain = url.parse(requestUrl).hostname;
    
    setCookieHeaders.forEach(function(cookieStr) {
        var cookie = parseCookie(cookieStr);
        if (cookie) {
            cookie.domain = domain;
            // Remove existing cookie with same name
            cookieJars[userId] = cookieJars[userId].filter(function(c) {
                return c.name !== cookie.name || c.domain !== cookie.domain;
            });
            // Add new cookie
            cookieJars[userId].push(cookie);
        }
    });
    
    console.log('[MoonfinService] Stored ' + setCookieHeaders.length + ' cookies for user: ' + userId);
}

/**
 * Parse a single cookie string
 */
function parseCookie(cookieStr) {
    var parts = cookieStr.split(';');
    if (parts.length === 0) return null;
    
    var nameValue = parts[0].trim().split('=');
    if (nameValue.length < 2) return null;
    
    var cookie = {
        name: nameValue[0],
        value: nameValue.slice(1).join('='),
        expires: null,
        path: '/',
        httpOnly: false,
        secure: false
    };
    
    for (var i = 1; i < parts.length; i++) {
        var part = parts[i].trim().toLowerCase();
        if (part === 'httponly') {
            cookie.httpOnly = true;
        } else if (part === 'secure') {
            cookie.secure = true;
        } else if (part.startsWith('path=')) {
            cookie.path = part.substring(5);
        } else if (part.startsWith('expires=')) {
            cookie.expires = new Date(part.substring(8));
        } else if (part.startsWith('max-age=')) {
            var maxAge = parseInt(part.substring(8));
            cookie.expires = new Date(Date.now() + maxAge * 1000);
        }
    }
    
    return cookie;
}

/**
 * Get cookies for a request
 */
function getCookies(userId, requestUrl) {
    if (!cookieJars[userId] || cookieJars[userId].length === 0) {
        return '';
    }
    
    var domain = url.parse(requestUrl).hostname;
    var now = new Date();
    
    // Filter expired cookies
    cookieJars[userId] = cookieJars[userId].filter(function(cookie) {
        return !cookie.expires || cookie.expires > now;
    });
    
    // Get matching cookies
    var cookies = cookieJars[userId]
        .filter(function(cookie) {
            return cookie.domain === domain;
        })
        .map(function(cookie) {
            return cookie.name + '=' + cookie.value;
        });
    
    return cookies.join('; ');
}

/**
 * Handle proxy request
 */
function handleProxyRequest(requestData, callback) {
    var userId = requestData.userId;
    var requestUrl = requestData.url;
    var method = requestData.method || 'GET';
    var headers = requestData.headers || {};
    var body = requestData.body;
    var timeout = requestData.timeout || 30000;
    
    if (!userId || !requestUrl) {
        callback({
            success: false,
            error: 'Missing userId or url'
        });
        return;
    }
    
    console.log('[MoonfinService] ' + method + ' ' + requestUrl + ' (user: ' + userId + ')');
    
    // Add cookies to request
    var cookieHeader = getCookies(userId, requestUrl);
    if (cookieHeader) {
        headers['Cookie'] = cookieHeader;
        console.log('[MoonfinService] Added cookies: ' + cookieHeader.substring(0, 50) + '...');
    }
    
    // Parse URL
    var parsedUrl = url.parse(requestUrl);
    var isHttps = parsedUrl.protocol === 'https:';
    var httpModule = isHttps ? https : http;
    
    // Request options
    var options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.path,
        method: method,
        headers: headers,
        timeout: timeout,
        rejectUnauthorized: false // Allow self-signed certs
    };
    
    // Make request
    var req = httpModule.request(options, function(res) {
        var responseBody = '';
        
        // Store cookies from response
        storeCookies(userId, res.headers, requestUrl);
        
        res.on('data', function(chunk) {
            responseBody += chunk;
        });
        
        res.on('end', function() {
            console.log('[MoonfinService] Response: ' + res.statusCode + ' (' + responseBody.length + ' bytes)');
            
            callback({
                success: true,
                status: res.statusCode,
                headers: res.headers,
                body: responseBody
            });
        });
    });
    
    req.on('error', function(err) {
        console.error('[MoonfinService] Request failed:', err.message);
        callback({
            success: false,
            error: err.message
        });
    });
    
    req.on('timeout', function() {
        console.error('[MoonfinService] Request timeout');
        req.abort();
        callback({
            success: false,
            error: 'Request timeout'
        });
    });
    
    // Send request body
    if (body) {
        req.write(body);
    }
    
    req.end();
}

/**
 * Clear cookies for a user
 */
function handleClearCookies(requestData, callback) {
    var userId = requestData.userId;
    var domain = requestData.domain;
    
    if (!userId) {
        callback({ success: false, error: 'Missing userId' });
        return;
    }
    
    if (domain) {
        if (cookieJars[userId]) {
            cookieJars[userId] = cookieJars[userId].filter(function(cookie) {
                return cookie.domain !== domain;
            });
            console.log('[MoonfinService] Cleared cookies for domain: ' + domain);
        }
    } else {
        delete cookieJars[userId];
        console.log('[MoonfinService] Cleared all cookies for user: ' + userId);
    }
    
    callback({ success: true });
}

/**
 * Get status
 */
function handleStatus(requestData, callback) {
    var userId = requestData.userId;
    var cookieCount = (cookieJars[userId] || []).length;
    
    callback({
        success: true,
        running: true,
        userId: userId,
        cookieCount: cookieCount
    });
}

/**
 * HTTP server to receive requests from the web app
 */
var server = http.createServer(function(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
        return;
    }
    
    var body = '';
    req.on('data', function(chunk) {
        body += chunk;
    });
    
    req.on('end', function() {
        try {
            var requestData = JSON.parse(body);
            var path = url.parse(req.url).pathname;
            
            var respond = function(data) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
            };
            
            switch (path) {
                case '/proxy':
                    handleProxyRequest(requestData, respond);
                    break;
                case '/clearCookies':
                    handleClearCookies(requestData, respond);
                    break;
                case '/status':
                    handleStatus(requestData, respond);
                    break;
                default:
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Not found' }));
            }
        } catch (err) {
            console.error('[MoonfinService] Error parsing request:', err);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Invalid request' }));
        }
    });
});

server.listen(SERVICE_PORT, '127.0.0.1', function() {
    console.log('[MoonfinService] Proxy service started on port ' + SERVICE_PORT);
});

// Tizen service lifecycle
module.exports.onStart = function() {
    console.log('[MoonfinService] Service started');
};

module.exports.onStop = function() {
    console.log('[MoonfinService] Service stopping');
    server.close();
};

module.exports.onRequest = function(request) {
    console.log('[MoonfinService] Received request:', request);
};
