---
name: ddd-architecture
description: 'Comprehensive DDD (Domain-Driven Design) skill for Xuanwu. Covers all four layers (Presentation, Application, Domain, Infrastructure), implementation patterns, scaffolding, and audit workflows. Use when designing, implementing, or auditing DDD-structured code in this repository.'
---

# DDD Architecture Skill

This skill provides comprehensive guidance for Domain-Driven Design implementation in Xuanwu.
It covers all four layers and the agent/prompt kit that drives the DDD development cycle.

## When to use

- Designing a new feature slice with proper DDD layering.
- Auditing existing code for layer boundary violations.
- Implementing entities, value objects, aggregates, or use cases.
- Wiring infrastructure adapters to port interfaces.
- Building a new bounded context from scratch.

## DDD Layer Architecture

```
┌──────────────────────────────────────────────┐
│ Presentation Layer                           │
│ src/app/, src/features/{slice}/_components/  │
│ UI components, Server Actions (thin wrapper) │
└─────────────────────▲────────────────────────┘
                      │ calls (Application API only)
┌─────────────────────┴────────────────────────┐
│ Application Layer                            │
│ src/features/{slice}/core/_use-cases.ts      │
│ src/features/{slice}/core/_actions.ts        │
│ src/features/{slice}/core/_queries.ts        │
│ Use Cases, Command Handlers, Query Handlers  │
└─────────────────────▲────────────────────────┘
                      │ calls (Domain objects)
                      │ calls (Port interfaces only)
┌─────────────────────┴────────────────────────┐
│ Domain Layer                                 │
│ src/features/{slice}/domain.*/_entity.ts     │
│ src/features/{slice}/domain.*/_value-objects │
│ src/shared-kernel/value-objects/             │
│ Entities, VOs, Domain Services, Events       │
└─────────────────────▲────────────────────────┘
                      │ implements (Port interfaces)
┌─────────────────────┴────────────────────────┐
│ Infrastructure Layer                         │
│ src/features/infra.*/                        │
│ src/shared-infra/                            │
│ src/features/{slice}/infra.outbox/           │
│ Firestore repos, Event Bus, Outbox, Storage  │
└──────────────────────────────────────────────┘
```

## DDD Development Order (always follow this sequence)

| Step | Layer | Agent | Prompt command |
|------|-------|-------|----------------|
| 1 | Domain | `ddd-domain-modeler` | `/ddd-domain-model` |
| 2 | Application | `ddd-application-layer` | `/ddd-application-service` |
| 3 | Infrastructure | `ddd-infrastructure` | `/ddd-infrastructure-adapter` |
| 4 | Presentation | `xuanwu-ui` / `xuanwu-implementer` | `/xuanwu-ui` / `/xuanwu-implementer` |

Full cycle shortcut: `/ddd-slice-scaffold` via `ddd-orchestrator`.
Audit existing code: `/ddd-layer-audit` via `ddd-orchestrator`.

## Domain Layer Patterns

### Entity (Aggregate Root)
```typescript
// src/features/{slice}/domain.{context}/_entity.ts
export class OrderEntity {
  private _events: DomainEvent[] = []

  private constructor(
    readonly id: OrderId,
    private _status: OrderStatus,
    private _items: OrderItem[],
  ) {}

  static create(cmd: CreateOrderCommand): Result<OrderEntity> {
    if (cmd.items.length === 0) return Err('items_required')
    const entity = new OrderEntity(OrderId.generate(), OrderStatus.draft(), cmd.items)
    entity._events.push(new OrderCreatedEvent(entity.id))
    return Ok(entity)
  }

  confirm(actor: ActorId): Result<void> {
    if (!this._status.canTransitionTo('confirmed')) return Err('invalid_transition')
    this._status = OrderStatus.confirmed()
    this._events.push(new OrderConfirmedEvent(this.id, actor))
    return Ok(undefined)
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this._events]
    this._events = []
    return events
  }
}
```

