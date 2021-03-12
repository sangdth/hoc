# Chi Bằng Học

## About this project

Super simple online learning application for people.

## Getting started

### 1. Clone the repository and install dependancies

```
git clone https://github.com/sangdth/hoc.git
cd hoc
yarn
```

### 2. Configure your local environment

Copy the .env.local.example file in this directory to .env.local (which will be ignored by Git):

```
cp .env.local.example .env.local
```

Add details for the Facebook provider (e.g. Google, Twitter, GitHub, Email, etc).
Make sure to add the same secret into Hasura environment variables `HASURA_GRAPHQL_JWT_SECRET`.

```
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_WS_URL=

NEXTAUTH_URL=https://localhost:3000
SECRET=""

FACEBOOK_ID="get it in facebook developer"
FACEBOOK_SECRET="get it in facebook developer"
```

### 3. Generate the certs for SSL in local

We will use `mkcert` to generate certifications, there is a script already, just make sure you have `mkcert` already.

```
brew install mkcert
yarn certs
```
It will automatic create a `certs` folder in this root.

### 4. Start develop

Now you are ready to develop the app.

```
yarn dev
```
