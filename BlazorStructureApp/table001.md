ID	Level	Name	IsBold	Parent

0010	1	.gitattributes	0	
0020	1	.gitignore	0	
0030	1	.editorconfig (Solution Files)	0	
0040	1	Directory.Packages.props (Solution Files)	0	
0050	1	nuget.config	0	
0060	1	Gilgalad.sln	0	
0070	1	Gilgalad.slnLaunch.user	0	
0080	1	src	0	
0090	2	AiclaRM.Server (Backend project folder)	1	0080
0100	3	AiclaRM.Server.csproj	0	0090
0110	3	Properties	0	0090
0120	4	launchSettings.json	0	0110
0130	3	Extensions	0	0090
0140	4	CatalogApiExtensions.cs	0	0130
0150	4	TourneyApiExtensions.cs	0	0130
0160	3	Endpoints (optional; common with Minimal APIs)	0	0090
0170	4	CatalogEndpoints.cs	0	0160
0180	4	TourneyEndpoints.cs	0	0160
0190	3	Middleware (optional)	0	0090
0200	4	ExceptionHandlingMiddleware.cs	0	0190
0210	4	RequestLoggingMiddleware.cs	0	0190
0220	3	Contracts (optional; request/response DTOs)	0	0090
0230	4	Requests	0	0220
0240	4	Responses	0	0220
0250	3	Services	0	0090
0260	4	CRM	0	0250
0270	4	ECommerce	0	0250
0280	5	CatalogService.cs	0	0270
0290	5	ICatalogService.cs	0	0270
0300	4	Tourney	0	0250
0310	5	IPrizeService.cs	0	0300
0320	5	PrizeService.cs	0	0300
0330	3	GlobalConfig.cs	0	0090
0340	3	AiclaRM.Server.http	0	0090
0350	3	appsettings.json	0	0090
0360	3	appsettings.Development.json	0	0090
0370	3	Program.cs	0	0090
0380	2	AIRMDataManager.Library (Data Library Backend?)	1	0080
0390	3	Common	0	0380
0400	4	DataAccess	0	0390
0410	5	IDatabaseConnectionFactory.cs   // Factory interface shared by all modules	0	0400
0420	5	IDataConnection.cs              // Database-agnostic data access interface	0	0400
0430	3	DataAccess	0	0380
0440	4	MsSql	0	0430
0450	5	MsSqlDatabaseConnectionFactory.cs	0	0440
0460	5	MsSqlDataRepository.cs	0	0440
0470	4	Postgres	0	0430
0480	5	PostgresDatabaseConnectionFactory.cs	0	0470
0490	5	PostgresDataRepository.cs	0	0470
0500	4	OLDDatabaseConnectionFactory.cs	0	0430
0510	3	Models	1	0380
0520	4	JirmModelV01.cs	0	0510
0530	3	Modules	1	0380
0540	4	CRM	1	0530
0550	5	Suggestion	0	0540
0560	6	DataAccess	0	0550
0570	7	MsSqlSuggestionRepository.cs    // SQL Server Suggestion operations	0	0560
0580	7	PostgresSuggestionRepository.cs // PostgreSQL Suggestion operations	0	0560
0590	7	ISuggestionRepository.cs        // Suggestion repository interface	0	0560
0600	6	Models	0	0550
0610	7	SuggestionModel.cs	0	0600
0620	6	Services	0	0550
0630	7	SuggestionService.cs	0	0620
0640	4	ECommerce	1	0530
0650	5	Brand	0	0640
0660	5	Catalog	0	0640
0670	6	DataAccess	0	0660
0680	7	MsSqlCatalogRepository.cs    // SQL Server Catalog operations	0	0670
0690	7	PostgresCatalogRepository.cs // PostgreSQL Catalog operations	0	0670
0700	7	ICatalogRepository.cs       // Catalog repository interface	0	0670
0710	6	Models	0	0660
0720	7	CatalogProductModel.cs	0	0710
0730	6	Services	0	0660
0740	7	CatalogService.cs	0	0730
0750	5	Customer	0	0640
0760	5	Ordering	0	0640
0770	5	Payment	0	0640
0780	5	Product	0	0640
0790	5	ProductType	0	0640
0800	6	DataAccess	0	0790
0810	7	MsSqlProductTypeRepository.cs    // SQL Server ProductType operations	0	0800
0820	7	PostgresProductTypeRepository.cs // PostgreSQL ProductType operations	0	0800
0830	7	IProductTypeRepository.cs        // ProductType repository interface	0	0800
0840	6	Models	0	0790
0850	7	ProductTypeModel.cs	0	0840
0860	6	Services	0	0790
0870	7	ProductTypeService.cs	0	0860
0880	4	Menu	1	0530
0890	5	DataAccess	0	0880
0900	6	MsSqlMenuRepository.cs    // SQL Server implementation	0	0890
0910	6	PostgresMenuRepository.cs // PostgreSQL implementation	0	0890
0920	6	IMenuRepository.cs        // Interface for Menu data operations	0	0890
0930	5	Models	0	0880
0940	6	MenuModel.cs	0	0930
0950	5	Services	0	0880
0960	6	MenuService.cs	0	0950
0970	4	Tourney	1	0530
0980	5	Others	0	0970
0990	6	MatchupEntryModel.cs	0	0980
1000	6	MatchupModel.cs	0	0980
1010	6	PersonModel.cs	0	0980
1020	6	TeamModel.cs	0	0980
1030	6	TournamentModel.cs	0	0980
1040	5	Prize	0	0970
1050	6	DataAccess	0	1040
1060	7	MsSqlPrizeRepository.cs    // SQL Server Prize operations	0	1050
1070	7	PostgresPrizeRepository.cs // PostgreSQL Prize operations	0	1050
1080	7	IPrizeRepository.cs        // Prize repository interface	0	1050
1090	6	Models	0	1040
1100	7	PrizeModel.cs	0	1090
1110	6	Services	0	1040
1120	7	PrizeService.cs	0	1110
1130	3	SystemCoreDataAccess	1	0380
1140	4	ISqlDataAccess.cs	0	1130
1150	4	SqlDataAccess.cs	0	1130
1160	3	TourneyDataAccess	1	0380
1170	4	(OLD)iDataConnection.cs	0	1160
1180	4	OLDSqlConnector.cs	0	1160
1190	4	OLDTextConnector.cs	0	1160
1200	4	OLDTextConnectorProcessor.cs	0	1160
1210	3	DatabaseTypeEnum.cs	0	0380
1220	3	EmailLogic.cs	0	0380
1230	3	TournamentLogic.cs	0	0380
1240	2	combust.client (Frontend project folder)	1	0080
1250	3	dist	1	1240
1260	3	app	1	1240
1270	4	assets	1	1260
1280	5	react.svg	0	1270
1290	4	pages	1	1260
1300	5	DashboardPagesLayout.tsx	0	1290
1310	5	WeatherForecastPages.tsx	0	1290
1320	4	main.tsx	0	1260
1330	4	vite-env.d.ts	0	1260
1340	3	public	0	1240
1350	4	vite.svg	0	1340
1360	3	.gitignore	0	1240
1370	3	eslint.config.js	0	1240
1380	3	index.html	0	1240
1390	3	package.json	0	1240
1400	3	README.md	0	1240
1410	3	tsconfig.json (if applicable)	0	1240
1420	3	tsconfig.app.json	0	1240
1430	3	vite.config.ts or webpack.config.js (if applicable)	0	1240
1440	3	node_modules (not committed to version control)	0	1240
1450	1	(add more folders here as needed)	0	