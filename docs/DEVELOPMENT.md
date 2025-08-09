# 🛠️ Development Guide

Comprehensive development guide for contributing to the Cooling Manager IoT application.

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **PostgreSQL 12+** (or Docker)
- **Git** for version control
- **VS Code** (recommended IDE)
- **Docker & Docker Compose** (optional)

### Development Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/minh3016/IoT_Manage_111_Web.git
   cd IoT_Manage_111_Web
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   cd backend
   npm install

   # Frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment configuration**
   ```bash
   # Root environment
   cp .env.example .env

   # Backend environment
   cd backend
   cp .env.example .env

   # Frontend environment
   cd ../frontend
   cp .env.example .env
   ```

4. **Database setup**
   ```bash
   cd backend
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. **Start development servers**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev

   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

## 📁 Project Structure

### Repository Organization

```
IoT_Manage_111_Web/
├── frontend/                 # React.js frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   └── hooks/          # Custom hooks
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Business logic
│   │   ├── config/         # Configuration
│   │   └── types/          # TypeScript types
│   ├── prisma/             # Database schema
│   └── package.json        # Backend dependencies
├── docs/                   # Documentation
├── docker-compose.yml      # Development Docker setup
└── README.md              # Project overview
```

## 🔧 Development Workflow

### Git Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

3. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create Pull Request on GitHub
   ```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

Examples:
```bash
feat: add device management dashboard
fix: resolve authentication token refresh issue
docs: update API documentation
style: format code with prettier
refactor: optimize database queries
test: add unit tests for user service
chore: update dependencies
```

## 🎨 Frontend Development

### Component Development

1. **Create component structure**
   ```bash
   mkdir src/components/YourComponent
   touch src/components/YourComponent/index.tsx
   touch src/components/YourComponent/YourComponent.tsx
   touch src/components/YourComponent/YourComponent.test.tsx
   ```

2. **Component template**
   ```typescript
   // YourComponent.tsx
   import React from 'react';
   import { Box, Typography } from '@mui/material';

   interface YourComponentProps {
     title: string;
     children?: React.ReactNode;
   }

   export const YourComponent: React.FC<YourComponentProps> = ({
     title,
     children
   }) => {
     return (
       <Box>
         <Typography variant="h6">{title}</Typography>
         {children}
       </Box>
     );
   };
   ```

3. **Export from index**
   ```typescript
   // index.tsx
   export { YourComponent } from './YourComponent';
   ```

### State Management

1. **Create Redux slice**
   ```typescript
   // store/slices/yourSlice.ts
   import { createSlice, PayloadAction } from '@reduxjs/toolkit';

   interface YourState {
     data: any[];
     loading: boolean;
     error: string | null;
   }

   const initialState: YourState = {
     data: [],
     loading: false,
     error: null,
   };

   const yourSlice = createSlice({
     name: 'your',
     initialState,
     reducers: {
       setLoading: (state, action: PayloadAction<boolean>) => {
         state.loading = action.payload;
       },
       setData: (state, action: PayloadAction<any[]>) => {
         state.data = action.payload;
       },
       setError: (state, action: PayloadAction<string | null>) => {
         state.error = action.payload;
       },
     },
   });

   export const { setLoading, setData, setError } = yourSlice.actions;
   export default yourSlice.reducer;
   ```

2. **Create API slice**
   ```typescript
   // store/api/yourApi.ts
   import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

   export const yourApi = createApi({
     reducerPath: 'yourApi',
     baseQuery: fetchBaseQuery({
       baseUrl: '/api/your-endpoint',
       prepareHeaders: (headers, { getState }) => {
         const token = (getState() as RootState).auth.token;
         if (token) {
           headers.set('authorization', `Bearer ${token}`);
         }
         return headers;
       },
     }),
     tagTypes: ['YourData'],
     endpoints: (builder) => ({
       getYourData: builder.query<YourData[], void>({
         query: () => '',
         providesTags: ['YourData'],
       }),
       createYourData: builder.mutation<YourData, Partial<YourData>>({
         query: (data) => ({
           url: '',
           method: 'POST',
           body: data,
         }),
         invalidatesTags: ['YourData'],
       }),
     }),
   });

   export const { useGetYourDataQuery, useCreateYourDataMutation } = yourApi;
   ```

### Testing

1. **Component testing**
   ```typescript
   // YourComponent.test.tsx
   import { render, screen } from '@testing-library/react';
   import { YourComponent } from './YourComponent';

   describe('YourComponent', () => {
     it('renders title correctly', () => {
       render(<YourComponent title="Test Title" />);
       expect(screen.getByText('Test Title')).toBeInTheDocument();
     });
   });
   ```

2. **Run tests**
   ```bash
   npm run test
   npm run test:coverage
   ```

## 🔧 Backend Development

### API Development

1. **Create controller**
   ```typescript
   // controllers/yourController.ts
   import { Request, Response } from 'express';
   import { catchAsync, createSuccessResponse } from '@/middleware/errorHandler';

   export const getYourData = catchAsync(async (req: Request, res: Response) => {
     // Your logic here
     const data = await yourService.getData();
     
     res.json(createSuccessResponse(data));
   });

   export const createYourData = catchAsync(async (req: Request, res: Response) => {
     const newData = await yourService.createData(req.body);
     
     res.status(201).json(createSuccessResponse(newData, 'Data created successfully'));
   });
   ```

2. **Create routes**
   ```typescript
   // routes/yourRoutes.ts
   import { Router } from 'express';
   import { getYourData, createYourData } from '@/controllers/yourController';
   import { authenticate, authorize } from '@/middleware/auth';
   import { yourValidation, handleValidationErrors } from '@/middleware/validation';

   const router = Router();

   router.use(authenticate); // All routes require authentication

   router.get('/', getYourData);
   router.post('/', authorize('ADMIN'), yourValidation.create, handleValidationErrors, createYourData);

   export default router;
   ```

