/* eslint-disable */
const winston =  require('winston');
const fs =  require('fs');
const DailyRotateFile =  require('winston-daily-rotate-file');
// const Sentry =  require('@sentry/node');
// Sentry.init({
//     dsn: 'https://8dd48ba62a4e488abc9c9d0b38c180ad@sentry.io/4560290',
// });

const customLevels = {
    levels: {
        error: 0,
        info: 1,
        warn: 2,
        taskLog: 3,
    },
    colors: {
        taskLog: 'blue',
        info: 'green',
        warn: 'yellow',
        error: 'red',
    },
};

winston.addColors(customLevels.colors);

// Create log dir if not exist.
if (!fs.existsSync(`logs`)) {
    fs.mkdirSync(`logs`);
}

const logger = winston.createLogger({
    levels: customLevels.levels,
    format: winston.format.combine(
        winston.format.splat(),
        winston.format.simple(),
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf((info) => `${info.timestamp}: ${info.message}`)
    ),
    transports: [
        new winston.transports.Console(),
        new DailyRotateFile({
            filename: `./logs/%DATE%/error.log`,
            level: 'error',
            datePattern: 'D-M-YYYY',
            // prepend: true,
            zippedArchive: true,
            // levelOnly: true,
        }),
        new DailyRotateFile({
            filename: `./logs/%DATE%/info.log`,
            level: 'info',
            datePattern: 'D-M-YYYY',
            // prepend: true,
            zippedArchive: true,
            // levelOnly: true,
        }),
        new DailyRotateFile({
            filename: './logs/%DATE%/taskLog.log',
            level: 'taskLog',
            datePattern: 'D-M-YYYY',
            // prepend: true,
            zippedArchive: true,
            // levelOnly: true,
        }),
        new DailyRotateFile({
            filename: `./logs/%DATE%/warn.log`,
            level: 'warn',
            datePattern: 'D-M-YYYY',
            // prepend: true,
            zippedArchive: true,
            // levelOnly: true,
        }),
    ],
});

const loggerWrapper = {
    info: (file, message) => {
        // console.log(file, message);
        // Sentry.captureMessage(`[${file}] ${message}`);
        logger.info(`[${file}] ${message}`);
    },
    warn: (file, message) => {
        // console.log(file, message);
        // Sentry.captureEvent(`[${file}] ${message}`);
        logger.warn(`[${file}] ${message}`);
    },
    // taskLog: (message:any) => {
    // //     // console.log(message);
    // //     logger.taskLog(`${message}`);
    // // },
    error: (file, message, error) => {
        // console.log(file, message);
        // console.log(file, error);
        // Sentry.captureException(
        //     `[${file}] ${message}${error && error.stack ? error.stack : error || ''}`
        // );
        // Sentry.captureException(error);
        logger.error(
            `[${file}] ${message}${error && error.stack ? error.stack : error || ''}`
        );
    },
    stopLogging: () => {
        logger.silent = true;
    },
};

exports.loggerWrapper = loggerWrapper;
