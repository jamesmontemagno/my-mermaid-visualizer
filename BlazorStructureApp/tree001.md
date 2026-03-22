Current Status
├── .gitattributes
├── .gitignore
├── .editorconfig (Solution Files)
├── Directory.Packages.props (Solution Files)
├── nuget.config
├── Gilgalad.sln
├── Gilgalad.slnLaunch.user
├── src
│   ├── **AiclaRM.Server (Backend project folder)**
│   │   ├── AiclaRM.Server.csproj
│   │   ├── Properties
│   │   │   └── launchSettings.json
│   │   ├── Extensions
│   │   │   ├── CatalogApiExtensions.cs
│   │   │   └── TourneyApiExtensions.cs
│   │   ├── Endpoints (optional; common with Minimal APIs)
│   │   │   ├── CatalogEndpoints.cs
│   │   │   └── TourneyEndpoints.cs
│   │   ├── Middleware (optional)
│   │   │   ├── ExceptionHandlingMiddleware.cs
│   │   │   └── RequestLoggingMiddleware.cs
│   │   ├── Contracts (optional; request/response DTOs)
│   │   │   ├── Requests
│   │   │   └── Responses
│   │   ├── Services
│   │   │   ├── CRM
│   │   │   ├── ECommerce
│   │   │   │   ├── CatalogService.cs
│   │   │   │   └── ICatalogService.cs
│   │   │   ├── Tourney
│   │   │   │   ├── IPrizeService.cs
│   │   │   │   └── PrizeService.cs
│   │   ├── GlobalConfig.cs
│   │   ├── AiclaRM.Server.http
│   │   ├── appsettings.json
│   │   ├── appsettings.Development.json
│   │   └── Program.cs
│   ├── **AIRMDataManager.Library (Data Library Backend?)**
│   │   ├── Common
│   │   │   ├── DataAccess
│   │   │   │   ├── IDatabaseConnectionFactory.cs   // Factory interface shared by all modules
│   │   │   │   └── IDataConnection.cs              // Database-agnostic data access interface
│   │   ├── DataAccess
│   │   │   ├── MsSql
│   │   │   │   ├── MsSqlDatabaseConnectionFactory.cs
│   │   │   │   └── MsSqlDataRepository.cs
│   │   │   ├── Postgres
│   │   │   │   ├── PostgresDatabaseConnectionFactory.cs
│   │   │   │   └── PostgresDataRepository.cs
│   │   │   ├── OLDDatabaseConnectionFactory.cs
│   │   ├── **Models**
│   │   │   ├── JirmModelV01.cs
│   │   ├── **Modules**
│   │   │   ├── **CRM**
│   │   │   │   ├── Suggestion
│   │   │   │   │   ├── DataAccess
│   │   │   │   │   │   ├── MsSqlSuggestionRepository.cs    // SQL Server Suggestion operations
│   │   │   │   │   │   ├── PostgresSuggestionRepository.cs // PostgreSQL Suggestion operations
│   │   │   │   │   │   └── ISuggestionRepository.cs        // Suggestion repository interface
│   │   │   │   │   ├── Models
│   │   │   │   │   │   └── SuggestionModel.cs
│   │   │   │   │   └── Services
│   │   │   │   │       └── SuggestionService.cs
│   │   │   ├── **ECommerce**
│   │   │   │   ├── Brand
│   │   │   │   ├── Catalog
│   │   │   │   │   ├── DataAccess
│   │   │   │   │   │   ├── MsSqlCatalogRepository.cs    // SQL Server Catalog operations
│   │   │   │   │   │   ├── PostgresCatalogRepository.cs // PostgreSQL Catalog operations
│   │   │   │   │   │   └── ICatalogRepository.cs       // Catalog repository interface
│   │   │   │   │   ├── Models
│   │   │   │   │   │   └── CatalogProductModel.cs
│   │   │   │   │   └── Services
│   │   │   │   │       └── CatalogService.cs
│   │   │   │   ├── Customer
│   │   │   │   ├── Ordering
│   │   │   │   ├── Payment
│   │   │   │   ├── Product
│   │   │   │   └── ProductType
│   │   │   │       ├── DataAccess
│   │   │   │       │   ├── MsSqlProductTypeRepository.cs    // SQL Server ProductType operations
│   │   │   │       │   ├── PostgresProductTypeRepository.cs // PostgreSQL ProductType operations
│   │   │   │       │   └── IProductTypeRepository.cs        // ProductType repository interface
│   │   │   │       ├── Models
│   │   │   │       │   └── ProductTypeModel.cs
│   │   │   │       └── Services
│   │   │   │           └── ProductTypeService.cs
│   │   │   ├── **Menu**
│   │   │   │   ├── DataAccess
│   │   │   │   │   ├── MsSqlMenuRepository.cs    // SQL Server implementation
│   │   │   │   │   ├── PostgresMenuRepository.cs // PostgreSQL implementation
│   │   │   │   │   └── IMenuRepository.cs        // Interface for Menu data operations
│   │   │   │   ├── Models
│   │   │   │   │   └── MenuModel.cs
│   │   │   │   └── Services
│   │   │   │       └── MenuService.cs
│   │   │   └── **Tourney**
│   │   │       ├── Others
│   │   │       │   ├── MatchupEntryModel.cs
│   │   │       │   ├── MatchupModel.cs
│   │   │       │   ├── PersonModel.cs
│   │   │       │   ├── TeamModel.cs
│   │   │       │   └── TournamentModel.cs
│   │   │       └── Prize
│   │   │           ├── DataAccess
│   │   │           │   ├── MsSqlPrizeRepository.cs    // SQL Server Prize operations
│   │   │           │   ├── PostgresPrizeRepository.cs // PostgreSQL Prize operations
│   │   │           │   └── IPrizeRepository.cs        // Prize repository interface
│   │   │           ├── Models
│   │   │           │   └── PrizeModel.cs
│   │   │           └── Services
│   │   │               └── PrizeService.cs
│   │   ├── **SystemCoreDataAccess**
│   │   │   ├── ISqlDataAccess.cs
│   │   │   └── SqlDataAccess.cs
│   │   ├── **TourneyDataAccess**
│   │   │   ├── (OLD)iDataConnection.cs
│   │   │   ├── OLDSqlConnector.cs
│   │   │   ├── OLDTextConnector.cs
│   │   │   └── OLDTextConnectorProcessor.cs
│   │   ├── DatabaseTypeEnum.cs
│   │   ├── EmailLogic.cs
│   │   └── TournamentLogic.cs
│   └── **combust.client** (Frontend project folder)
│       ├── **dist**
│       ├── **app**
│       │   ├── **assets**
│       │   │   └── react.svg
│       │   ├── **pages**
│       │   │   ├── DashboardPagesLayout.tsx
│       │   │   └── WeatherForecastPages.tsx
│       │   ├── main.tsx
│       │   └── vite-env.d.ts
│       ├── public
│       │   └── vite.svg
│       ├── .gitignore
│       ├── eslint.config.js
│       ├── index.html
│       ├── package.json
│       ├── README.md
│       ├── tsconfig.json (if applicable)
│       ├── tsconfig.app.json
│       ├── vite.config.ts or webpack.config.js (if applicable)
│       └── node\_modules (not committed to version control)
└── (add more folders here as needed)
