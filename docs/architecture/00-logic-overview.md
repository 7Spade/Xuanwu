%%  ?”â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â?
%%  ?? LOGIC OVERVIEW v2 ??ARCHITECTURE SSOT                                ??
%%  ?? è¨­è??Ÿå?ï¼?                                                             ??
%%  ??   ??çµ±ä??±ä??³ä?ï¼šå??¨å…¥?????˜é? ???˜å? ??äº‹ä»¶ç¸½ç? ???•å½± ???¥è©¢?ºå£  ??
%%  ??   ??SK å¥‘ç??†ä¸­å®šç¾©ï¼Œæ??‰ç?é»å?å¼•ç”¨ä¸é?è¤‡å®£??                          ??
%%  ??   ??Firebase ?Šç??ç¢ºï¼šAnti-Corruption Translator + æ¨™æ???Port ?ºå”¯ä¸€ runtime å¥‘ç? ??
%%  ??   ??è®€å¯«å??¢çµ±ä¸€?˜é?ï¼ˆCQRS Gateway = L0A + L2 + L6ï¼‰ï?ä¸‰é??“å?ä¸€?ˆç¾ï¼Œä»¥è®€/å¯«ç‚º?¯ä??‡å‰²ç·? ??
%%  ??   ???€?‰ä?è®Šé?ä»?[#N] / [SN] / [RN] è¡Œå…§ç´¢å?ï¼Œå??´å?ç¾©æ–¼?‡æœ«            ??
%%  ??   ??Everything as a Tagï¼šæ??‰é??Ÿæ?å¿µä»¥èªç¾©æ¨™ç±¤å»ºæ¨¡ï¼Œç”± VS8 ?¨å?æ²»ç? + VS4 çµ„ç??´å?æ²»ç? ??
%%  ??   ??VS7 ?…å¯ç¶?Portï¼ˆIMessagingï¼‰ç™¼?é€šçŸ¥ï¼Œä?å¾—ç›´??»»ä½?Adapter/Runtime   ??
%%  ??   ???¶æ?æ­?¢º?§å„ª?ˆï?Architectural Correctness Firstï¼‰ï?æ­???¶æ??ºæ?é«˜è?æ±ºæ?æº–ï?  ??
%%  ??      å¥§å¡å§†å??€ = æ­?¢º?½è±¡?æ?å°‘ç?å¼ç¢¼ï¼›æ¶æ§‹é?è¦é›¶å®¹å?ï¼Œå??ˆç??³ç?æ§‹æ€§ä¿®æ­? ??
%%  ??      ä¸‰å??‡ï?çµæ?ç©©å??‡ä??´æ€?Â· ?¬è³ª?‡ç°¡ç´?Â· ?¯æ?çºŒæ€§è?æ¼”é€?              ??
%%  ? â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â•£
%%  SSOT Mapping:
%%    Architecture rules       ??docs/architecture/00-logic-overview.md  ??THIS FILEï¼ˆå?å§‹æ?ï¼Œæ??‰è??‡æ­£?‡åœ¨æ­¤å?ç¾©ï?
%%    Semantic relations       ??.memory/knowledge-graph.json
%%    VS8 complete-body guide  ??docs/architecture/03-Slices/VS8-SemanticBrain/01-d21-body-8layers.md  (companion spec)
%%  ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
%%  Sub-View Indexï¼ˆå?è¦–å?ç´¢å?ï¼Œå??¬æ??½å‡ºï¼Œä??¯è??§é–±è¦½ï?:
%%    ?è¼¯æµè???(Logical Flow)     ??docs/architecture/01-logical-flow.md
%%    æ²»ç?è¦–å?   (Governance View)  ??docs/architecture/02-governance-rules.md
%%    ?ºç?è¨­æ–½è¦–å?(Infrastructure)  ??docs/architecture/03-infra-mapping.md
%%  æ³¨æ?ï¼šè‹¥å­è??–è??¬æ?è¡ç?ï¼Œä»¥?¬æ?ï¼?0-logic-overview.mdï¼‰ç‚ºæº–ã€?
%%  RULE SENTENCE TEMPLATEï¼ˆè??‡å¥æ¨¡æ¿ï¼?
%%    MUST     : IF <æ¢ä»¶> THEN <å¿…é?è¡Œç‚º>
%%    SHOULD   : IF <?…å?> THEN <å»ºè­°è¡Œç‚º>
%%    FORBIDDEN: IF <?…å?> THEN MUST NOT <ç¦æ­¢è¡Œç‚º>
%%  RULE CLASSIFICATIONï¼ˆå?é¡ï?:
%%    MUST(R/S/A/#) = ç©©å?ä¸è??ï?SHOULD(D/P/T/E) = æ²»ç?æ¼”é€²ï?FORBIDDEN = çµ•å?ç¦æ­¢
%%  ? â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â•£
%%  QUICK REFERENCEï¼ˆå¿«?Ÿç´¢å¼????€?Ÿå?å¾—ä?ä¸‹æ?ï¼?
%%  ?€?€ Vertical Indexï¼ˆé??Ÿç·¨??Â· VS0?“VS8ï¼‰â??€
%%    VS0=Foundationï¼ˆSharedKernel + SharedInfraï¼? VS1=Identity   VS2=Account      VS3=Skill
%%    VS4=Organization  VS5=Workspace  VS6=Workforce-Scheduling   VS7=Notification
%%    VS8=SemanticGraphEngine
%%    Path Map: VS0=src/shared-kernel + src/shared-kernel/observability + src/shared-infra/frontend-firebase + src/shared-infra/backend-firebase + src/shared-infra/observability
%%              VS1=src/features/identity.slice   VS2=src/features/account.slice
%%              VS3=src/features/skill-xp.slice   VS4=src/features/organization.slice
%%              VS5=src/features/workspace.slice  VS6=src/features/workforce-scheduling.slice
%%              VS7=src/features/notification-hub.slice  VS8=src/features/semantic-graph.slice
%%    VS0 ?§éƒ¨?†å±¤ï¼ˆFoundation Planeï¼?
%%      src/shared-kernel                   = VS0-Kernelï¼ˆL1 å¥‘ç?å±¤ï?
%%      src/shared-kernel/observability     = VS0-Kernelï¼ˆL1 Observability Contracts onlyï¼štypes/interfacesï¼Œé? runtime nodeï¼?
%%      src/shared-infra/*                  = VS0-Infra Planeï¼ˆL0/L2/L4/L5/L6/L7/L9/L10 ?·è?å±¤ï?L8 ?ºå??¨å¹³?°åŸ·è¡Œç›®æ¨™ï?
%%      L0/L2/L4/L5/L6 ?ºç?è¨­æ–½ä¸»è·¯å¾‘ï?src/shared-infra/{external-triggers|gateway-command|event-router|outbox-relay|dlq-manager|projection-bus|gateway-query}
%%      Legacy ?¸å®¹è·¯å?ï¼ˆå??æ¸¡ï¼Œä?ä½œç‚º?®æ??¶æ?ï¼‰ï?src/features/infra.*
%%      src/shared-infra/projection-bus     = VS0-Infraï¼ˆL5 Projection Busï¼?
%%      src/shared-infra/observability      = VS0-Infraï¼ˆL9 Observability Runtimeï¼?
%%    ?½å?è¦å?ï¼šVS0=Foundation Indexï¼ˆL1+L0+L2+L4+L5+L6+L7+L8+L9+L10ï¼‰ï?VS1~VS8=æ¥­å??‡ç?ç·¨è?ï¼ˆL3ï¼?
%%    VS0 è­˜åˆ¥è¦æ ¼ï¼ˆæ?ä»?å¯©æŸ¥ä¸€å¾‹ä½¿?¨ï?:
%%      VS0-Kernel = src/shared-kernel/*ï¼ˆpure contracts/constants/functionsï¼Œç?æ­?I/Oï¼?
%%      VS0-Infra  = src/shared-infra/*ï¼ˆL0/L2/L4/L5/L6/L7/L9/L10 execution planeï¼›L8 ?ºå???runtime targetï¼?
%%      Observability ?†å±¤è¦å?ï¼šL1 ?ªå?è¨?observability contractsï¼›L9 runtime sink/counter/trace provider ?ªå?è¨±åœ¨ src/shared-infra/observability
%%      ç¦æ­¢?ªå¯«?ŒVS0?è€Œä?æ¨™è¨» -Kernel ??-Infraï¼ˆé¿?è?ç¾©æ­§ç¾©ï?
%%      VS0 è¦–å??†æ?è¦å?ï¼šå?ä¸€ VS0 ?ƒåœ¨?–ä¸­?†ç‚º?ŒL1 VS0-Kernel?è??ŒL0/L2/L4/L5/L6~L9 VS0-Infra?å…©å¡Šå??¾ï?
%%      æ­¤ç‚º Layer ?¯è??§å??–ï??é??Ÿå??²ï?Domain Ownership ä»å?å±?VS0/Foundationï¼?
%%  ?€?€ Cross-cutting Authoritiesï¼ˆè·¨?‡ç?æ¬Šå?ï¼‰â??€
%%    global-search.slice  = èªç¾©?€?¶ï??¯ä?è·¨å??œå?æ¬Šå? Â· å°æ¥ VS8 èªç¾©ç´¢å?ï¼?
%%    notification-hub.slice = ?æ?ä¸­æ?ï¼ˆVS7 å¢å¼· Â· ?¯ä??¯ä??¨å‡º??Â· æ¨™ç±¤?ŸçŸ¥è·¯ç”±ï¼?
%%    ???©è€…ç??ˆæ??‰è‡ªå·±ç? _actions.ts / _services.tsï¼Œä?å¾—å??Ÿæ–¼ shared-kernel [D3 D8]
%%  ?€?€ Layerï¼ˆç³»çµ±å±¤ï¼‰â??€
%%    L0=ExternalTriggers   L1=SharedKernel       L2=CommandGateway
%%    L3=DomainSlices       L4=IER                L5=ProjectionBus
%%    L6=QueryGateway       L7=FirebaseBoundary    L8=FirebaseInfra      L9=Observability
%%    L10=AIRuntime&Orchestrationï¼ˆGenkit Flow Gateway / Prompt Policy / Tool ACL / Model Routingï¼?
%%    ??L7 ?†å±¤ï¼ˆè²¬ä»»å??ï?:
%%      - L7-Translator = SDK semantics ??VS0 standardized portsï¼ˆIStd* / IMessaging / IDataConnectï¼?
%%      - L7-FE Functional Adapters = src/shared-infra/frontend-firebase/*ï¼ˆä½¿?¨è€…æ?è©±æ? / Security Rules ?¯å??‰ï?
%%      - L7-BE Functional Adapters = src/shared-infra/backend-firebase/functions/*ï¼ˆAdmin / è·¨ç???/ è§¸ç™¼??/ ?’ç? / Webhook é©—ç°½ï¼?
%%      - L7-BE-DC Adapter          = src/shared-infra/backend-firebase/dataconnectï¼ˆå?æ²»ç? GraphQL schema/connector å¥‘ç?ï¼?
%%    ??L8 = å¤–éƒ¨ Firebase å¹³å°?·è?å±¤ï?SDK Runtimeï¼‰ï??¨æœ¬ repo ?…ä»¥?Šç?æ¨¡å??ˆç¾ï¼Œé??¬åœ°å¯¦ä?è³‡æ?å¤?
%%    ??L10 = AI ?·è??‡æ²»?†å±¤ï¼ˆå¯??src/app-runtime/ai + shared-infra/ai-* ?±å?å¯¦ä?ï¼›å? L1 å¥‘ç???L9 è§€æ¸¬ç??Ÿï?
%%    ??L3 Domain Slices = VS1(Identity) Â· VS2(Account) Â· VS3(Skill) Â·
%%                          VS4(Organization) Â· VS5(Workspace) Â· VS6(Workforce-Scheduling) Â·
%%                          VS7(Notification) Â· VS8(SemanticGraph)
%%    ??VS0(Foundation) ä¸å±¬??L3 Domain Slicesï¼›å…¶ä¸?VS0-Kernel=L1ï¼ŒVS0-Infra=L0/L2/L4/L5/L6/L7/L8/L9/L10
%%    ???Šç?æ¾„æ?ï¼šL2 Command Gateway ?ç¢ºå±¬æ–¼ VS0-Infraï¼ˆä?å¾—èª¤æ­?L3ï¼‰ï?L8 ?ºå???runtimeï¼Œä?ä»?¡¨?¬åœ° folder ownership
%%  ?€?€ Canonical Chainsï¼ˆå”¯ä¸€?’å??¤æ?ï¼‰â??€
%%    å¯«é?ï¼ˆCommandï¼? External/L0 ??L0A COMMAND_API_GATEWAY ??L2 Command Gateway ??L3 Domain Slices ??L4 IER ??L5 Projection
%%    è®€?ˆï?Queryï¼?  : UI/L0 ??L0A QUERY_API_GATEWAY ??L6 Query Gateway ??L5 Projection(Read Model)
%%    Infra?ˆï?SDKï¼? : L3/L5/L6 ??L1 Ports/Contracts ??L7 Firebase Boundary ??L8 Firebase Runtime
%%    è¦å?ï¼šä?æ¢é?ä¸¦å?ï¼Œä?å¾—æ? Query/Command/FirebaseBoundary å£“æ??®ä?ç·šæ€§æ?åº?
%%  ?€?€ æ¨™æ??®é?çµæ?ï¼ˆStandard Directory Structure Â· ?®å?ä¾è³´?ˆå?é½Šï??€?€
%%    src/
%%      shared-kernel/                          # VS0-Kernel / L1: contracts/constants/pure zone
%%      shared-kernel/observability/            # VS0-Kernel / L1: observability contracts only (no side effects)
%%      shared-infra/frontend-firebase/         # VS0-Infra / L7: Frontend Firebase ACL adapters (Web SDK boundary)
%%        auth/
%%        firestore/
%%        realtime-database/
%%        messaging/
%%        storage/
%%        analytics/
%%      shared-infra/backend-firebase/          # VS0-Infra / L7: Backend Firebase execution boundary (server-side)
%%        functions/                            # Cloud Functions (HTTP/callable/triggers/scheduler)
%%        dataconnect/                          # Data Connect schema/connector/operations
%%        firestore/                            # Firestore rules/indexes deploy artifacts
%%        storage/                              # Storage rules deploy artifacts
%%  ?€?€ L7 Firebase Boundary Folder Ownershipï¼ˆé¿?å?å¾Œç«¯?·è²¬æ··æ?ï¼‰â??€
%%    src/shared-infra/frontend-firebase/         = FE ACLï¼ˆuser-session / rules-guardedï¼?
%%    src/shared-infra/backend-firebase/functions = BE orchestrationï¼ˆadmin/cross-tenant/triggers/scheduler/webhookï¼?
%%    src/shared-infra/backend-firebase/dataconnect = BE query contractï¼ˆgoverned GraphQL schema/connectorï¼?
%%  ?€?€ VS0-Infra Core Foldersï¼ˆé? L7 å°ˆå±¬ï¼›ä? Layer ?†å·¥ï¼‰â??€
%%      shared-infra/external-triggers/         # VS0-Infra / L0: external triggers
%%      shared-infra/gateway-command/           # VS0-Infra / L2: CBG_ENTRY/CBG_AUTH/CBG_ROUTE orchestration
%%      shared-infra/event-router/              # VS0-Infra / L4: IER core + lanes
%%      shared-infra/outbox-relay/              # VS0-Infra / L4: outbox relay worker
%%      shared-infra/dlq-manager/               # VS0-Infra / L4: DLQ tiering and replay policy center
%%      shared-infra/projection-bus/            # VS0-Infra / L5: projection funnel + read model materialization
%%      shared-infra/gateway-query/             # VS0-Infra / L6: query gateway/read registry
%%      shared-infra/observability/             # VS0-Infra / L9: metrics/errors/trace observability
%%      features/
%%        infra.external-triggers/              # legacy alias onlyï¼ˆé·ç§»æ??¸å®¹ï¼?
%%        infra.gateway-command/                # legacy alias onlyï¼ˆé·ç§»æ??¸å®¹ï¼?
%%        infra.event-router/                   # legacy alias onlyï¼ˆé·ç§»æ??¸å®¹ï¼?
%%        infra.outbox-relay/                   # legacy alias onlyï¼ˆé·ç§»æ??¸å®¹ï¼?
%%        infra.dlq-manager/                    # legacy alias onlyï¼ˆé·ç§»æ??¸å®¹ï¼?
%%        infra.gateway-query/                  # legacy alias onlyï¼ˆé·ç§»æ??¸å®¹ï¼?
%%        projection.bus/                       # legacy alias onlyï¼ˆé·ç§»æ??¸å®¹ï¼›ç›®æ¨?src/shared-infra/projection-busï¼?
%%        identity.slice/                       # L3 VS1
%%        account.slice/                        # L3 VS2
%%        skill-xp.slice/                       # L3 VS3
%%        organization.slice/                   # L3 VS4
%%        workspace.slice/                      # L3 VS5
%%        workforce-scheduling.slice/           # L3 VS6
%%        notification-hub.slice/               # L3 VS7 (authority exit)
%%        semantic-graph.slice/                 # L3 VS8 (semantic authority)
%%        global-search.slice/                  # L3 cross-cut authority (search exit)
%%    app/                                      # UI entry; read-only via L6
%%  ?€?€ Logic-First Placement Matrixï¼ˆæ–°å¢æ?æ¡ˆæ”¾ç½®åˆ¤?·ï?ä¾å…­ç¶­è??‡å??¨ï?ä¸ä»¥å¯«æ?ç°¡çŸ­?–ä»£?è¼¯ï¼‰â??€
%%    ?€é«˜æ?æ¨™ï??è¼¯æ­?¢ºï¼ˆå±¤ç´šè?ä¾è³´è¦å? Â· ?Šç??‡ä?ä¸‹æ? Â· ?šè??‡å?èª¿æ???Â· ?€?‹è??¯ä???Â· æ¬Šå?æ­¸å±¬ Â· è®Šå??Ÿç?ï¼?
%%    A. å±¤ç??‡ä?è³´è??‡ï?Layering & Dependencyï¼?
%%      - ç´”å?ç´?å¸¸æ•¸/ç´”å‡½å¼ï???I/Oï¼‰â? src/shared-kernel/*ï¼ˆVS0-Kernel / L1ï¼?
%%      - Observability å¥‘ç?ï¼ˆTraceContext/DomainErrorEntry/interfacesï¼‰â? src/shared-kernel/observability/*ï¼ˆL1, contract-onlyï¼?
%%      - Firebase SDK ?Šç?ï¼ˆå?ç«¯ï???src/shared-infra/frontend-firebase/*ï¼ˆVS0-Infra / L7ï¼?
%%      - Firebase é«˜æ???ä¼ºæ?æµç?ï¼ˆå?ç«¯ï???src/shared-infra/backend-firebase/{functions|dataconnect}/*ï¼ˆVS0-Infra / L7ï¼?
%%      - è®€?–ç·¨?’ï?Read registryï¼‰â? src/shared-infra/gateway-query/*ï¼ˆL6, ownership=VS0-Infraï¼?
%%      - è§€æ¸¬åŸ·è¡Œèƒ½?›ï?trace provider / metrics recorder / error loggerï¼‰â? src/shared-infra/observability/*ï¼ˆL9, ownership=VS0-Infraï¼?
%%      - ?˜å?è¦å?ï¼ˆaggregate/policy/invariantï¼‰â? src/features/{slice}.slice/*ï¼ˆL3ï¼?
%%    B. ?Šç??‡ä?ä¸‹æ?ï¼ˆBoundary & Contextï¼?
%%      - è·¨æ¥­?™å…±?¨ä??æ¥­?™è?ç¾?= VS0ï¼ˆKernel ??Infraï¼?
%%      - æ¥­å?èªç¾©?‡ç??‹æ? = å°æ? Feature Sliceï¼ˆL3ï¼?
%%      - Cross-cutting Authorityï¼ˆæ?å°??šçŸ¥ï¼? L3 æ¬Šå??‡ç?ï¼Œä?å¾—å???shared-kernel
%%    C. ?šè??‡å?èª¿æ??¶ï?Communication & Coordinationï¼?
%%      - å¯«å…¥?”èª¿ = L2ï¼ˆshared-infra/gateway-commandï¼?
%%      - äº‹ä»¶è·¯ç”±/relay/DLQ = L4ï¼ˆshared-infra/event-router / shared-infra/outbox-relay / shared-infra/dlq-managerï¼?
%%      - ?•å½±?©å? = L5ï¼ˆsrc/shared-infra/projection-busï¼Œsystem serviceï¼?
%%      - è®€?–å‡º??= L6ï¼ˆshared-infra/gateway-queryï¼?
%%    D. ?€?‹è??¯ä??¨ï?State & Side Effectsï¼?
%%      - shared-kernel ç¦æ­¢ async/Firestore/side effects [D8]
%%      - shared-kernel/observability ç¦æ­¢ runtime sinkï¼ˆconsole/network/dbï¼‰ã€ç?æ­?mutable counter?ç?æ­?clock/random å¯¦ä?
%%      - ä»»ä? sink å¯«å…¥?runtime counter?clock/random?console ?†è??ºå‰¯ä½œç”¨ï¼Œå??ˆåœ¨ VS0-Infra ?–å??‰åŸ·è¡Œå±¤
%%    E. æ¬Šå?æ­¸å±¬ï¼ˆAuthority Ownershipï¼?
%%      - Query æ¬Šå?å±?L6ï¼ˆownership=VS0-Infraï¼?
%%      - Firebase SDK æ¬Šå?å±?L7ï¼ˆFIREBASE_ACLï¼?
%%      - Observability Contract Authority å±?L1ï¼ˆsrc/shared-kernel/observabilityï¼?
%%      - Observability Runtime Authority å±?L9ï¼ˆsrc/shared-infra/observabilityï¼?
%%      - Search/Notification æ¬Šå?å±¬å???cross-cutting slice [D26]
%%    F. è®Šå??Ÿç?ï¼ˆRate of Changeï¼?
%%      - ?¢è?å¥‘ç?ï¼ˆtypes/contractsï¼‰æ”¾ L1
%%      - ä¸­è??´å?ï¼ˆadapter/gateway/observabilityï¼‰æ”¾ VS0-Infra
%%      - å¿«è?æ¥­å?æµç???L3
%%    ?¤æ–·?Ÿè?ï¼šå??¤æ–·?è¼¯å±¤è?æ¬Šå?æ­¸å±¬ï¼Œå?æ±ºå?è·¯å?ï¼›ä?å¾—å??‘ä»¥?¢æ?è·¯å??ˆç??–è¨­è¨ˆã€?
%%  ?€?€ ä¾è³´?¹å?ç´„æ?ï¼ˆå??‰ç›®?„ï???Canonical Chains ä¸€?´ï??€?€
%%    å¯«é?ï¼šshared-infra/external-triggers ??shared-infra/api-gateway(command) ??shared-infra/gateway-command ??*.slice ??shared-infra/event-router ??shared-infra/projection-bus
%%    è®€?ˆï?app/UI ??shared-infra/api-gateway(query) ??shared-infra/gateway-query ??shared-infra/projection-bus
%%    Infra?ˆï??ç«¯ SDKï¼‰ï?*.slice/projection/query ??shared-kernel(SK_PORTS) ??shared-infra/frontend-firebase(FIREBASE_ACL, Web SDK)
%%    Infra?ˆï?å¾Œç«¯é«˜æ??ï?ï¼šL0 or L2 API entry ??shared-infra/backend-firebase/functions|dataconnect ??Firebase Platform (L8)

%%  ?€?€ Firebase ?å?ç«¯å?å±¤è??æœ¬æ±ºç?ï¼ˆFront/Back Decision Matrixï¼‰â??€
%%    Frontend Firebaseï¼ˆsrc/shared-infra/frontend-firebaseï¼‰é©?¨ï?
%%      - ä½¿ç”¨?…æ?è©±å…§?å? Security Rules ä¿è­·?„è?å¯«ï??‹äººè³‡æ?/ä¸€?¬å?è¡?äº’å??€?‹ï?
%%      - RTDB presence/typing/live-feed ä½å»¶?²ä???
%%      - FCM token ç¶å??Analytics ?™æ¸¬ä¸Šå ±
%%    Backend Firebaseï¼ˆsrc/shared-infra/backend-firebase/functionsï¼‰å??¨ï?
%%      - ?€è¦?Admin æ¬Šé??è·¨ç§Ÿæˆ¶è³‡æ?å­˜å??å???æ©Ÿå?ä½¿ç”¨
%%      - è·¨é???è·¨è??ˆä??´æ€§å¯«?¥ã€è??Ÿäº¤?“ã€æ‰¹æ¬¡å¯«?¥è?é«˜æ??ºå·¥ä½?
%%      - Firestore/Storage trigger?æ?ç¨‹ä»»?™ã€Webhook é©—ç°½?å?å¤?HTTP/Callable API
%%    Data Connectï¼ˆsrc/shared-infra/backend-firebase/dataconnectï¼‰å??¨ï?
%%      - ?€è¦å¯æ²»ç???GraphQL schema/connectorï¼Œä¸¦ä»¥å?ç«¯ç??¥çµ±ä¸€è·¯ç”±è³‡æ?å­˜å?
%%      - ?€è¦è·¨?ç«¯çµ±ä??¥è©¢?½å??‡å¼·?‹åˆ¥ API å¥‘ç???
%%    ?æœ¬?‡æ??½å??¨ï??è¼¯æ­?¢º?ªå?ï¼Œæ??¬æ¬¡ä¹‹ï?ï¼?
%%      - IF ?ä??¯ç”± Security Rules å®‰å…¨å®Œæ?ä¸”ç‚ºé«˜é »å°è?æ±?THEN ?ªå? Frontend Firebaseï¼ˆé?ä½?Functions ?¼å«?æœ¬?‡å°¾å»¶é²ï¼?
%%      - IF ?ä?æ¶‰å?é«˜æ??ã€è??œå?èª¿æ?é«˜æ???THEN ?ªå? Backend Firebaseï¼ˆé?ä½ä??´æ€§é¢¨?ªè??è©¦?¾å¤§?æœ¬ï¼?
%%      - IF è®€?–æ¨¡å¼ç‚º?·é€???³æ??´æ–° THEN ?ªå? RTDB/Firestore listenerï¼›è‹¥?…å¶?¼æŸ¥è©¢å??¿å?å¸¸é? listener ä»¥æ§?¶è??–æ???
%%      - IF ?¯æ‰¹æ¬??»æ?/?šå?å¾Œå?å¯«å…¥ THEN å¿…é???Backend ç«¯é?ä¸­è??†ï?ä»¥é?ä½å¯«?¥æ¬¡?¸è??ºç??æœ¬
%%    Security Closureï¼ˆèº«ä»½è?å®‰å…¨?‰ç’°ï¼?
%%      - App Check å¿…é???external-trigger ?¥å£é©—è?ï¼Œæœª?šé?è«‹æ??´æ¥?’ç?ï¼›ä?å¾—ç??è‡³ Domain Slice
%%      - Security Rules å¿…é?ä»?org/workspace/account ä¸‰å±¤ç§Ÿæˆ¶?µç??Ÿè??™å??–ï?é«˜é¢¨?ªæ?ä½œå??ˆå?ç¶?backend-firebase/functions é©—è?
%%      - Rules è®Šæ›´?€?­é??æ­¸æ¸¬è©¦?‡ç??¬è¨»è¨˜ï??¿å? ACL æ¼‚ç§»
%%  ?€?€ AI Platform Control Planeï¼ˆGenkit + SaaS Workflowï¼‰â??€
%%    AI å¯«é?ï¼šUI/ServerAction ??L10 AI Flow Gateway ??Prompt Policy Guard ??Tool ACL ??Domain Commandï¼ˆL2ï¼?
%%    AI è®€?ˆï?UI/Parallel Routes ??L6 Query Gateway ??Projectionï¼ˆL5ï¼‰â? L10 Response Composerï¼ˆStreamingï¼?
%%    MUST:
%%      - IF ?²å…¥ AI flow THEN å¿…é??ˆé€šé? Prompt Policyï¼ˆæ??Ÿè?/è³‡æ??†ç?/ç§Ÿæˆ¶?Šç?ï¼?
%%      - IF AI ?€è¦è??™å???THEN Tool å¿…é?èµ?L1 Port + L7 Adapterï¼›ç?æ­?AI flow ?´é€?firebase/*
%%      - IF AI è§¸ç™¼å¯«å…¥ THEN å¿…é?ç¶?L2 Command Gatewayï¼Œç?æ­¢ç???Aggregate
%%      - IF AI ?æ??…å«å·¥å…·è¼¸å‡º THEN å¿…é?å¸?traceId / toolCallId / modelId ä¾?L9 è§€æ¸?
%%    SHOULD:
%%      - Parallel Routesï¼ˆchat/tool-panel/modal/consoleï¼‰å? slot ç¶­æ??¨ç? Suspense ?Šç??‡è??™é€šé?ï¼Œé¿?å–®é»é˜»å¡?
%%      - Streaming UI ??partial-first ç­–ç•¥ï¼šå??è?éª¨æ¶?‡ä?é¢¨éšª?§å®¹ï¼Œå?å¢é?è£œé?å·¥å…·çµæ?
%%  ?€?€ RULESET-MUSTï¼ˆä??¯é??ï?: R Â· S Â· A Â· # ?€?€
%%    R1=relay-lag-metrics   R5=DLQ-failure-rule   R6=workflow-state-rule
%%    R7=aggVersion-relay    R8=traceId-readonly    R9=context-propagation-middleware
%%    S1=OUTBOX-contract     S2=VersionGuard       S3=ReadConsistency
%%    S4=Staleness-SLA       S5=Resilience         S6=TokenRefresh
%%    A3=workflow-blockedBy  A5=scheduling-saga    A8=1cmd-1agg
%%    A9=scope-guard         A10=notification-stateless
%%    A12=global-search-authority   A13=notification-hub-authority
%%    A14=cost-semantic-dual-key
%%    A15=finance-lifecycle-gateï¼ˆé€²å…¥?˜é?ï¼štask ACCEPTED via Validator ?å¯?²å…¥ Financeï¼?
%%    A16=ï¼ˆå·²??#A21 ?‡ç?ï¼‰finance-request-independent-lifecycleï¼ˆVS9 Finance_Requestï¼?
%%    A17=skill-xp-award-contract
%%    A18=org-semantic-extension
%%    A19=task-lifecycle-convergenceï¼ˆVS5 ?€?‹å??‰æ€?+ Validator ?€ç¦?+ TaskAcceptedConfirmed ?Ÿå??–ï?
%%    A20=finance-staging-pool-rulesï¼ˆVS9 ?æ?å¼æ???+ LOCKED_BY_FINANCE ?“å??–å?ï¼?
%%    A21=finance-request-independent-lifecycleï¼ˆVS9 Finance_Requestï¼šDRAFT?’AUDITING?’DISBURSING?’PAIDï¼?
%%    A22=finance-task-feedback-projectionï¼ˆFinanceRequestStatusChanged ??L5 task-finance-label-viewï¼?
%%  ?€?€ VS8 æ­??è¦å?é«”ç³»ï¼ˆG/C/E/O/B Series Â· RULESET-MUSTï¼‰â??€
%%  ?€?€ è¨­è??•æ?ï¼šG/C/E/O/B äº”ç³»?—è??‡æ˜¯ VS8 P1-P10 ?¶æ?ç¼ºé™·?„å??´æ­£å¼è?ç¯„ï?Formal Specificationï¼‰ï?
%%  ?€?€   ?µå¾ª?¶æ?æ­?¢º?§å„ª?ˆå??‡ï?å¥§å¡å§†å??€ = æ­?¢º?½è±¡?æ?å°‘ç?å¼ç¢¼ï¼›ä»»ä½•é?è¦å??ˆç?æ§‹æ€§ä¿®æ­??ç¦æ­¢è£œä?è¦†è?
%%    G1=CTA-ssotï¼ˆå…¨?Ÿè?ç¾?SSOTï¼›æœª Active slug ä¸å¯å¼•ç”¨ï¼?
%%    G2=tag-lifecycle-unidirectionalï¼ˆDraft?’Active?’Stale?’Deprecatedï¼›ç?æ­¢è·³èº??†å?ï¼?
%%    G3=invariant-guard-supremeï¼ˆæ?é«˜è?æ±ºæ?ï¼›COMPLIANCE TaskNode å¿…é???cert_required Skillï¼?
%%    G4=cta-write-path-exclusiveï¼ˆå¯«?¥è·¯å¾‘å”¯ä¸€ï¼šCMD_GWAY?’CTAï¼›ç?æ­¢ç??ï?
%%    G5=governance-portal-review-requiredï¼ˆæ²»?†è??´å¼·??REVIEW_REQUIREDï¼›ç?æ­?SAFE_AUTOï¼?
%%    G6=staleness-monitor-sla-referenceï¼ˆå???SK_STALENESS_CONTRACTï¼›ç?æ­¢ç¡¬å¯«æ??“æ•¸?¼ï?
%%    G7=semantic-protocol-cross-sliceï¼ˆè·¨?‡ç?è¨Šè?å¿…å¸¶ semanticTagSlugsï¼›ç¼ºå¤±å³?”æˆªï¼?
%%    C1=subject-graph-boundaryï¼ˆVS8 ?ªç¶­è­·ä¸»é«”å?ï¼›å??œå???IER+L5 ?¿è?ï¼?
%%    C2=five-legal-edge-typesï¼ˆREQUIRES/HAS_SKILL/IS_A/DEPENDS_ON/TRIGGERSï¼›ç?æ­¢è‡ªå®šç¾©?Šï?
%%    C3=weight-calculator-exclusiveï¼ˆæ??‰é? weight ??weight-calculator è¨ˆç?ï¼›ç?æ­¢ç¡¬å¯«ï?
%%    C4=taxonomy-governanceï¼ˆIS_A ?Šå?é¡å­¸ä¿®æ”¹å¿…é?èµ?governance-portal [G4]ï¼?
%%    C5=no-orphan-nodeï¼ˆæ–°æ¨™ç±¤å¿…é??›çˆ¶ç¯€é»ï?å­¤ç?ç¯€é»ä?å¾?Activeï¼?
%%    C6=essence-type-classifierï¼ˆTaskNode.essence_type ?ªç”± cost-item-classifier è³¦å€¼ï?
%%    C7=materialize-as-inferenceï¼ˆshouldMaterializeAsTask ?¯æ¨?†ç??œï?override ??IS_A ?Šï?
%%    C8=granularity-learning-onlyï¼ˆSkillNode.granularity ?ªç”± learning-engine æ¼”å?ï¼?
%%    C9=person-node-readonly-projectionï¼ˆPersonNode ?¯è?ï¼›å”¯ä¸€?´æ–°è·¯å? ISemanticFeedbackPortï¼?
%%    C10=vector-sync-freshnessï¼ˆå??å??ˆè? CTA ?Œæ­¥ï¼›é??Ÿå??ä?å¾—ç”¨?¼æ¨?†ï?
%%    C11=vector-graph-dual-confirmationï¼ˆå??ç¸®ç¯?Graph ç¢ºè?ç¼ºä?ä¸å¯ï¼›ç?æ­¢ç??‘é?ä½œæ?çµ‚å?é¡ï?
%%    E1=edge-store-exclusiveï¼ˆæ??‰é??ä?å¿…é?ç¶?semantic-edge-storeï¼?
%%    E2=weight-calculator-sole-interfaceï¼ˆcomputeSimilarity ?¯ä?èªç¾©?¸ä¼¼åº¦ä??¢ï?
%%    E3=adjacency-list-topologyï¼ˆæ??²é??…å”¯ä¸€?ˆæ?è·¯å?ï¼? ?‹ä??¢ï?ç¦æ­¢?´é?æ­·ï?
%%    E4=cost-item-classifier-sole-entryï¼ˆISemanticClassificationPortï¼›ç?æ­¢å?ä¸²æ?å°å?é¡ï?
%%    E5=three-step-inferenceï¼ˆå??ç¸®ç¯„â?Graph ç¢ºè??’override ä¸‰æ­¥ä¸å¯è·³è?ï¼›è¼¸?ºå« inferenceTraceï¼?
%%    E6=inference-trace-mandatoryï¼ˆæ?æ¬¡æ¨?†å??ˆè¼¸??inferenceTrace[]ï¼›ç„¡ trace ç¦æ­¢?²å…¥ä¸‹æ¸¸ï¼?
%%    E7=skill-matcher-triple-gateï¼ˆtier+granularity è¦†è?åº?cert ä¸‰æ?ä»¶å…¨æ»¿ï?ç¦æ­¢?¨å??šé?ï¼?
%%    E8=causality-tracer-graph-onlyï¼ˆBFS ä¾†æ??¯ä?ï¼šTRIGGERS+DEPENDS_ON ?Šï?ç¦æ­¢?ªå?ç¾©å??œè??‡ï?
%%    E9=learning-engine-fact-events-onlyï¼ˆåª?¥å? VS3/VS5 äº‹å¯¦äº‹ä»¶ï¼›ç?æ­¢ç???ISemanticFeedbackPortï¼?
%%    E10=semantic-decay-sla-boundï¼ˆè¡°?€?±æ?ç¶å? SK_STALENESS_CONTRACTï¼›ç?æ­¢è??‹æ´»èºé?ï¼?
%%    E11=routing-engine-hint-onlyï¼ˆåªè¼¸å‡º SemanticRouteHintï¼›ç?æ­¢æ??‰å‰¯ä½œç”¨?–ç›´??VS6/VS7ï¼?
%%    E12=context-attention-unifiedï¼ˆfilterByContext ??VS8 çµ±ä?ï¼›ç?æ­¢å…¶ä»–å??‡è‡ªè¡Œé?æ¿¾è?ç¾©æ?å¢ƒï?
%%    O1=three-port-interfacesï¼ˆISemanticClassificationPort/ISkillMatchPort/ISemanticFeedbackPort ?¯ä??ºå£ï¼?
%%    O2=tag-snapshot-read-pathï¼ˆæ¥­?™ç«¯è®€?–å”¯ä¸€è·¯å???projection.tag-snapshotï¼?
%%    O3=task-semantic-view-completenessï¼ˆrequired_skills+eligible_persons å¿…é??Œæ?å­˜åœ¨ï¼?
%%    O4=causal-audit-log-with-traceï¼ˆæ?æ¢è??„å???inferenceTrace[]+traceIdï¼›ç?æ­¢é??°ç??ï?
%%    O5=tag-outbox-single-nodeï¼ˆVS8 ?¯ä? outboxï¼ŒDLQ=SAFE_AUTOï¼›ç?æ­¢é?è¤‡å?ç¾©ï?
%%    O6=tag-lifecycle-event-ier-pathï¼ˆTagLifecycleEventï¼štag-outbox?’RELAY?’IERï¼›ç?æ­¢ç??ï?
%%    B1=vs8-semantic-onlyï¼ˆVS8 ?ªå?èªç¾©?¨ç?ï¼›ç?æ­¢ç›´?¥è§¸?¼è·¨?‡ç??¯ä??¨ï?
%%    B2=governance-core-engine-output-unidirectionalï¼ˆå…§?¨ä?è³´å–®?‘ï?ç¦æ­¢?†å?ï¼?
%%    B3=ai-flow-port-onlyï¼ˆAI Flow ?ªèƒ½?é? ISemanticClassificationPort/ISkillMatchPort å­˜å? VS8ï¼?
%%    B4=taxonomy-vector-separationï¼ˆå?é¡å­¸?¯æœ¬é«”è?ï¼›å??æ˜¯èªè?è«–å·¥?·ï?ç¦æ­¢äº’ç›¸?–ä»£ï¼?
%%    B5=subject-graph-not-causal-executorï¼ˆVS8 ?¨è?? æ?è·¯å?ï¼›å??œåŸ·è¡Œæ­¸ IER+L5ï¼?
%%  ?€?€ RULESET-SHOULDï¼ˆå¯æ¼”å?æ²»ç?ï¼? D Â· P Â· T Â· E ?€?€
%%    D7=cross-slice-index-only   D24=no-firebase-import D26=cross-cutting-authority
%%    D27=cost-semantic-routing   D27-A=semantic-aware-routing-policy
%%    D27-Order=single-direction-chain   D27-Gate=task-materialization-gate   D22=strong-typed-tag-ref
%%    D28=vis-data-caching-pattern
%%    D29=transactional-outbox-pattern   D30=hop-limit-circular-dependency
%%    D31=permission-projection
%%    P6=parallel-routes-data-contract  P7=realtime-subscription-lifecycle
%%    P8=dynamic-backpressure-worker-pool
%%    E7=app-check-enforcement-closure  E8=genkit-tool-governance
%%    D21=VS8-semantic-engine-governanceï¼ˆå?å±¤è?ç¾©å???D21-1~D21-10 + D21-A~D21-Xï¼›å??´æ­£è¦è??‡è? G/C/E/O/B seriesï¼?
%%    D21-1=semantic-uniqueness(?’D21-A)   D21-2=strong-typed-tags(?’D22)  D21-3=node-connectivity(?’D21-C)
%%    D21-4=aggregate-constraint          D21-5=semantic-aware-routing(?’D27-A)
%%    D21-6=causal-auto-trigger           D21-7=read-write-separation    D21-8=freshness-defense(?’S4)
%%    D21-9=synaptic-weight-invariant     D21-10=topology-observability
%%    D21-A=?¯ä?è¨»å?å¾?  D21-B=Schema?–å?   D21-C=?¡å­¤ç«‹ç?é»?   D21-D=?‘é?ä¸€?´æ€? D21-E=æ¬Šé??æ???
%%    D21-F=æ³¨æ??›é???  D21-G=æ¼”å??é???  D21-H=è¡€?¦å??œBBB   D21-I=?¨å??±è?å¾? D21-J=?¥è?æº¯æ?
%%    D21-K=èªç¾©è¡ç?è£æ±º D21-S=?Œç¾©è©é?å®šå? D21-T=?½å??±è?å¾?   D21-U=ç¦æ­¢?è?å®šç¾©
%%    D21-V=?æ??–å?æ©Ÿåˆ¶ D21-W=è·¨ç?ç¹”é€æ???D21-X=èªç¾©?ªå?æ¿€??
%%    D22=å¼·å??¥å???  D27-A=èªç¾©?ŸçŸ¥è·¯ç”±
%%    P1=IER-lane-priority        P4=eligibility-query   P5=projection-funnel
%%    T1=tag-lifecycle-sub        T3=eligible-tag-logic  T5=tag-snapshot-readonly
%%    E2=OrgContextProvisioned    E3=ScheduleAssigned    E5=ws-event-flow   E6=claims-refresh
%%  ?€?€ RULESET-MUST Â· VS6 Workforce Scheduling SSOTï¼ˆç”¢?æ¨å°ç??Ÿï??€?€
%%    [D27-Order] ?®å??ˆï?WorkspaceItem ??WorkspaceTask ??Scheduleï¼ˆç?æ­¢è·³ç´šï?
%%    ?¥åº·è¨­è??ˆï?WorkspaceItem ??WorkspaceTaskï¼ˆç„¡?‚é?ï¼???WorkspaceScheduleï¼ˆæ??‚é?ï¼???OrganizationScheduleï¼ˆäºº?›æ?æ´¾ï?
%%    [D27-Gate] ä»»å??©å??¯ä??¥å£ï¼šshouldMaterializeAsTask()ï¼›å? EXECUTABLE ?¯ç‰©??
%%    [SK_SKILL_REQ] ?‡æ´¾?¡é?å¿…é?å¼•ç”¨è·¨ç?äººå??€æ±‚å?ç´?
%%    [VS8-Tag] ?½å??‡è?è¦ºåˆ¤å®šå??¯è? tag-snapshotï¼ˆç?æ­¢è? Account ?Ÿå??€?½è??™ï?
%%    [L5-Bus] Calendar/Timeline å±?Read Sideï¼Œå??¥ç‰©?–æ—¥?Ÿç¶­åº¦è?è³‡æ?ç¶­åº¦
%%    [S2] ?•å½±å¯«å…¥å¿…ç? applyVersionGuard()ï¼Œé˜²æ­¢ä?åºè?å¯?
%%    [L6-Gateway] UI ç¦æ­¢?´è? VS6/Firebaseï¼Œå??¯ç? Query Gateway è®€??
%%    [Timeline] overlap/resource-grouping ?è¼¯ä¸‹æ? L5ï¼Œå?ç«¯å?æ¸²æ?
%%  ?€?€ RULESET-MUST Â· VS3 Skill XP SSOTï¼ˆç”¢?æ¨å°ç??Ÿï??€?€
%%    [A17] XP ?ˆä?ä¾†æ?å¿…é???VS5 ä»»å?äº‹å¯¦ï¼ˆTaskCompletedï¼‰è??è³ªäº‹å¯¦ï¼ˆQualityAssessedï¼?
%%    [A17] è¨ˆç??¬å?ï¼šawardedXp = baseXp ? qualityMultiplier ? policyMultiplierï¼ˆå« min/max clampï¼?
%%    [A17] VS8 ?…æ?ä¾?semanticTagSlug / policy lookupï¼›XP ledger å¯«å…¥æ¬Šé??ªåœ¨ VS3
%%  ?€?€ RULESET-MUST Â· Layering Rulesï¼ˆå±¤ç´šé€šè?è¦å?ï¼‰â??€
%%    ?ˆè·¯?¤æ?ï¼šä»¥ Canonical Chains ?ºå”¯ä¸€?ºæ?ï¼ˆå¯«??/ è®€??/ Infra?ˆï?
%%    External ?¥å£?†æ?ï¼šå¯«?¥èµ° L2 CMD_GWAYï¼›è??–èµ° L6 QGWAY
%%    å¯«é?ç¦æ­¢?è·³ï¼›è??ˆç?æ­¢å??‘é??•å‘½ä»¤é?ï¼›Infra?ˆç?æ­¢è·³??L1 Port ??L7 ?Šç?
%%    L3 Slice ??L3 Slice = ç¦æ­¢?´æ¥ mutateï¼›å??¯é€é? L4 IER äº‹ä»¶?”ä? [#2 D9]
%%    L3 ??L5 Projection å¯«å…¥ = ç¦æ­¢?´å¯«ï¼›å??ˆç? event-funnel [#9 S2]
%%    L3 è®€?–è?ç¾?= ?…å¯ç¶?VS8 projection.tag-snapshot [D21-7 T5]
%%    ä»»æ?å±¤ç›´??firebase/* = ç¦æ­¢ï¼›å? L7 FIREBASE_ACL ?¯å‘¼??SDK [D24 D25]
%%  ?€?€ RULESET-MUST Â· Authority Exitsï¼ˆæ?å¨å‡º??™½?å–®ï¼‰â??€
%%    Search Exit     = global-search.sliceï¼ˆå”¯ä¸€è·¨å??œå?æ¬Šå?ï¼‰[D26 #A12]
%%    Side-effect Exit= notification-hub.sliceï¼ˆå”¯ä¸€?šçŸ¥?¯ä??¨å‡º???[D26 #A13]
%%    Semantic Exit   = VS8 Semantic Cognition Engineï¼ˆè?ç¾©è¨»???¨ç?/?•å½±ï¼‰[D21]
%%    Finance Routing = VS8 decision/_cost-classifier + VS5 Layer-3 gate [D27 #A14]
%%  ?€?€ RULESET-SHOULD Â· Governance Focusï¼ˆæ²»?†è?æ¼”å??¦é?ï¼‰â??€
%%    Stable Core     = R/S/A/#ï¼ˆHard Invariantsï¼Œç??¬æ??²ä??¯ç ´å£ï?
%%    Evolution Track = D/P/T/Eï¼ˆå¯æ¼”å?è¦å?ï¼Œä»¥ç´¢å?å¼•ç”¨ï¼Œä??è?å®šç¾©ï¼?
%%    Team Gate       = L/R/A ?Œæ??ç?ï¼ˆLayer/Rule/Atomicityï¼?
%%  ?€?€ RULESET-SHOULD Â· Downstream Prioritiesï¼ˆä?æ²‰å„ª?ˆæ??®ï??€?€
%%    1) Shared Kernel Contractsï¼šS4/R8/SK_CMD_RESULT ?†ä¸­å®šç¾©ï¼Œç?æ­¢å? Slice ?è?å®??
%%    2) Semantic Governanceï¼šD22 å¼·å??¥æ?ç±?+ VS8 cost-classifierï¼›æ¥­?™ç«¯ç¦æ­¢?ªå»º?†é??è¼¯
%%    3) Consistency Infrastructureï¼šS2 ä¸‹æ? Projection Bus/FIREBASE_ACLï¼›S3 ??L6 Query Gateway çµ±ä?è·¯ç”±
%%    4) Firebase ACLï¼šD24 ?´æ ¼?²è?ï¼›Feature Slice ?…å¯ä¾è³´ SK_PORTSï¼Œä?å¾—ç›´??firebase/*
%%    5) Authority Exitsï¼šD26 ?¶å£ Global Search / Notification Hubï¼Œæ¥­?™ç«¯?ªç”¢?Ÿä?å¯¦ä?ä»?
%%  ?€?€ OPTIMIZATION ADOPTIONï¼ˆè½?°æ¡ç´æ???Â· ?®å?ä¾è³´?ˆç?ï¼‰â??€
%%    MUST: IF ?€è¦å‘¼??Firebase SDK THEN å¿…é?ç¶?L7 FIREBASE_ACLï¼›ä? aggregateVersion å®ˆè?å¿…é???L5/L7 ?Ÿæ?
%%    MUST: IF äº‹ä»¶?ˆé?è¦?traceId THEN ?…èƒ½??CBG_ENTRY æ³¨å…¥ï¼›L9 ?…å¯è§€æ¸¬ä??¯ç???
%%    MUST: IF UI è®€?–æ¥­?™è???THEN å¿…é?ç¶?L6 Query Gatewayï¼›Timeline overlap/grouping å¿…é?ä¸‹æ? L5
%%    MUST: IF æ¶‰å? SLA/Outbox/Resilience/EventEnvelope THEN å¿…é?å¼•ç”¨ L1 å¥‘ç?ï¼Œä?å¾—å??‡å…§?å?ç¾?
%%    MUST: IF å±¬è·¨?‡å…±?¨å?ç´„ï?å¦?SK_SKILL_REQï¼‰THEN å¿…é??†ä¸­??L1ï¼Œå??‡å??¯å???
%%    MUST: IF æ¶‰å??¨å?èªç¾©è¨»å? THEN å¿…é???VS8 Core Domainï¼ˆCTA/tag-definitionsï¼‰å?ç¾©ï?IF æ¶‰å?çµ„ç?ä»»å?é¡å?/?€?½é??‹è?ç¾?THEN å¿…é???VS4 org-semantic-registryï¼ˆorg-task-type-registry + org-skill-type-registryï¼‰å?ç¾?
%%    SHOULD: IF è¨­è? L2 Command Gateway ä¸‹æ? THEN ?…ä?æ²‰å?ç´??‹åˆ¥??L1ï¼›å?èª¿æ?ç¨‹ä???L2
%%  ?€?€ L9 OBSERVABILITY BLUEPRINTï¼ˆé?é»é?å½?Â· ?¯ç›´?¥è½?°ï??€?€
%%    Ownership:
%%      - Contract Authority = L1 src/shared-kernel/observabilityï¼ˆtypes/interfaces onlyï¼?
%%      - Runtime Authority  = L9 src/shared-infra/observabilityï¼ˆmetrics/errors/trace sinksï¼?
%%    MUSTï¼ˆæ?å°å¯?¨é??°ï?:
%%      - Trace: CBG_ENTRY æ³¨å…¥ traceId ä¸€æ¬¡ï??¶é?ç¯€é»å”¯è®€ [R8]
%%      - Metrics: ?³å?è¦†è? command_count, command_latency_ms, query_count, query_latency_ms,
%%                 relay_lag_ms [R1], projection_apply_latency_ms, dlq_count_by_tier [R5]
%%      - Errors: çµ±ä?å¯«å…¥ DomainErrorEntryï¼›è‡³å°‘å?é¡?validation / auth / conflict / infra / security
%%      - Correlation: commandId/eventId/correlationId å¿…é??¯å??¥åˆ°å°æ? error ??metrics ?‚å?
%%    SHOULDï¼ˆå?è­¦å?ç´šï?:
%%      - P1: SECURITY_BLOCK DLQ?trace ?·é??AppCheck å¤±æ??‡ç•°å¸¸ï?ç«‹å³?Šè­¦ï¼?
%%      - P2: relay_lag è¶…é? SLA?projection å»¶é²è¶…æ??query p95 ?°å¸¸ï¼ˆå€¼ç­?Šè­¦ï¼?
%%      - P3: background lane ç©å??å–®?‡ç??¯èª¤?‡å?é«˜ï?å·¥ä??‚æ®µ?•ç?ï¼?
%%    Gateï¼ˆå?ä½µå??€ä½é??¶ï?:
%%      - æ¯å€‹æ–°å¢?L2/L4/L5/L6 è·¯å??½å??ˆå¸¶ traceId?è‡³å°?1 ??counter?? ??latency?? ??error mapping
%%      - ?¡æ??ä?è§€æ¸¬ç?è·¯å?è¦–ç‚º?ªå??ï?ä¸å?å®?? Doneï¼?
%%  ? â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â•£
%%  ARCHITECTURE CONTROL PLANEï¼ˆå?å¤§æ²»?†è???Â· è¦å??¥ç?ï¼?
%%  ?€?€ CP1 MUSTï¼šHard Invariantsï¼ˆç³»çµ±ç©©å®šåŸº?³ï??€?€
%%    ä»»ä??æ?ä¸å??´å?ï¼štraceId ?¯è?ï¼ˆR8ï¼‰ã€ç??¬å?è¡›ï?S2ï¼‰ã€SLA å¸¸æ•¸?®ä??Ÿç›¸ï¼ˆS4ï¼‰ã€?
%%    è·¨å??‡å…¬??API ?Šç?ï¼ˆD7ï¼‰ã€å‰¯ä½œç”¨?‡æ?å°‹æ?å¨å‡º???A12/A13ï¼‰ã€?
%%  ?€?€ CP2 MUSTï¼šCross-cutting Authoritiesï¼ˆè·è²¬é??Œè?æ¬Šå??ºå£ï¼‰â??€
%%    ?¨å??œå??ªç? Global Searchï¼›é€šçŸ¥?¯ä??¨åªç¶?Notification Hubï¼?
%%    ä»»å?èªç¾©?‡æ??¬æ±ºç­–ç”± VS8 ?ä??¨å??ºç?ï¼›ç?ç¹”è‡ªè¨‚ä»»?™é????€?½é??‹è?ç¾©å??ˆç? VS4 org-semantic-registry æ²»ç?ä¸¦æ?å½±åˆ° tag-snapshot??
%%  ?€?€ CP3 MUSTï¼šLayering Rulesï¼ˆå±¤ç´šé€šè?ï¼‰â??€
%%    ?½ä»¤??L2 ?¶å£?ä?ä»¶ç”± L4 ?†ç™¼?æ?å½±ç”± L5 ?©å??è??–ç”± L6 ?´éœ²ï¼?
%%    Feature Slice ä¸å?è·¨å±¤?è·¯ï¼ˆå« Firebase SDK ?è·¯??Projection ?´å¯«ï¼‰ã€?
%%  ?€?€ CP4 SHOULDï¼šGovernance Rulesï¼ˆæ²»?†è?æ¼”å?ï¼‰â??€
%%    ?°è??‡å?ç´¢å??å?å¯¦ä?ï¼›å„ª?ˆå??¨ç¾?‰å?ç´„ï??¨å?èªç¾©??VS8 è¨»å?ï¼Œç?ç¹”ä»»?™é????€?½é??‹è?ç¾©é€?VS4 org-semantic-registry è¨»å?ï¼?
%%    D27 å±?Extension Gateï¼Œå?å½±éŸ¿ document-parser / finance-routing è®Šæ›´??
%%  ? â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â•£
%%  ?€?€ FINAL REVIEW BASELINEï¼ˆæ?çµ‚æ?å¯©æŸ¥?ºæ? Â· Team Gateï¼?
%%  ?€?€ ?€é«˜è?æ±ºå??‡ï??¶æ?æ­?¢º?§å„ª?ˆï?Architectural Correctness Firstï¼‰ï?å¥§å¡å§†å??€ = æ­?¢º?½è±¡?æ?å°‘ç?å¼ç¢¼ï¼›æ¶æ§‹é?è¦é›¶å®¹å?
%%  ?€?€ Scopeï¼ˆæœ¬è¼ªå?å¯©ï??€?€
%%    1) VS0~VS8ï¼šæ??‹ç·¨?Ÿå?å¿…é??‰æ?ç¢ºå±¤ä½è??®ä??·è²¬ï¼ˆVS0=L1+L0+L2+L4+L5+L6+L7+L8+L9+L10ï¼›VS1~VS8=L3ï¼?
%%    1a) VS0 æª¢æ ¸ï¼šæ???VS0 è·¯å?å¿…é?æ¨™æ? VS0-Kernel ??VS0-Infraï¼ˆä?å¾—æ··ç¨±ï?
%%    2) D1~D31ï¼šå???Mandatory Gateï¼ˆD27 ??Extension Gateï¼Œå‘½ä¸­å ´?¯å?å¯©ï?D29/D30/D31 ?ºæ–°å¢?Gateï¼?
%%    2a) E7/E8ï¼šå±¬ AI/Firebase Security ?‰ç’° Gateï¼ˆå‘½ä¸?AI flow ?–å?ä¿è­·?¥å£?‚å?å¯©ï?
%%    2b) G1~G7/C1~C11/E1~E12/O1~O6/B1~B5ï¼šVS8 æ­??è¦å? Gateï¼ˆå‘½ä¸­è?ç¾©å?ä»»ä?æ¨¡ç??‚å?å¯©ï??•è?å¿…é?çµæ??§ä¿®æ­??
%%    3) TE1~TE6ï¼šè?ç¾©å??¨å??ˆå¼·?‹åˆ¥ï¼Œç?æ­¢è£¸å­—ä¸² tagSlug
%%    4) S1~S6ï¼šå?ç´„è? SLA ?…èƒ½å¼•ç”¨ SK_* å¸¸æ•¸ï¼Œç?æ­¢ç¡¬å¯?
%%    5) L/R/Aï¼šLayer ?ˆè? / Rule ?ˆè? / Atomicity ?ˆè? å¿…é??Œæ??ç?
%%    6) Boundary Serialization Gateï¼šClient -> Server action ?…å?è¨?Command DTOï¼ˆplain objectï¼?
%%  ?€?€ Rule Canonicalityï¼ˆå–®ä¸€å®šç¾©æ²»ç?ï¼‰â??€
%%    Canonical Rule Bodyï¼šUNIFIED DEVELOPMENT RULESï¼ˆD1~D27 + E7/E8ï¼?
%%    Secondary Sectionsï¼ˆKEY INVARIANTS / FORBIDDEN / Quick Referenceï¼‰åª?è¨±?Œç´¢å¼•å???+ å¯©æŸ¥èªå¥?ï?ä¸å??´å¯«ç¬¬ä?ä»½è??‡æ­£??
%%    IF Secondary ??Canonical è¡ç? THEN ä»?Canonical ?ºæ?ï¼ŒSecondary å¿…é??¨å?ä¸€ PR ä¿®æ­£
%%    IF ?°å?è¦å? THEN å¿…é??ˆåœ¨ Canonical å®šç¾©ï¼Œå??å¡«ç´¢å?ï¼ˆé¿?é??ç??¸ï?
%%  ?€?€ D27 å®šä?ï¼ˆæ“´å±•ï??€?€
%%    D27ï¼ˆæ??¬è?ç¾©è·¯?±ï???Extension Gateï¼›å???document-parser / finance-routing è®Šæ›´?‚å¼·?¶å¯©??
%%  ?€?€ No-Smell å®šç¾©ï¼ˆå¯ä½œç‚º Code Review Checklistï¼‰â??€
%%    - ?¡é?è¤‡å?ç¾©ï??Œä?è¦å??ªä??™ä??‹ä¸»å®šç¾©ï¼Œå…¶ä»–ä?ç½®å??šç´¢å¼•å???
%%    - ?¡é??Œæ±¡?“ï?Feature Slice ä¸è·¨?Šç? mutate?ä??´é€?firebase/* [D24]
%%    - ?¡è?ç¾©æ?ç§»ï?tag èªç¾©å¿…é?ä¾†è‡ª?ŒVS8 CTA ?¨å?æ¨™ç±¤?æ??ŒVS4 çµ„ç?æ¨™ç±¤æ²»ç??å?æ³•ä?æº?[D21-1 D22]
%%    - ?¡ä??´æ€§ç ´???Projection ?¨é??µå? S2ï¼›SLA ?¨é??µå? S4
%%    - ?¡å‰¯ä½œç”¨?è·¯ï¼šé€šçŸ¥?‡æ?å°‹å??ˆç? D26 æ¬Šå??ºå£
%%  ? â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â•£
%%  KEY INVARIANTSï¼ˆRULESET-MUST / çµ•å??µå?ï¼?
%%    [R8]  traceId ??CBG_ENTRY æ³¨å…¥ä¸€æ¬¡ï??¨é??¯è?ä¸å¯è¦†è?
%%    [S2]  ?€??Projection å¯«å…¥?å??ˆå‘¼??applyVersionGuard()
%%    [S4]  SLA ?¸å€¼åª?½å???SK_STALENESS_CONTRACTï¼Œç?æ­¢ç¡¬å¯?
%%    [D7]  è·¨å??‡å??¨åª?½é€é? {slice}/index.ts ?¬é? API
%%    [D21] VS8 ?›å±¤èªç¾©å¼•æ?ï¼šGovernance ??Core Domain ??Compute Engine ??Output
%%           ï¼ˆå??‰æ¨¡çµ„ï?registry/protocol/guards/portal ??CTA/hierarchy/vector/tags ??graph/reasoning/routing/learning ??projections/io/decisionï¼?
%%    [D21-A] ?™å±¤è¨»å?å¾‹ï??¨å?èªç¾©??VS8 core/tag-definitions.tsï¼›ç?ç¹”ä»»?™é????€?½é??‹è?ç¾©åœ¨ VS4 org-semantic-registryï¼ˆorg-task-type-registry + org-skill-type-registryï¼‰è¨»??
%%    [D21-B] Schema ?–å?ï¼šæ?ç±¤å??¸æ?å¿…é?ç¬¦å? core/schemasï¼Œç?æ­¢é?? æœª?¡é??„é?çµæ??–å±¬??
%%    [D21-C] ?¡å­¤ç«‹ç?é»ï?æ¯å€‹æ–°æ¨™ç±¤å¿…é??é? hierarchy-manager.ts ?›è??³å?ä¸€?‹çˆ¶ç´šç?é»?
%%    [D21-D] ?‘é?ä¸€?´æ€§ï?embeddings/vector-store.ts ?‘é?å¿…é??¨æ?ç±¤å?ç¾©å?æ­¥åˆ·??
%%    [D21-E] æ¬Šé??æ??–ï?èªç¾©?¸ä¼¼åº¦è?è·¯å?æ¬Šé?å¿…é???weight-calculator.ts çµ±ä??¢å‡ºï¼Œç?æ­¢æ¥­?™ç«¯?ªè?? æ?
%%    [D21-F] æ³¨æ??›é??¢ï?context-attention.ts ?ˆæ ¹??Workspace ?…å??æ¿¾?¡é?æ¨™ç±¤
%%    [D21-G] æ¼”å??é??°ï?learning-engine.ts ?…èƒ½??VS3/VS2 ?Ÿå¯¦äº‹å¯¦äº‹ä»¶é©…å?ï¼Œç?æ­¢æ??•éš¨æ©Ÿä¿®??
%%    [D21-H] è¡€?¦å???BBB)ï¼šinvariant-guard.ts å°è?ç¾©è?çªæ??‰æ?é«˜è?æ±ºæ?ï¼Œå¯?´æ¥?”æˆª?æ?
%%    [D21-I] ?¨å??±è?å¾‹ï?æ¨™ç±¤æ²»ç??‹æ”¾?¨éƒ¨çµ„ç??¨æˆ¶?æ?ï¼Œå??ˆé€šé? consensus-engine ?è¼¯?¡é?
%%    [D21-J] ?¥è?æº¯æ?ï¼šæ?æ¢æ?ç±¤é?ä¿‚å»ºç«‹é?æ¨™è¨»è²¢ç»?…è??ƒè€ƒä??šï??·å??ˆæœ¬?æº¯?½å?
%%    [D21-K] èªç¾©è¡ç?è£æ±ºï¼šinvariant-guard ?µæ¸¬?°é??ç‰©?†é?è¼¯ç??¯ç??‚ç›´?¥æ?çµ•æ?æ¡?
%%    [D21-S] ?Œç¾©è©é?å®šå?ï¼šæ?ç±¤å?ä½µå??Šæ?ç±¤æ???Aliasï¼Œè‡ª?•é?å®šå??³ä¸»æ¨™ç±¤ï¼Œæ­·?²æ•¸?šä??·é?
%%    [D21-T] ?½å??±è?å¾‹ï?é¡¯ç¤º?ç¨±?±ç¤¾ç¾¤è²¢?»åº¦æ±ºå?ï¼ŒtagSlug æ°¸ä?ä¸è?
%%    [D21-U] ç¦æ­¢?è?å®šç¾©ï¼šæ–°å¢æ?ç±¤æ? embeddings å¿…é??³æ??ç¤º?¸ä¼¼æ¨™ç±¤
%%    [D21-V] ?æ??–å?ï¼šè??¼ã€Œä½µè³¼çˆ­è­°ä¸­?ç?æ¨™ç±¤æ¨™è¨» Pending-Syncï¼Œè·¯?±æ??å?çµç›´?°å…±è­˜å???
%%    [D21-W] è·¨ç?ç¹”é€æ??§ï?æ¨™ç±¤ä¿®æ”¹ç´€?„å??¨å??¬é?ï¼Œä»»ä½•ç?ç¹”å¯?¥ç?æ¼”å?æ­·ç?
%%    [D21-X] èªç¾©?ªå?æ¿€?¼ï??¨æˆ¶??? A+B ??causality-tracer ?ªå?å»ºè­°?¸é?æ¨™ç±¤ C
%%    [D21-6] TagLifecycleEvent ??VS8 Causality Tracer ?ªå??¨å??—å½±?¿ç?é»ä¸¦?¼å??´æ–°äº‹ä»¶
%%    [D21-7] èªç¾©è®€?–å??ˆç???projection.tag-snapshotï¼›å¯«?¥å??ˆç? CMD_GWAY ?²å…¥ VS8 CTAï¼ˆå…¨?Ÿï???VS4 org-semantic-registryï¼ˆç?ç¹”ï?
%%    [D21-8] TAG_STALE_GUARD ??30sï¼Œæ??‰è?ç¾©æŸ¥è©¢å??ˆå???SK_STALENESS_CONTRACT
%%    [D21-9] çªè§¸æ¬Šé?ä¸è??ï?SemanticEdge.weight ??[0.0, 1.0]ï¼›cost = 1/weightï¼ˆå¼·???=è¿‘é„°ï¼?
%%    [D21-10] ?“æ’²?¯è?æ¸¬æ€§ï?findIsolatedNodes å¿…é?å®šæ??å ±å­¤ç?ç¯€é»ï?D21-3 ?•è??µæ¸¬ï¼?
%%    [T5] æ¥­å? Slice ?…èƒ½è¨‚é–± projections/tag-snapshot.slice.tsï¼Œåš´ç¦ç›´?¥å???graph/adjacency-list.tsï¼?
%%         DocumentParser UI è¦–è¦ºå±¬æ€§ï??²å½©/icon/?†é?é¡¯ç¤ºï¼‰å??ˆé€é? semantic-graph.slice ?•å½±?–å?
%%    [D22] ç¨‹å?ç¢¼ç?æ­¢å‡º?¾è£¸å­—ä¸² tag_nameï¼›å…¨?Ÿæ?ç±¤é?å¼•ç”¨ TE1~TE6ï¼Œç?ç¹”è‡ªè¨‚æ?ç±¤é?ä½¿ç”¨ OrgTagRef(orgId, tagSlug)
%%    [D27-A] èªç¾©?ŸçŸ¥è·¯ç”±ï¼šæ??‰å??¼é?è¼¯å??ˆå?èª¿ç”¨ policy-mapper/ è½‰æ?èªç¾©æ¨™ç±¤ï¼Œç?æ­?ID ç¡¬ç·¨ç¢¼è·¯??
%%    [D24] Feature slice ç¦æ­¢?´æ¥ import firebase/*ï¼Œå??ˆèµ° SK_PORTS
%%    [D26] global-search = ?¯ä??œå?æ¬Šå?ï¼›notification-hub = ?¯ä??¯ä??¨å‡º??
%%    [#A12] Global Search = ?¯ä?è·¨å??œå??ºå£ï¼Œç?æ­¢å? Slice ?ªå»º?œå??è¼¯
%%    [#A13] Notification Hub = ?¯ä??¯ä??¨å‡º???æ¥­å? Slice ?ªç”¢?Ÿä?ä»¶ä?æ±ºå??šçŸ¥ç­–ç•¥
%%    [#A14] ParsedLineItem.(costItemType, semanticTagSlug) (Layer-2) ??VS8 _cost-classifier.ts æ¨™æ³¨ï¼?
%%           Layer-3 Semantic Router ?ªå?è¨?EXECUTABLE ?…ç›®?©å???tasksï¼Œä?ä»?semanticTagSlug å°é? tag-snapshotï¼?
%%           ?¶é?é¡å?ï¼ˆMANAGEMENT/RESOURCE/FINANCIAL/PROFIT/ALLOWANCEï¼‰é?é»˜è·³?ä¸¦ toast
%%    [#A15] Finance ?²å…¥?˜é?ï¼šä»»?™å??ˆé???ACCEPTEDï¼ˆé€šé? task-accepted-validator [#A19]ï¼‰æ??¯é€²å…¥ Finance Staging Poolï¼?
%%           Finance ?¨ç??Ÿå‘½?±æ???VS9 ç®¡ç?ï¼ˆ[#A21] Finance_Requestï¼šDRAFT?’AUDITING?’DISBURSING?’PAIDï¼?
%%    [#A16] ï¼ˆå·²??#A21 ?‡ç??–ä»£ï¼‰Finance_Request ?Ÿå‘½?±æ?ï¼šDRAFT?’AUDITING?’DISBURSING?’PAIDï¼?
%%           Workflow Completed æ¢ä»¶?ºæ??‰é???Finance_Request.status = PAIDï¼?
%%           ç¦æ­¢?¨æ–°å·¥ä?ä¸­å???#A16
%%  FORBIDDENï¼ˆRULESET-FORBIDDENï¼?
%%    BC_X ç¦æ­¢?´æ¥å¯«å…¥ BC_Y aggregate ??å¿…é??é? IER Domain Event
%%    TX Runner ç¦æ­¢?¢ç? Domain Event ???ªæ? Aggregate ?¯ä»¥ [#4b]
%%    SECURITY_BLOCK DLQ ??ç¦æ­¢?ªå? Replayï¼Œå??ˆäººå·¥å¯©??
%%    B-track ç¦æ­¢?å‘¼ A-track ???ªèƒ½?é? Domain Event æºé€?
%%    Feature slice ç¦æ­¢?´æ¥ import firebase/* [D24]
%%    Feature slice ç¦æ­¢?´æ¥ import @/shared-infra/*ï¼›å??¯ä?è³?SK_PORTS / Query Gateway / slice public API
%%    Notification Hub ç¦æ­¢?´æ¥ä¾è³´ L7 ?·é? Adapterï¼ˆå« RTDB_ADP/FCM_ADPï¼‰ï?å¿…é?ç¶?Port ??Gateway ?¬é?ä»‹é¢
%%    Feature slice ç¦æ­¢?ªå»º?œå??è¼¯ï¼Œå??ˆé€é? Global Search [D26 #A12]
%%    Feature slice ç¦æ­¢?´æ¥ call sendEmail/push/SMSï¼Œå??ˆé€é? Notification Hub [D26 #A13]
%%    ç¦æ­¢ L6 Query Gateway ?å?é©…å? L2 Command Gatewayï¼ˆè?å¯«é?ä¸å?å½¢æ??é??°ï?
%%    ç¦æ­¢ VS8 ?´æ¥ä¸‹å‘½ä»¤è‡³ VS5/VS6ï¼›å??¯é€é? L4 äº‹ä»¶??L5/L6 ?•å½±äº’å?
%%    VS5 document-parser ç¦æ­¢?ªè?å¯¦ä??æœ¬èªç¾©?è¼¯ï¼Œå??ˆå‘¼??VS8 classifyCostItem() [D27 #A14]
%%    Layer-3 Semantic Router ç¦æ­¢ç¹é? costItemType ?´æ¥?©å???EXECUTABLE ?…ç›®??tasks [D27]
%%    Workflow ç¦æ­¢?¨ä»»??Acceptance ?ªé? ACCEPTEDï¼ˆtask-accepted-validator ?šé?ï¼‰å??²å…¥ Finance [#A15 #A19]
%%    ç¦æ­¢å¤–éƒ¨?å??´æ¥ä¿®æ”¹ VS5 ä»»å??€?‹ï??€?‹åª?½ç”± VS5 Aggregate ?§éƒ¨é©…å? [#A19]
%%    ç¦æ­¢ VS5 ?´æ¥?¼å« VS9 Finance API ?–å¯«??VS9 Aggregateï¼›å??¯é€é? TaskAcceptedConfirmed äº‹ä»¶ [#A19 #A20]
%%    ç¦æ­¢ VS9 ?´æ¥?¼å« VS5 API ?–å¯«??VS5 Aggregate [#A20]
%%    ç¦æ­¢?ºå?ä¸€?¹æ¬¡ä»»å?å»ºç??©å€?Finance_Requestï¼ˆLOCKED_BY_FINANCE ?²æ­¢?è?è«‹æ¬¾ï¼‰[#A20 #A21]
%%    Finance_Staging_Pool ç¦æ­¢æ¶ˆè²»?¹ç›´?¥å¯«?¥ï??¯ä?å¯«å…¥è·¯å???L5 Projection Bus [#A20]
%%    ?ç«¯ç¦æ­¢?´è? VS9 Finance ?Ÿè??™å??ä»»?™é¡¯ç¤ºï?å¿…é??é? task-finance-label-view ?•å½± [#A22]
%%    ParsingIntent.lineItems ç¦æ­¢ç¼ºå? semanticTagSlugï¼›UI è¦–è¦ºå±¬æ€§ç?æ­¢ç›´?¥è? adjacency-listï¼Œå??ˆè? tag-snapshot [T5]
%%    æ¥­å??‡ç?ï¼ˆVS1~VS6ï¼Œé™¤ VS4 org-semantic-registryï¼‰ç?æ­¢ç??ªå®£?Šè?ç¾©é??¥ï?çµ„ç??ªè?ä»»å?é¡å?/?€?½é??‹è?ç¾©å??ˆé€é? VS4 æ²»ç?æµç? [D21-1]
%%    ç¦æ­¢ä½¿ç”¨?±æ€§å?ä¸²å‚³?è?ç¾©ï??¨å?å¼•ç”¨å¿…é??‡å? TE1~TE6ï¼Œç?ç¹”è‡ªè¨‚å??¨å??ˆæ???OrgTagRef [D21-2]
%%    å­¤ç?æ¨™ç±¤ï¼ˆç„¡ parentTagSlug æ­¸å±¬ï¼‰ç?æ­¢åœ¨ç³»çµ±ä¸­å??¨ï??ˆæ­¸?¥å?é¡å­¸ [D21-3]
%%    è·¨å??‡æ±ºç­–ï??’ç­è·¯ç”±/?šçŸ¥?†ç™¼ï¼‰ç?æ­¢ç¡¬ç·¨ç¢¼æ¥­å?å°è±¡ IDï¼Œå??ˆåŸº?¼æ?ç±¤è?ç¾©æ???[D21-5]
%%    èªç¾©è®€?–ç?æ­¢ç›´????™åº«ï¼Œå??ˆç???projection.tag-snapshot [D21-7]
%%    æ¥­å?ç«¯ç?æ­¢ç›´?¥å???graph/adjacency-list.tsï¼Œå??ˆé€é? tag-snapshot [T5]
%%    æ¥­å?ç«¯ç?æ­¢è‡ªè¡Œè?ç®—è?ç¾©ç›¸ä¼¼åº¦/? æ?ï¼Œå??ˆé€é? weight-calculator.ts [D21-E]
%%    ?šçŸ¥/?’ç­?†ç™¼ç¦æ­¢?ºæ–¼æ¥­å? ID ç¡¬ç·¨ç¢¼è·¯?±ï?å¿…é?èµ?policy-mapper/ èªç¾©? å? [D27-A]
%%    learning-engine.ts ç¦æ­¢?‹å??¨æ?ä¿®æ”¹ç¥ç??ƒå¼·åº¦ï?å¿…é???VS3/VS2 äº‹å¯¦äº‹ä»¶é©…å? [D21-G]
%%    èªç¾©è¡ç??æ?ç¦æ­¢ç¹é? invariant-guard.tsï¼ŒBBB ?æ??€é«˜è?æ±ºæ? [D21-H D21-K]
%%    ?ˆä½µ?æ??šé?å¾Œç?æ­¢ç›´?¥åˆª?¤è?æ¨™ç±¤ï¼Œå??ˆè???Alias ?ªå??å??‘æ­·?²å???[D21-S]
%%    ?¨æˆ¶?°å??è?èªç¾©æ¨™ç±¤?‚ç?æ­¢é?é»˜å»ºç«‹ï?embeddings å¿…é??³æ??ç¤º?¸ä¼¼æ¨™ç±¤ [D21-U]
%%    VS8 ç¦æ­¢?´æ¥å¯«å…¥ VS3 XP aggregate/ledgerï¼›å??¯æ?ä¾?semanticTag ??policy lookup [A17]
%%    VS5 ä»»å?/?è³ªæµç?ç¦æ­¢?´æ¥ mutate VS3 XPï¼›å??ˆé€é? IER äº‹ä»¶?²å…¥ VS3 [#2 D9 A17]
%%    ?€?€ VS8 G/C/E/O/B ç³»å??¸å?ç¦ä»¤ ?€?€
%%    ç¦æ­¢ä»»ä?æ¨¡ç?ç¹é? CMD_GWAY ?´æ¥å¯«å…¥ CTA?Graph ?Šæ? VS8 ?§éƒ¨?€??[G4]
%%    ç¦æ­¢ä»¥ç??‘é??¸ä¼¼åº¦ä??€çµ‚å?é¡ä??šï??‘é?ç¸®ç?å¾Œå???Graph ç¢ºè? [C11 E5]
%%    ç¦æ­¢æ¥­å?ç«¯æ? AI Flow ?ªè?è¨ˆç???weightï¼›æ???weight ??weight-calculator çµ±ä?è¨ˆç? [C3 E2]
%%    ç¦æ­¢??VS8 ä»»ä?å­æ¨¡çµ„ä¸­?·è?è·¨å??‡å‰¯ä½œç”¨ï¼ˆé€šçŸ¥?æ??­ã€ç‰©?–ï?[B1 E11]
%%    ç¦æ­¢æ¥­å?ç«¯ç???Port ?´æ¥?¼å« VS8 ?§éƒ¨æ¨¡ç?ï¼ˆsemantic-edge-store?causality-tracer ç­‰ï?[O1 B3]
%%    ç¦æ­¢ PersonNode è¢«ä»»ä½•è·¯å¾‘ç›´?¥å¯«?¥ï??¯ä??´æ–°è·¯å???ISemanticFeedbackPort [C9]
%%    ??inferenceTrace[] ?„æ¨?†ç??œè??ºä?å®Œæ•´ï¼Œç?æ­¢é€²å…¥ä»»ä?ä¸‹æ¸¸æµç? [E6]
%%    routing-engine ç¦æ­¢?´å‘¼ VS6 ?’ç­??VS7 ?šçŸ¥ï¼›åªè¼¸å‡º SemanticRouteHint [E11]
%%    VS8 ?§éƒ¨ä¾è³´?®å?ï¼šGovernance?’Core?’Engine?’Outputï¼›ç?æ­¢é€†å? import [B2]
%%    IS_A ?†é?å­¸ï??¬é?è«–ï????‘é?å·¥å…·ï¼ˆè?è­˜è?ï¼‰ï?ç¦æ­¢ä»¥ä??…å?ä»?¦ä¸€??[B4]
%%    VS8 ?ªæ¨è«–å??œé?ï¼Œä??©å?? æ??¯ä??¨ï?? æ??·è?æ­?IER+L5 [B5]
%%    cost-item-classifier ä¸‰æ­¥?¨ç?ä¸å¯è·³è?ï¼ˆå??ç¸®ç¯„â?Graph ç¢ºè??’overrideï¼‰ï?è¼¸å‡ºå¿…é???inferenceTrace[] [E5]
%%    skill-matcher ä¸‰æ?ä»¶å…¨æ»¿æ??ˆæ ¼ï¼štier + granularity è¦†è?åº?+ cert_required è­‰ç…§ï¼›ç?æ­¢éƒ¨?†é€šé? [E7]
%%    TagLifecycleEvent å»?’­å¿…é?ç¶?tag-outbox?’RELAY?’IERï¼›ç?æ­¢ç???IER [O5 O6]
%%    èªç¾©æ²»ç?è®Šæ›´ DLQ å¼·åˆ¶ REVIEW_REQUIREDï¼›ç?æ­?SAFE_AUTO replay [G5]
%%  ?šâ??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â?

flowchart TD

%% ?â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â???
%% VS0 FOUNDATION ?€?€ SAME DOMAIN, SPLIT VIEWï¼ˆVS0-Kernel + VS0-Infraï¼?
%% ?â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â???

subgraph VS0_FOUNDATION["?§± VS0 Â· Foundationï¼ˆsrc/shared-kernel + src/shared-infraï¼?]
    direction LR

subgraph SK["?”· L1 Â· Shared Kernelï¼ˆVS0-Kernel Â· src/shared-kernelï¼‰â€?å¥‘ç?/å¸¸æ•¸/ç´”å‡½å¼ï?No I/Oï¼?]
    direction TB

    subgraph SK_DATA["?? ?ºç?è³‡æ?å¥‘ç?ï¼ˆsrc/shared-kernel/data-contractsï¼‰[#8]"]
        direction LR
        SK_ENV["event-envelope\nversion Â· traceId Â· causationId Â· correlationId Â· timestamp Â· hopCount\nidempotency-key = eventId+aggId+version\n[R8] traceId ?´é??±äº«?»ä??¯è??‹\n[D30] hopCount æ¯ç? IER è½‰ç™¼ +1ï¼›â‰¥ 4 ??CircularDependencyDetected + SECURITY_BLOCK ?Šè­¦\ncausationId = è§¸ç™¼æ­¤ä?ä»¶ç??½ä»¤/äº‹ä»¶ ID\ncorrelationId = ?Œä? saga/replay ?„é???ID"]
        SK_AUTH_SNAP["authority-snapshot\nclaims / roles / scopes\nTTL = Token ?‰æ???]
        SK_SKILL_TIER["skill-tierï¼ˆç??½å?ï¼‰\ngetTier(xp)?’Tier\næ°¸ä?å­?DB [#12]"]
        SK_SKILL_REQ["skill-requirement\ntagSlug ? minXp\nè·¨ç?äººå??€æ±‚å?ç´?]
        SK_CMD_RESULT["command-result-contract\nSuccess { aggregateId, version }\nFailure { DomainError }\n?ç«¯æ¨‚è??´æ–°ä¾æ?"]
    end

    subgraph SK_INFRA["?™ï? ?ºç?è¨­æ–½è¡Œç‚ºå¥‘ç?ï¼ˆsrc/shared-kernel/infra-contractsï¼‰[#8]"]
        direction LR

        SK_OUTBOX["?“¦ SK_OUTBOX_CONTRACT [S1]\n??at-least-once\n   EventBus ??OUTBOX ??RELAY ??IER\n??idempotency-key å¿…å¸¶\n   ?¼å?ï¼ševentId+aggId+version\n??DLQ ?†ç?å®??ï¼ˆæ? OUTBOX å¿…å¡«ï¼‰\n   SAFE_AUTO      ?ªç?äº‹ä»¶?»è‡ª?•é?è©¦\n   REVIEW_REQUIRED ?‘è?/?’ç­/è§’è‰²?»äººå·¥å¯©\n   SECURITY_BLOCK  å®‰å…¨äº‹ä»¶?»å?çµ??Šè­¦"]

        SK_VERSION["?”¢ SK_VERSION_GUARD [S2]\nevent.aggregateVersion\n  > view.lastProcessedVersion ???è¨±?´æ–°\n  ?¦å? ??ä¸Ÿæ?ï¼ˆé??Ÿä?ä»¶ä?è¦†è?ï¼‰\n?©ç”¨?¨éƒ¨ Projection [#19]"]

        SK_READ["?? SK_READ_CONSISTENCY [S3]\nSTRONG_READ  ??Aggregate ?æ?\n  ?©ç”¨ï¼šé??ãƒ»å®‰å…¨?»ä??¯é€†\nEVENTUAL_READ ??Projection\n  ?©ç”¨ï¼šé¡¯ç¤ºãƒ»çµ±è??»å?è¡¨\nè¦å?ï¼šé?é¡??ˆæ?/?’ç­è¡ç? ??STRONG_READ"]

        SK_STALE["??SK_STALENESS_CONTRACT [S4]\nTAG_MAX_STALENESS    ??30s\nPROJ_STALE_CRITICAL  ??500ms\nPROJ_STALE_STANDARD  ??10s\n?„ç?é»å??¨æ­¤å¸¸æ•¸?»ç?æ­¢ç¡¬å¯«æ•¸??]

        SK_RESILIENCE["?›¡ SK_RESILIENCE_CONTRACT [S5]\nR1 rate-limit   per user ??per org ??429\nR2 circuit-break ??? 5xx ???”æ–·\nR3 bulkhead     ?‡ç??”æ¿?»ç¨ç«‹åŸ·è¡Œç?æ± \n?©ç”¨ï¼š_actions.ts / Webhook / Edge Function"]

        SK_TOKEN["?? SK_TOKEN_REFRESH_CONTRACT [S6]\nè§¸ç™¼ï¼šRoleChanged | PolicyChanged\n  ??IER CRITICAL_LANE ??CLAIMS_HANDLER\nå®Œæ?ï¼šTOKEN_REFRESH_SIGNAL\nå®¢ç«¯ç¾©å?ï¼šå¼·?¶é???Firebase Token\nå¤±æ?ï¼šâ? DLQ SECURITY_BLOCK + ?Šè­¦"]
    end

    subgraph SK_PORTS["?? Infrastructure Portsï¼ˆä?è³´å€’ç½®ä»‹é¢ src/shared-kernel/portsï¼›ç”± L7 Adapter å¯¦ä?ï¼‰[D24]"]
        direction LR
        I_AUTH["IAuthService\nèº«ä»½é©—è? Port"]
        I_REPO["IFirestoreRepo\nFirestore å­˜å? Port [S2]"]
        I_MSG["IMessaging\nè¨Šæ¯?¨æ’­ Port [R8]"]
        I_STORE["IFileStore\næª”æ??²å? Port"]
    end

    subgraph SK_OBS_CONTRACT["?? L1 Â· Observability Contractsï¼ˆsrc/shared-kernel/observabilityï¼‰[D8]"]
        direction LR
        SK_OBS_PATH["path: src/shared-kernel/observability"]
        SK_TRACE_CTX["TraceContext / ITraceProvider\ncontract-only"]
        SK_METRICS_IF["EventCounters / IMetricsRecorder\ncontract-only"]
        SK_ERR_IF["DomainErrorEntry / IErrorLogger\ncontract-only"]
    end

end

subgraph SHARED_INFRA_PLANE["?§© Shared Infrastructure Planeï¼ˆVS0-Infraï¼šL0/L2/L4/L5/L6/L7/L9/L10 Execution Planeï¼›L8 ?ºå???Firebase å¹³å°ï¼Œä???VS0 ç®¡è?ï¼›è? VS0-Kernel ?Œå±¬ VS0ï¼?]
        direction TB

        %% ?â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â???
        %% LAYER 0 ?€?€ EXTERNAL TRIGGERSï¼ˆå??¨è§¸?¼å…¥???
        %% ?â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â???

        subgraph EXT["?? L0 Â· External Triggersï¼ˆsrc/shared-infra/external-triggersï¼?]
            direction LR
            EXT_CLIENT["Next.js Client\n_actions.ts [S5]"]
            EXT_AUTH["Firebase Auth\n?»å…¥ / è¨»å? / Token"]
            EXT_WEBHOOK["Webhook / Edge Fn\n[S5] ?µå? SK_RESILIENCE_CONTRACT"]
            WEBHOOK_READ_REJECT["webhook-read-reject\nread not allowed\n401/403/400"]

            subgraph GW_GUARD["?›¡ï¸??¥å£?²è­·å±¤ï?src/shared-infra/external-triggersï¼‰[S5]"]
                RATE_LIM["rate-limiter\nper user / per org\n429 + retry-after"]
                CIRCUIT["circuit-breaker\n5xx ???”æ–· / ?Šé??¢é??¢å¾©"]
                BULKHEAD["bulkhead-router\n?‡ç??”æ¿?»ç¨ç«‹åŸ·è¡Œç?æ±?]
                RATE_LIM --> CIRCUIT --> BULKHEAD
            end

            EXT_WEBHOOK -.->|forbidden read| WEBHOOK_READ_REJECT
        end

        BULKHEAD -->|command ingress| CMD_API_GW
        BULKHEAD -->|client/server-action read ingress| QRY_API_GW

        %% ?â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â???
        %% CQRS GATEWAYï¼ˆè?å¯«å??¢çµ±ä¸€?˜é? Â· L0A / L2 / L6ï¼?
        %% ?¶æ?è¨­è?æ­?¢º?§ï?Command Layer + Command Gateway + Query Gateway
        %% ä¸‰è€…å?å±¬ã€Œè?å¯«å??¢é??“ã€ï?ä»¥è?/å¯«ç‚º?¯ä??‡å‰²ç·šï??ˆä??ˆç¾
        %% ?â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â???

        subgraph UNIFIED_GW["?? CQRS Gatewayï¼ˆè?å¯«å??¢çµ±ä¸€?˜é? Â· L0A + L2 + L6 Â· src/shared-infra/api-gateway + gateway-command + gateway-queryï¼?]
            direction LR

            subgraph CQRS_WRITE["??Write Pathï¼ˆL0A ??L2ï¼?]
                direction TB
                CMD_API_GW["COMMAND_API_GATEWAY\nwrite-only ingress Â· L0A\nsrc/shared-infra/api-gateway"]

                subgraph GW_PIPE["?™ï? Command Pipelineï¼ˆL2 Â· src/shared-infra/gateway-commandï¼?]
                    CBG_ENTRY["unified-command-gateway\n[R8] TraceID æ³¨å…¥ï¼ˆå”¯ä¸€æ³¨å…¥é»ï?\n??event-envelope.traceId"]
                    CBG_AUTH["authority-interceptor\nAuthoritySnapshot [#A9]\nè¡ç?ä»?ACTIVE_CTX ?ºæ?"]
                    CBG_ROUTE["command-router [D29]\nTransactionalCommand ?ºé?å¼·åˆ¶å°è?\n?Œä? Firestore TXï¼šAggregate å¯«å…¥ + {slice}/_outbox å¯«å…¥\nè·¯ç”±?³å??‰å??‡\n?å‚³ SK_CMD_RESULT"]
                    CBG_ENTRY --> CBG_AUTH --> CBG_ROUTE
                end

                CMD_API_GW --> CBG_ENTRY
            end

            subgraph CQRS_READ["?? Read Pathï¼ˆL0A ??L6ï¼?]
                direction TB
                QRY_API_GW["QUERY_API_GATEWAY\nread-only ingress Â· L0A\nsrc/shared-infra/api-gateway"]

                subgraph GW_QUERY["?™ï? Query Routesï¼ˆL6 Â· src/shared-infra/gateway-queryï¼‰[S2 S3]"]
                    direction LR
                    QGWAY["read-model-registry\nçµ±ä?è®€?–å…¥?£\n?ˆæœ¬å°ç…§ / å¿«ç…§è·¯ç”±\n[S2] ?€??Projection ?µå? SK_VERSION_GUARD\n[D31] è®€?–è‡ª??JOIN acl-projection ?æ¿¾ï¼ˆè?å¯«æ??ç?å°å?æ­¥ï?"]
                    QGWAY_SCHED["??.org-eligible-member-view\n[#14 #15 #16]"]
                    QGWAY_CAL_DAY["??.schedule-calendar-view/day\n?¥æ?ç¶­åº¦ï¼ˆå–®?¥ï?by dateKeyï¼?]
                    QGWAY_CAL_ALL["??.schedule-calendar-view/all\n?¥æ?ç¶­åº¦ï¼ˆå…¨?ï?by orgIdï¼?]
                    QGWAY_TL_MEMBER["??.schedule-timeline-view/member\nè³‡æ?ç¶­åº¦ï¼ˆå–®?å“¡ï¼Œby memberIdï¼?]
                    QGWAY_TL_ALL["??.schedule-timeline-view/all\nè³‡æ?ç¶­åº¦ï¼ˆå…¨?ï?by orgIdï¼?]
                    QGWAY_NOTIF["??.account-view + notification-feed-view\n[#6] FCM Token + RTDB ?šçŸ¥å¿«ç…§"]
                    QGWAY_SCOPE["??.workspace-scope-guard-view\n[#A9]"]
                    QGWAY_WALLET["??.wallet-balance\n[S3] é¡¯ç¤º ??Projection\nç²¾ç¢ºäº¤æ? ??STRONG_READ"]
                    QGWAY_SEARCH["??.tag-snapshot\nèªç¾©?–ç´¢å¼•æª¢ç´?]
                    QGWAY_SEM_GOV["??.semantic-governance-view\nèªç¾©æ²»ç??è?æ¨¡å?ï¼ˆæ?æ¡??±è?/?œä?ï¼‰\næ²»ç??é¡¯ç¤ºå?ç¶?L5 ?•å½±"]
                    QGWAY_FIN_STAGE["??.finance-staging-pool [#A20]\nè²¡å?å¾…è??†æ??®ï?å·²é??¶æœªè«‹æ¬¾ä»»å?ï¼?]
                    QGWAY_FIN_LABEL["??.task-finance-label-view [#A22]\nä»»å??‘è?é¡¯ç¤ºæ¨™ç±¤ï¼ˆå??é¡¯ç¤ºï?"]
                    QGWAY --> QGWAY_SCHED & QGWAY_CAL_DAY & QGWAY_CAL_ALL & QGWAY_TL_MEMBER & QGWAY_TL_ALL & QGWAY_NOTIF & QGWAY_SCOPE & QGWAY_WALLET & QGWAY_SEARCH & QGWAY_SEM_GOV & QGWAY_FIN_STAGE & QGWAY_FIN_LABEL
                end

                QRY_API_GW --> QGWAY
            end
        end

        %% ?â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â???
        %% LAYER 4 ?€?€ INTEGRATION EVENT ROUTERï¼ˆä?ä»¶è·¯?±ç¸½ç·šï?
        %% ?â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â???

        subgraph GW_IER["?? L4 Â· Integration Event Routerï¼ˆsrc/shared-infra/event-router + src/shared-infra/outbox-relay + src/shared-infra/dlq-managerï¼?]
            direction TB

            RELAY["outbox-relay-workerï¼ˆsrc/shared-infra/outbox-relayï¼‰\n?å…±??Infra?»æ???OUTBOX ?±äº«?‘\n?ƒæ?ï¼šFirestore onSnapshot (CDC)\n[R9] è¦æ?ä¾†æ?å¿…é?å¸?traceIdï¼›ä»¥ AsyncLocalStorage ?³é?ä¸Šä??‡è‡³?°æ­¥?½å??ˆ\n?•é?ï¼šOUTBOX ??IER å°æ? Lane\nå¤±æ?ï¼šretry backoff ??3æ¬¡å¤±????DLQ\n??§ï¼šrelay_lag ??L9(Observability)"]

            subgraph IER_CORE["?™ï? IER Coreï¼ˆsrc/shared-infra/event-routerï¼?]
                IER[["integration-event-router\nçµ±ä?äº‹ä»¶?ºå£ [#9]\n[R8] ä¿ç? envelope.traceId ç¦æ­¢è¦†è?\n[D30] hopCount++ ??hopCount ??4 ???”æˆª + SECURITY_BLOCK + CircularDependencyDetected ?Šè­¦"]]
            end

            subgraph IER_LANES["?š¦ ?ªå?ç´šä??“å?å±¤ï?src/shared-infra/event-routerï¼‰[P1]"]
                CRIT_LANE["?”´ CRITICAL_LANE\né«˜å„ª?ˆæ?çµ‚ä??´\nRoleChanged ??Claims ?·æ–° [S6]\nWalletDeducted/Credited\nOrgContextProvisioned\nTaskAcceptedConfirmed [#A19] ??Finance Staging Pool\nSLAï¼šç›¡å¿«æ???]
                STD_LANE["?Ÿ¡ STANDARD_LANE\n?å?æ­¥æ?çµ‚ä??´\nSLA < 2s\nSkillXpAdded/Deducted\nScheduleAssigned / ScheduleProposed\nMemberJoined/Left\nFinanceRequestStatusChanged [#A22] ??task-finance-label-view\nAll Domain Events"]
                BG_LANE["??BACKGROUND_LANE\nSLA < 30s\nTagLifecycleEvent\nAuditEvents"]
            end

            subgraph DLQ_SYS["?? DLQ ä¸‰ç??†é?ï¼ˆsrc/shared-infra/dlq-managerï¼‰[R5 S1]"]
                DLQ["dead-letter-queue\nå¤±æ? 3 æ¬¡å??¶å®¹\n?†ç?æ¨™è?ä¾†è‡ª SK_OUTBOX_CONTRACT"]
                DLQ_S["?Ÿ¢ SAFE_AUTO\n?ªå? Replayï¼ˆä???idempotency-keyï¼?]
                DLQ_R["?Ÿ¡ REVIEW_REQUIRED\n?‘è?/?’ç­/è§’è‰²\näººå·¥ç¢ºè?å¾?Replay"]
                DLQ_B["?”´ SECURITY_BLOCK\nå®‰å…¨äº‹ä»¶\n?Šè­¦ + ?ç? + äººå·¥ç¢ºè?\nç¦æ­¢?ªå? Replay"]
                DLQ --> DLQ_S & DLQ_R & DLQ_B
                DLQ_S -.->|"?ªå? Replay"| IER
                DLQ_R -.->|"äººå·¥ç¢ºè?å¾?Replay"| IER
                DLQ_B -.->|"?Šè­¦"| DOMAIN_ERRORS
            end

            RELAY -.->|"?ƒæ??€??OUTBOX ???•é?"| IER
            IER --> IER_LANES
            IER_LANES -.->|"?•é?å¤±æ? 3 æ¬?| DLQ
        end

        %% ?â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â???
        %% LAYER 5 ?€?€ PROJECTION BUSï¼ˆä?ä»¶æ?å½±ç¸½ç·šï?
        %% ?â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â???

        subgraph PROJ_BUS["?Ÿ¡ L5 Â· Projection Busï¼ˆsrc/shared-infra/projection-busï¼Œownership: VS0-Infraï¼?]
            direction TB

            subgraph PROJ_BUS_FUNNEL["??Event Funnelï¼ˆsrc/shared-infra/projection-busï¼‰[S2 P5 R8]"]
                direction LR
                FUNNEL[["event-funnel\n[#9] ?¯ä? Projection å¯«å…¥è·¯å?\n[Q3] upsert by idempotency-key\n[R8] å¾?envelope è®€??traceId ??DOMAIN_METRICS\n[S2] ?€??Lane ?µå? SK_VERSION_GUARD\n     event.aggVersion > view.lastVersion\n     ???´æ–°ï¼›å¦????ä¸Ÿæ?\n[P8] Worker Poolï¼šä? priorityLane ?†é? Quotaï¼ˆCritical/Standard/Backgroundï¼‰\n     ?Œä? doc 100ms ?§å?æ¬¡æ›´?°å?ä½µç‚º 1 æ¬¡å¯«?¥ï?Debounce/Batchï¼?]]
                CRIT_PROJ["?”´ CRITICAL_PROJ_LANE\n[S4: PROJ_STALE_CRITICAL ??500ms]\n?¨ç??è©¦ / dead-letter"]
                STD_PROJ["??STANDARD_PROJ_LANE\n[S4: PROJ_STALE_STANDARD ??10s]\n?¨ç??è©¦ / dead-letter"]
                FUNNEL --> CRIT_PROJ & STD_PROJ
            end

            subgraph PROJ_BUS_META["?™ï? Stream Metaï¼ˆsrc/shared-infra/projection-busï¼?]
                PROJ_VER["projection.version\näº‹ä»¶ä¸²æ??ç§»??]
                READ_REG["read-model-registry\n?ˆæœ¬?®é?"]
                PROJ_VER -->|version mapping| READ_REG
            end

            subgraph PROJ_BUS_CRIT["?”´ Critical Projectionsï¼ˆsrc/shared-infra/projection-busï¼‰[S2 S4]"]
                WS_SCOPE_V["projection.workspace-scope-guard-view\n?ˆæ?è·¯å? [#A9]\n[S2: SK_VERSION_GUARD]"]
                ORG_ELIG_V["projection.org-eligible-member-view\n[S2: SK_VERSION_GUARD]\nskills{tagSlug?’xp} / eligible\n[#14 #15 #16 T3]\n??tag::skill [TE_SK]\n??tag::skill-tier [TE_ST]"]
                WALLET_V["projection.wallet-balance\n[S3: EVENTUAL_READ]\né¡¯ç¤º?¨ãƒ»ç²¾ç¢ºäº¤æ??æ? AGG"]
                ACL_PROJ_V["projection.acl-projection [D31]\nè®€?–è·¯å¾‘æ??é¡?\nCBG_AUTH æ¬Šé?è®Šæ›´äº‹ä»¶ ??L5 ?Œæ­¥?´æ–°\nQRY_API_GW è®€?–è‡ª??JOIN ?æ¿¾"]
                TIER_FN[["getTier(xp) ??Tier\nç´”å‡½å¼?[#12]"]]
            end

            subgraph PROJ_BUS_STD["??Standard Projectionsï¼ˆsrc/shared-infra/projection-busï¼‰[S4]"]
                direction LR
                WS_PROJ["projection.workspace-view"]
                ACC_SCHED_V["projection.account-schedule"]
                CAL_PROJ["projection.schedule-calendar-view\n?¥æ?ç¶­åº¦ Read Model [L5-Bus]\napplyVersionGuard() [S2]"]
                TL_PROJ["projection.schedule-timeline-view\nè³‡æ?ç¶­åº¦ Read Model [L5-Bus]\noverlap/resource-grouping ä¸‹æ? L5\napplyVersionGuard() [S2]"]
                ACC_PROJ_V["projection.account-view"]
                ORG_PROJ_V["projection.organization-view"]
                SKILL_V["projection.account-skill-view\n[S2: SK_VERSION_GUARD]"]
                AUDIT_V["projection.global-audit-view\næ¯æ?è¨˜é???traceId [R8]"]
                TAG_SNAP["projection.tag-snapshot\n[S4: TAG_MAX_STALENESS]\nT5 æ¶ˆè²»?¹ç?æ­¢å¯«??]
                SEM_GOV_V["projection.semantic-governance-view\næ²»ç???Read Modelï¼ˆwiki/proposal/relationshipï¼‰\né¡¯ç¤ºç·šè·¯ï¼šL5?’L6?’UI"]
                TASK_V["projection.tasks-view\nä»»å?æ¸…å–®ï¼ˆcreatedAt ?¹æ¬¡?“\n??sourceIntentIndex ?¹æ¬¡?§ï?[D27-Order]\napplyVersionGuard() [S2]"]
                WS_GRAPH_V["projection.workspace-graph-view\nä»»å?ä¾è³´ Nodes/Edges ?“æ’²\n[VS5 vis-network æ¶ˆè²»?¼å?]\napplyVersionGuard() [S2]"]
                FINANCE_STAGE_V["projection.finance-staging-pool [#A20]\nå¾…è?æ¬¾æ?ï¼šå·²é©—æ”¶?ªè?æ¬¾ä»»?™æ??®\næ¶ˆè²» TaskAcceptedConfirmedï¼ˆCRITICAL_LANEï¼‰\n?€?‹ï?PENDING | LOCKED_BY_FINANCE\napplyVersionGuard() [S2]"]
                TASK_FIN_LABEL_V["projection.task-finance-label-view [#A22]\nä»»å??‘è?é¡¯ç¤ºæ¨™ç±¤?•å½±\næ¶ˆè²» FinanceRequestStatusChangedï¼ˆSTANDARD_LANEï¼‰\næ¬„ä?ï¼štaskId, financeStatus, requestId, requestLabel\napplyVersionGuard() [S2]"]
            end

            IER ==>|"[#9] ?¯ä? Projection å¯«å…¥è·¯å?"| FUNNEL
            CRIT_PROJ --> WS_SCOPE_V & ORG_ELIG_V & WALLET_V & ACL_PROJ_V
            STD_PROJ --> WS_PROJ & ACC_SCHED_V & CAL_PROJ & TL_PROJ & ACC_PROJ_V & ORG_PROJ_V & SKILL_V & AUDIT_V & TAG_SNAP & SEM_GOV_V & TASK_V & WS_GRAPH_V & FINANCE_STAGE_V & TASK_FIN_LABEL_V

            FUNNEL -->|stream offset| PROJ_VER
            WS_ESTORE -.->|"[#9] replay ??rebuild"| FUNNEL
            SKILL_V -.->|"[#12] getTier"| TIER_FN
            ORG_ELIG_V -.->|"[#12] getTier"| TIER_FN
        end

        subgraph FIREBASE_L7["?”¥ L7 Firebase ?å?ç«¯å?å±¤ï?æ±ºç??©é™£ï¼šä??‚ç”¨ firebase-client vs functions ??D25 / è¦?01-logical-flow.md Â§Firebase è·¯ç”±æ±ºç?ï¼?]
            direction LR

        subgraph FIREBASE_ACL["?”¥ L7-A Â· firebase-client SDKï¼ˆClient Adapters Â· src/shared-infra/frontend-firebase Â· FIREBASE_ACLï¼‰[D24]\n?ç«¯?ä? / App Check ?å???/ Analytics ?™æ¸¬ / ?³æ?è¨‚é–±\næµç?ï¼šL3/L5/L6 ??L1 SK_PORTS ??L7-A ??L8"]
            direction LR

            AC_TRANSLATOR_L7["anti-corruption-translator\nSDK semantics -> standardized ports"]

            AUTH_ADP["auth.adapter.ts\nAuthAdapter\nå¯¦ä? IAuthService\nFirebase User ??Auth Identity\n[D24] ?¯ä??ˆæ? firebase/auth ?¼å«é»?]

            FSTORE_ADP["firestore.facade.ts\nFirestoreAdapter\nå¯¦ä? IFirestoreRepo\n[S2] aggregateVersion ?®èª¿?å?å®ˆè?\n[D24] ?¯ä??ˆæ? firebase/firestore ?¼å«é»?]

            RTDB_ADP["realtime-database.adapter.ts\nRealtimeDatabaseAdapter\n?³æ??šè?/?šçŸ¥ä½å»¶?²å?æ­¥ï?presence/typing/live-feedï¼‰\n[D24] ?¯ä??ˆæ? firebase/database ?¼å«é»?]

            FCM_ADP["messaging.adapter.ts\nFCMAdapter\nå¯¦ä? IMessaging\n[R8] æ³¨å…¥ envelope.traceId ??FCM metadata\nç¦æ­¢?¨æ­¤?Ÿæ???traceId\n[D24] ?¯ä??ˆæ? firebase/messaging ?¼å«é»?]

            STORE_ADP["storage.facade.ts\nStorageAdapter\nå¯¦ä? IFileStore\nPath Resolver / URL ç°½ç™¼\n[D24] ?¯ä??ˆæ? firebase/storage ?¼å«é»?]

            ANALYTICS_ADP["analytics.adapter.ts\nAnalyticsAdapter\nGoogle Analytics äº‹ä»¶å¯«å…¥ï¼ˆlogEvent/screen_viewï¼‰\n?…å?è¨±é?æ¸¬ä?ä»¶ï?ç¦æ­¢?¿è??˜å?å¯«å…¥\n[D24] ?¯ä??ˆæ? firebase/analytics ?¼å«é»?]

            APPCHK_ADP["app-check.adapter.ts\nAppCheckAdapter\nClient attestation token ?å???çºŒæ?/é©—è?\n?ªé€šé?ä¸å??²å…¥ L2/L3\n[D24 D25 E7] ?¯ä??ˆæ? firebase/app-check ?¼å«é»?]

            VIS_DATA_ADP["vis-data.adapter.ts\nVisDataAdapter\nDataSet<Node|Edge|DataItem> ?¬åœ°å¿«å?\n[D28] ?¯ä? vis-* DataSet å¯«å…¥é»\nFirebase Snapshot è¨‚é–±ä¸€æ¬???DataSet ?´æ–°?¨æ’­\nvis-network / vis-timeline / vis-graph3d ?¯è?æ¶ˆè²»\nç¦æ­¢ vis-* ?´é€?Firebaseï¼ˆN?1 ??? ??è²»ç”¨?å?ï¼‰[D28]"]

            AC_TRANSLATOR_L7 -.-> AUTH_ADP
            AC_TRANSLATOR_L7 -.-> FSTORE_ADP
            AC_TRANSLATOR_L7 -.-> RTDB_ADP
            AC_TRANSLATOR_L7 -.-> FCM_ADP
            AC_TRANSLATOR_L7 -.-> STORE_ADP
            AC_TRANSLATOR_L7 -.-> ANALYTICS_ADP
            AC_TRANSLATOR_L7 -.-> APPCHK_ADP
            AC_TRANSLATOR_L7 -.-> VIS_DATA_ADP
        end

        subgraph FIREBASE_BACKEND["?”¥ L7-B Â· functionsï¼ˆfirebase-admin ?¯ä?å®¹å™¨ Â· src/shared-infra/backend-firebaseï¼‰[D25]\nfirebase-admin ä¸€å¾‹é€é? Cloud Functionsï¼›ç?æ­¢åœ¨ Next.js server/edge/Server Actions/Edge Functions ?´æ¥ä½¿ç”¨\né«˜æ???/ è·¨ç???/ Admin Claims / Webhook é©—ç°½ / ?¹æ¬¡?”èª¿\næµç?ï¼šL0 EXT_WEBHOOK / L2 CBG_ROUTE ??L7-B ??L8"]
            direction LR
            BFN_GW["functions-gateway\nsrc/shared-infra/backend-firebase/functions\nAdmin æ¬Šé? / è·¨ç??¶å?èª?/ Trigger / Scheduler / Webhook é©—ç°½\nfirebase-admin SDK ?å??–å”¯ä¸€å®¹å™¨\nå°å? HTTP/Callable API ?¥å£"]

            subgraph ADMIN_ADPTS["Admin SDK Adaptersï¼ˆfirebase-admin ??ä¸€å¾‹åœ¨ Cloud Functions ?§åŸ·è¡Œï?[D25]"]
                direction TB
                ADMIN_AUTH_ADP["admin-auth-adapter\n[D25] ?¯ä??ˆæ? firebase-admin/auth ?¼å«é»\n(?ªè? Claims / ä½¿ç”¨?…ç®¡??"]
                ADMIN_DB_ADP["admin-data-adapter\n[D25] ?¯ä??ˆæ? firebase-admin/firestore ?¼å«é»\n(å¼·ä??´å¯«??/ è·¨é???TX)"]
                ADMIN_MSG_ADP["admin-messaging-adapter\n[D25] ?¯ä??ˆæ? firebase-admin/messaging ?¼å«é»\n(Server-side FCM ä¸»è??šé?)"]
                ADMIN_STORE_ADP["admin-storage-adapter\n[D25] ?¯ä??ˆæ? firebase-admin/storage ?¼å«é»\n(å¾Œç«¯ç°½ç½² URL / è·¨ç??¶æ?ä½?"]
                ADMIN_APPCHK_ADP["admin-appcheck-adapter\n[D25] ?¯ä??ˆæ? firebase-admin/app-check ?¼å«é»\n(é©—è? App Check token)"]
            end

            BFN_GW -.->|"Admin SDK init ????Service API å§”æ´¾"| ADMIN_AUTH_ADP & ADMIN_DB_ADP & ADMIN_MSG_ADP & ADMIN_STORE_ADP & ADMIN_APPCHK_ADP

            BDC_GW["dataconnect-gateway-adapter\nsrc/shared-infra/backend-firebase/dataconnect\næ²»ç???GraphQL schema/connector/operations\nè·¨å?ç«¯ä??´æŸ¥è©¢å?ç´?]
        end

        end

        subgraph FIREBASE_EXT["?ï? L8 Â· Firebase Infrastructureï¼ˆå??¨å¹³??SDK Runtimeï¼›æœ¬ repo ?…é??Œæ?å°„ï?"]
            direction LR
            F_AUTH[("Firebase Auth\nfirebase/auth")]
            F_DB[("Firestore\nfirebase/firestore")]
            F_RTDB[("Realtime Database\nfirebase/database")]
            F_FCM[("Firebase Cloud Messaging\nfirebase/messaging")]
            F_STORE[("Cloud Storage\nfirebase/storage")]
            F_ANALYTICS[("Google Analytics\nfirebase/analytics")]
            F_APPCHK[("Firebase App Check\nfirebase/app-check")]
            F_DC[("Data Connect\nfirebase/data-connect")]
            F_FUNCTIONS[("Cloud Functions Runtime\nfirebase-admin/app\n?å???Admin SDK ?„å”¯ä¸€å®¹å™¨")]
        end

        subgraph OBS_LAYER["â¬?L9 Â· Observabilityï¼ˆsrc/shared-infra/observabilityï¼?]
            direction LR
            OBS_PATH["path: src/shared-infra/observability"]
            TRACE_ID["trace-identifier\nCBG_ENTRY æ³¨å…¥ TraceID\n?´æ?äº‹ä»¶?ˆå…±äº?[R8]"]
            DOMAIN_METRICS["domain-metrics\nIER ??Lane Throughput/Latency\nFUNNEL ??Lane ?•ç??‚é?\nOUTBOX_RELAY lag [R1]\nRATELIMIT hit / CIRCUIT open"]
            DOMAIN_ERRORS["domain-error-log\nWS_TX_RUNNER\nSCHEDULE_SAGA\nDLQ_BLOCK å®‰å…¨äº‹ä»¶ [R5]\nStaleTagWarning\nTOKEN_REFRESH å¤±æ??Šè­¦ [S6]\nCircularDependencyDetected [D30]"]
        end
end

end

SK_OBS_CONTRACT -.->|"contract bind"| OBS_LAYER
SK_OBS_PATH -.->|"contract -> runtime"| OBS_PATH

%% ?€?€?€ VS8 Semantic Cognition Engineï¼ˆè?ç¾©è??¥å??ï?
%% ?€?€?€ ?¶æ?æ­?¢º?§å„ª?ˆå??‡ï?Architectural Correctness Firstï¼‰ï?G/C/E/O/B äº”ç³»?—è??‡ç‚º VS8 å®Œæ•´æ­??è¦ç?
%% ?€?€?€   å¥§å¡å§†å??€ = æ­?¢º?½è±¡ï¼ˆæ­£ç¢ºç??·è²¬?Šç??æ??°ç?èªç¾©å±¤æ¬¡ï¼‰ï??Œé??€å°‘ç?å¼ç¢¼?–æ?å¿«å¯¦ä½?
%% ?€?€?€ ?›å±¤?¶æ?ï¼ˆå¯ç¶­è­·è¦–å?ï¼‰ï?
%% ?€?€?€   ??Governanceï¼ˆæ²»?†ï?: registry / protocol / guards / portal
%% ?€?€?€   ??Core Domainï¼ˆæ ¸å¿ƒè?ç¾©å?ï¼? CTA / hierarchy / vector / tag entities
%% ?€?€?€   ??Compute Engineï¼ˆè?ç®—å??ï?: graph / reasoning / routing / learning
%% ?€?€?€   ??Outputï¼ˆè¼¸?ºï?: projections / event-broadcast / decision-policy
%% ?€?€?€ ?‘ä??¸å®¹ï¼šVS8_CL ??core-domain, VS8_SL ??graph-engine, VS8_NG ??reasoning-engine, VS8_RL ??decision-policy
%% ?€?€?€ [B2] ?›å±¤?®å?ä¾è³´ï¼šGovernance?’Core Domain?’Compute Engine?’Outputï¼ˆç?æ­¢é€†å?ï¼?
%% ?€?€?€ [B4] ?†é?å­¸ï?IS_A ?¬é?è«–ï????‘é?å·¥å…·ï¼ˆè?è­˜è?ï¼‰ï??©è€…è·è²¬ä??¯ä???
%% ?€?€?€ [B5] VS8 ?¨è?? æ??ˆè·¯å¾‘ï?? æ??·è??¯ä??¨ï??’ç­?é€šçŸ¥?ç‰©?–ï?æ­?IER+L5
%% ?€?€?€ centralized-tag.aggregate ?·å? lifecycleï¼Œç‚º domain authority [#A6 #17]
subgraph VS8["?? VS8 Â· Semantic Cognition Engineï¼ˆsrc/features/semantic-graph.sliceï¼‰[#A6 #17]"]
    direction TB

    subgraph VS8_GOV_LAYER["????ï¸?Semantic Governance Layerï¼ˆsrc/features/semantic-graph.slice/governanceï¼?]
        direction TB
        SEM_REG["semantic-registry\n?Semantic SSOT?‘\n??centralized-tag.aggregate ?ä??¯ä?è¨»å?ä¾†æ?\nè·¨å?èªç¾©å¿…é??ˆè¨»?Šå?ä½¿ç”¨ [D21-A D21-T D21-U]"]
        SEM_PROTOCOL["semantic-protocol\n?è??Ÿå?è­°å±¤?‘\ncommand/event envelope ??TagLifecycleEvent ?”è­°\nç¶­æ?è·¨æ¨¡çµ„è?ç¾©è??Ÿä???[D21-6 S1 R8]"]

        subgraph VS8_GUARD["1.1 ?›¡ï¸?guards Â· Semantic Integrityï¼ˆsrc/features/semantic-graph.slice/governance/guardsï¼‰[D21-H D21-K S4]"]
            direction LR
            INV_GUARD["invariant-guard.ts\n?æ?é«˜è?æ±ºæ? Â· èªç¾©è¡ç??´æ¥?’ç??‘\n?•å??©ç??è¼¯?¯ç? ???”æˆª?æ? [D21-H D21-K]"]
            STALE_MON["staleness-monitor.ts\nTAG_MAX_STALENESS ??30s [S4 D21-8]"]
        end

        subgraph VS8_WIKI["1.2 ??ï¸?semantic-governance-portalï¼ˆsrc/features/semantic-graph.slice/semantic-governance-portalï¼‰[D21-I~W]"]
            direction LR
            WIKI_ED["editor\næ¨™ç±¤å®šç¾©ç·¨è¼¯ [D21-J]\nè®€?–ï?L6 Query Gateway ??semantic-governance-view\nå¯«å…¥ï¼šL2 CMD_GWAY ??VS8 CTAï¼ˆç?æ­¢ç›´å¯?graph/projectionï¼?]
            PROP_STREAM["proposal-stream/\n?æ?å¯©è­°ä¸²æ? [D21-I D21-V]"]
            REL_VIS["relationship-visualizer/\nèªç¾©?œä??–è?è¦ºå?"]
            CONS_ENG["consensus-engine/\n?¨å??±è??¡é? [D21-I D21-K]"]
            PROP_STREAM -->|"?æ??é?"| CONS_ENG
        end
    end

    subgraph VS8_CORE_LAYER["???§¬ Semantic Core Domainï¼ˆsrc/features/semantic-graph.slice/coreï¼?]
        direction TB

        subgraph VS8_CL["2.1 semantic-core-domainï¼ˆsrc/features/semantic-graph.slice/coreï¼‰[D21-A D21-B D21-C D21-D]"]
            direction LR
            CTA["centralized-tag.aggregate (CTA)\n?å…¨?Ÿè?ç¾©å??¸ãƒ»?¯ä??Ÿç›¸?‘\ntagSlug / label / category\ndeprecatedAt / deleteRule\n?Ÿå‘½?±æ?å®ˆè­·ï¼šDraft?’Active?’Stale?’Deprecated [D21-4]"]
            HIER["hierarchy-manager.ts\nç¢ºä?æ¯å€‹æ–°æ¨™ç±¤?›è??³å?ä¸€?‹çˆ¶ç¯€é»?[D21-C]"]
            VEC["embeddings/vector-store.ts\n?‘é??¨æ?ç±¤å?ç¾©å?æ­¥åˆ·??[D21-D]"]
            subgraph TAG_ENTS["?·ï¸?Semantic Tag Entitiesï¼ˆsrc/shared-kernel/data-contracts/tag-authorityï¼?TE1~TE6) [D21-A]"]
                direction LR
                TE_UL["TE1 Â· tag::user-level\ncategory: user_level"]
                TE_SK["TE2 Â· tag::skill\ncategory: skill"]
                TE_ST["TE3 Â· tag::skill-tier\ncategory: skill_tier"]
                TE_TM["TE4 Â· tag::team\ncategory: team"]
                TE_RL["TE5 Â· tag::role\ncategory: role"]
                TE_PT["TE6 Â· tag::partner\ncategory: partner"]
            end
            CTA --> TAG_ENTS
            CTA --> HIER
            CTA -.-> VEC
        end
    end

    subgraph VS8_ENGINE_LAYER["???™ï? Semantic Compute Engineï¼ˆsrc/features/semantic-graph.slice/{graph,reasoning,routing,learning}ï¼?]
        direction TB

        subgraph VS8_SL["3.1 graph-engineï¼ˆsrc/features/semantic-graph.slice/graphï¼‰[D21-E D21-F D21-9 D21-10 C2 C3]"]
            direction LR
            EDGE_STORE["semantic-edge-store.ts\n?é??œä??»é?ä¸­å? Â· ?¯ä??Šå??ä?é»?[E1]?‘\n5 ç¨®å?æ³•é?é¡å? [C2]ï¼š\n  REQUIRESï¼ˆTask?’Skillï¼‰\n  HAS_SKILLï¼ˆPerson?’Skillï¼‰\n  IS_Aï¼ˆSkill?’Skill ç¹¼æ‰¿ï¼‰\n  DEPENDS_ONï¼ˆTask?’Task ?ç½®ï¼‰\n  TRIGGERSï¼ˆTask?’Task å®Œæ?è§¸ç™¼ï¼‰\nweight ??[0,1]ï¼ˆREQUIRES?granularityï¼›HAS_SKILL?xp/tierï¼‰[C3]\nç¦æ­¢æ¥­å?ç«¯è‡ªå®šç¾©?Šé??‹ãƒ»ç¦æ­¢ç¡¬å¯« weight [C2 C3]"]
            WT_CALC["weight-calculator.ts\n?è?ç¾©ç›¸ä¼¼åº¦çµ±ä??ºå£ Â· ç¦æ­¢æ¥­å?ç«¯è‡ªè¡Œå?æ¬?[E2]?‘\ncomputeSimilarity(a,b) [D21-E]"]
            CTX_ATTN["context-attention.ts\n?Workspace ?…å??æ¿¾ Â· æ³¨æ??›é???[E12]?‘\nfilterByContext(slugs, wsCtx) [D21-F]"]
            TOPO_OPS["adjacency-list.ts\n?“æ’²?‰å?è¨ˆç?ï¼ˆç?æ­¢æ¥­?™ç«¯?´é€?[T5 E3]ï¼‰\ngetTransitiveRequirements / isSupersetOf / findCriticalPath [D21-10]"]
            EDGE_STORE -.-> WT_CALC
            EDGE_STORE -.-> TOPO_OPS
        end

        subgraph VS8_NG["3.2 reasoning-engineï¼ˆsrc/features/semantic-graph.slice/reasoningï¼‰[D21-4 D21-6 D21-X E5~E9]"]
            direction LR
            NEURAL_NET["semantic-distance\ncomputeSemanticDistance(a,b)\nfindIsolatedNodes(slugs[]) [D21-10]\nDijkstra ? æ??€?­è·¯å¾?]
            CAUSALITY["?? Causality Tracer [D21-6 D21-X E8]\ntraceAffectedNodes(event, candidates[])\nbuildCausalityChain(event, candidates[])\nBFS ? æ??³æ’­ Â· ä¾†æ??¯ä?ï¼šTRIGGERS+DEPENDS_ON ?Š\nç¦æ­¢?ªå?ç¾©å??œè???[E8]"]
            SKILL_MATCH["skill-matcher.ts [E7]\näººå“¡è³‡æ ¼?¨ç?ï¼šä?æ¢ä»¶?¨æ»¿?å??¼\n??tier ??Task è¦æ?å±¤ç?\n??granularity è¦†è?åº???REQUIRES ??weight\n??cert_required Skill å¿…é??‰å?è¦è??§\nç¦æ­¢?¨å?æ»¿è¶³?„æ¨¡ç³Šé€šé? [E7]"]
            TAG_EV["TagLifecycleEventï¼ˆin-processï¼‰\neventType: TAG_CREATED | TAG_ACTIVATED\n         | TAG_DEPRECATED | TAG_STALE_FLAGGED\n         | TAG_DELETED\n[D21-6] ? æ??ªå?è§¸ç™¼"]
            TAG_OB["tag-outbox\n[SK_OUTBOX: SAFE_AUTO]"]
            TAG_SG["? ï? TAG_STALE_GUARD\n[S4 D21-8: TAG_MAX_STALENESS ??30s]"]
            NEURAL_NET -.->|"èªç¾©è·é›¢ [D21-4]"| CAUSALITY
            CAUSALITY -->|"TagLifecycleEvent [D21-6]"| TAG_EV
            TAG_EV --> TAG_OB
            CAUSALITY -.->|"å»¢æ??ŸçŸ¥ [D21-8]"| TAG_SG
            SKILL_MATCH -.->|"æ¶ˆè²» HAS_SKILL / REQUIRES ??[E7]"| EDGE_STORE
        end

        subgraph VS8_ROUT["3.3 routing-engineï¼ˆsrc/features/semantic-graph.slice/routingï¼‰[D21-5 D27-A E11]"]
            direction LR
            POLICY_MAP["policy-mapper/\nèªç¾©æ¨™ç±¤?’å??¼ç???[D27-A]\nç¦æ­¢ ID ç¡¬ç·¨ç¢¼è·¯??]
            SEM_ROUTE_HINT["SemanticRouteHint contract [E11]\nç´”è?ç¾©è?ç®—å»ºè­°è¼¸?º\nç¦æ­¢ routing-engine ?´å‘¼ VS6/VS7\n?¯ä??¨ç”±è¨‚é–±?¹è?è²¬åŸ·è¡?]
            DISPATCH["dispatch-bridge/\n?’ç­è·¯ç”± Â· ?šçŸ¥?†ç™¼?ºå£"]
            subgraph WORKFLOWS["workflows/ï¼ˆsrc/features/semantic-graph.slice/workflowsï¼?]
                direction LR
                TAG_PROMO["tag-promotion-flow.ts\næ¨™ç±¤?‰å?æµç?"]
                ALERT_FLOW["alert-routing-flow.ts\n?Šè­¦è·¯ç”±æµç?"]
            end
            POLICY_MAP --> SEM_ROUTE_HINT --> DISPATCH
        end

        subgraph VS8_PLAST["3.4 learning-engineï¼ˆsrc/features/semantic-graph.slice/learningï¼‰[D21-G]"]
            direction LR
            LEARN["learning-engine.ts\n?å? VS3/VS2 äº‹å¯¦äº‹ä»¶é©…å? Â· ç¦æ­¢?‹å??¨æ?ä¿®æ”¹?‘\n? æ?æ¼”å??é???[D21-G]"]
            DECAY["semantic-decay\nèªç¾©å¼·åº¦?ªç„¶è¡°é€€"]
            LEARN -.-> DECAY
        end
    end

    subgraph VS8_OUTPUT_LAYER["???“¤ Semantic Output Layerï¼ˆsrc/features/semantic-graph.slice/{projections,subscribers,outbox,decision,ports}ï¼?]
        direction TB

        subgraph VS8_PROJ["4.1 projections Â· è®€?´æ?å½±ï?src/features/semantic-graph.slice/output/projectionsï¼‰[D21-7 T5 O2~O4]"]
            direction LR
            TAG_RO["semantic-tag-projection\n?æ¥­?™ç«¯?¯ä??ˆæ?è®€?–å‡º??Â· T5 O2?‘\n[D21-7] è®€?–å??ˆç? projection.tag-snapshot\nT1 ?°å??‡è??±ä?ä»¶å³?¯æ“´å±?]
            GRAPH_SEL["projections/graph-selectors.ts\n?–ç?æ§‹å”¯è®€?¥è©¢"]
            CTX_SEL["projections/context-selectors.ts\nWorkspace èªç¾©ä¸Šä???]
            TASK_SEM_V["projection.task-semantic-view [O3]\nrequired_skillsï¼ˆä???REQUIRES ?Šï?\neligible_personsï¼ˆä???skill-matcher ?¨ç?ï¼‰\n?©è€…ç¼ºä¸€?‡æ?å½±ä?å®Œæ•´ä¸å?å°å??ä?"]
            CAUSAL_LOG["projection.causal-audit-log [O4]\næ¯æ?è¨˜é?å¿…å« inferenceTrace[] + traceId\ntraceId å¾?event-envelope è®€?–ï?ç¦æ­¢?æ–°?Ÿæ?ï¼?]
            TAG_RO -.-> GRAPH_SEL
            TAG_RO -.-> CTX_SEL
        end

        subgraph VS8_IO["4.2 event-broadcast Â· èªç¾©è¨‚é–±å»?’­ï¼ˆsrc/features/semantic-graph.slice/{subscribers,outbox}ï¼‰[D21-6 S1 O5 O6]"]
            direction LR
            LIFECYCLE_SUB["subscribers/lifecycle-subscriber.ts\næ¨™ç±¤?Ÿå‘½?±æ?äº‹ä»¶è¨‚é–±"]
            TAG_OUTBOX["outbox/tag-outbox.ts\n?VS8 ?¯ä? outbox ç¯€é»?[O5]?‘\n[SK_OUTBOX: SAFE_AUTO]\nè·¯å?ï¼štag-outbox?’RELAY?’IER?’L5 FUNNEL?’tag-snapshot\næ¨™ç±¤?°å?å»?’­?ºå£ [O6]"]
        end

        subgraph VS8_RL["4.3 decision-policy Â· èªç¾©æ±ºç?è¼¸å‡ºï¼ˆsrc/features/semantic-graph.slice/decisionï¼‰[D21-5 D8 D27 E4~E6]"]
            direction LR
            subgraph COST_CLASS["?? ?æœ¬èªç¾©?†é??¨ï?src/features/semantic-graph.slice/_cost-classifier.tsï¼‰[D8][D24][D27][E4 E5 E6 C6]"]
                direction LR
                COST_CLASSIFIER["_cost-classifier.tsï¼ˆç??½å? [D8]ï¼‰\nå¯¦ä? ISemanticClassificationPort [O1 E4]\nclassifyCostItem(name) ??(costItemType, semanticTagSlug, confidence, inferenceTrace[])\nshouldMaterializeAsTask(type) ??boolean  ?…[D27 C7]\n?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€\n?¨ç?ä¸‰æ­¥é©Ÿä??¯è·³èº?[E5]ï¼š\n  ??vector similarity ç¸®å??™é¸ slugï¼ˆC11 ?‘é?ç¸®ç?ï¼‰\n  ??graph traversal ç¢ºè? essence_typeï¼ˆC11 Graph ç¢ºè?ï¼‰\n  ??å¥—ç”¨ override è¦å?ï¼ˆoverride = IS_A ?Šï???if-else [C7]ï¼‰\nTaskNode.essence_type [C6]ï¼š\n  PHYSICAL_INSTALL / LOGIC_CONFIG / COMPLIANCE\n?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€\nEXECUTABLE  ?©ç??½å·¥ä»»å?ï¼ˆé?è¨­å‡º???\nMANAGEMENT  è¡Œæ”¿/?ç®¡/?·å?ç®¡ç?ï¼ˆå« QC Inspectionï¼‰\nRESOURCE    ?‰å„²/äººå?è³‡æ??²å?\nFINANCIAL   ä»˜æ¬¾?Œç?ç¢??ä?æ¬¾\nPROFIT      ?©æ½¤?…ç›®ï¼ˆåˆ©æ½¤ï?\nALLOWANCE   ?—æ?/å·®æ?/?‹è¼¸è£œè²¼ï¼ˆå«å·®æ??é?è¼¸ï?\n?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€\nsemanticTagSlug ??VS8 ä¾å…§å®¹è?ç¾©æ?è¼‰ï?å°é? tagSlugï¼‰\n??EXECUTABLE override ?ªå?ï¼šæ??»æª¢æ¸?qc test ç­‰æ–½å·¥æ¸¬è©¦â?EXECUTABLE\n??inferenceTrace ?„æ¨?†ç??œç?æ­¢é€²å…¥ä¸‹æ¸¸æµç? [E6]\nç¦æ­¢ Firestore å­˜å??»ç?æ­?async\n?¯åœ¨ä»»æ? Layer å®‰å…¨?¼å« [D8]"]
            end
        end

        subgraph VS8_PORTS["4.4 port-interfaces Â· VS8 å°å??¯ä??ºå£ï¼ˆsrc/features/semantic-graph.slice/portsï¼‰[O1 B3]"]
            direction LR
            PORT_CLASS["ISemanticClassificationPort [O1]\nä¾?VS5 ?¼å«?æœ¬?†é?\ncost-item-classifier å¯¦ä?æ­¤ä???[E4]"]
            PORT_SKILL["ISkillMatchPort [O1]\nä¾?L10 Genkit Flow ?¼å«è³‡æ ¼?¨ç?\nskill-matcher å¯¦ä?æ­¤ä???[E7]"]
            PORT_FEED["ISemanticFeedbackPort [O1]\nä¾?learning-engine ?¥æ”¶äº‹å¯¦äº‹ä»¶\n?¯ä??ˆæ?ï¼šVS3 SkillXpAdded/Deducted\n         + VS5 TaskCompleted [E9]"]
        end
    end

    SEM_REG --> CTA
    SEM_PROTOCOL -.->|"protocol drives lifecycle events"| TAG_EV
    SEM_PROTOCOL -.->|"protocol constrains routing I/O"| VS8_ROUT
    SEM_PROTOCOL -.->|"protocol constrains outbox broadcast"| VS8_IO

    VS8_CL -->|"?¸å?èªç¾©è®Šæ›´è¼¸å…¥ [D21-6]"| VS8_SL
    VS8_SL -->|"?–ç?æ§‹è¼¸??[D21-3 D21-9]"| VS8_NG
    VS8_WIKI -.->|"?æ??ˆé? BBB [D21-H]"| VS8_GUARD
    VS8_NG -.->|"?¨ç?çµæ? [D21-5]"| VS8_ROUT
    VS8_NG -.->|"äº‹ä»¶å»?’­ [D21-6]"| VS8_IO
    VS8_PLAST -.->|"æ¬Šé??é? [D21-G]"| VS8_SL
    VS8_PROJ -.->|"?¯è?èªç¾©è¼¸å‡º [T5]"| VS8_ROUT
    CTA -.->|"?¯è?å¼•ç”¨å¥‘ç? [D21-7]"| TAG_RO
    CTA -.->|"Deprecated ?šçŸ¥ [D21-8]"| TAG_SG
    VS8_NG -.->|"èªç¾©è·¯ç”±?ˆæ? [D21-5]"| VS8_RL
    CONS_ENG -.->|"æ²»ç??šé? ??BBB ?€çµ‚è?æ±?[D21-I D21-K]"| INV_GUARD
    SKILL_MATCH -.->|"eligible_persons ?¨ç?çµæ? [O3]"| TASK_SEM_V
    CAUSALITY -.->|"? æ?å¯©è?è¨˜é? [O4]"| CAUSAL_LOG
    PORT_CLASS -.->|"ä»‹é¢å¯¦ä? [O1 E4]"| COST_CLASSIFIER
    PORT_SKILL -.->|"ä»‹é¢å¯¦ä? [O1 E7]"| SKILL_MATCH
    PORT_FEED -.->|"äº‹å¯¦äº‹ä»¶é©…å? [O1 E9]"| LEARN
end

%% ?â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â???
%% LAYER 3 ?€?€ L3 Â· Domain Slicesï¼ˆé??Ÿå???Â· VS1?“VS8ï¼?
%% ?€?€ VS1=Identity Â· VS2=Account Â· VS3=Skill Â· VS4=Organization
%% ?€?€ VS5=Workspace Â· VS6=Workforce-Scheduling Â· VS7=Notification
%% ?€?€ VS8=Semantic Graph Engine
%% èªç¾©ä¸»å¹¹ï¼ˆé?è¼¯åˆ¤æº–ï?ï¼šVS1(?»å…¥) ??VS2(å¸³æˆ¶) ??VS4(çµ„ç?) ??VS5(å·¥ä??€)
%% ?Šç?ç´„æ?ï¼šVS3 ?…æ‰¿è¼‰ã€Œå¸³?¶æ??½ã€ï?VS6 ?…æ‰¿??VS5 ä»»å?/?’ç­?æ?ï¼›VS7 ?…æ‰¿?¥å¸³?¶é€šçŸ¥?•å½±?‡ä?ä»?
%% ?â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â???

%% ?€?€ VS1 Identity ?€?€
subgraph VS1["?Ÿ¦ VS1 Â· Identity Sliceï¼ˆsrc/features/identity.sliceï¼?]
    direction TB

    AUTH_ID["authenticated-identity"]
    ID_LINK["account-identity-link\nfirebaseUserId ??accountId"]

    subgraph VS1_CTX["?™ï? Context Lifecycleï¼ˆsrc/features/identity.sliceï¼?]
        ACTIVE_CTX["active-account-context\nTTL = Token ?‰æ???]
        CTX_MGR["context-lifecycle-manager\nå»ºç?ï¼šLogin\n?·æ–°ï¼šOrgSwitched / WorkspaceSwitched\nå¤±æ?ï¼šTokenExpired / Logout"]
        CTX_MGR --> ACTIVE_CTX
    end

    subgraph VS1_CLAIMS["?“¤ Claims Managementï¼ˆsrc/features/identity.sliceï¼‰[S6]"]
        CLAIMS_H["claims-refresh-handler\n?¯ä??·æ–°è§¸ç™¼é»?[E6]\nè¦ç? ??[SK_TOKEN_REFRESH_CONTRACT]"]
        CUSTOM_C["custom-claims\nå¿«ç…§?²æ? [#5]\nTTL = Token ?‰æ???]
        TOKEN_SIG["token-refresh-signal\nClaims è¨­å?å®Œæ?å¾Œç™¼??[S6]"]
        CLAIMS_H --> CUSTOM_C
        CLAIMS_H -->|"Claims è¨­å?å®Œæ?"| TOKEN_SIG
    end

    EXT_AUTH --> AUTH_ID --> ID_LINK --> CTX_MGR
    AUTH_ID -->|"?»å…¥è§¸ç™¼"| CLAIMS_H
end

CUSTOM_C -.->|"å¿«ç…§å¥‘ç? + TTL"| SK_AUTH_SNAP
AUTH_ID -.->|"uses IAuthService"| I_AUTH

%% ?€?€ VS2 Account ?€?€
subgraph VS2["?Ÿ© VS2 Â· Account Sliceï¼ˆsrc/features/account.sliceï¼?]
    direction TB

    subgraph VS2_USER["?‘¤ ?‹äººå¸³è??Ÿï?src/features/account.slice/user.profile + user.walletï¼?]
        USER_AGG["user-account.aggregate"]
        WALLET_AGG["wallet.aggregate\nå¼·ä??´å¸³??[#A1]\n[S3: STRONG_READ]"]
        PROFILE["account.profile\nFCM Tokenï¼ˆå¼±ä¸€?´ï?"]
    end

    subgraph VS2_ORG["?¢ çµ„ç?å¸³è??Ÿï?src/features/account.sliceï¼›org-account aggregate + settings + bindingï¼?]
        ORG_ACC["organization-account.aggregate"]
        ORG_SETT["org-account.settings"]
        ORG_BIND["org-account.binding\nACL ?²è?å°æ¥ [#A2]"]
    end

    subgraph VS2_GOV["?›¡ï¸?å¸³è?æ²»ç??Ÿï?src/features/account.slice/gov.role + gov.policyï¼?]
        ACC_ROLE["account-governance.role\n??tag::role [TE_RL]"]
        ACC_POL["account-governance.policy"]
    end

    subgraph VS2_EV["?“¢ Account Events + Outboxï¼ˆsrc/features/account.sliceï¼‰[S1]"]
        ACC_EBUS["account-event-busï¼ˆin-processï¼‰\nAccountCreated / RoleChanged\nPolicyChanged / WalletDeducted / WalletCredited"]
        ACC_OB["acc-outbox [SK_OUTBOX: S1]\nDLQ: RoleChanged/PolicyChanged ??SECURITY_BLOCK\n     WalletDeducted ??REVIEW_REQUIRED\n     AccountCreated ??SAFE_AUTO\nLane: Wallet/Role/Policy ??CRITICAL\n      ?¶é? ??STANDARD"]
        ACC_EBUS -->|pending| ACC_OB
    end

    USER_AGG --> WALLET_AGG
    USER_AGG -.->|å¼±ä??´| PROFILE
    ORG_ACC --> ORG_SETT & ORG_BIND
    ORG_ACC --> VS2_GOV
    ACC_ROLE & ACC_POL --> ACC_EBUS
    WALLET_AGG -->|"WalletDeducted/Credited"| ACC_EBUS
end

ID_LINK --> USER_AGG & ORG_ACC
ORG_BIND -.->|"ACL [#A2]"| ORG_AGG
ACC_EBUS -.->|"äº‹ä»¶å¥‘ç?"| SK_ENV
ACC_ROLE -.->|"role tag èªç¾©"| TE_RL

%% ?€?€ VS3 Skill ?€?€
subgraph VS3["?Ÿ© VS3 Â· Skill XP Sliceï¼ˆsrc/features/skill-xp.sliceï¼?]
    direction TB

    subgraph VS3_CORE["?™ï? Skill Domainï¼ˆsrc/features/skill-xp.sliceï¼?]
        SKILL_AGG["account-skill.aggregate\n?XP å¯«å…¥?¯ä?æ¬Šå??‘\naccountId / skillId(tagSlug)\nxp / version\n??tag::skill [TE_SK]\n??tag::skill-tier [TE_ST]"]
        XP_LED[("account-skill-xp-ledger\nentryId / delta / reason\nsourceId / timestamp [#13]")]
        XP_AWARD["xp-award-policy\n[A17] awardedXp = baseXp ? qualityMultiplier ? policyMultiplier\n??min/max clampï¼Œç?æ­¢æ¥­?™ç«¯ç¡¬å¯«?¬å?"]
    end

    subgraph VS3_EV["?“¢ Skill Events + Outboxï¼ˆsrc/features/skill-xp.sliceï¼‰[S1]"]
        SKILL_TASK_SRC["TaskCompletedï¼ˆfrom VS5ï¼‰\nbaseXp + semanticTagSlug"]
        SKILL_QA_SRC["QualityAssessedï¼ˆfrom VS5ï¼‰\nqualityScore"]
        SKILL_EV["SkillXpAdded / SkillXpDeducted\nï¼ˆå« tagSlug èªç¾©?»aggregateVersionï¼?]
        SKILL_OB["skill-outbox\n[SK_OUTBOX: SAFE_AUTO]\n??IER STANDARD_LANE"]
        SKILL_EV --> SKILL_OB
    end

    SKILL_TASK_SRC --> XP_AWARD
    SKILL_QA_SRC --> XP_AWARD
    XP_AWARD -->|"deltaXp"| SKILL_AGG
    SKILL_AGG -->|"[#13] ?°å?å¿…å¯« Ledger"| XP_LED
    SKILL_AGG --> SKILL_EV
end

SKILL_AGG -.->|"tagSlug ?¯è?å¼•ç”¨"| TAG_RO
SKILL_AGG -.->|"skill èªç¾©"| TE_SK
SKILL_AGG -.->|"skill-tier èªç¾©"| TE_ST
SKILL_EV -.->|"äº‹ä»¶å¥‘ç?"| SK_ENV
SKILL_EV -.->|"tier ?¨å?å¥‘ç?"| SK_SKILL_TIER

%% ?€?€ VS4 Organization ?€?€
subgraph VS4["?Ÿ§ VS4 Â· Organization Sliceï¼ˆsrc/features/organization.sliceï¼?]
    direction TB

    subgraph VS4_CORE["??ï¸?çµ„ç??¸å??Ÿï?src/features/organization.slice/coreï¼?]
        ORG_AGG["organization-core.aggregate"]
    end

    subgraph VS4_GOV["?›¡ï¸?çµ„ç?æ²»ç??Ÿï?src/features/organization.slice/gov.members + gov.partners + gov.policy + gov.teamsï¼?]
        ORG_MBR["org.memberï¼ˆtagSlug ?¯è?ï¼‰\n??tag::role [TE_RL]\n??tag::user-level [TE_UL]"]
        ORG_PTR["org.partnerï¼ˆtagSlug ?¯è?ï¼‰\n??tag::partner [TE_PT]"]
        ORG_TEAM["org.team\n??tag::team [TE_TM]"]
        ORG_POL["org.policy"]
        ORG_RECOG["org-skill-recognition.aggregate\nminXpRequired / status [#11]"]
    end

    subgraph VS4_TAG["?·ï¸?Tag çµ„ç?ä½œç”¨?Ÿï?src/features/organization.sliceï¼‰[S4]"]
        TAG_SUB["tag-lifecycle-subscriber\nè¨‚é–± IER BACKGROUND_LANE\nè²¬ä»»ï¼šå?æ­¥å…¨?Ÿæ?ç±¤è??´åˆ°çµ„ç?ä½œç”¨??]
        ORG_TAG_REG["org-semantic-registry.aggregate\nçµ„ç?èªç¾©å­—å…¸ï¼ˆtask-type/skill-typeï¼‰\n??org-task-type-registry + org-skill-type-registry çµ„æ?\n?½å?ç©ºé?ï¼šorg:{orgId}:task-type:* / org:{orgId}:skill-type:*"]
        SKILL_POOL[("org-skill-type-dictionary\nçµ„ç?ä½œç”¨?Ÿæ??½é??‹å??¸ï??¯å¯« Overlayï¼‰\n[S4: TAG_MAX_STALENESS ??30s]")]
        TASK_POOL[("org-task-type-dictionary\nçµ„ç?ä½œç”¨?Ÿä»»?™é??‹å??¸ï??¯å¯« Overlayï¼‰\n[S4: TAG_MAX_STALENESS ??30s]")]
        TALENT[["talent-repository [#16]\nMember + Partner + Team\n??ORG_ELIGIBLE_VIEW"]]
        TAG_SUB -->|"TagLifecycleEvent"| SKILL_POOL
        TAG_SUB -->|"TagLifecycleEvent"| TASK_POOL
        ORG_TAG_REG --> SKILL_POOL
        ORG_TAG_REG --> TASK_POOL
        ORG_MBR & ORG_PTR & ORG_TEAM --> TALENT
        TALENT -.->|äººå?ä¾†æ?| SKILL_POOL
        SKILL_POOL -.->|"çµ„ç??€?½æ?ç±¤æ?å½?| TAG_SNAP
        TASK_POOL -.->|"çµ„ç?ä»»å?æ¨™ç±¤?•å½±"| TAG_SNAP
    end

    subgraph VS4_EV["?“¢ Org Events + Outboxï¼ˆsrc/features/organization.sliceï¼‰[S1]"]
        ORG_EBUS["org-event-busï¼ˆin-processï¼‰\n?Producer-only [#2]?‘\nOrgContextProvisioned / MemberJoined\nMemberLeft / SkillRecognitionGranted/Revoked\nPolicyChanged"]
        ORG_OB["org-outbox [SK_OUTBOX: S1]\nDLQ: OrgContextProvisioned ??REVIEW_REQUIRED\n     MemberJoined/Left ??SAFE_AUTO\n     SkillRecog ??REVIEW_REQUIRED\n     PolicyChanged ??SECURITY_BLOCK"]
        ORG_EBUS -->|pending| ORG_OB
    end

    ORG_AGG & ORG_POL & ORG_RECOG --> ORG_EBUS
end

ORG_MBR -.->|"role tag èªç¾©"| TE_RL
ORG_MBR -.->|"user-level tag èªç¾©"| TE_UL
ORG_PTR -.->|"partner tag èªç¾©"| TE_PT
ORG_TEAM -.->|"team tag èªç¾©"| TE_TM
ORG_EBUS -.->|"äº‹ä»¶å¥‘ç?"| SK_ENV

%% ?€?€ VS5 Workspace ?€?€
subgraph VS5["?Ÿ£ VS5 Â· Workspace Sliceï¼ˆsrc/features/workspace.sliceï¼?]
    direction TB

    ORG_ACL["org-context.acl [E2]\nIER OrgContextProvisioned\n??Workspace ?¬åœ° Context [#10]"]

    subgraph VS5_APP["?™ï? Application Coordinatorï¼ˆsrc/features/workspace.sliceï¼‰[#3]"]
        direction LR
        WS_CMD_H["command-handler\n??SK_CMD_RESULT"]
        WS_SCP_G["scope-guard [#A9]"]
        WS_POL_E["policy-engine"]
        WS_TX_R["transaction-runner\n[#A8] 1cmd / 1agg"]
        WS_OB["ws-outbox\n[SK_OUTBOX: SAFE_AUTO / REVIEW_REQUIRED]\nCRITICAL_LANE: TaskAcceptedConfirmed [#A19 D29]\nSTANDARD_LANE: ä¸€?¬å?äº‹ä»¶ [E5]"]
        WS_CMD_H --> WS_SCP_G --> WS_POL_E --> WS_TX_R
        WS_TX_R -->|"pending events [E5]"| WS_OB
    end

    subgraph VS5_CORE["?™ï? Workspace Core Domainï¼ˆsrc/features/workspace.slice/core + core.event-bus + core.event-storeï¼?]
        WS_AGG["workspace-core.aggregate"]
        WS_EBUS["workspace-core.event-busï¼ˆin-process [E5]ï¼?]
        WS_ESTORE["workspace-core.event-store\n?…é???ç¨½æ ¸ [#9]"]
        WS_SETT["workspace-core.settings"]
    end

    subgraph VS5_GOV["?›¡ï¸?Workspace Governanceï¼ˆsrc/features/workspace.slice/gov.role + gov.audit + gov.members + gov.partners + gov.teamsï¼?]
        WS_ROLE["workspace-governance.role\nç¹¼æ‰¿ org-policy [#18]\n??tag::role [TE_RL]"]
        WS_PCHK["policy-eligible-check [#14]\nvia Query Gateway"]
        WS_AUDIT["workspace-governance.audit"]
        AUDIT_COL["audit-event-collector\nè¨‚é–± IER BACKGROUND_LANE\n??GLOBAL_AUDIT_VIEW"]
        WS_ROLE -.->|"[#18] eligible ?¥è©¢"| WS_PCHK
    end

    subgraph VS5_BIZ["?™ï? Business Domainï¼ˆsrc/features/workspace.slice/business.{tasks,quality-assurance,acceptance,finance,daily,document-parser,files,issues,workflow}ï¼ŒA+B ?™è?ï¼?]
        direction TB

        subgraph VS5_PARSE["?? ?‡ä»¶è§??ä¸‰å±¤?‰ç’°ï¼ˆsrc/features/workspace.slice/business.document-parserï¼‰[Layer-1 ??Layer-2 ??Layer-3]"]
            W_FILES["workspace.files"]
            W_PARSER["document-parser\nLayer-1 ?Ÿå?è§??\n??raw ParsedLineItem[]\n+ classifyCostItem() [VS8 Layer-2]\n??ParsedLineItem.(costItemType, semanticTagSlug)"]
            PARSE_INT[("ParsingIntent\nDigital Twin [#A4]\nlineItems[].(costItemType, semanticTagSlug, sourceIntentIndex)\nï¼ˆLayer-2 èªç¾©æ¨™æ³¨ + ä¾†æ?ç´¢å?ï¼?)]
            W_FILES -.->|?Ÿå?æª”æ?| W_PARSER --> PARSE_INT
        end

        subgraph VS5_WF["?™ï? Workflow State Machineï¼ˆsrc/features/workspace.slice/business.workflowï¼‰[R6]"]
            WF_AGG["workflow.aggregate\n?€?‹å?ç´„ï?Draft?’InProgress?’QA\n?’Acceptance(ACCEPTED via Validator)?’Completed\n[#A19] ?¶æ?æ¢ä»¶ï¼šæ??‰é???Finance_Request.status = PAIDï¼ˆç”± task-finance-label-view ?•å½±?æ?ï¼‰\nblockedBy: Set?¹issueId?º\n[#A3] blockedBy.isEmpty() ?å¯ unblock\n[æ³¨] Finance ?¨ç??Ÿå‘½?±æ???VS9 Finance Slice ç®¡ç?"]
        end

        subgraph VS5_A["?Ÿ¢ A-track ä¸»æ?ç¨‹ï?src/features/workspace.slice/business.tasks + business.quality-assurance + business.acceptanceï¼?]
            direction LR
            A_ITEMS["workspace.items\nä¾†æ?äº‹é?ï¼ˆSource of Workï¼‰\nä¿ç? sourceIntentIndex"]
            A_TASKS["tasks\n?€?‹ï?IN_PROGRESS"]
            A_QA["quality-assurance\n?€?‹ï?PENDING_QUALITY"]
            A_ACCEPT["acceptance\n?€?‹ï?PENDING_ACCEPTANCE"]
            A_VALIDATOR["task-accepted-validator [#A19]\n?§éƒ¨å®ˆè?ï¼šæª¢?¥é??¶ç°½??+ ?è³ª?ˆæ ¼è­‰\nç¦æ­¢å¤–éƒ¨?å??´æ¥è®Šæ›´ä»»å??€??]
            A_ACCEPTED["tasks.ACCEPTED [#A19 D29]\n?¼å‡º TaskAcceptedConfirmed äº‹ä»¶\nï¼ˆå?ä¸€ L2 Firestore TX ?Ÿå?å¯«å…¥ï¼?]
        end

        subgraph VS5_FIN["?’° Finance äº‹ä»¶æ©‹æ¥ï¼ˆsrc/features/workspace.slice/business.financeï¼‰[#A19 #A20]"]
            direction TB
            FIN_BRIDGE["TaskAcceptedConfirmed äº‹ä»¶æ©‹\n[#A19] ä»»å??°é? ACCEPTED ?€?‹å?\n??ws-outboxï¼ˆCRITICAL_LANEï¼‰\n??L4 IER ??VS9 Finance_Staging_Pool\n[#A20] ?¯è?è²»ä»»?™è‡ª?•è??„è‡³ Finance_Staging_Pool\nï¼ˆç?æ­?VS5 ?´æ¥?¼å« VS9 APIï¼?]
            FIN_LABEL["task-finance-labelï¼ˆå?ç¤ºå±¤ï¼‰\n[#A22] æ¶ˆè²» task-finance-label-view ?•å½±\né¡¯ç¤ºï¼šå·²é©—æ”¶ ï½??‘è??€?‹æ?ç±¤ï?REQ-001 / å¯©æ ¸ä¸­ï?"]
        end

        subgraph VS5_B["?”´ B-track ?°å¸¸?•ç?ï¼ˆsrc/features/workspace.slice/business.issuesï¼?]
            B_ISSUES{{"issues"}}
        end

        W_DAILY["daily\n?½å·¥?¥è?"]
        W_SCHED["workspace.scheduleï¼ˆWorkspaceScheduleï¼‰\nä»»å??‚é??–ï??‰æ??“ï?\nWorkspaceScheduleProposedï¼ˆå??æ?ï¼‰\nTask ??WorkspaceSchedule ?®å?æ©‹æ¥ [D27-Order #A5]"]

        PARSE_INT -->|"[Layer-3 Semantic Router]\nshouldMaterializeAsTask(costItemType) [D27-Gate]\n?ˆå½¢??WorkspaceItem"| A_ITEMS
        A_ITEMS -->|"??EXECUTABLE äº‹é??¯ç‰©?–ä»»?™\nä¿ç? sourceIntentIndex ?’å? [D27-Order]"| A_TASKS
        PARSE_INT -.->|"è²¡å??™é¸è³‡æ?ï¼ˆé??æ®µ?·ç§»ï¼?| FIN_BRIDGE
        PARSE_INT -->|è§???°å¸¸| B_ISSUES
        A_TASKS -.->|"SourcePointer [#A4]"| PARSE_INT
        PARSE_INT -.->|"IntentDeltaProposed [#A4]"| A_TASKS
        WF_AGG -.->|stage-view| A_TASKS & A_QA & A_ACCEPT
        A_TASKS --> A_QA --> A_ACCEPT --> A_VALIDATOR --> A_ACCEPTED
        A_ACCEPTED -.->|"TaskAcceptedConfirmedï¼ˆCRITICAL_LANEï¼‰[#A19 D29]"| FIN_BRIDGE
        A_ACCEPTED -.->|"task-finance-label-view ?•å½±?æ?"| FIN_LABEL
        WF_AGG -->|"blockWorkflow [#A3]"| B_ISSUES
        A_TASKS -.-> W_DAILY
        A_TASKS -.->|ä»»å??†é??æ?ï¼ˆTask?’Scheduleï¼‰| W_SCHED
        W_SCHED -.->|"WorkspaceScheduleProposed [#A5]"| SCH_SAGA
        PARSE_INT -.->|"?·èƒ½?€æ±?T4"| W_SCHED
    end

    ORG_ACL -.->|?¬åœ° Org Context| VS5_APP
    B_ISSUES -->|IssueResolved| WS_EBUS
    WS_EBUS -.->|"blockedBy.delete(issueId) [#A3]"| WF_AGG
    WS_TX_R -->|"[#A8]"| WS_AGG
    WS_TX_R -.->|?·è?æ¥­å??è¼¯| VS5_BIZ
    WS_AGG --> WS_ESTORE
    WS_AGG -->|"in-process [E5]"| WS_EBUS
end

W_FILES -.->|"uses IFileStore"| I_STORE
WS_EBUS -.->|"äº‹ä»¶å¥‘ç?"| SK_ENV
WS_ROLE -.->|"role tag èªç¾©"| TE_RL
WS_PCHK -.->|"[#14]"| QGWAY_SCHED
WS_CMD_H -.->|"?·è?çµæ?"| SK_CMD_RESULT
W_SCHED -.->|"tagSlug T4"| TAG_RO
W_SCHED -.->|"äººå??€æ±‚å?ç´?| SK_SKILL_REQ
A_TASKS -.->|"TaskCompleted(baseXp, semanticTagSlug) [A17]"| SKILL_TASK_SRC
A_QA -.->|"QualityAssessed(qualityScore) [A17]"| SKILL_QA_SRC
XP_AWARD -.->|"semanticTag policy lookup [D21-7 T5]"| TAG_RO

%% ?€?€ VS6 Workforce Scheduling ?€?€
subgraph VS6["?Ÿ¨ VS6 Â· Workforce Scheduling Sliceï¼ˆsrc/features/workforce-scheduling.slice Â· ?’ç­?”ä?ï¼?]
    direction TB

    subgraph VS6_CMD_LAYER["?™ï? Command Layerï¼ˆsrc/features/workforce-scheduling.sliceï¼Œå¯«?´ï?"]
        SCH_CMD["schedule-command-handler\n?…æ¥?¶æ??­å‘½ä»¤ï?ç¦æ­¢ UI ?´å¯«ï¼‰\n?å‚³ SK_CMD_RESULT"]
        SCH_CONFLICT["schedule-conflict-checker\n?‚é?/è³‡æ?è¡ç?æª¢æŸ¥ï¼ˆå¯«?´å??€ï¼?]
        ORG_SCH["organization.schedule.aggregateï¼ˆOrganizationScheduleï¼‰\näººå??‡æ´¾?šå?ï¼ˆä? workspace schedule ?æ?ï¼‰\nHR Scheduling (tagSlug T4)\n?ˆé?è­?SK_SKILL_REQ + TAG_STALE_GUARD\näº‹ä»¶å¸?aggregateVersion [R7]"]
        SCH_CMD --> SCH_CONFLICT --> ORG_SCH
    end

    subgraph VS6_SAGA["?™ï? Workforce-Scheduling Sagaï¼ˆsrc/features/workforce-scheduling.sliceï¼‰[#A5]"]
        SCH_SAGA["workforce-scheduling-saga\n?¥æ”¶ WorkspaceScheduleProposed\neligibility check [#14]\ncompensating:\n  ScheduleAssignRejected\n  ScheduleProposalCancelled\nï¼ˆé?æ±‚å?å°åŸ·è¡Œï??·è?å¼•å??”ä?ï¼?]
    end

    subgraph VS6_OB["?“¤ Schedule Outboxï¼ˆsrc/features/workforce-scheduling.sliceï¼‰[S1]"]
        SCH_OB["sched-outbox\n[SK_OUTBOX: S1]\nDLQ: ScheduleAssigned ??REVIEW_REQUIRED\n     Compensating Events ??SAFE_AUTO"]
    end

    ORG_SCH -.->|"[#14] ?ªè? eligible=true"| QGWAY_SCHED
    ORG_SCH -.->|"?½å?/è¦–è¦º?ªè? tag-snapshot [VS8-Tag T5]"| TAG_RO
    ORG_SCH -.->|"tagSlug ?°é®®åº¦æ ¡é©?| TAG_SG
    ORG_SCH -->|"ScheduleAssigned + aggregateVersion"| SCH_OB
    ORG_SCH -.->|"äººå??€æ±‚å?ç´?| SK_SKILL_REQ
    SCH_SAGA -->|compensating event| SCH_OB
    SCH_SAGA -.->|"?”èª¿ handleScheduleProposed"| SCH_CMD
end

%% ?€?€ VS7 Notificationï¼ˆCross-cutting Authority Â· ?æ?ä¸­æ?ï¼‰â??€
subgraph VS7["?©· VS7 Â· Notification Hubï¼ˆsrc/features/notification-hub.slice Â· è·¨å??‡æ?å¨ï?"]
    direction TB

    NOTIF_R["notification-router\n?¡ç??‹è·¯??[#A10]\næ¶ˆè²» IER STANDARD_LANE\nScheduleAssigned [E3]\nå¾?envelope è®€??traceId [R8]"]
    NOTIF_EXIT["notification-hub._services.ts\nNOTIF_EXITï¼ˆå”¯ä¸€?¯ä??¨å‡º???\næ¨™ç±¤?ŸçŸ¥è·¯ç”±ç­–ç•¥\nå°æ¥ VS8 èªç¾©ç´¢å?\n#channel:slack ??Slack\n#urgency:high ???»è©±"]

    subgraph VS7_DEL["?“¤ Deliveryï¼ˆsrc/features/notification-hub.sliceï¼?]
        USER_NOTIF["src/features/notification-hub.slice/domain.notification\n?‹äºº?¨æ’­ + RTDB ?³æ??šçŸ¥ä¸²æ?"]
        USER_DEV["ä½¿ç”¨?…è?ç½?]
        USER_NOTIF --> USER_DEV
    end

    NOTIF_R -->|TargetAccountID ?¹é?| NOTIF_EXIT
    NOTIF_EXIT -->|è·¯ç”±ç­–ç•¥æ±ºå?| USER_NOTIF
    PROFILE -.->|"FCM Tokenï¼ˆå”¯è®€ï¼?| USER_NOTIF
end

NOTIF_EXIT -.->|"uses IMessaging [R8]"| I_MSG
USER_NOTIF -.->|"[#6] RTDB ?³æ??šçŸ¥ä¸²æ?ï¼ˆä?å»¶é² Â· L7-A RTDBAdapterï¼?| QGWAY_NOTIF
NOTIF_EXIT -.->|"æ¨™ç±¤?ŸçŸ¥è·¯ç”±"| VS8

%% ?€?€ VS9 Financeï¼ˆå·¥ä½œå?ä»»å??‘è??šå??˜é?ï¼‰â??€
subgraph VS9["?’³ VS9 Â· Finance Sliceï¼ˆsrc/features/finance.slice Â· ?‘è??šå??˜é?ï¼?]
    direction TB

    FIN_STAGING_ACL["finance-staging.acl [#A20]\næ¶ˆè²» IER CRITICAL_LANE TaskAcceptedConfirmed\n?¥ä»»?™æ?è¨»ç‚º?¯è?è²???è½‰é???Finance_Staging_Pool\näº‹å¯¦è½‰é??«ï?taskId, amount, tags, traceId, acceptedAt"]

    subgraph VS9_POOL["?’¼ Finance Staging Poolï¼ˆsrc/features/finance.slice/staging-poolï¼‰[#A20]"]
        direction LR
        FIN_STAGE_POOL[("Finance_Staging_Pool\nL5 Standard Projection [#A20]\n?€?‹ï?PENDINGï¼ˆå·²é©—æ”¶?ªè?æ¬¾ï?| LOCKED_BY_FINANCEï¼ˆæ??…ä¸­ï¼‰\næ¬„ä?ï¼štaskId, amount, tags, traceId, acceptedAt, status")]
    end

    subgraph VS9_CMD["??Finance Command Layerï¼ˆsrc/features/finance.slice/applicationï¼?]
        direction LR
        FIN_REQ_CMD["create-bulk-payment-command-handler\n?¥æ”¶ CreateBulkPaymentCommand\n?“å?ä»»æ??¸é?ä»»å?\n?“å?å¾?Finance_Staging_Pool ä¸­ä»»?™ç?????LOCKED_BY_FINANCE [#A20]\n?²æ­¢?è?è«‹æ¬¾"]
    end

    subgraph VS9_AGG["?™ï? Finance Request Aggregateï¼ˆsrc/features/finance.slice/coreï¼‰[#A21]"]
        direction TB
        FIN_REQ_AGG["finance-request.aggregate [#A21]\næ¯ç??“å??•ä??Ÿæ?ä¸€??Finance_Request\n?€?‹æ?ï¼šDRAFT ??AUDITING ??DISBURSING ??PAID\nbundledTaskIds[]ï¼?:N æº¯æ??œä?ï¼‰\ntraceId ç¹¼æ‰¿?ªè§¸?¼å‘½ä»¤\n[S3] ?€?‹ç²¾ç¢ºè?????STRONG_READ"]
    end

    subgraph VS9_EV["?“¢ Finance Events + Outboxï¼ˆsrc/features/finance.sliceï¼‰[S1]"]
        FIN_OB["finance-outbox\n[SK_OUTBOX: REVIEW_REQUIRED]\nFinanceRequestStatusChanged ??STANDARD_LANE\n[D29] Finance_Request ?€?‹è??´è? Outbox å¯«å…¥?Œä? Firestore TX"]
    end

    FIN_STAGING_ACL -->|"PENDING è½‰é?"| FIN_STAGE_POOL
    FIN_STAGE_POOL -->|"?“å??¸å? [#A20]"| FIN_REQ_CMD
    FIN_REQ_CMD -->|"CreateBulkPaymentCommand"| FIN_REQ_AGG
    FIN_REQ_AGG --> FIN_OB
end

%% ?€??OUTBOX ??RELAY
ACC_OB & ORG_OB & SCH_OB & SKILL_OB & TAG_OB & WS_OB & FIN_OB -.->|"è¢?RELAY ?ƒæ? [R1]"| RELAY

%% Outbox Lane Declarations
ACC_OB -->|"CRITICAL_LANE: Role/Policy/Wallet"| IER
ACC_OB -->|"STANDARD_LANE: AccountCreated"| IER
ORG_OB -->|"CRITICAL_LANE: OrgContextProvisioned?»PolicyChanged"| IER
ORG_OB -->|"STANDARD_LANE: MemberJoined/Left?»SkillRecog"| IER
SKILL_OB -->|"STANDARD_LANE"| IER
SCH_OB -->|"STANDARD_LANE"| IER
WS_OB -->|"CRITICAL_LANE: TaskAcceptedConfirmed [#A19]"| IER
WS_OB -->|"STANDARD_LANE [E5]"| IER
FIN_OB -->|"STANDARD_LANE: FinanceRequestStatusChanged [#A22]"| IER
TAG_OB -->|"BACKGROUND_LANE"| IER

%% IER ??Domain Slice æ¶ˆè²»
CRIT_LANE -.->|"RoleChanged/PolicyChanged [S6]"| CLAIMS_H
CRIT_LANE -.->|"OrgContextProvisioned [E2]"| ORG_ACL
CRIT_LANE -.->|"TaskAcceptedConfirmed [#A19 #A20]"| FIN_STAGING_ACL
ORG_EBUS -.->|"OrgContextProvisioned äº‹ä»¶ä¾†æ? [E2]"| ORG_ACL
STD_LANE -.->|"ScheduleAssigned [E3]"| NOTIF_R
STD_LANE -.->|"ScheduleProposed [#A5]"| SCH_SAGA
STD_LANE -.->|"FinanceRequestStatusChanged [#A22]"| TASK_FIN_LABEL_V
BG_LANE -.->|"TagLifecycleEvent [T1]"| TAG_SUB
BG_LANE -.->|"è·¨ç?ç¨½æ ¸"| AUDIT_COL

%% ?â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â???
%% CONNECTIVITY STITCH ZONEï¼ˆé?ä¸­é€???€å¡Šï??¿å?ç·šæ®µ?†æ•£ï¼?
%% ?â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â???

FUNNEL -.->|"uses IFirestoreRepo [S2]"| I_REPO
WS_SCOPE_V -.->|"å¿«ç…§å¥‘ç?"| SK_AUTH_SNAP
ACC_PROJ_V -.->|"å¿«ç…§å¥‘ç?"| SK_AUTH_SNAP
SKILL_V -.->|"tier ?¨å?"| SK_SKILL_TIER
ORG_ELIG_V -.->|"skill tag èªç¾©"| TE_SK
ORG_ELIG_V -.->|"skill-tier tag èªç¾©"| TE_ST
AUDIT_COL -.->|"è·¨ç?ç¨½æ ¸"| AUDIT_V

%% ?€?€ Connectivity A: Query Spineï¼ˆL5 ??L6ï¼‰â??€
READ_REG -.->|"?ˆæœ¬?®é?"| QGWAY
ORG_ELIG_V -.-> QGWAY_SCHED
CAL_PROJ -.-> QGWAY_CAL_DAY
CAL_PROJ -.-> QGWAY_CAL_ALL
TL_PROJ -.-> QGWAY_TL_MEMBER
TL_PROJ -.-> QGWAY_TL_ALL
ACC_PROJ_V -.-> QGWAY_NOTIF
WS_SCOPE_V -.-> QGWAY_SCOPE
WALLET_V -.-> QGWAY_WALLET
TAG_SNAP -.-> QGWAY_SEARCH
SEM_GOV_V -.-> QGWAY_SEM_GOV
FINANCE_STAGE_V -.-> QGWAY_FIN_STAGE
TASK_FIN_LABEL_V -.-> QGWAY_FIN_LABEL
ACTIVE_CTX -->|"?¥è©¢??| QGWAY_SCOPE
SK_AUTH_SNAP -.->|"AuthoritySnapshot å¥‘ç? [#A9]"| CBG_AUTH

%% ?€?€ Connectivity B: VS0 Foundationï¼ˆVS0-Kernel ??VS0-Infra ??L8ï¼‰â??€
AUTH_ADP -.->|"implements"| I_AUTH
FSTORE_ADP -.->|"implements [S2]"| I_REPO
FCM_ADP -.->|"implements [R8]"| I_MSG
STORE_ADP -.->|"implements"| I_STORE
SK_PORTS -.->|"contract bridge"| AC_TRANSLATOR_L7
SK_INFRA -.->|"S2/R8/S4 è¦å?ç´„æ?"| FIREBASE_ACL
SK_INFRA -.->|"D25 é«˜æ???è·¨ç????’ç?"| FIREBASE_BACKEND
AUTH_ADP --> F_AUTH
FSTORE_ADP --> F_DB
RTDB_ADP --> F_RTDB
FCM_ADP --> F_FCM
STORE_ADP --> F_STORE
ANALYTICS_ADP --> F_ANALYTICS
APPCHK_ADP --> F_APPCHK
BFN_GW --> F_FUNCTIONS
ADMIN_AUTH_ADP --> F_AUTH
ADMIN_DB_ADP --> F_DB
ADMIN_MSG_ADP --> F_FCM
ADMIN_STORE_ADP --> F_STORE
ADMIN_APPCHK_ADP --> F_APPCHK
BDC_GW --> F_DC

EXT_CLIENT -.->|"UI è¡Œç‚º?™æ¸¬ï¼ˆGA eventsï¼?| ANALYTICS_ADP
EXT_WEBHOOK --> BFN_GW
CBG_ROUTE -.->|"é«˜æ????¹æ¬¡?”èª¿?¥å£"| BFN_GW
QGWAY -.->|"æ²»ç???GraphQL ?¥è©¢å¥‘ç?"| BDC_GW

%% ?€?€ Connectivity C: Observabilityï¼ˆL2/L4/L5 ??L9ï¼‰â??€
CBG_ENTRY --> TRACE_ID
IER --> DOMAIN_METRICS
FUNNEL --> DOMAIN_METRICS
RELAY -.->|"relay_lag metrics"| DOMAIN_METRICS
RATE_LIM -.->|"hit metrics"| DOMAIN_METRICS
CIRCUIT -.->|"open/half-open"| DOMAIN_METRICS
WS_TX_R --> DOMAIN_ERRORS
SCH_SAGA --> DOMAIN_ERRORS
DLQ_B -.->|"å®‰å…¨?Šè­¦"| DOMAIN_ERRORS
TAG_SG -.->|"StaleTagWarning"| DOMAIN_ERRORS
TOKEN_SIG -.->|"Claims ?·æ–°?å? [S6]"| DOMAIN_METRICS

%% ?€?€ Connectivity D: Visualization Busï¼ˆL5 ?•å½± ??Firebase L8 ??vis-data DataSet å¿«å? ??vis-* rendererï¼‰[D28]?€?€
TASK_V -.->|"[D28] tasks-viewï¼ˆä»»?™ç?é»ï?"| VIS_DATA_ADP
WS_GRAPH_V -.->|"[D28] workspace-graph-viewï¼ˆnodes/edgesï¼?| VIS_DATA_ADP
TL_PROJ -.->|"[D28] schedule-timeline-viewï¼ˆtimeline itemsï¼?| VIS_DATA_ADP
SEM_GOV_V -.->|"[D28] semantic-governance-viewï¼?D graphï¼?| VIS_DATA_ADP

%% ?€?€ Global Searchï¼ˆCross-cutting Authority Â· èªç¾©?€?¶ï??€?€
GLOBAL_SEARCH["?? Global Searchï¼ˆsrc/features/global-search.slice Â· è·¨å??‡æ?å¨ï?\nL6 Query Gateway ?¸å?æ¶ˆè²»?…\nèªç¾©?–ç´¢å¼•æª¢ç´¢\n?¯ä?è·¨å??œå?æ¬Šå?\nå°æ¥ VS8 èªç¾©ç´¢å?\nCmd+K ?¯ä??å??ä??…\n_actions.ts / _services.ts [D26]"]
GLOBAL_SEARCH -->|"èªç¾©?–ç´¢å¼•æª¢ç´?| QGWAY_SEARCH
GLOBAL_SEARCH -.->|"queries VS8 semantic index [D26]"| VS8

%% ?€?€ VS8 Semantic Graph è·¨å??‡è?ç¾©æ?ä¾??€?€
VS8 -.->|"èªç¾©?•å½±è¼¸å‡ºï¼ˆå”¯è®€ï¼?| TAG_SNAP
VS5 -.->|"èªç¾©è®€?–å?ç¶?L6 [D21-7 T5]"| QGWAY_SEARCH
VS6 -.->|"èªç¾©è®€?–å?ç¶?L6 [D21-7 T5]"| QGWAY_SEARCH
COST_CLASSIFIER -.->|"classifyCostItem() [Layer-2 D27 #A14]"| W_PARSER

%% ?â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â???
%% MAIN FLOWï¼šå??¨å…¥?????˜é? ???‡ç?
%% ?â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â???

EXT_CLIENT --> RATE_LIM
EXT_WEBHOOK --> RATE_LIM
CBG_ROUTE -->|"Workspace Command"| WS_CMD_H
CBG_ROUTE -->|"Skill Command"| SKILL_AGG
CBG_ROUTE -->|"Org Command"| ORG_AGG
CBG_ROUTE -->|"Account Command"| USER_AGG
CBG_ROUTE -->|"Finance Command [#A21]"| FIN_REQ_CMD

%% ?â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â???
%% STYLES
%% ?â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â???

classDef sk fill:#ecfeff,stroke:#22d3ee,color:#000,font-weight:bold
classDef skInfra fill:#f0f9ff,stroke:#0369a1,color:#000,font-weight:bold
classDef skAuth fill:#fdf4ff,stroke:#7c3aed,color:#000,font-weight:bold
classDef tagAuth fill:#cffafe,stroke:#0891b2,color:#000,font-weight:bold
classDef tagEnt fill:#ecfdf5,stroke:#059669,color:#000,font-weight:bold,stroke-width:2px
classDef infraPort fill:#e0f7fa,stroke:#00838f,color:#000,font-weight:bold
classDef identity fill:#dbeafe,stroke:#93c5fd,color:#000
classDef ctxNode fill:#eff6ff,stroke:#1d4ed8,color:#000,font-weight:bold
classDef claimsNode fill:#dbeafe,stroke:#1d4ed8,color:#000,font-weight:bold
classDef tokenSig fill:#fef3c7,stroke:#d97706,color:#000,font-weight:bold
classDef account fill:#dcfce7,stroke:#86efac,color:#000
classDef outboxNode fill:#fef3c7,stroke:#d97706,color:#000,font-weight:bold
classDef relay fill:#f0fdf4,stroke:#15803d,color:#000,font-weight:bold
classDef skillSlice fill:#bbf7d0,stroke:#22c55e,color:#000
classDef orgSlice fill:#fff7ed,stroke:#fdba74,color:#000
classDef tagSub fill:#fef9c3,stroke:#ca8a04,color:#000,font-weight:bold
classDef wsSlice fill:#ede9fe,stroke:#c4b5fd,color:#000
classDef wfNode fill:#fdf4ff,stroke:#9333ea,color:#000,font-weight:bold
classDef cmdResult fill:#f0fdf4,stroke:#16a34a,color:#000,font-weight:bold
classDef schedSlice fill:#fef9c3,stroke:#ca8a04,color:#000
classDef notifSlice fill:#fce7f3,stroke:#db2777,color:#000
classDef critProj fill:#fee2e2,stroke:#dc2626,color:#000,font-weight:bold
classDef stdProj fill:#fef9c3,stroke:#d97706,color:#000
classDef eligGuard fill:#fee2e2,stroke:#b91c1c,color:#000,font-weight:bold
classDef auditView fill:#f0fdf4,stroke:#15803d,color:#000,font-weight:bold
classDef gateway fill:#f8fafc,stroke:#334155,color:#000,font-weight:bold
classDef guardLayer fill:#fff1f2,stroke:#e11d48,color:#000,font-weight:bold
classDef cmdGw fill:#eff6ff,stroke:#2563eb,color:#000
classDef eventGw fill:#fff7ed,stroke:#ea580c,color:#000
classDef critLane fill:#fee2e2,stroke:#dc2626,color:#000,font-weight:bold
classDef stdLane fill:#fef9c3,stroke:#ca8a04,color:#000
classDef bgLane fill:#f1f5f9,stroke:#64748b,color:#000
classDef dlqNode fill:#fca5a5,stroke:#b91c1c,color:#000,font-weight:bold
classDef dlqSafe fill:#d1fae5,stroke:#059669,color:#000,font-weight:bold
classDef dlqReview fill:#fef9c3,stroke:#ca8a04,color:#000,font-weight:bold
classDef dlqBlock fill:#fca5a5,stroke:#b91c1c,color:#000,font-weight:bold
classDef qgway fill:#f0fdf4,stroke:#15803d,color:#000
classDef staleGuard fill:#fef3c7,stroke:#b45309,color:#000,font-weight:bold
classDef obs fill:#f1f5f9,stroke:#64748b,color:#000
classDef trackA fill:#d1fae5,stroke:#059669,color:#000
classDef tierFn fill:#fdf4ff,stroke:#9333ea,color:#000
classDef talent fill:#fff1f2,stroke:#f43f5e,color:#000
classDef serverAct fill:#fed7aa,stroke:#f97316,color:#000
classDef aclAdapter fill:#fce4ec,stroke:#ad1457,color:#000,font-weight:bold
classDef firebaseExt fill:#fff9c4,stroke:#f9a825,color:#000,font-weight:bold
classDef semanticGraph fill:#e0e7ff,stroke:#4f46e5,color:#000,font-weight:bold
classDef crossCutAuth fill:#fde68a,stroke:#b45309,color:#000,font-weight:bold,stroke-width:3px

class SK,SK_ENV,SK_AUTH_SNAP,SK_SKILL_TIER,SK_SKILL_REQ,SK_CMD_RESULT,SK_OBS_PATH sk
class SK_OUTBOX,SK_VERSION,SK_READ,SK_STALE,SK_RESILIENCE skInfra
class SK_TOKEN skAuth
class CTA,TAG_EV,TAG_RO tagAuth
class TE_UL,TE_SK,TE_ST,TE_TM,TE_RL,TE_PT tagEnt
class TAG_SG staleGuard
class TAG_OB outboxNode
class SK_PORTS,I_AUTH,I_REPO,I_MSG,I_STORE infraPort
class VS1,AUTH_ID,ID_LINK identity
class ACTIVE_CTX,CTX_MGR ctxNode
class CLAIMS_H,CUSTOM_C claimsNode
class TOKEN_SIG tokenSig
class VS2,USER_AGG,WALLET_AGG,PROFILE,ORG_ACC,ORG_SETT,ORG_BIND,ACC_ROLE,ACC_POL,ACC_EBUS account
class ACC_OB outboxNode
class VS3,SKILL_AGG,XP_LED skillSlice
class SKILL_EV,SKILL_OB skillSlice
class VS4,ORG_AGG,ORG_MBR,ORG_PTR,ORG_TEAM,ORG_POL,ORG_RECOG,ORG_EBUS orgSlice
class TAG_SUB tagSub
class ORG_OB outboxNode
class VS5,WS_CMD_H,WS_SCP_G,WS_POL_E,WS_TX_R,WS_OB,WS_AGG,WS_EBUS,WS_ESTORE,WS_SETT,WS_ROLE,WS_PCHK,WS_AUDIT wsSlice
class WF_AGG wfNode
class AUDIT_COL auditView
class A_ITEMS,A_TASKS,A_QA,A_ACCEPT,A_VALIDATOR,A_ACCEPTED trackA
class FIN_BRIDGE,FIN_LABEL wfNode
class B_ISSUES,W_DAILY,W_SCHED wsSlice
class VS6,SCH_CMD,SCH_CONFLICT,ORG_SCH,SCH_SAGA schedSlice
class SCH_OB outboxNode
class VS7,NOTIF_R,USER_NOTIF,USER_DEV notifSlice
class UNIFIED_GW,CQRS_WRITE,CQRS_READ,GW_GUARD,GW_PIPE gateway
class RATE_LIM,CIRCUIT,BULKHEAD guardLayer
class CMD_API_GW,CBG_ENTRY,CBG_AUTH,CBG_ROUTE cmdGw
class GW_IER,IER_CORE,IER eventGw
class RELAY relay
class CRIT_LANE critLane
class STD_LANE stdLane
class BG_LANE bgLane
class DLQ dlqNode
class DLQ_S dlqSafe
class DLQ_R dlqReview
class DLQ_B dlqBlock
class QRY_API_GW,GW_QUERY,QGWAY,QGWAY_SCHED,QGWAY_CAL_DAY,QGWAY_CAL_ALL,QGWAY_TL_MEMBER,QGWAY_TL_ALL,QGWAY_NOTIF,QGWAY_SCOPE,QGWAY_WALLET,QGWAY_SEARCH,QGWAY_SEM_GOV,QGWAY_FIN_STAGE,QGWAY_FIN_LABEL qgway
class PROJ_BUS,FUNNEL,PROJ_VER,READ_REG stdProj
class CRIT_PROJ,WS_SCOPE_V,ORG_ELIG_V,WALLET_V critProj
class STD_PROJ,WS_PROJ,ACC_SCHED_V,CAL_PROJ,TL_PROJ,ACC_PROJ_V,ORG_PROJ_V,SKILL_V,TASK_V,WS_GRAPH_V,FINANCE_STAGE_V,TASK_FIN_LABEL_V stdProj
class AUDIT_V auditView
class TAG_SNAP tagSub
class TIER_FN tierFn
class TALENT talent
class OBS_LAYER,OBS_PATH,TRACE_ID,DOMAIN_METRICS,DOMAIN_ERRORS obs
class FIREBASE_L7,FIREBASE_ACL,AC_TRANSLATOR_L7,AUTH_ADP,FSTORE_ADP,RTDB_ADP,FCM_ADP,STORE_ADP,ANALYTICS_ADP aclAdapter
class APPCHK_ADP,VIS_DATA_ADP aclAdapter
class FIREBASE_BACKEND,BFN_GW,BDC_GW,ADMIN_ADPTS,ADMIN_AUTH_ADP,ADMIN_DB_ADP,ADMIN_MSG_ADP,ADMIN_STORE_ADP,ADMIN_APPCHK_ADP aclAdapter
class FIREBASE_EXT,F_AUTH,F_DB,F_RTDB,F_FCM,F_STORE,F_ANALYTICS,F_APPCHK,F_DC,F_FUNCTIONS firebaseExt
class EXT_CLIENT,EXT_AUTH,EXT_WEBHOOK serverAct
class VS8 semanticGraph
class GLOBAL_SEARCH crossCutAuth
class NOTIF_EXIT crossCutAuth
class VS9,FIN_STAGING_ACL,FIN_STAGE_POOL,FIN_REQ_CMD,FIN_REQ_AGG,FIN_OB crossCutAuth

%%  ?”â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â?
%%  ?? CONSISTENCY INVARIANTS å®Œæ•´ç´¢å?                                         ??
%%  ? â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â•£
%%  #1   æ¯å€?BC ?ªèƒ½ä¿®æ”¹?ªå·±??Aggregate
%%  #2   è·?BC ?…èƒ½?é? Event / Projection / ACL æºé€?
%%  #3   Application Layer ?ªå?èª¿ï?ä¸æ‰¿è¼‰é??Ÿè???
%%  #4a  Domain Event ?…ç”± Aggregate ?¢ç?ï¼ˆå”¯ä¸€?Ÿæ??…ï?
%%  #4b  TX Runner ?ªæ???Outboxï¼Œä??¢ç? Domain Eventï¼ˆå?å·¥ç?å®šï?
%%  #5   Custom Claims ?ªå?å¿«ç…§ï¼Œé??Ÿå¯¦æ¬Šé?ä¾†æ?
%%  #6   Notification ?ªè? Projection
%%  #7   Scope Guard ?…è???Context Read Model
%%  #8   Shared Kernel å¿…é?é¡¯å?æ¨™ç¤ºï¼›æœªæ¨™ç¤ºè·?BC ?±ç”¨è¦–ç‚ºä¾µå…¥
%%  #9   Projection å¿…é??¯ç”±äº‹ä»¶å®Œæ•´?å»º
%%  #10  ä»»ä?æ¨¡ç??€å¤–éƒ¨ Context ?§éƒ¨?€??= ?Šç?è¨­è??¯èª¤
%%  #11  XP å±?Account BCï¼›Organization ?ªè¨­?€æª?
%%  #12  Tier æ°¸é??¯æ¨å°å€¼ï?ä¸å? DB
%%  #13  XP ?°å?å¿…é?å¯?Ledger
%%  #14  Schedule ?ªè? ORG_ELIGIBLE_MEMBER_VIEW
%%  #15  eligible ?Ÿå‘½?±æ?ï¼šjoined?’true Â· assigned?’false Â· completed/cancelled?’true
%%  #16  Talent Repository = member + partner + team
%%  #17  centralized-tag.aggregate ??tagSlug ?¯ä??Ÿç›¸
%%  #18  workspace-governance role ç¹¼æ‰¿ policy ç¡¬ç???
%%  #19  ?€??Projection ?´æ–°å¿…é?ä»?aggregateVersion ?®èª¿?å??ºå???[S2 æ³›å?]
%%  ? â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â•£
%%  ATOMICITY AUDIT å®Œæ•´ç´¢å?
%%  #A1  wallet å¼·ä??´ï?profile/notification å¼±ä???
%%  #A2  org-account.binding ??ACL/projection ?²è?å°æ¥
%%  #A3  blockWorkflow ??blockedBy Setï¼›allIssuesResolved ??unblockWorkflow
%%  #A4  ParsingIntent ?ªå?è¨±æ?è­°ä?ä»?
%%  #A5  schedule è·?BC saga/compensating event
%%  #A6  ?¨å?èªç¾©æ¬Šå? = VS8 CENTRALIZED_TAG_AGGREGATEï¼›ç?ç¹”ä»»?™é????€?½é??‹æ“´å±•æ?å¨?= VS4 org-semantic-registry [D21-1]
%%  #A7  Event Funnel ?ªå? compose
%%  #A8  TX Runner 1cmd/1agg ?Ÿå??äº¤
%%  #A9  Scope Guard å¿«è·¯å¾‘ï?é«˜é¢¨?ªå?æº?aggregate
%%  #A10 Notification Router ?¡ç??‹è·¯??
%%  #A11 eligible = ?Œç„¡è¡ç??’ç­?å¿«?§ï??é??‹ç???
%%  #A12 Global Search = è·¨å??‡æ?å¨ï?èªç¾©?€?¶ï?ï¼Œå”¯ä¸€è·¨å??œå??ºå£ï¼Œç?æ­¢å? Slice ?ªå»º?œå??è¼¯
%%  #A13 Notification Hub = è·¨å??‡æ?å¨ï??æ?ä¸­æ?ï¼‰ï??¯ä??¯ä??¨å‡º???æ¥­å? Slice ?ªç”¢?Ÿä?ä»¶ä?æ±ºå??šçŸ¥ç­–ç•¥
%%  #A14 Cost Semantic ?™éµ?†é?ï¼ˆLayer-2ï¼? VS8 _cost-classifier.ts ç´”å‡½å¼è¼¸??(costItemType, semanticTagSlug)ï¼?
%%       VS5 Layer-3 Semantic Router = use-workspace-event-handlerï¼?
%%       ??EXECUTABLE ?…ç›®?©å???tasksï¼›å…¶é¤˜å…­é¡é?é»˜è·³?ä¸¦ toast [D27]
%%  #A15 Finance ?²å…¥?˜é?ï¼šä»»?™å??ˆé???ACCEPTEDï¼ˆé€šé? task-accepted-validator [#A19]ï¼‰æ??¯é€²å…¥ Finance Staging Poolï¼?
%%       Finance ?¨ç??Ÿå‘½?±æ???VS9 ç®¡ç?ï¼ˆFinance_Requestï¼šDRAFT?’AUDITING?’DISBURSING?’PAID [#A21]ï¼?
%%  #A16 ï¼ˆå·²??#A21 ?‡ç??–ä»£ï¼‰Finance_Request ?Ÿå‘½?±æ??ˆç?ï¼?
%%       Workflow Completed æ¢ä»¶?ºæ??‰é???Finance_Request.status = PAIDï¼?
%%       ç¦æ­¢?¨æ–°å·¥ä?ä¸­å???#A16ï¼›è???Multi-Claim å¾ªç’°?è¼¯å·²é·ç§»è‡³ VS9 Finance_Request ?€?‹æ?
%%  #A17 Skill XP Award contractï¼šXP ?…èƒ½??VS3 å¯«å…¥ï¼›ä?æºå??ˆç‚º VS5 ??TaskCompleted(baseXp, semanticTagSlug)
%%       ??QualityAssessed(qualityScore) äº‹å¯¦äº‹ä»¶ï¼›è?ç®—å…¬å¼?awardedXp = baseXp ? qualityMultiplier ? policyMultiplierï¼ˆå« clampï¼?
%%       VS8 ?…æ?ä¾›è?ç¾©æ?ç±¤è??¿ç??¥è©¢ï¼Œç?æ­¢ç›´?¥å¯«??XP ledger
%%  #A18 Org Semantic Dictionary Extension contractï¼šç?ç¹”å¯?°å»º task-type/skill-type èªç¾©ï¼›å??ˆèµ° VS4 org-semantic-registryï¼ˆorg-task-type-registry + org-skill-type-registryï¼‰ï?ä¸¦ä»¥ org namespace å¯«å…¥ tag-snapshot
%%  ? â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â•£
%%  TAG SEMANTICS ?´å?è¦å?ï¼ˆVS8 Â· ?›å±¤èªç¾©å¼•æ??´å?è¦å? [D21-1~D21-10 + D21-A~D21-X]ï¼?
%%  T1  ?°å??‡è???TagLifecycleEventï¼ˆBACKGROUND_LANEï¼‰å³?¯æ“´å±?[D21-6]
%%  T2  ORG_SKILL_TYPE_DICTIONARY / ORG_TASK_TYPE_DICTIONARY = çµ„ç?ä½œç”¨?Ÿå¯å¯?Overlayï¼ˆä?æºï?VS8 ?¨å? + VS4 çµ„ç?èªç¾©å­—å…¸ï¼?
%%  T3  ORG_ELIGIBLE_MEMBER_VIEW.skills{tagSlug?’xp} äº¤å?å¿«ç…§
%%  T4  ?’ç­?·èƒ½?€æ±?= SK_SKILL_REQ ? Tag Authority tagSlug [D21-5]
%%  T5  TAG_SNAPSHOT æ¶ˆè²»?¹ç?æ­¢å¯«??[D21-7]ï¼›DocumentParser UI è¦–è¦ºå±¬æ€§å??ˆç”± semantic-graph.slice ?•å½±è®€??
%%      èªç¾©æ²»ç??ï?wiki/proposal/relationshipï¼‰é¡¯ç¤ºè??™å?æ¨???ˆèµ° L5 projection.semantic-governance-view ??L6 Query Gateway
%%  T6  çªè§¸å±¤ï?VS8_SLï¼‰å¯«?¥åª?½é€é? semantic-edge-store.addEdge()ï¼›ç?æ­¢ç›´?¥æ?ä½?_edges ?§éƒ¨?€??[D21-9]
%%  T7  findIsolatedNodes ?¨æ?æ¬?addEdge/removeEdge å¾Œç”± VS8_NG ?å?æ­¥è§¸?¼ï?å­¤ç?ç¯€é»å¯«??Observability [D21-10]
%%  T8  çµ„ç??°å»ºèªç¾©?…é? task-type/skill-type é¡åˆ¥ï¼Œä?å¿…é?ä½¿ç”¨ org namespace tagSlugï¼ˆorg:{orgId}:task-type:* / org:{orgId}:skill-type:*ï¼‰ï??¿å?æ±¡æ??¨å?èªç¾©ç©ºé?
%%  ? â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â•£
%%  SEMANTIC TAG ENTITIES ç´¢å?ï¼ˆAI-ready Semantic Graphï¼?
%%  TE1 TAG_USER_LEVEL  tag::user-level    ??tagSlug: user-level:{slug}
%%  TE2 TAG_SKILL       tag::skill         ??tagSlug: skill:{slug}
%%  TE3 TAG_SKILL_TIER  tag::skill-tier    ??tagSlug: skill-tier:{tier}
%%  TE4 TAG_TEAM        tag::team          ??tagSlug: team:{slug}
%%  TE5 TAG_ROLE        tag::role          ??tagSlug: role:{slug}
%%  TE6 TAG_PARTNER     tag::partner       ??tagSlug: partner:{slug}
%%  ? â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â•£
%%  INFRASTRUCTURE CONTRACTS [S1~S6] ç´¢å?
%%  S1  SK_OUTBOX_CONTRACT     ä¸‰è?ç´ ï?at-least-once / idempotency-key / DLQ?†ç?
%%  S2  SK_VERSION_GUARD       aggregateVersion ?®èª¿?å?ä¿è­·ï¼ˆå…¨ Projectionï¼?
%%  S3  SK_READ_CONSISTENCY    STRONG_READ vs EVENTUAL_READ è·¯ç”±æ±ºç?
%%  S4  SK_STALENESS_CONTRACT  SLA å¸¸æ•¸?®ä??Ÿç›¸ï¼ˆTAG/PROJ_CRITICAL/PROJ_STANDARDï¼?
%%  S5  SK_RESILIENCE_CONTRACT å¤–éƒ¨?¥å£?€ä½é˜²è­·è??¼ï?rate-limit/circuit-break/bulkheadï¼?
%%  S6  SK_TOKEN_REFRESH_CONTRACT Claims ?·æ–°ä¸‰æ–¹?¡æ?ï¼ˆVS1 ??IER ???ç«¯ï¼?
%%  ? â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â•£
%%  FIREBASE ?”é›¢è¦å? ??Cross-cutting Authority æ²»ç? [D24~D26]
%%  ï¼ˆè©³è¦?UNIFIED DEVELOPMENT RULES å®Œæ•´å®šç¾©ï¼?
%%  ? â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â•£
%%  UNIFIED DEVELOPMENT RULES [D1~D27 + E7/E8 Governance]
%%  ?€?€ è¦å??†å±¤ï¼šHard Invariants (D1~D20 ?¸å?ä¸è??? / Semantic Governance D21(D21-1~D21-10+D21-A~D21-X)/D22~D23 / Infrastructure (D24~D25) / Authority Governance (D26) / Cost Semantic Routing Extension (D27) / AI & Entry Security Closure (E7/E8) ?€?€
%%  ?€?€ ?ºç?è·¯å?ç´„æ?ï¼ˆD1~D12ï¼‰â??€
%%  D1  äº‹ä»¶?³é??ªé€é? shared-infra/outbox-relayï¼›domain slice ç¦æ­¢?´æ¥ import shared-infra/event-router
%%  D2  è·¨å??‡å??¨ï?import from '@/features/{slice}/index' onlyï¼›_*.ts ?ºç???
%%  D3  ?€??mutationï¼šsrc/features/{slice}/_actions.ts only
%%  D4  ?€??readï¼šsrc/features/{slice}/_queries.ts only
%%  D5  src/app/ ??UI ?ƒä»¶ç¦æ­¢ import src/shared-infra/frontend-firebase/{firestore|realtime-database|analytics}
%%  D6  "use client" ?ªåœ¨ _components/ ??_hooks/ ?‰ç?é»ï?layout/page server components ç¦ç”¨
%%  D7  è·¨å??‡ï?import from '@/features/{other-slice}/index'ï¼›ç?æ­?_private å¼•ç”¨
%%  D8  shared-kernel/* ç¦æ­¢ async functions?Firestore calls?side effects
%%  D9  workspace-application/ TX Runner ?”èª¿ mutationï¼›slices ä¸å?äº’ç›¸ mutate
%%  D10 EventEnvelope.traceId ?…åœ¨ CBG_ENTRY è¨­å?ï¼›å…¶ä»–åœ°?¹å”¯è®€
%%  D11 workspace-core.event-store ?¯æ´ projection rebuildï¼›å??ˆæ?çºŒå?æ­?
%%  D12 getTier() å¿…é?å¾?shared-kernel/skill-tier importï¼›Firestore å¯«å…¥ç¦å¸¶ tier æ¬„ä?
%%  ?€?€ å¥‘ç?æ²»ç?å®ˆå?ï¼ˆD13~D20ï¼‰â??€
%%  D13 ?°å? OUTBOXï¼šå??ˆåœ¨ SK_OUTBOX_CONTRACT å®?? DLQ ?†ç?
%%  D14 ?°å? Projectionï¼šå??ˆå???SK_VERSION_GUARDï¼Œä?å¾—è·³??aggregateVersion æ¯”å?
%%  D15 è®€?–å ´?¯æ±ºç­–ï??ˆæŸ¥ SK_READ_CONSISTENCYï¼ˆé????ˆæ? ??STRONGï¼›å…¶é¤???EVENTUALï¼?
%%  D16 SLA ?¸å€¼ç?æ­¢ç¡¬å¯«ï?ä¸€å¾‹å???SK_STALENESS_CONTRACT
%%  D17 ?°å?å¤–éƒ¨è§¸ç™¼?¥å£ï¼šå??ˆåœ¨ SK_RESILIENCE_CONTRACT é©—æ”¶å¾Œä?ç·?
%%  D18 Claims ?·æ–°?è¼¯è®Šæ›´ï¼šä»¥ SK_TOKEN_REFRESH_CONTRACT ?ºå”¯ä¸€è¦ç?
%%  D19 ?‹åˆ¥æ­¸å±¬è¦å?ï¼šè·¨ BC å¥‘ç??ªå???shared-kernel/*ï¼›shared/types ?…ç‚º legacy fallback
%%  D20 ?¯å…¥?ªå?åºï?shared-kernel/* > feature slice index.ts > shared/types
%%  ?€?€ èªç¾© Tag å®ˆå?ï¼ˆD21~D23ï¼‰â??€ VS8 ?›å±¤èªç¾©å¼•æ?æ­??è¦ç? ?€?€
%%  ?€?€ å±¤ç?çµæ?ï¼šGovernance ??Core Domain ??Compute Engine ??Output ?€?€
%%  ?€?€ ä¸€?æ ¸å¿ƒè?ç¾©å?ï¼ˆCore Domain Â· VS8_CLï¼‰â??€
%%  D21-1 èªç¾©?¯ä??§ï??™å±¤ï¼‰ï??¨å?èªç¾©é¡åˆ¥?‡æ?ç±¤å¯¦é«”ç”± VS8 CTA å®šç¾©ï¼›ç?ç¹”è‡ªè¨?task-type/skill-type èªç¾©??VS4 org-semantic-registry å®šç¾©
%%  D21-2 æ¨™ç±¤å¼·å??¥å?ï¼šç³»çµ±ä¸­ç¦æ­¢ä½¿ç”¨?±æ€§å?ä¸²å‚³?è?ç¾©ï??€?‰å??¨å??ˆæ???TE1~TE6 ?‰æ? tagSlug
%%  ?€?€ äºŒã€å?è­œè??¨ç?å¼•æ?ï¼ˆCompute Engine Â· VS8_SL / VS8_NGï¼‰â??€
%%  D21-3 ç¯€é»ä??¯å?ï¼šè?ç¾©ç?é»å??ˆå…·?™å±¤ç´šæ?? æ??œä?ï¼›å­¤ç«‹æ?ç±¤ï?Isolated Tagï¼‰è??ºç„¡?ˆè?ç¾©ï??ˆé€šé? parentTagSlug æ­¸å…¥?†é?å­?
%%  D21-4 ?šå?é«”ç??Ÿï?CTA å®ˆè­·æ¨™ç±¤?Ÿå‘½?±æ?ï¼ˆDraft?’Active?’Stale?’Deprecatedï¼‰ï?reasoning-engine è¨ˆç??œè¯æ¬Šé??‡è?ç¾©è???
%%  ?€?€ ä¸‰ã€è?ç¾©è·¯?±è??·è? (Compute Engine Â· VS8_ROUT) ?€?€
%%  D21-5 èªç¾©?ŸçŸ¥è·¯ç”±ï¼šè·¨?‡ç?æ±ºç?ï¼ˆæ??­è·¯???šçŸ¥?†ç™¼ï¼‰å??ˆåŸº?¼æ?ç±¤è?ç¾©æ??ï?ç¦æ­¢ç¡¬ç·¨ç¢¼æ¥­?™å?è±?ID
%%  D21-6 ? æ??ªå?è§¸ç™¼ï¼šTagLifecycleEvent ?¼ç??‚ï?VS8 ?é? Causality Tracer ?ªå??¨å??—å½±?¿ç?é»ä¸¦?¼å??´æ–°äº‹ä»¶ï¼?
%%        traceAffectedNodes(event, candidateSlugs[]) ?¯æ´?™é¸ç¯€é»é?æ¿¾ï?candidateSlugs=[] è¡¨å…¨?–è¿½è¹¤ï?ï¼?
%%        rankAffectedNodes / buildDownstreamEvents ?¯ä??ºç¨ç«‹å·¥?·ä½¿?¨ï?TAG_DELETED ä¸ç”¢?Ÿä?æ¸¸ä?ä»?
%%  ?€?€ ?›ã€è¼¸?ºè?ä¸€?´æ€?(Output Layer Â· Projection & Consistency) ?€?€
%%  D21-7 è®€å¯«å??¢å??‡ï?å¯«å…¥?ä?å¿…é?ç¶“é? CMD_GWAY ?²å…¥ VS8 CTAï¼ˆå…¨?Ÿï???VS4 org-semantic-registryï¼ˆç?ç¹”ï?ï¼›è??–åš´ç¦ç›´????™åº«ï¼Œå??ˆç???projection.tag-snapshot
%%  D21-8 ?°é®®åº¦é˜²ç¦¦ï??€?‰åŸº?¼è?ç¾©ç??¥è©¢å¿…é?å¼•ç”¨ SK_STALENESS_CONTRACTï¼ŒTAG_STALE_GUARD ??30 ç§?
%%  ?€?€ äº”ã€å??œä??©ç?ç´„æ? (VS8_SL Â· Graph Physics) ?€?€
%%  D21-9 çªè§¸æ¬Šé?ä¸è??ï?SemanticEdge.weight ??[0.0, 1.0]ï¼?
%%        èªç¾©ä»?ƒ¹ cost = 1.0 / max(weight, MIN_EDGE_WEIGHT)ï¼ˆå¼·??? = è¿‘é„° = ?­è??¢ï?ï¼?
%%        _clampWeight ??addEdge ?‚å¼·?¶åŸ·è¡Œï??€?‰ç›´?¥é?ä¿‚é?è¨?weight=1.0ï¼?
%%        ç¦æ­¢ä»»ä?æ¶ˆè²»?¹æ???weight > 1.0 ??weight < 0.0 ?„é?
%%  D21-10 ?“æ’²?¯è?æ¸¬æ€§ï?findIsolatedNodes(slugs[]) ??VS8_NG ?¯ä??“æ’²?¥åº·?¢é?ï¼?
%%         æ¯æ¬¡ addEdge/removeEdge å¾Œå??ˆä»¥?å?æ­¥æ–¹å¼è§¸?¼å­¤ç«‹ç?é»æª¢?¥ï?
%%         çµæ?å¯«å…¥ L9 Observabilityï¼›D21-3 ?•è???> 0 ?€è§¸ç™¼è­¦å?äº‹ä»¶
%%  ?€?€ ?­ã€æ“´å±•ä?è®Šé? (D21-A~D21-X Â· ?›å±¤?¶æ?æ²»ç?å¾? ?€?€
%%  D21-A ?™å±¤è¨»å?å¾‹ï?è·¨é??Ÿå…¨?Ÿæ?å¿µåœ¨ core/tag-definitions.ts è¨»å?ï¼›ç?ç¹”ä»»?™é????€?½é??‹æ?å¿µåœ¨ VS4 org-semantic-registryï¼ˆorg-task-type-registry + org-skill-type-registryï¼‰è¨»??
%%  D21-B Schema ?–å?ï¼šæ?ç±¤å??¸æ?å¿…é?ç¬¦å? core/schemas å®šç¾©ï¼Œç?æ­¢é?? ä»»ä½•æœªç¶“æ ¡é©—ç??ç?æ§‹å?å±¬æ€?
%%  D21-C ?¡å­¤ç«‹ç?é»ï?æ¯å€‹æ–°æ¨™ç±¤å»ºç??‚å??ˆé€é? hierarchy-manager.ts ?›è??³å?ä¸€?‹æ??ˆçˆ¶ç´šç?é»ï???D21-3 å¼·å??ˆï?
%%  D21-D ?‘é?ä¸€?´æ€§ï?embeddings/vector-store.ts ä¸­ç??‘é?å¿…é???core/tag-definitions.ts å®šç¾©?Œæ­¥?·æ–°ï¼Œå»¶????60s
%%  D21-E æ¬Šé??æ??–ï?èªç¾©?¸ä¼¼åº¦è?ç®—è?è·¯å?æ¬Šé??Ÿæ?å¿…é???weight-calculator.ts çµ±ä?è¼¸å‡ºï¼Œç?æ­¢æ?è²»æ–¹?ªè??¨ç?
%%  D21-F æ³¨æ??›é??¢ï?context-attention.ts å¿…é??¹æ??¶å? Workspace ?…å??æ¿¾?¡é?æ¨™ç±¤ï¼Œé˜²æ­¢è?ç¾©å™ª?²æ±¡?“è·¯?±ç???
%%  D21-G æ¼”å??é??°ï?learning-engine.ts ?…èƒ½ä¾æ? VS3ï¼ˆæ??­ï?/ VS2ï¼ˆä»»?™ï??„ç?å¯¦ä?å¯¦ä?ä»¶é€²è?ç¥ç??ƒå¼·åº¦èª¿?´ï?
%%                    ç¦æ­¢?‹å??¨æ?ä¿®æ”¹?–æ³¨?¥å??æ•¸?šï?æ¯æ¬¡èª¿æ•´?ˆé?å¸¶ä?æºä?ä»¶æº¯æº?
%%  D21-H è¡€?¦å??œï?BBBï¼‰ï??·è?ç®¡ç?ï¼šL3(VS8 Governance) consensus-engine ?ˆè??¡é?æ²»ç??è¼¯ä¸€?´æ€§ï??šé?å¾Œæ?æ¡ˆè???BBB ?šæ?çµ‚ç‰©?†ä?è®Šé?è£æ±ºï¼?
%%                          invariant-guard.ts ?æ??€é«˜å¦æ±ºæ?ï¼Œå¯?´æ¥?’ç?å·²é€šé?æ²»ç??±è?ä½†é??å??©ç?çµæ??„æ?æ¡ˆï?
%%                          ?¶æ?çµ‚è?æ±ºæ??ªå??Œé???consensus-engine ??learning-engine ä¹‹ä?
%%  D21-I ?¨å??±è?å¾‹ï?æ¨™ç±¤æ²»ç?æ±ºç??‹æ”¾?¨éƒ¨çµ„ç??¨æˆ¶?æ?ï¼Œæ??‰æ?æ¡ˆå??ˆé€šé? consensus-engine ?„é?è¼¯ä??´æ€§æ ¡é©?
%%  D21-J ?¥è?æº¯æ?ï¼šæ?æ¢æ?ç±¤é?ä¿‚ç?å»ºç?å¿…é?æ¨™è¨»è²¢ç»??ID ?‡å??ƒä??šï?äº‹ä»¶ ID / ?‡ä»¶ IDï¼‰ï??·å?å®Œæ•´?ˆæœ¬?æº¯?½å?
%%  D21-K èªç¾©è¡ç?è£æ±ºï¼šinvariant-guard ?µæ¸¬?°é??ç‰©?†é?è¼¯ï?å¦‚å¾ª?°ç¹¼?¿ã€ç??¾è?ç¾©ï??„è¯çµæ??´æ¥?’ç??æ?ä¸¦ç”¢?Ÿæ?çµ•ä?ä»?
%%  D21-S ?Œç¾©è©é?å®šå?ï¼šæ?ç±¤å?ä½µå??å??Šæ?ç±¤è‡ª?•æ???Aliasï¼Œæ??‰æ­·?²æ•¸?šå??¨è‡ª?•é?å®šå??³ä¸»æ¨™ç±¤ï¼Œç?æ­¢ç›´?¥åˆª?¤è?æ¨™ç±¤
%%  D21-T ?½å??±è?å¾‹ï?æ¨™ç±¤é¡¯ç¤º?ç¨±?±ç¤¾ç¾¤è²¢?»åº¦æ±ºå?ï¼ˆå¯æ¼”å?ï¼‰ï?tagSlug ä½œç‚ºæ°¸ä??€è¡“è??¥ç¢¼ä¸å?ä¿®æ”¹
%%  D21-U ç¦æ­¢?è?å®šç¾©ï¼šæ–°å¢æ?ç±¤æ? embeddings å¿…é??³æ?è¨ˆç??¸ä¼¼åº¦ä¸¦?ç¤ºèªç¾©?¥è??„ç¾?‰æ?ç±¤ï??»æ­¢?œé??è?
%%  D21-V ?æ??–å?æ©Ÿåˆ¶ï¼šè??¼ã€Œä½µè³¼çˆ­è­°ä¸­ï¼ˆPending-Syncï¼‰ã€ç?æ¨™ç±¤?¶è·¯?±æ??å?çµç‚º 0.5 ä¸­æ€§å€¼ï??´åˆ°?±è??”æ?
%%  D21-W è·¨ç?ç¹”é€æ??§ï??€?‰æ?ç±¤ä¿®?¹ç??„å??¨å??¬é?ï¼Œä»»ä½•ç?ç¹”ç”¨?¶å??¯æŸ¥?‹å??´æ??–æ­·ç¨‹è?è²¬ä»»æ­¸å±¬
%%  D21-X èªç¾©?ªå?æ¿€?¼ï??¨æˆ¶å»ºç? A?’B ?œè¯?‚ï?causality-tracer ?ªå?å»ºè­°èªç¾©?¸è??„ç?é»?C ä½œç‚ºæ½›åœ¨????™é¸
%%  D22 è·¨å???tag èªç¾©å¼•ç”¨ï¼šå…¨?Ÿæ?ç±¤å??ˆæ???TE1~TE6ï¼›ç?ç¹”è‡ªè¨‚æ?ç±¤å??ˆæ???OrgTagRef(orgId, tagSlug)ï¼›ç?æ­¢éš±å¼å?ä¸²å???
%%  D23 tag èªç¾©æ¨™æ³¨?¼å?ï¼šç?é»å…§ ??tag::{category}ï¼›é? ??-.->|"{dim} tag èªç¾©"|
%%  ?€?€ Firebase ?”é›¢å®ˆå?ï¼ˆD24~D25ï¼‰â??€
%%  D24 MUST: IF ä½æ–¼ feature slice / shared/types / app THEN å¿…é?ç¦æ­¢?´æ¥ import firebase/*
%%  D24 MUST: IF å±¬å?ç«¯ä½¿?¨è€…æ? Firebase ?¼å« THEN å¿…é??é? FIREBASE_ACL Adapterï¼ˆsrc/shared-infra/frontend-firebase/{auth|firestore|realtime-database|messaging|storage|analytics}ï¼?
%%  D24 FORBIDDEN: IF ä½æ–¼ Feature Slice THEN MUST NOT ?´æ¥ import @/shared-infra/* å¯¦ä?ç´°ç?ï¼ˆå« firestore.*.adapter / db clientï¼?
%%  D24 MUST: IF ä½æ–¼ Feature Slice THEN ?…å¯ä¾è³´ SK_PORTSï¼ˆL1ï¼‰æ? Query Gatewayï¼ˆL6ï¼‰å…¬?‹ä???
%%  D24-A MUST: IF ?¼å« Server Function / Server Actionï¼ˆClient -> Server ?Šç?ï¼?
%%         THEN è¼¸å…¥/è¼¸å‡ºå¿…é???Plain Objectï¼ˆJSON-serializableï¼‰ï?
%%         MUST NOT ?³é? class instance?Firestore Timestamp/FieldValue?Date?å« toJSON ??runtime object
%%  D24-B MUST: IF ä½æ–¼ feature slice å®šç¾© mutation action
%%         THEN å¿…é??Œæ?å®šç¾© Command DTOï¼ˆæ?å°å?è¦æ?ä½ï?ï¼?
%%         ç¦æ­¢?´æ¥ä½¿ç”¨ Aggregate/Projection ?‹åˆ¥ä½œç‚º action ?ƒæ•¸
%%  D24-C MUST: IF Firestore snapshot ?²å…¥ client state
%%         THEN å¿…é??ˆç? normalizer è½‰ç‚º Client Modelï¼ˆplain valuesï¼‰å?å­˜å…¥ context/store
%%  D24-D FORBIDDEN: IF ??Client ç«¯å‘¼??action
%%         THEN MUST NOT ?´æ¥?³é? Account/Workspace ç­?rich entity ??Server Function
%%  D25 MUST: IF ?°å? Firebase ?ç«¯?½å? THEN å¿…é???FIREBASE_ACL ?°å? Adapterï¼›Realtime Database ?¨æ–¼?³æ??šè?ï¼ŒAnalytics ?¨æ–¼?™æ¸¬å¯«å…¥ï¼Œä?å¾—æ‰¿è¼‰é??Ÿå¯«??
%%  D25 MUST: IF ?¥å£æ¶‰å??—ä?è­·è??™æ??¯è??´ç???THEN å¿…é??ˆå???App Check é©—è?ï¼ˆå« token çºŒæ??‡å¤±?ˆè??†ï?[E7]
%%  D25 MUST: IF ?ä?æ¶‰å? Admin æ¬Šé?/è·¨ç????’ç?/è§¸ç™¼??Webhook é©—ç°½ THEN å¿…é?èµ?src/shared-infra/backend-firebase/functions
%%  D25 MUST: IF ?€è¦å?æ²»ç???GraphQL è³‡æ?å¥‘ç? THEN å¿…é?èµ?src/shared-infra/backend-firebase/dataconnect
%%  D25 SHOULD: IF ?¯ç”± Rules å®‰å…¨å®Œæ?ä¸”ç‚ºé«˜é »å°è?æ±?THEN ?ªå? frontend-firebase ä»¥é?ä½?Functions ?æœ¬
%%  D25 SHOULD: IF ?ºé??‡å‡º?–å¯?¹æ¬¡æµç? THEN ?ªå? backend-firebase/functions ?†ä¸­?¹è??†ä»¥?ä?ç¸½å¯«?¥æ???
%%  D25 SHOULD: IF ?ºå³?‚è??±èƒ½??THEN å¿…é?å®šç¾© subscribe/unsubscribe/reconnect/backoff ?‡æ??å¤±?ˆç???[P7]
%%  D25 SHOULD: IF ??AI tool data access THEN å¿…é???Genkit tool gateway çµ±ä?æª¢æŸ¥ç§Ÿæˆ¶?Šç??‡å¯è¦‹æ€?[E8]
%%  ?€?€ Cross-cutting Authority å®ˆå?ï¼ˆD26ï¼‰â??€
%%  D26 MUST: IF ?·è?è·¨å??œå? THEN å¿…é?ç¶?global-search.sliceï¼›æ¥­??Slice ä¸å??ªå»º?œå??è¼¯
%%  D26 MUST: IF ?·è??šçŸ¥?¯ä???THEN å¿…é?ç¶?notification-hub.sliceï¼ˆVS7ï¼‰ï?æ¥­å? Slice ä¸å??´æ¥èª¿ç”¨ sendEmail/push/SMS
%%  D26 MUST: IF å±?global-search.slice ??notification-hub.slice THEN å¿…é??·å??ªå·±??_actions.ts / _services.ts [D3]
%%  D26 FORBIDDEN: IF å±?cross-cutting authority THEN MUST NOT å¯„ç???shared-kernel [D8]
%%  ?€?€ L2 Command Gateway ä¸‹æ??Šç?ï¼ˆå–®?‘é??²å?ï¼‰â??€
%%      MUST: IF ?ƒä»¶??GatewayCommand / DispatchOptions / Handler ä»‹é¢?‹åˆ¥ THEN ?¯ä?æ²‰è‡³ L1ï¼ˆShared Kernelï¼?
%%      MUST: IF ?ƒä»¶??CommandResult/?¯èª¤ç¢¼å?ç´„ä??ºç?è³‡æ??–ç??½å? THEN ?¯ä?æ²‰è‡³ L1ï¼ˆShared Kernelï¼?
%%      MUST: IF ?ƒä»¶å±?CBG_ENTRY / CBG_AUTH / CBG_ROUTE ?·è?ç®¡ç? THEN å¿…é?ä¿ç???L2ï¼ˆInfrastructure Orchestrationï¼?
%%      MUST: IF ?ƒä»¶å±?handler registry ??resilience ?¥ç?ï¼ˆrate-limit/circuit-breaker/bulkheadï¼‰THEN å¿…é?ä¿ç???L2
%%      FORBIDDEN: IF ?ƒä»¶?…å« async / side effects / routing registry THEN MUST NOT ä¸‹æ???shared-kernel/* [D8]
%%      FORBIDDEN: IF ä½æ–¼ L1 THEN MUST NOT ?¢ç? traceIdï¼›traceId ?…å?è¨?CBG_ENTRY æ³¨å…¥ [D10]
%%  ?€?€ ?æœ¬èªç¾©è·¯ç”±å®ˆå?ï¼ˆD27 Â· Extension Gateï¼‰â??€
%%  D27 MUST: IF ?•ç??æœ¬èªç¾©è·¯ç”± THEN å¿…é??¡ç”¨ä¸‰å±¤?¶æ?ï¼ˆLayer-1 ?Ÿå?è§?? ??Layer-2 èªç¾©?†é? ??Layer-3 èªç¾©è·¯ç”±ï¼?
%%  D27 MUST: IF ä½æ–¼ Layer-2 THEN å¿…é??¼å« VS8 classifyCostItem(name) è¼¸å‡º (costItemType, semanticTagSlug)
%%  D27 MUST: IF å¯¦ä? classifyCostItem THEN å¿…é??ºç??½å?ï¼ˆç?æ­?async / Firestore / ?¯ä??¨ï?[D8]
%%  D27 MUST: IF ?¢ç? ParsedLineItem THEN å¿…é?å¯«å…¥ (costItemType, semanticTagSlug) ä¸¦éš¨ payload ?³é?
%%  D27 MUST: IF ä½æ–¼ Layer-3 ?©å?æµç? THEN å¿…é?ä»?shouldMaterializeAsTask() ä½œç‚º?¯ä??©å??˜é? [D27-Gate]
%%  D27 FORBIDDEN: IF ä½æ–¼ workspace.slice THEN MUST NOT ?´æ¥ç¡¬å¯« `=== CostItemType.EXECUTABLE` ?¤æ–·
%%  D27 MUST: IF shouldMaterializeAsTask() è¿”å? true THEN ?å¯?©å???WorkspaceTaskï¼›å¦?‡å??ˆé?é»˜è·³?ä¸¦ toast [#A14]
%%  D27 MUST: IF ?©å??ºä»»??THEN å¿…é?å¯«å…¥ sourceIntentIndex ä»¥ç¶­?æ?åºä?è®Šé? [D27-Order]
%%  D27 MUST: IF tasks-view ?ˆç¾ä»»å?æ¸…å–® THEN å¿…é??ˆæ? createdAtï¼ˆæ‰¹æ¬¡é?ï¼‰å???sourceIntentIndexï¼ˆæ‰¹æ¬¡å…§ï¼‰æ?åº?
%%  D27 MUST: IF è¨­è?ä»»å??ˆè·¯ THEN å¿…é??µå??®å???WorkspaceItem ??WorkspaceTask ??Scheduleï¼ˆç?æ­¢è·³ç´šï?[D27-Order]
%%  D27 MUST: IF UI é¡¯ç¤º DocumentParser icon/color/label THEN å¿…é?è®€??tag-snapshotï¼ˆä?å¾—å?é¡å™¨ç¡¬ç·¨ç¢¼ï?[T5]
%%  D27 MUST: IF ?ºæ??­è??–è???THEN ?…å¯ç¶?L6 Query Gatewayï¼›UI ç¦æ­¢?´è? VS6/Firebase [L6-Gateway]
%%  D27 MUST: IF æ¶‰å? overlap/resource-grouping THEN å¿…é???L5 Projection å±¤å??ï??ç«¯?…æ¸²??[Timeline]
%%  P6 SHOULD: IF ä½¿ç”¨ Next.js Parallel Routes THEN æ¯å€?@slot å¿…é?å°æ??®ä?è³‡æ??šé?ï¼ˆQGWAY channelï¼‰è??¨ç? Suspense fallback
%%  P6 SHOULD: IF ä½¿ç”¨ Streaming UI THEN å¿…é?å®šç¾©?¯ä¸­???¯é?è©¦ç??¥ï??¿å?è·?slot ?±äº«?»å?
%%  E8 MUST: IF Genkit flow è§¸ç™¼ tool calling THEN å¿…é?ç¶?Tool ACLï¼ˆrole/scope/tenantï¼‰è?å¯©è?è¿½è¹¤ï¼ˆtraceId/toolCallId/modelIdï¼?
%%  E8 FORBIDDEN: IF ä½æ–¼ AI flow THEN MUST NOT ?´æ¥?¼å« firebase/* ?–è·¨ç§Ÿæˆ¶è®€å¯?
%%  D27 FORBIDDEN: IF ä½æ–¼ VS5 document-parser THEN MUST NOT ?ªè?å¯¦ä??æœ¬èªç¾©?è¼¯ï¼›å??ˆé€é? VS8 classifyCostItem() [D27]
%%      ç¦æ­¢ Layer-3 Semantic Router ç¹é? costItemType ?´æ¥?©å???EXECUTABLE ?…ç›®
%%  ?€?€ Visualization DataSet å¿«å?å®ˆå?ï¼ˆD28ï¼‰â??€
%%  D28 MUST: IF æ¸²æ? vis-network / vis-timeline / vis-graph3d THEN å¿…é??é? VisDataAdapter DataSet<>ï¼›ç?æ­¢ç›´??Firebase
%%  D28 MUST: IF ?°å?è¦–è¦º?–å?ä»?THEN å¿…é???VisDataAdapter ?°å?å°æ? DataSet<>ï¼Œä?å¾—åœ¨?ƒä»¶ä¸­å»ºç«‹ç¨ç«?Firebase è¨‚é–±
%%  D28 FORBIDDEN: IF ä½æ–¼ vis-* ?ƒä»¶ THEN MUST NOT ?´æ¥è¨‚é–± Firebaseï¼ˆé¿??N çµ„ä»¶ ? 1 è¨‚é–±? æ?è²»ç”¨?å?ï¼?
%%  D28 FORBIDDEN: IF ä½æ–¼ VisDataAdapter ä»¥å? THEN MUST NOT å¯«å…¥ vis-data DataSet<>
%%  ?šâ??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â??â?
