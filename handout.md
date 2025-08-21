# Agentic Engineering Quick Reference
## Your Guide from Manual Coding to AI Orchestration

##

Follow Anthropics [Best Practises](https://www.anthropic.com/engineering/claude-code-best-practices) when using CLAUDE CODE
But this card is equally applicable for RooCode and any other agentic coding tool. 

## Context Engineering Formula

### The Signal-to-Noise Ratio
```markdown
GOOD CONTEXT (High Signal):
- Specific file paths
- Clear success criteria  
- Existing patterns to follow
- Test cases that must pass
- Constraints and boundaries
- Non-functional requirements
- Performance targets
- Security requirements

BAD CONTEXT (High Noise):
- Vague requirements
- Entire codebase dumped
- Outdated documentation
- Conflicting instructions
- "Make it work"
- "Make it fast"
- "Handle all edge cases"
```

### Basic CLAUDE.md Template
```markdown
# Context
[What you're building]

## Technical Stack
- Framework: NestJS [version]
- Validation: class-validator
- Documentation: @nestjs/swagger
- Testing: Jest

## Development Guidelines
- Follow existing service patterns from /apps/[service]
- Use repository pattern for data access
- Add Swagger decorators to all endpoints
- Implement proper error handling
- All tests must pass before commit

## Success Criteria
- [ ] Tests pass with >80% coverage
- [ ] ESLint passes
- [ ] Swagger documentation complete
- [ ] No regression in existing features
- [ ] Security: Input validation on all endpoints
- [ ] Scalability: Pagination implemented
- [ ] Maintainability: Clear error messages
```

---

## Claude Code Essential Commands

### Basic Workflow
```bash
# Start a new session
claude "Your specific task"

# Continue existing session
claude --continue

# Quick task with file context
claude "Fix the bug in asset.service.ts" asset.service.ts

# Review mode
claude --review "Check this implementation"
```

### Common Patterns
```bash
claude "Write me a simple and concise plan on how to resolve this issue. Don't write any code yet."

claude "Do a git-diff review of the current changes, and ensure they are correct and follow the specified plan."

claude "Commit branch and then pull request the changes."

claude "Fix all failing tests and linting issues on the current branch."

claude "Explain me how the implementation of this feature works."

claude "ultrathink/think harder/think about the current issue."

claude "For the implementation of this plan, give me multiple options and let me choose the best option."

claude "Write me a failing test first for the issue. Then make it green."

claude "Start multiple sub agents to investigate how we can solve this issue in path /XXXX then come up with a plan how this can be implemented"
```

---

## Anti-Patterns to Avoid

### The "VIBE Coding" Trap
```markdown
BAD: "Fix all the issues in the service"
GOOD: "Fix the TypeORM query error in asset.service.ts line 42"

BAD: Accept code you don't understand
GOOD: "Explain this NestJS decorator before we proceed"
```

### Keep your sessions short
```markdown
BAD: 3-hour agent session on entire microservice
GOOD: 30-minute focused sessions per service layer

Why: Context degrades, errors compound
```

### The Over-Testing Trap
```markdown
BAD: "Write integration tests for every scenario, also write tests on the UI."
GOOD: "Write unit tests for business logic, one integration test per endpoint"

Why: Their agent doesn't know what a good test and what a bad test is. It just follows your instructions. 
```

---

## Productivity 

### The 80/20 Rule for Enterprise Development
- **You do 20%**: Architecture, API design, review, Requirements, Implementation and plan complicated features, Manual Testing
- **AI does 80%**: Bug fixes, Language/Framework specfic implementationd details, tests, documentation, 

- Try to get a feel what features or changes AI Models are good at, and where they are bad.

## The Plan-Review-Cook-Review Cycle

### The Right Process (45 minutes total)
```
1. PLAN Together (10 min)
   - Define scope precisely
   - List non-functional requirements
   - Identify integration points
   - Agree on approach

2. REVIEW Plan (5 min)
   - Will this scale?
   - Security implications?
   - Maintenance burden?

3. Let Agent COOK (20 min)
   - Clear boundaries set
   - Success criteria defined
   - Constraints specified
   - Help the agent with the implementation (Correct it on mistakes)

4. REVIEW Implementation (10 min)
   [ ] Code makes sense
   [ ] Handles errors
   [ ] Performance acceptable
   [ ] Security validated
   [ ] Would I maintain this?
```

## Reward Hacking

- Claude and other agents will occasionally lie to you about the success of an implementation. sometimes on purpose to [reward hack](https://alignment.anthropic.com/2025/reward-hacking-ooc/) and sometimes because of a context issue, Sometimes because they don't understand the full picture. 
- Do not trust any implementation of an AI agent. Try to always validate and review the results yourself. As agents cannot know the full requirements of the implementation. 
