# 42_transcendence

## Basic folder structure V1
```
42_transcendence/
├── services/                    # Backend microservices
│   ├── auth-service/           # Authentication service
│   │   ├── src/
│   │   │   ├── config/        
│   │   │   ├── controllers/   
│   │   │   ├── middlewares/   
│   │   │   ├── models/        
│   │   │   ├── routes/        
│   │   │   ├── services/      
│   │   │   ├── types/         # Service-specific types
│   │   │   ├── utils/         
│   │   │   └── app.ts         
│   │   ├── tests/
│   │   ├── docs/              # Service-specific documentation
│   │   │   ├── api/          # API documentation
│   │   │   └── setup.md
│   │   ├── infrastructure/    # Service-specific infrastructure
│   │   │   ├── kubernetes/
│   │   │   └── terraform/
│   │   ├── .github/          # Service-specific CI/CD
│   │   │   └── workflows/
│   │   ├── contracts/        # API contracts (OpenAPI/Swagger)
│   │   │   └── v1/
│   │   │       └── auth.yaml
│   │   ├── tsconfig.json     # Service-specific TS config
│   │   ├── .eslintrc.js      # Service-specific ESLint
│   │   ├── Dockerfile
│   │   ├── docker-compose.yml # For local development only
│   │   └── package.json      # Service-specific dependencies
│   │
│   ├── game-service/         
│   │   ├── src/
│   │   │   ├── config/        
│   │   │   ├── controllers/   
│   │   │   ├── middlewares/   
│   │   │   ├── models/        
│   │   │   ├── routes/        
│   │   │   ├── services/      
│   │   │   ├── types/         # Game-specific types
│   │   │   ├── utils/         
│   │   │   └── app.ts         
│   │   ├── tests/
│   │   ├── docs/
│   │   ├── infrastructure/
│   │   ├── .github/
│   │   ├── contracts/
│   │   │   └── v1/
│   │   │       └── game.yaml
│   │   ├── tsconfig.json     # Game-specific TS config
│   │   ├── .eslintrc.js      # Game-specific ESLint
│   │   ├── Dockerfile
│   │   ├── docker-compose.yml
│   │   └── package.json
│   │
│   └── [other-services]/     # Same structure for other services
│
├── client/                    # Frontend application
│   ├── src/
│   │   ├── api/              # API client code (generated from contracts)
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
│   │   ├── types/           # Frontend-specific types
│   │   ├── utils/           
│   │   ├── constants.ts     
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── infrastructure/       # Frontend-specific infrastructure
│   ├── .github/             # Frontend-specific CI/CD
│   ├── tsconfig.json        # Frontend-specific TS config
│   ├── .eslintrc.js         # Frontend-specific ESLint
│   └── package.json         # Frontend-specific dependencies
│
├── tools/                    # Development tools and scripts
│   ├── proto/               # Protobuf definitions if used
│   ├── api-docs/            # API documentation generator
│   └── scripts/             # Utility scripts for local development
│
├── .github/                 # Only for repository-level workflows
│   └── workflows/
│       └── pr-checks.yml    # Basic PR checks, no deployment
│
├── docker-compose.yml       # Optional: only for local development
├── README.md               
└── .gitignore
```
