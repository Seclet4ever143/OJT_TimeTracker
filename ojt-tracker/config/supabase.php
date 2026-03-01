<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Supabase Project URL
    |--------------------------------------------------------------------------
    |
    | The base URL for your Supabase project. Found in your Supabase dashboard
    | under Settings → API.
    |
    */
    'url' => env('SUPABASE_URL'),

    /*
    |--------------------------------------------------------------------------
    | Supabase Anon (Public) Key
    |--------------------------------------------------------------------------
    |
    | The anonymous/public key for client-side operations. This key is safe
    | to expose in the browser — Row Level Security policies protect data.
    |
    */
    'anon_key' => env('SUPABASE_ANON_KEY'),

    /*
    |--------------------------------------------------------------------------
    | Supabase Service Role Key
    |--------------------------------------------------------------------------
    |
    | The service role key bypasses Row Level Security. NEVER expose this key
    | on the client side. Use it only in Laravel backend code.
    |
    */
    'service_role_key' => env('SUPABASE_SERVICE_ROLE_KEY'),

];
