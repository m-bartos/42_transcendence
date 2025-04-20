# Setup Rules for RabbitMQ

## 1. Usernames & Permissions

- Each service has its own username and permissions.
- User creation, removal, and permission changes are managed via the `definitions.json` file.

## 2. Hostname Convention

- The hostname for each RabbitMQ service is conventionally set to the container name:
  ```
  rabbitmq_service
  ```

## 3. Connection Definitions

- **Every** publisher or consumer **must** define a complete setup/connection configuration in their code.
- Credentials should **not** be hardcoded; they should come from environment variables.

---

## 4. Example: `dashboard_consumer_service`

### 4.1 AMQP Connection Config
```javascript
export const amqpConnectionConfig = {
  username: process.env.RABBITMQ_USERNAME || 'dashboard_service',
  password: process.env.RABBITMQ_PASSWORD || 'dashpass',
  hostname: process.env.RABBITMQ_HOSTNAME || 'rabbitmq_service',
  port:     process.env.RABBITMQ_PORT     || '5672',
  connectionName: 'dashboard-consumer-service-connection',
  retryLow:  1000,
  retryHigh: 5000
};
```

### 4.2 AMQP Consumer Config
```javascript
export const amqpConsumerConfig = {
    queue: 'game-service-queue',
    exchange: 'gameEvents',
    queueBindings: [
        { exchange: 'gameEvents', queue: 'game-service-queue', routingKey: 'game.end.multi' },
        { exchange: 'gameEvents', queue: 'game-service-queue', routingKey: 'game.end.split' },
        { exchange: 'gameEvents', queue: 'game-service-queue', routingKey: 'game.end.tournament' }
    ],
    exchanges: [{exchange: 'gameEvents', type: 'direct', durable: true }]
}
```

> **Note:** Environment variables will be used in the future to avoid any hardcoded credentials.

---

## 5. Exchanges & Routing Keys

### 5.1 Game-Related Events

- **Exchange name:** `gameEvents`
- **Routing key format:** `game.<action>.<mode>`

| Action | Mode       | Example Key             |
| ------ | ---------- |-------------------------|
| end    | multi      | `game.end.multi`        |
| end    | single     | `game.end.split`        |
| end    | tournament | `game.end.tournament`   |
| start  | multi      | `game.start.multi`      |
| start  | single     | `game.start.single`     |
| start  | tournament | `game.start.tournament` |

_Add additional routing keys as your domain requires._

### 5.2 Authentication-Related Events

- **Exchange name:** `authEvents`
- **Routing key format:** `auth.user.<action>`

| Domain    | Action     | Example Key             |
| --------- | ---------- | ----------------------- |
| auth.user | logout     | `auth.user.logout`      |
| auth.user | del        | `auth.user.del`         |
| auth.user | logoutall  | `auth.user.logoutall`   |


### 5.3 Some other service -Related Events

-- **More to come...**
