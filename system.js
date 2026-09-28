'use strict';
addModule('system','process','01 · The architecture process','Start with a problem, not a collection of technologies.',['design','architecture'],[
lesson('Requirements, scope & quality attributes','Architecture translates user needs into structural decisions. Separate what a system must do from measurable qualities such as latency, availability, recoverability, and cost.',[
'Functional scope::Name actors, operations, and excluded features so everyone is solving the same problem.',
'Quality attributes and SLOs::Turn "fast" into a measurable target with a percentile, workload, and time window.',
'Constraints and trade-offs::Record budget, team capability, regulations, legacy interfaces, and which requirement wins when goals conflict.'
],'Feature: upload and share a document\nSLO: 99% of metadata reads under 200 ms\nConstraint: documents remain in the selected region','An average latency hides slow outliers. A percentile-based objective makes the experience more concrete.','Why should you clarify requirements before choosing microservices?','Service boundaries and deployment complexity should respond to business and operational needs, not precede them.'),
lesson('Capacity estimates, APIs & data models','Use rough numbers to expose constraints, then refine where decisions depend on precision. API and data-model choices should reflect access patterns and correctness requirements.',[
'Traffic, storage, and bandwidth::Estimate average and peak rates, retention, object sizes, and replication overhead.',
'API contracts and pagination::Specify identifiers, errors, idempotency, filtering, and consistent pagination behavior.',
'Entities and access patterns::List the reads and writes before deciding which indexes or denormalized views are needed.'
],'10 million reads/day ÷ 86,400 ≈ 116 reads/s average\nPeak assumption: 10× → about 1,160 reads/s\nRevisit the assumption using real traffic.','An estimate is a model of the workload, not a promise about future demand.','Why is average requests per second insufficient for sizing?','Bursts, hotspots, background work, retries, and uneven regional traffic may dominate peak resource needs.')]);
addModule('system','network','02 · Requests, scaling & caching','Follow a request from a client to stored data.',['design','data'],[
lesson('Networking, load balancing & stateless services','Requests travel through name resolution, connections, routing, and application instances. A stateless instance keeps durable user state outside its local process, making replacement and horizontal scaling easier.',[
'DNS, HTTP, and connection behavior::Understand lookup caching, connection reuse, timeouts, and payload size.',
'L4/L7 balancing and health checks::Choose routing based on transport or application information and distinguish liveness from readiness.',
'Horizontal scaling and state::Externalize durable state, but account for connection affinity and cache effects.'
],'Client → DNS → load balancer → application → database\n                                      ↘ cache','A load balancer cannot help if every instance blocks on the same overloaded database.','Why can adding application servers fail to improve throughput?','A shared dependency, contention point, or downstream rate limit can remain the bottleneck.'),
lesson('Caches, CDNs & invalidation','A cache stores a reusable result nearer the consumer. The hard part is preserving an acceptable relationship between cached and authoritative data as writes and permissions change.',[
'Cache-aside and write policies::Choose who fills the cache, when entries update, and what happens if cache operations fail.',
'TTL, eviction, and stampedes::Use expiration and capacity policies; coalesce concurrent misses or stagger refreshes.',
'CDNs and private data::Cache static or safely shareable content; include authorization scope in private-cache design.'
],'read(key): cache hit → return\n           cache miss → database → cache with TTL → return\nwrite(key): commit → invalidate or update cache','Cache-aside can still race with writes. Decide whether temporary staleness is acceptable and test the race.','What is a cache stampede?','Many clients regenerate the same expired or missing value simultaneously, overwhelming the backing service.')]);
addModule('system','storage','03 · Storage engines & data models','Choose storage according to operations and guarantees.',['data'],[
lesson('Relational, document, key-value & graph models','A data model determines which relationships and access patterns are natural. Multiple models can coexist, but each extra system adds synchronization and operational work.',[
'Relational constraints and joins::Use schemas and transactions to express relationships and correctness requirements.',
'Document and key-value access::Documents keep related fields together; key-value stores emphasize known-key operations.',
'Graphs, search, and analytical models::Graphs support relationship traversal; search indexes and columnar analytics optimize different queries.'
],'Order service: relational source of truth\nProduct search: derived search index\nSession lookup: key-value cache','A derived search index may lag behind the authoritative order database. Expose that consistency model deliberately.','Why is "NoSQL scales better" an incomplete decision rule?','Scale depends on workload, data distribution, consistency, implementation, and operations. The model label alone does not establish suitability.'),
lesson('B-trees, LSM trees & analytical storage','Storage engines organize persistent data to balance reading, writing, space, and recovery. Understanding their costs helps explain why the same database behaves differently under different workloads.',[
'B-tree page organization::Sorted pages enable efficient lookup and range scans but require maintaining structure during writes.',
'LSM writes and compaction::Buffer and merge sorted runs, trading write patterns against read and space amplification.',
'Column stores, compression, and warehouses::Columnar layouts reduce unnecessary reads for analytical scans; operational and analytical workloads often differ.'
],'OLTP: fetch one customer and update one order\nOLAP: aggregate revenue across millions of orders\nDifferent access patterns → different physical layouts','An index that helps selective reads also consumes write work and storage.','What is read amplification?','A logical read requires multiple physical reads, such as checking several sorted runs or fetching scattered pages.')]);
addModule('system','distributed','04 · Replication, partitioning & guarantees','Reason about failures between machines.',['data','design'],[
lesson('Replication, partitioning & consistent hashing','Replication keeps multiple copies; partitioning divides ownership. They solve different problems and are commonly combined to distribute load while surviving failures.',[
'Leader and leaderless replication::Compare write coordination, conflict handling, and replication lag.',
'Range and hash partitioning::Range partitions preserve locality; hash partitions spread keys but can complicate range queries.',
'Rebalancing, hot keys, and virtual nodes::Moving ownership has a cost. Hashing does not eliminate extremely popular keys.'
],'key → partition function → shard\nshard → leader + replicas\nreplication protects copies; sharding divides the dataset','A single celebrity account can overload its partition despite an otherwise even hash distribution.','What is the difference between a replica and a shard?','A replica copies a dataset for availability or reads. A shard owns a distinct subset of data.'),
lesson('Consistency, consensus & distributed failures','Network delay, process pauses, and partial failure make distributed state difficult. Choose the guarantee needed by each operation instead of describing the entire system with one vague consistency label.',[
'Linearizability and eventual consistency::Linearizable operations appear atomic in real-time order; eventual convergence alone is weaker.',
'Partitions, quorums, and CAP::During a network partition, strong consistency and availability of every request can conflict; CAP is not a general pick-two menu.',
'Consensus, clocks, and fencing::Consensus agrees on decisions despite some failures. Fencing tokens prevent stale owners from acting after a lease changes.'
],'A leader pauses → lease expires → new leader starts\nOld leader resumes → stale fencing token rejected','A timeout means the caller lacks a result, not that the remote operation certainly failed.','Why can retrying after a timeout create duplicate work?','The server may have completed the operation while the reply was delayed or lost. Use idempotency or deduplication where required.')]);
addModule('system','transactions','05 · Transactions & distributed workflows','Make state changes correct under concurrency.',['data','design'],[
lesson('ACID, isolation & concurrency anomalies','A transaction groups operations into a unit with defined guarantees. Isolation levels determine which concurrent effects can be observed; the names and details vary across databases.',[
'Atomicity and durability::Atomicity prevents partial logical commits; durability concerns survival after acknowledged commit.',
'Lost updates, write skew, and phantoms::Identify which invariant a concurrent schedule can violate.',
'Locks, MVCC, and serializability::MVCC gives snapshots; it does not automatically prevent every anomaly. Retry serialization failures safely.'
],'Two doctors both read: "another doctor is on call"\nEach turns their own status off\nResult: no doctor on call unless the invariant is protected','Updating different rows can still violate a cross-row invariant.','Why does a consistent snapshot not necessarily prevent write skew?','Concurrent transactions may make decisions from the same snapshot and update different rows without a direct write conflict.'),
lesson('Sagas, outbox & idempotency','A business process spanning services often cannot rely on one database transaction. Model intermediate states, compensations, and duplicate messages explicitly.',[
'Saga orchestration and choreography::Coordinate local transactions with compensating actions where a true rollback is unavailable.',
'Transactional outbox::Write a business update and an outgoing event record in the same local transaction.',
'Deduplication and reconciliation::Consumers track processed IDs; reconciliation repairs inconsistencies that still escape normal handling.'
],'DB transaction: create order + insert OrderCreated outbox row\nPublisher: relay outbox event (may repeat)\nConsumer: deduplicate by event ID','An outbox prevents losing an event between a committed write and an attempted send, but does not itself ensure exactly-once delivery.','Why must an outbox consumer still handle duplicates?','The publisher may send successfully and crash before marking the event as sent, so it sends the event again after recovery.')]);
addModule('system','messaging','06 · Queues, logs & data processing','Separate work in time and derive useful views.',['data','design'],[
lesson('Message queues, ordering & backpressure','Queues decouple producers from consumers and absorb temporary bursts. They do not create unlimited capacity; sustained overload eventually requires throttling, dropping, or scaling.',[
'Delivery and acknowledgments::At-least-once delivery requires duplicate-safe consumers; acknowledgment timing affects loss and replay.',
'Partitions and ordering::Ordering is often guaranteed within one partition, not across the entire system.',
'Retries, dead letters, and backpressure::Bound retries, use delay, and create a process for diagnosing failed messages.'
],'producer → partitioned log → consumer group\nconsumer crash before ack → message may be delivered again','A poison message should not cause an infinite rapid retry loop that starves healthy work.','Does a queue solve a permanently overloaded consumer?','No. It postpones failure while the backlog grows. You must reduce input, increase capacity, or change the work.'),
lesson('Batch, streaming & derived data','Batch jobs process bounded datasets; stream jobs process continuing events. Event-time correctness requires dealing with late data, replays, and changes in the source of truth.',[
'Batch joins and transformations::Partition and sort data to make large joins and aggregations manageable.',
'Event time, windows, and watermarks::Choose how long to wait for late events and how to correct already published results.',
'CDC, materialized views, and lineage::Track how derived data came from source changes, including rebuild and deletion behavior.'
],'event occurred: 10:02\nevent arrived: 10:07\n5-minute event-time window may already have closed.','A watermark is a processing policy about lateness, not proof that older events can never arrive.','Why distinguish event time from processing time?','Network delays and retries change arrival order. Business metrics often need the time the event actually occurred.')]);
addModule('system','styles','07 · Architecture styles & boundaries','Choose structures that fit your team and domain.',['architecture'],[
lesson('Modularity, coupling & architecture styles','Modularity groups related responsibilities behind boundaries. Cohesion describes how closely responsibilities belong together; coupling describes how much modules depend on one another.',[
'Layered and modular monoliths::One deployment can still have strong internal boundaries and clear ownership.',
'Microservices and service-based systems::Independent deployment has benefits and costs in coordination, networking, data, and operations.',
'Microkernel, pipeline, SOA, and space-based styles::Plugins, staged transformations, enterprise orchestration, and distributed memory solve distinct structural needs.'
],'Billing module → public billing interface\nOther modules cannot write billing tables directly.','A modular monolith can be simpler to operate than many services while retaining useful domain boundaries.','Why are deployment boundaries different from logical module boundaries?','Modules describe responsibility and dependency; deployments describe operational packaging. One deployment can contain many well-separated modules.'),
lesson('Event-driven architecture & domain boundaries','Events describe facts that happened. Clear domain boundaries determine who owns data and which changes should become integration events.',[
'Commands versus events::A command requests an action; an event records an occurrence.',
'Bounded contexts and data ownership::One concept may have different meanings in different business domains.',
'Schema evolution and contracts::Evolve event fields compatibly and specify who handles old versions or replayed events.'
],'Command: ReserveInventory\nEvent: InventoryReserved\nOrder service reacts without directly changing inventory tables.','An event name should communicate a fact, not hide an implicit request that nobody owns.','What can go wrong when services share writable tables?','They become coupled through schemas and invariants, making independent releases and clear responsibility difficult.')]);
addModule('system','operations','08 · Reliability, security & architecture practice','Design for operation and change.',['architecture','data'],[
lesson('Resilience, observability & recovery','Failures are expected operational states. Decide which failures to isolate, how to detect them, and how to restore correct service before they occur.',[
'Timeouts, retries, and circuit breakers::Use bounded retries with backoff and jitter; coordinate budgets across service chains.',
'Logs, metrics, traces, and SLOs::Choose signals that connect symptoms to affected users and root causes.',
'Backups, RPO, RTO, and testing::RPO limits acceptable data loss; RTO targets restoration time. Test actual restores.'
],'A retries B 3 times; B retries C 3 times\nOne request can cause up to 9 calls to C.','Retries multiply across layers and can intensify an outage.','Why is an untested backup not sufficient evidence of recoverability?','It may be incomplete, corrupted, inaccessible, or too slow to restore within the required recovery objective.'),
lesson('Architecture decisions, risk & communication','Architecture work includes explaining decisions, collecting feedback, and adapting to evidence. Record why a choice fits its context so future maintainers know when to reconsider it.',[
'ADRs and diagrams::Capture context, options, decisions, and consequences. Draw boundaries and data flow at an appropriate level.',
'Fitness functions and risk analysis::Automate checks for measurable architectural constraints and test the riskiest assumptions early.',
'Leadership, ethics, and governance::Negotiate priorities, consider data privacy and bias, and keep decision ownership clear.'
],'ADR: choose a modular monolith\nContext: small team, evolving domain\nConsequence: simple deployment; enforce module boundaries\nRevisit when independent scaling becomes necessary.','An architecture decision is stronger when it states the conditions under which it should change.','What belongs in an ADR besides the selected technology?','The problem context, alternatives, constraints, reasoning, consequences, and any revisit conditions.')]);
addModule('system','coredesigns','09 · Core system design case studies','Apply the design process to reusable infrastructure.',['design'],[
lesson('Rate limiters, IDs & key-value services','Infrastructure designs force precise choices about ordering, coordination, storage, and failure. State the guarantee of each API before selecting algorithms.',[
'Rate limiting::Compare token buckets and sliding windows; decide whether limits are per user, key, host, or region.',
'Distributed IDs::Compare random IDs with time/worker/sequence schemes; handle clock movement and collisions.',
'Key-value stores and URL shortening::Define lookup latency, durability, expiration, collision handling, and hot-key behavior.'
],'Token bucket: capacity 10, refill 2 tokens/s\nRequest costs 1 token\nA full bucket permits a short burst of 10 requests.','A per-instance rate limiter does not automatically enforce one global limit across instances.','How would you avoid a hot shortened URL overwhelming storage?','Cache popular mappings, distribute reads, and define an appropriate invalidation or expiration policy.'),
lesson('Autocomplete, search & web crawlers','Search systems separate data collection, indexing, ranking, and query serving. The freshness and relevance requirements determine how these stages interact.',[
'Autocomplete and ranking::Combine prefix lookup with popularity or personalization under a latency budget.',
'Crawler frontier and politeness::Track visited URLs, deduplicate canonical forms, respect site rules, and limit per-host load.',
'Indexing and refresh::Handle updates, deleted content, and the delay between source changes and searchable results.'
],'crawl queue → fetch → parse → deduplicate → index\nquery → retrieve candidates → rank → return','A crawler needs host-level scheduling so one large site does not consume all capacity.','Why should crawling and indexing be separate stages?','They have different workloads, failure modes, and scaling needs. A queue between them supports independent retries and backpressure.')]);
addModule('system','social','10 · Communication & media case studies','Design systems people interact with continuously.',['design'],[
lesson('Feeds, chat, notifications & email','Communication systems balance delivery, ordering, fan-out, personalization, and user preferences. Different message types need different durability and latency guarantees.',[
'Feed fan-out::Precompute feeds on writes, assemble on reads, or combine approaches for high-follower accounts.',
'Chat and presence::Persist messages, reconnect safely, and distinguish message acceptance from delivery and reading.',
'Notifications and email::Apply preferences, deduplicate, rate-limit, and track per-channel delivery state.'
],'Send message → durable record → delivery queue\nClient reconnects with last received sequence\nServer replays missing messages.','Presence is often approximate, while message persistence may require stronger guarantees.','Why can fan-out on write be expensive for a celebrity account?','One post can create millions of downstream updates, producing bursts and large write amplification.'),
lesson('Video platforms, file sync & object storage','Large-object systems separate metadata from object bytes. Upload, transformation, replication, and distribution should tolerate partial work and retries.',[
'Multipart upload and object storage::Track chunks, checksums, and completion; collect abandoned partial uploads.',
'Video processing and CDNs::Transcode asynchronously into multiple renditions and serve segments near viewers.',
'File synchronization::Track versions, detect conflicts, and avoid assuming concurrent edits merge automatically.'
],'upload → object store → transcode job\n→ encoded renditions → CDN → adaptive playback','The metadata transaction and object upload may fail separately, so design cleanup and reconciliation.','Why store media bytes outside the main relational metadata tables in many designs?','Object storage and CDNs fit large sequential payloads, while relational tables efficiently manage metadata, permissions, and relationships.')]);
addModule('system','advancedcases','11 · Location, analytics & financial case studies','Explore domain-specific constraints.',['design'],[
lesson('Maps, proximity & nearby friends','Location systems need spatial indexing and an explicit freshness model. Nearby search, route planning, and live location sharing are separate problems with different privacy and update needs.',[
'Geohashes, quadtrees, and spatial indexes::Narrow candidates geographically before precise distance calculations.',
'Routing and map updates::Model roads as weighted graphs and account for changing travel costs.',
'Live sharing and retention::Define update frequency, visibility permissions, and location deletion behavior.'
],'Find nearby cafés:\nspatial index → candidate cells → exact distance → rank','A rectangular index region includes points outside the desired circular radius; filter candidates precisely.','Why is geographic index lookup often followed by exact distance filtering?','The index gives an efficient approximate candidate region, not necessarily the exact geometric result.'),
lesson('Metrics, click aggregation & leaderboards','Analytical services need clear event identity, time semantics, aggregation rules, and query latency. Approximation can be valuable when its error is acceptable and visible.',[
'Metrics ingestion and cardinality::Unbounded labels can create enormous numbers of time series.',
'Ad clicks and deduplication::Choose event IDs, attribution windows, and treatment of late or fraudulent events.',
'Leaderboard rankings::Maintain scores and tie-breaking rules; shard or approximate only with an understood consequence.'
],'click(event_id, ad_id, event_time)\nDeduplicate event_id before incrementing billable count.','Counting delivered messages is not necessarily the same as counting unique user events.','Why is user_id often a dangerous metrics label?','It can create one time series per user per metric, causing high-cardinality storage and query costs.'),
lesson('Reservations, payments, wallets & exchanges','Financial and inventory systems put correctness at the center. Model explicit states and immutable records so retries, audits, refunds, and reconciliation can be understood.',[
'Reservations and overselling::Use transactional constraints or carefully designed allocation to protect limited inventory.',
'Payments and ledgers::Use idempotency keys, balanced ledger entries, and reconciliation with external processors.',
'Exchanges and ordered processing::Define matching rules, sequencing, durability, and recovery before optimizing throughput.'
],'Payment states: created → authorized → captured\nFailure or timeout → reconcile provider state\nRetry uses the same logical idempotency key.','A client timeout must not be interpreted as proof that a payment did not happen.','Why record money movement in a ledger instead of only overwriting a balance?','The ledger preserves the history needed to audit, reconcile, rebuild balances, and explain each movement.')]);
