# 42_transcendence

## Basic folder structure V1.1
- fastify service structure is according to chapter 6 and 7 of [Accelerating server side development with Fastify](https://github.com/PacktPublishing/Accelerating-Server-Side-Development-with-Fastify/tree/main)
- another [reddit source](https://www.reddit.com/r/node/comments/139qzwf/comment/jj760v0/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button) for Fastify structure inspiration

```
42_transcendence/
├── services/                                  # Backend microservices
│   ├── game-service/ 
│   │   ├── configs/        
│   │   ├── plugins/   
│   │   ├── routes/
│   │   |   └── game/
│   │   |       ├── schemas/
│   │   |       |   ├── create-body.json
│   │   |       |   └── create-response.json
│   │   |       └── routes.ts                 # routes definitions with handlers
|   │   ├── schemas/        
|   │   ├── test/        
|   │   ├── services/      
│   │   ├── types/                            # Service-specific types
│   │   ├── app.ts         
│   │   ├── tsconfig.json                     # Service-specific TS config
│   │   ├── package.json                      # Service-specific dependencies
│   │   ├── Dockerfile
│   │   └── .gitignore                        # Auth-specific .gitignore
│   │
│   ├── auth-service/                         # Authentication service       
│   ├── [other-services]/                     # Same structure for other services
│   └── docker-compose.yml                    # For local development. Will build and run all services.
│
├── client/                                   # Frontend application - Draft, I do not have insight to validate the structure.
│   ├── src/                                  # Draft - the folders in src may differ!!
│   │   ├── api/                              # API client code (generated from contracts)
│   │   │   ├── auth/
│   │   │   ├── game/
│   │   │   └── chat/
│   │   ├── assets/           
│   │   ├── components/       
│   │   ├── contexts/        
│   │   ├── hooks/           
│   │   ├── layouts/         
│   │   ├── pages/           
│   │   ├── services/         
│   │   ├── stores/          
│   │   ├── styles/          
│   │   ├── types/                           # Frontend-specific types
│   │   ├── utils/           
│   │   ├── constants.ts     
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── infrastructure/                      # Frontend-specific infrastructure
│   ├── tsconfig.json                        # Frontend-specific TS config
│   ├── package.json                         # Frontend-specific dependencies
│   └── .gitignore                           # .gitignore for Frontend application
│
├── README.md               
└── .gitignore                               # .gitignore for whole project
```