3. **Add validation**
   ```typescript
   // middleware/validation.ts
   export const yourValidation = {
     create: [
       body('name')
         .isString()
         .trim()
         .isLength({ min: 1, max: 100 })
         .withMessage('Name must be between 1 and 100 characters'),
       
       body('email')
         .isEmail()
         .normalizeEmail()
         .withMessage('Must be a valid email address'),
     ],
   };
   ```

### Database Development

1. **Update Prisma schema**
   ```prisma
   // prisma/schema.prisma
   model YourModel {
     id        Int      @id @default(autoincrement())
     name      String
     email     String   @unique
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt

     @@map("your_table")
   }
   ```

2. **Generate migration**
   ```bash
   npx prisma migrate dev --name add_your_model
   ```

3. **Update seed data**
   ```typescript
   // scripts/seed.ts
   const yourData = [
     { name: 'Example 1', email: 'example1@test.com' },
     { name: 'Example 2', email: 'example2@test.com' },
   ];

   for (const data of yourData) {
     await prisma.yourModel.create({ data });
   }
   ```

### Testing

1. **Unit tests**
   ```typescript
   // __tests__/yourController.test.ts
   import request from 'supertest';
   import { app } from '../src/server';

   describe('Your Controller', () => {
     it('should get data successfully', async () => {
       const response = await request(app)
         .get('/api/your-endpoint')
         .set('Authorization', `Bearer ${validToken}`)
         .expect(200);

       expect(response.body.success).toBe(true);
       expect(response.body.data).toBeDefined();
     });
   });
   ```

2. **Run tests**
   ```bash
   npm run test
   npm run test:watch
   ```

## 🔍 Code Quality

### Linting and Formatting

1. **ESLint configuration**
   ```json
   // .eslintrc.json
   {
     "extends": [
       "@typescript-eslint/recommended",
       "prettier"
     ],
     "rules": {
       "@typescript-eslint/no-unused-vars": "error",
       "@typescript-eslint/explicit-function-return-type": "warn"
     }
   }
   ```

2. **Prettier configuration**
   ```json
   // .prettierrc
   {
     "semi": true,
     "trailingComma": "es5",
     "singleQuote": true,
     "printWidth": 100,
     "tabWidth": 2
   }
   ```

3. **Run linting**
   ```bash
   npm run lint
   npm run lint:fix
   npm run format
   ```

### Type Safety

1. **Strict TypeScript configuration**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true,
       "noImplicitReturns": true,
       "noFallthroughCasesInSwitch": true
     }
   }
   ```

2. **Type definitions**
   ```typescript
   // types/index.ts
   export interface YourType {
     id: number;
     name: string;
     email: string;
     createdAt: string;
     updatedAt: string;
   }

   export type CreateYourType = Omit<YourType, 'id' | 'createdAt' | 'updatedAt'>;
   export type UpdateYourType = Partial<CreateYourType>;
   ```

## 🐛 Debugging

### Frontend Debugging

1. **React DevTools**
   - Install React DevTools browser extension
   - Use Redux DevTools for state debugging

2. **Console debugging**
   ```typescript
   console.log('Debug info:', data);
   console.error('Error occurred:', error);
   ```

3. **VS Code debugging**
   ```json
   // .vscode/launch.json
   {
     "type": "node",
     "request": "launch",
     "name": "Debug Frontend",
     "program": "${workspaceFolder}/frontend/node_modules/.bin/vite",
     "args": ["dev"],
     "console": "integratedTerminal"
   }
   ```

### Backend Debugging

1. **VS Code debugging**
   ```json
   // .vscode/launch.json
   {
     "type": "node",
     "request": "launch",
     "name": "Debug Backend",
     "program": "${workspaceFolder}/backend/src/server.ts",
     "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"],
     "runtimeArgs": ["-r", "ts-node/register"]
   }
   ```

2. **Database debugging**
   ```bash
   # Enable Prisma query logging
   DEBUG=prisma:query npm run dev
   ```

## 📚 Best Practices

### Code Organization

1. **File naming conventions**
   - Components: `PascalCase.tsx`
   - Utilities: `camelCase.ts`
   - Constants: `UPPER_SNAKE_CASE.ts`

2. **Import organization**
   ```typescript
   // External libraries
   import React from 'react';
   import { Box } from '@mui/material';

   // Internal imports
   import { YourComponent } from '@/components';
   import { useYourHook } from '@/hooks';
   import { YourType } from '@/types';
   ```

### Performance

1. **React optimization**
   - Use `React.memo` for expensive components
   - Implement `useMemo` and `useCallback` appropriately
   - Lazy load components with `React.lazy`

2. **Bundle optimization**
   - Analyze bundle size with `npm run build:analyze`
   - Implement code splitting
   - Optimize images and assets

### Security

1. **Input validation**
   - Always validate user input
   - Sanitize data before database operations
   - Use parameterized queries

2. **Authentication**
   - Never store sensitive data in localStorage
   - Implement proper token refresh
   - Use HTTPS in production

## 🚀 Deployment

### Development Deployment

```bash
# Build applications
npm run build:frontend
npm run build:backend

# Start with PM2
pm2 start ecosystem.config.js
```

### Production Deployment

```bash
# Docker deployment
docker-compose -f docker-compose.prod.yml up -d

# Manual deployment
npm run deploy:prod
```

---

**Complete development guide for contributing to the Cooling Manager project** 🛠️
