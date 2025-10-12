/**
 * Structured JSON Logger for ABM² MCP Server
 * Provides consistent logging with levels, timestamps, and separate error tracking
 */

const fs = require('fs');
const path = require('path');

// Log levels
const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARNING: 2,
    ERROR: 3,
    FATAL: 4
};

const LogLevelNames = {
    0: 'DEBUG',
    1: 'INFO',
    2: 'WARNING',
    3: 'ERROR',
    4: 'FATAL'
};

class Logger {
    constructor(options = {}) {
        this.logDir = options.logDir || '/tmp';
        this.serviceName = options.serviceName || 'abm2-mcp';
        this.minLevel = options.minLevel !== undefined ? options.minLevel : LogLevel.INFO;

        // Log file paths
        this.mainLogFile = path.join(this.logDir, `${this.serviceName}.log`);
        this.errorLogFile = path.join(this.logDir, `${this.serviceName}-errors.log`);

        // Request ID counter
        this.requestIdCounter = 0;

        // Ensure log directory exists
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }

        // Initialize log files
        this._initLogFiles();
    }

    _initLogFiles() {
        const timestamp = new Date().toISOString();
        const separator = '\n' + '='.repeat(80) + '\n';
        const header = `${separator}[${timestamp}] ${this.serviceName} logger initialized${separator}`;

        // Create/append to main log
        fs.appendFileSync(this.mainLogFile, header);

        // Create/append to error log
        fs.appendFileSync(this.errorLogFile, header);
    }

    generateRequestId() {
        this.requestIdCounter++;
        return `req_${Date.now()}_${this.requestIdCounter}`;
    }

    _formatLogEntry(level, message, context = {}) {
        return {
            timestamp: new Date().toISOString(),
            level: LogLevelNames[level],
            service: this.serviceName,
            message: message,
            ...context
        };
    }

    _writeLog(level, message, context = {}) {
        if (level < this.minLevel) {
            return; // Skip logs below minimum level
        }

        const logEntry = this._formatLogEntry(level, message, context);
        const logLine = JSON.stringify(logEntry) + '\n';

        // Write to main log
        fs.appendFileSync(this.mainLogFile, logLine);

        // Write to error log if ERROR or FATAL
        if (level >= LogLevel.ERROR) {
            fs.appendFileSync(this.errorLogFile, logLine);
        }

        // Also output to console for monitoring
        const consoleMsg = `[${logEntry.timestamp}] [${logEntry.level}] ${logEntry.message}`;
        if (level >= LogLevel.ERROR) {
            console.error(consoleMsg, context);
        } else {
            console.log(consoleMsg);
        }
    }

    debug(message, context = {}) {
        this._writeLog(LogLevel.DEBUG, message, context);
    }

    info(message, context = {}) {
        this._writeLog(LogLevel.INFO, message, context);
    }

    warning(message, context = {}) {
        this._writeLog(LogLevel.WARNING, message, context);
    }

    error(message, context = {}) {
        this._writeLog(LogLevel.ERROR, message, context);
    }

    fatal(message, context = {}) {
        this._writeLog(LogLevel.FATAL, message, context);
    }

    // Request-specific logging
    logRequest(method, params, requestId) {
        this.info('MCP request received', {
            requestId: requestId,
            method: method,
            params: params
        });
    }

    logResponse(method, success, duration, requestId, error = null) {
        const context = {
            requestId: requestId,
            method: method,
            duration_ms: duration,
            success: success
        };

        if (error) {
            context.error = error;
            this.error('MCP request failed', context);
        } else {
            this.info('MCP request completed', context);
        }
    }

    logHttpRequest(endpoint, httpMethod, statusCode, duration, requestId) {
        this.info('Backend API request', {
            requestId: requestId,
            endpoint: endpoint,
            method: httpMethod,
            statusCode: statusCode,
            duration_ms: duration
        });
    }

    // Startup/shutdown logging
    logStartup(port, config) {
        this.info('Server starting', {
            port: port,
            backend_api: config.ABM2_API_URL,
            auth_enabled: !!config.ABM2_PASSWORD
        });
    }

    logShutdown(reason) {
        this.info('Server shutting down', { reason: reason });
    }
}

// Export singleton instance
let loggerInstance = null;

function getLogger(options = {}) {
    if (!loggerInstance) {
        loggerInstance = new Logger(options);
    }
    return loggerInstance;
}

module.exports = {
    Logger,
    LogLevel,
    getLogger
};
