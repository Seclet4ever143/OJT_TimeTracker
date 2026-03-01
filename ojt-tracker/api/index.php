<?php

// Serverless entry point for Vercel

// Ensure /tmp directories exist for serverless (read-only filesystem)
foreach (['/tmp/views', '/tmp/cache', '/tmp/cache/data', '/tmp/sessions'] as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
}

// Override env for serverless
$_ENV['VIEW_COMPILED_PATH'] = '/tmp/views';
$_ENV['LOG_CHANNEL'] = 'stderr';
$_ENV['SESSION_DRIVER'] = 'cookie';
$_ENV['CACHE_STORE'] = 'array';

// Boot Laravel from the public entry point
require __DIR__ . '/../public/index.php';