### Value Object
```typescript
// Immutable, self-validating, equality by value
export class OrderId {
  private constructor(readonly value: string) {}
  static generate(): OrderId { return new OrderId(nanoid()) }
  static from(raw: string): Result<OrderId> {
    if (!raw || raw.length < 1) return Err('invalid_id')
    return Ok(new OrderId(raw))
  }
  equals(other: OrderId): boolean { return this.value === other.value }
}
```

## Application Layer Patterns

### Use Case (Command Handler)
```typescript
// src/features/{slice}/core/_use-cases.ts
export async function confirmOrderUseCase(
  cmd: ConfirmOrderCommand,
  deps: { repo: IOrderRepository; events: IEventBus }
): Promise<CommandResult> {
  const order = await deps.repo.findById(OrderId.from(cmd.orderId).unwrap())
  if (!order) return CommandResult.notFound('order')

  const result = order.confirm(ActorId.from(cmd.actorId).unwrap())
  if (!result.ok) return CommandResult.domainError(result.error)

  await deps.repo.save(order)                          // S1: atomic write + outbox
  await deps.events.publishAll(order.pullDomainEvents())

  return CommandResult.success()
}
```

### Server Action (Presentation → Application bridge)
```typescript
// src/features/{slice}/_actions.ts
'use server'
export async function confirmOrderAction(orderId: string): Promise<ActionResult> {
  const session = await getServerSession()
  const deps = resolveDeps()  // inject concrete adapters here
  return confirmOrderUseCase({ orderId, actorId: session.userId }, deps)
}
```

## Infrastructure Layer Patterns

### Repository Adapter
```typescript
// Implements IOrderRepository port interface
export class FirestoreOrderRepository implements IOrderRepository {
  async save(order: OrderEntity): Promise<void> {
    await db.runTransaction(async (tx) => {
      tx.set(db.doc(`orders/${order.id.value}`), OrderMapper.toDoc(order))
      // S1: write domain events to outbox atomically
      for (const event of order.pullDomainEvents()) {
        tx.set(db.collection('outbox').doc(), OutboxMapper.toDoc(event))
      }
    })
  }
}
```

## Port Interface Pattern

```typescript
// src/shared-kernel/ports/i-order-repository.ts
export interface IOrderRepository {
  findById(id: OrderId): Promise<OrderEntity | null>
  save(order: OrderEntity): Promise<void>
  findByWorkspace(workspaceId: WorkspaceId): Promise<OrderEntity[]>
}
```

## Slice Public API Pattern

```typescript
// src/features/{slice}/index.ts
// ONLY export presentation-safe APIs
export { confirmOrderAction } from './core/_actions'
export { getOrdersQuery } from './core/_queries'
export type { OrderDTO, OrderStatus } from './_contract'
// Do NOT export: entities, VOs, repositories, domain events
```

## Agent and Prompt Kit

### Available Agents

| Agent | Role |
|-------|------|
| `ddd-orchestrator` | Entry point, coordinates DDD delivery order |
| `ddd-domain-modeler` | Domain layer: entities, VOs, aggregates, invariants |
| `ddd-application-layer` | Application layer: use cases, actions, queries |
| `ddd-infrastructure` | Infrastructure layer: repository, outbox, event bus |

### Available Prompts

| Slash command | What it does |
|---------------|-------------|
| `/ddd-domain-model` | Design/implement domain entities or VOs |
| `/ddd-application-service` | Design/implement use cases and application services |
| `/ddd-infrastructure-adapter` | Implement repository or outbox adapters |
| `/ddd-layer-audit` | Audit layer compliance and D24 violations |
| `/ddd-slice-scaffold` | Scaffold a complete new DDD slice (all 4 layers) |

## Related Repository Files

- DDD layer rules: `.github/instructions/xuanwu-ddd-layers.instructions.md`
- Architecture SSOT: `docs/architecture/README.md`
- Domain model: `docs/architecture/models/domain-model.md`
- Application service spec: `docs/architecture/blueprints/application-service-spec.md`
- Port interfaces: `src/shared-kernel/ports/`
- Infra contracts: `src/shared-kernel/infra-contracts/`
- Feature slices: `src/features/README.md`
