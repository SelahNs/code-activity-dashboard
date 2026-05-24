const KNOWN_STACK = new Set([
    // JavaScript / TypeScript
    'react', 'next', 'nextjs', 'vue', 'nuxt', 'angular', 'svelte', 'sveltekit',
    'express', 'fastify', 'koa', 'hapi', 'nestjs', 'remix', 'astro', 'gatsby',
    'electron', 'tauri', 'expo', 'react-native',
    'vite', 'webpack', 'turbopack', 'rollup', 'parcel', 'esbuild',
    'prisma', 'mongoose', 'sequelize', 'typeorm', 'drizzle', 'knex',
    'graphql', 'trpc', 'socket.io', 'apollo',
    'jest', 'vitest', 'playwright', 'cypress', 'mocha', 'chai',
    'tailwindcss', 'chakra-ui', 'shadcn', 'bootstrap', 'bulma', 'antd', 'mui',
    'redux', 'zustand', 'mobx', 'recoil', 'jotai',
    'axios', 'swr', 'react-query', 'tanstack',
    'storybook', 'nx', 'turborepo',

    // Python
    'django', 'flask', 'fastapi', 'tornado', 'aiohttp', 'starlette', 'litestar',
    'sqlalchemy', 'celery', 'pytest', 'pydantic', 'alembic',
    'numpy', 'pandas', 'tensorflow', 'pytorch', 'scikit-learn', 'keras',
    'scrapy', 'httpx', 'requests',
    'airflow', 'prefect', 'dagster',
    'langchain', 'llamaindex',

    // Ruby
    'rails', 'sinatra', 'hanami', 'rspec', 'sidekiq',

    // PHP
    'laravel', 'symfony', 'codeigniter', 'slim', 'lumen', 'yii', 'cake',

    // Rust
    'actix', 'axum', 'rocket', 'tokio', 'warp', 'serde', 'diesel', 'sea-orm',

    // Go
    'gin', 'echo', 'fiber', 'chi', 'gorilla', 'beego', 'gorm', 'cobra',

    // Dart / Flutter
    'flutter', 'dart',

    // Java / Kotlin
    'spring', 'springboot', 'quarkus', 'micronaut', 'ktor', 'hibernate',
    'junit', 'gradle', 'maven',

    // C# / .NET
    'dotnet', 'aspnet', 'blazor', 'unity', 'xamarin', 'maui', 'efcore',

    // Swift
    'swiftui', 'uikit', 'vapor', 'hummingbird',

    // Kotlin Mobile
    'jetpack', 'compose',

    // Elixir
    'phoenix', 'ecto', 'oban',

    // Scala
    'play', 'akka', 'zio', 'cats',

    // Haskell
    'yesod', 'scotty', 'servant',

    // Clojure
    'ring', 'compojure', 'pedestal',

    // C / C++
    'qt', 'boost', 'opencv', 'cmake',

    // Database / Infra tools
    'redis', 'elasticsearch', 'supabase', 'firebase', 'mongodb',
    'postgresql', 'mysql', 'sqlite',

    // DevOps / Infra
    'docker', 'kubernetes', 'terraform', 'ansible', 'pulumi',
    'githubactions', 'jenkins', 'circleci',

    // AI / ML infra
    'huggingface', 'wandb', 'mlflow', 'ray',
]);

