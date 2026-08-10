This repo is the part of my blog: [Deploy, Proxy, Ship: The No-Fluff Guide to Full-Stack Agents 🤖](https://medium.com/@LoveeJain/deploy-proxy-ship-the-no-fluff-guide-to-full-stack-agents-092544533c25) that allows you to create an ADK (Agent Development Kit) agent using agents-cli, deploy it to Google's Agent Platform. We then proxy it using a FastAPI BFF that allows us to access the agent securely. We finally vibecode the Frontend in React/Vite - a minimal chat interface that allows to chat to our agent via the BFF proxy! 

Don't forget to create and update `.env` files to run and deploy each. There is a `.env.example` available for reference.

Again the Frontend is just vibecoded, so it is not at its best, but helps deliver the point. 

Best part, you can swap the agent in the bff with any of your deployed agents in the Agent Platform, and it would work! 
