<?php

// Serverless entry point for Vercel

// Ensure /tmp directories exist for serverless (read-only filesystem)
foreach (['/tmp/views', '/tmp/cache', '/tmp/cache/data', '/tmp/sessions', '/tmp/logs'] as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
}

// Override env for serverless
putenv('VIEW_COMPILED_PATH=/tmp/views');
putenv('LOG_CHANNEL=stderr');
putenv('SESSION_DRIVER=cookie');
putenv('CACHE_STORE=array');

$_ENV['VIEW_COMPILED_PATH'] = '/tmp/views';
$_ENV['LOG_CHANNEL'] = 'stderr';
$_ENV['SESSION_DRIVER'] = 'cookie';
$_ENV['CACHE_STORE'] = 'array';

$_SERVER['VIEW_COMPILED_PATH'] = '/tmp/views';
$_SERVER['LOG_CHANNEL'] = 'stderr';
$_SERVER['SESSION_DRIVER'] = 'cookie';
$_SERVER['CACHE_STORE'] = 'array';

try {
    require __DIR__ . '/../public/index.php';
} catch (\Throwable $e) {
    http_response_code(500);
    echo '<h1>Server Error</h1>';
    echo '<pre>' . $e->getMessage() . "\n" . $e->getFile() . ':' . $e->getLine() . '</pre>';
    echo '<pre>' . $e->getTraceAsString() . '</pre>';
}
