// PM2 process definition for the Next.js frontend (web-next), running the
// standalone server. Lives on the droplet alongside the unpacked bundle.
//
// Deploy dir (cwd) holds the extracted standalone bundle, i.e. it contains
// server.js, .next/, node_modules/, public/.
//
// Start:   pm2 start /var/www/unitedhotels-next/ecosystem.config.cjs
//          (filename MUST contain ".config." or PM2 runs it as a plain script)
// Reload:  pm2 reload frontend
//
// The BFF reaches the other PM2 apps over loopback:
//   BACKEND_URL  -> Express `backend`        (PM2, :5000)
//   PRICING_URL  -> `pricing-engine`         (PM2, :5050)
module.exports = {
  apps: [
    {
      name: 'frontend',
      cwd: '/var/www/unitedhotels-next',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      // Safety net on the 512MB box — restart if the process balloons.
      // Requires a swapfile (see DEPLOY_NEXT.md) so this headroom is usable.
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
        // Bind to loopback only; nginx is the public edge.
        HOSTNAME: '127.0.0.1',
        BACKEND_URL: 'http://127.0.0.1:5000',
        PRICING_URL: 'http://127.0.0.1:5050',
      },
    },
  ],
};
