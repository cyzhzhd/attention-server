module.exports = {
  apps: [{
    name: "backend-183",
    script: "./bin/www",
    instances: 0,
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}