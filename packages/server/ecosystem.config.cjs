module.exports = {
  apps: [
    {
      name: 'party-games-server',
      script: 'dist/server.cjs',
      instances: 1,
      exec_mode: 'fork',
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
      },
      max_memory_restart: '512M',
      restart_delay: 1000,
      error_file: '/var/log/party-games/err.log',
      out_file: '/var/log/party-games/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
}
