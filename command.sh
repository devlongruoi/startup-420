npx create-next-app@latest

npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p

npx shadcn@latest init
npx shadcn@latest add --all

npm install next-auth@beta
npx auth secret

npm create sanity@latest -- --project edi5l7ix --dataset production --template clean --typescript --output-path studio

npx @sentry/wizard@latest -i nextjs --saas --org devlongruoi --project javascript-nextjs