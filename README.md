<h1 align="center">wpp-rest-api</h1>

<p align="center">WhatsApp rest api built with <a href="https://github.com/WhiskeySockets/Baileys">Baileys</a> to send, receive, react, edit and delete messages from WhatsApp</p>

<p align="center">
  <a href="#roadmap">Roadmap</a> • 
  <a href="#installation">Installation</a> •
  <a href="#custom-configs">Custom configurations</a> •
  <a href="#development">Development</a>
</p>

<h2 id="roadmap">Roadmap</h2>

✅ Send/receive messages

✅ React a message

✅ Edit a message

✅ Delete a message

⏳ Authentication

⏳ Webhooks

⏳ Frontend

<h2 id="installation">Installation</h2>

<h3>Requirements</h3>

  ⚠️ [Node.js](https://nodejs.org/en)
  
  ⚠️ [Redis Stack](https://redis.io/docs/install/install-stack/)

<h3>Running the server</h3>

<h4>Clone this repository</h4>

```bash
git clone https://github.com/henmeyer/wpp-rest-api.git
```

<h4>Install all dependencies</h4>

```bash
npm i
```

<h4>Build all files</h4>

```bash
npm run build
```

<h4>Start the server</h4>

```bash
npm run build
```

<h2 id="custom-configs">Custom configurations</h3>

```bash
cp .env.example .env
```
<p>Edit .env</p>

```.env
PORT=3000
```

<h2 id="development">Development</h2>

<h3>Running the server</h3>

```bash
npm run start-dev
```
