# Logiva

Dashboard de monitoramento de entregas com Angular + Spring Boot + MySQL.

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | Angular 22, Angular Material, Chart.js |
| Backend | Spring Boot 3.3, JWT, Lombok, Swagger |
| Banco | MySQL 8, Flyway |
| Infra | Docker Compose |

## Início rápido (Docker)

```bash
# Na raiz do projeto
cp .env.example .env
docker compose up --build
```

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:8080/api/v1 |
| Swagger | http://localhost:8080/swagger-ui.html |
| MySQL | localhost:3307 (porta externa; dentro do Docker continua 3306) |

## Credenciais demo

| Perfil | E-mail | Senha | Permissões |
|--------|--------|-------|------------|
| Admin | admin@logistics.com | admin123 | Dashboard, listagem, usuários |
| Operador | operator@logistics.com | operator123 | Dashboard, listagem, **criar entregas**, atualizar status |

## Desenvolvimento local

### Backend (requer Maven ou Docker)

```bash
cd backend
# Com Docker para build:
docker build -t logistics-backend .
```

### Frontend

```bash
cd frontend
npm install
npm start
# Acesse http://localhost:4200 (proxy para API em :8080)
```

## Endpoints principais

- `POST /api/v1/auth/login` — autenticação
- `GET /api/v1/deliveries` — listagem com filtros
- `GET /api/v1/analytics/overview` — KPIs do dashboard
- Documentação completa: Swagger UI

## Estrutura

```
├── backend/          # Spring Boot API
├── frontend/         # Angular SPA
├── docker-compose.yml
└── .env.example
```

## Roadmap (próximas fases)

- Notificações em tempo real (WebSocket)
- Export CSV/PDF
- Mapa de rotas
- Gestão de frota