const DISPLAY_NAMES = {
    'react': 'React', 'next': 'Next.js', 'nextjs': 'Next.js', 'vue': 'Vue', 'nuxt': 'Nuxt',
    'angular': 'Angular', 'svelte': 'Svelte', 'sveltekit': 'SvelteKit', 'express': 'Express',
    'fastify': 'Fastify', 'koa': 'Koa', 'hapi': 'Hapi', 'nestjs': 'NestJS', 'remix': 'Remix',
    'astro': 'Astro', 'gatsby': 'Gatsby', 'electron': 'Electron', 'tauri': 'Tauri', 'expo': 'Expo',
    'react-native': 'React Native', 'vite': 'Vite', 'webpack': 'Webpack', 'turbopack': 'Turbopack',
    'rollup': 'Rollup', 'parcel': 'Parcel', 'esbuild': 'esbuild', 'prisma': 'Prisma', 'mongoose': 'Mongoose',
    'sequelize': 'Sequelize', 'typeorm': 'TypeORM', 'drizzle': 'Drizzle', 'knex': 'Knex', 'graphql': 'GraphQL',
    'trpc': 'tRPC', 'socket.io': 'Socket.io', 'apollo': 'Apollo', 'jest': 'Jest', 'vitest': 'Vitest',
    'playwright': 'Playwright', 'cypress': 'Cypress', 'mocha': 'Mocha', 'chai': 'Chai', 'tailwindcss': 'Tailwind CSS',
    'chakra-ui': 'Chakra UI', 'shadcn': 'shadcn/ui', 'bootstrap': 'Bootstrap', 'bulma': 'Bulma',
    'antd': 'Ant Design', 'mui': 'Material UI', 'redux': 'Redux', 'zustand': 'Zustand', 'mobx': 'MobX',
    'recoil': 'Recoil', 'jotai': 'Jotai', 'axios': 'Axios', 'swr': 'SWR', 'react-query': 'React Query',
    'tanstack': 'TanStack', 'storybook': 'Storybook', 'nx': 'Nx', 'turborepo': 'Turborepo',
    'django': 'Django', 'flask': 'Flask', 'fastapi': 'FastAPI', 'tornado': 'Tornado', 'aiohttp': 'aiohttp',
    'starlette': 'Starlette', 'litestar': 'Litestar', 'sqlalchemy': 'SQLAlchemy', 'celery': 'Celery',
    'pytest': 'pytest', 'pydantic': 'Pydantic', 'alembic': 'Alembic', 'numpy': 'NumPy', 'pandas': 'Pandas',
    'tensorflow': 'TensorFlow', 'pytorch': 'PyTorch', 'scikit-learn': 'scikit-learn', 'keras': 'Keras',
    'scrapy': 'Scrapy', 'httpx': 'HTTPX', 'requests': 'Requests', 'airflow': 'Airflow', 'prefect': 'Prefect',
    'dagster': 'Dagster', 'langchain': 'LangChain', 'llamaindex': 'LlamaIndex', 'rails': 'Rails',
    'sinatra': 'Sinatra', 'hanami': 'Hanami', 'rspec': 'RSpec', 'sidekiq': 'Sidekiq', 'laravel': 'Laravel',
    'symfony': 'Symfony', 'codeigniter': 'CodeIgniter', 'slim': 'Slim', 'lumen': 'Lumen', 'yii': 'Yii',
    'cake': 'CakePHP', 'actix': 'Actix', 'axum': 'Axum', 'rocket': 'Rocket', 'tokio': 'Tokio', 'warp': 'Warp',
    'serde': 'Serde', 'diesel': 'Diesel', 'sea-orm': 'SeaORM', 'gin': 'Gin', 'echo': 'Echo', 'fiber': 'Fiber',
    'chi': 'Chi', 'gorilla': 'Gorilla', 'beego': 'Beego', 'gorm': 'GORM', 'cobra': 'Cobra', 'flutter': 'Flutter',
    'dart': 'Dart', 'spring': 'Spring', 'springboot': 'Spring Boot', 'quarkus': 'Quarkus', 'micronaut': 'Micronaut',
    'ktor': 'Ktor', 'hibernate': 'Hibernate', 'junit': 'JUnit', 'gradle': 'Gradle', 'maven': 'Maven',
    'dotnet': '.NET', 'aspnet': 'ASP.NET', 'blazor': 'Blazor', 'unity': 'Unity', 'xamarin': 'Xamarin',
    'maui': 'MAUI', 'efcore': 'EF Core', 'swiftui': 'SwiftUI', 'uikit': 'UIKit', 'vapor': 'Vapor',
    'hummingbird': 'Hummingbird', 'jetpack': 'Jetpack', 'compose': 'Compose', 'phoenix': 'Phoenix',
    'ecto': 'Ecto', 'oban': 'Oban', 'play': 'Play', 'akka': 'Akka', 'zio': 'ZIO', 'cats': 'Cats',
    'yesod': 'Yesod', 'scotty': 'Scotty', 'servant': 'Servant', 'qt': 'Qt', 'boost': 'Boost',
    'opencv': 'OpenCV', 'cmake': 'CMake', 'redis': 'Redis', 'elasticsearch': 'Elasticsearch',
    'supabase': 'Supabase', 'firebase': 'Firebase', 'mongodb': 'MongoDB', 'postgresql': 'PostgreSQL',
    'mysql': 'MySQL', 'sqlite': 'SQLite', 'docker': 'Docker', 'kubernetes': 'Kubernetes',
    'terraform': 'Terraform', 'ansible': 'Ansible', 'pulumi': 'Pulumi', 'githubactions': 'GitHub Actions',
    'jenkins': 'Jenkins', 'circleci': 'CircleCI', 'huggingface': 'Hugging Face', 'wandb': 'Weights & Biases',
    'mlflow': 'MLflow', 'ray': 'Ray',
};

/**
 * Parses file paths and workspace project names to identify used frameworks
 * @param {Object} activity The raw activity record
 * @returns {String[]} List of detected framework tokens
 */
const detectFrameworks = (activity) => {
    const detected = new Set();
    if (!activity) return [];

    const searchTargets = [];
    if (activity.independentFile) searchTargets.push(activity.independentFile.toLowerCase());
    if (activity.project) searchTargets.push(activity.project.toLowerCase());

    searchTargets.forEach(target => {
        // Tokenize file path directories and delimiters into individual tags
        const normalized = target.replace(/[\/\\._\-]/g, ' ');
        const tokens = normalized.split(/\s+/);
        
        tokens.forEach(token => {
            if (KNOWN_STACK.has(token)) {
                detected.add(token);
            }
        });
    });

    return Array.from(detected);
};

module.exports = { KNOWN_STACK, DISPLAY_NAMES, detectFrameworks };