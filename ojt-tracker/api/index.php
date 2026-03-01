<?php

// Serverless entry point for Vercel

// Ensure /tmp directories exist for serverless (read-only filesystem)
$tmpDirs = [
    '/tmp/views',
    '/tmp/cache',
    '/tmp/cache/data',
    '/tmp/sessions',
    '/tmp/logs',
    '/tmp/bootstrap-cache',
];
foreach ($tmpDirs as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
}

// Also ensure storage framework dirs exist (may be needed by Laravel bootstrap)
$storageDirs = [
    __DIR__ . '/../storage/framework/views',
    __DIR__ . '/../storage/framework/cache',
    __DIR__ . '/../storage/framework/sessions',
    __DIR__ . '/../storage/logs',
];
foreach ($storageDirs as $dir) {
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
}

// Copy bootstrap cache files to writable /tmp so Laravel can recompile if needed
$bootstrapCache = __DIR__ . '/../bootstrap/cache';
foreach (['services.php', 'packages.php'] as $cacheFile) {
    $src = $bootstrapCache . '/' . $cacheFile;
    $dst = '/tmp/bootstrap-cache/' . $cacheFile;
    if (file_exists($src) && !file_exists($dst)) {
        copy($src, $dst);
    }
}

// Set all env overrides for serverless
$envOverrides = [
    'VIEW_COMPILED_PATH' => '/tmp/views',
    'LOG_CHANNEL' => 'stderr',
    'SESSION_DRIVER' => 'cookie',
    'CACHE_STORE' => 'array',
    'APP_SERVICES_CACHE' => '/tmp/bootstrap-cache/services.php',
    'APP_PACKAGES_CACHE' => '/tmp/bootstrap-cache/packages.php',
    'APP_CONFIG_CACHE' => '/tmp/bootstrap-cache/config.php',
    'APP_ROUTES_CACHE' => '/tmp/bootstrap-cache/routes-v7.php',
    'APP_EVENTS_CACHE' => '/tmp/bootstrap-cache/events.php',
];

foreach ($envOverrides as $key => $value) {
    putenv("$key=$value");
    $_ENV[$key] = $value;
    $_SERVER[$key] = $value;
}

try {
    require __DIR__ . '/../public/index.php';
} catch (\Throwable $e) {
    http_response_code(500);
    echo '<h1>Server Error</h1>';
    echo '<pre>' . $e->getMessage() . "\n" . $e->getFile() . ':' . $e->getLine() . '</pre>';
    echo '<pre>' . $e->getTraceAsString() . '</pre>';
}
