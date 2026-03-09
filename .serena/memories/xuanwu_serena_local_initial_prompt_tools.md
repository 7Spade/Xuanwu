Serena local initial_prompt configured in .serena/project.local.yml to allow autonomous use of:
- sequentialthinking (multi-step reasoning/uncertainty)
- io.github.upstash/context7 (version-sensitive docs/security integrations)
With fallback rule: if unavailable, state limitation + conservative assumption + concrete validation.
Source: .serena/project.local.yml:9-14