module.exports = {
  apps: [
    {
      name: "clinic-voice-demo",
      script: "./server.js",
      cwd: "/var/www/clinic-voice-demo/current",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 8080
      }
    }
  ]
};
