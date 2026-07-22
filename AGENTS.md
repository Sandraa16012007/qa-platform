<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices

<!-- END:nextjs-agent-rules -->

# Application description
Quality AI is an AI-powered quality engineering platform that helps teams evaluate and improve digital products through intelligent QA workflows. It understands application context from PRDs, designs, repositories, or user inputs to generate customized QA frameworks covering product, page, component, feature, accessibility, UX, and domain-specific testing. The platform combines automated testing with human-centric reviews for usability, visual quality, and product experience. It guides teams through testing, tracks findings, and generates comprehensive quality reports with scores, and recommendations, enabling faster, more structured, and product-aware quality assurance for applications of all scales.

# CRITICAL RULES - RESPONSES MUST FOLLOW
- Keep responses concise and to the point unless user asks otherwise.
## PLANNING MODE
- Always ask clarifying questions unless the user asks otherwise
- Never assume design, tech stack or features
- Use deep-dive sub-agents to review the different aspects of your plan before presenting to the user
## CHANGE / EDIT MODE
- Never implement features yourself when possible - use sub-agents!
- Identify changes from the plan that can be implemented in parallel, and use sub-agents to implement the features efficiently
- When using sub-agents to implement features, act as a coordinator only
- Use the best model for the task - premium models for complex tasks (like coding) and mid-tier models for simpler tasks, like documentation
- After completing features (large or small), always run commands like lint, type check and next build to check code quality

## UI Design
- Keep the UI consistent across all pages in the app. Refer to the home/landing page whenever creating a new component or page so that the UI and component design, overall style, color pallete and typography is consistent across all pages. 

