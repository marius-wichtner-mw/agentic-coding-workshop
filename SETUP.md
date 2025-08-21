# AI Coding Tools Setup Guide

This guide covers the setup for three AI coding assistants available at MaibornWolff: RooCode, Claude Code, and Codex.

## 1. Codex Setup

Codex can be configured to use the internal MaibornWolff infrastructure.

### Configuration Steps

1. **Create config file** at `~/.codex/config.toml`:

```toml
# Custom provider for MaibornWolff API endpoint
[model_providers.maibornwolff]
name = "MaibornWolff API"
base_url = "https://aikeys.maibornwolff.de/v1"
env_key = "MAIBORNWOLFF_API_KEY"
wire_api = "chat"

# Profile for MaibornWolff API
[profiles.maibornwolff]
model_provider = "maibornwolff"
model = "gpt-5"
disable_response_storage = true
```

2. **Set environment variable**:

   **macOS/Linux:**
   ```bash
   export MAIBORNWOLFF_API_KEY="your-api-key-here"
   ```
   
   **Windows (PowerShell):**
   ```powershell
   $env:MAIBORNWOLFF_API_KEY="your-api-key-here"
   ```
   
   **Windows (Command Prompt):**
   ```cmd
   set MAIBORNWOLFF_API_KEY=your-api-key-here
   ```

3. **Start using Codex**:
   ```bash
   codex --profile maibornwolff -m gpt-5
   ```

## 2. Claude Code Setup

Setup instructions for the MaibornWolff trusted zone can be found at:
https://lumos.maibornwolff.de/home/ls/content/4176122629581893/claude-code

### Quick Start
1. Follow the internal documentation link above
2. Configure authentication through the trusted zone
3. Install Claude Code CLI following the platform-specific instructions

## 3. RooCode Setup

Setup instructions for the MaibornWolff trusted zone can be found at:
https://lumos.maibornwolff.de/home/ls/content/4047982520786931/knowledge/ai/ai-tools/trusted-zone/roocode-9fb7d13e-9a77-494b-b0ce-9529a37080e5

### Quick Start
1. Access the internal documentation link above
2. Follow trusted zone configuration steps
3. Install RooCode extension in your IDE

## Choosing a Tool

- **Codex**: Lightweight CLI tool, great for quick tasks and terminal workflows
- **Claude Code**: Advanced AI capabilities, ideal for complex coding tasks
- **RooCode**: IDE-integrated assistant, best for in-editor suggestions

## Support

For MaibornWolff-specific setup issues, consult the internal Lumos documentation or contact the AI tools support team.