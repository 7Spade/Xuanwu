# VS7-Notification

- Notification hub as single side-effect exit (`#A13`)
- Stateless router with semantic-aware delivery policy
- IER standard lane consumption and trace propagation (`R8`)

## Implemented Capabilities (from code)

- Hub actions: dispatch、routing rule register/unregister、manual trigger dispatch。
- Hub services: tag-aware routing decision、subscription registry、projection-bus subscriber、hub stats。
- Hub contracts: notification category / semantic type / priority / channel。
- User notification domain: deliver、subscribe、mark-read、notifications hook。
- Governance router: notification router registration。
- UI: notification bell、badge、list。
