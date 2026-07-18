import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Building2, Clock, ChevronDown, ChevronUp, CheckCircle, XCircle,
  Timer, ArrowLeft, Play, RotateCcw, Trophy, BookOpen, FileQuestion, Mic,
} from "lucide-react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import api from "../lib/api";
import { CardSkeleton } from "../components/ui/Skeleton";
import { ProgressBar } from "../components/ui/ProgressBar";
import { getDifficultyColor } from "../lib/utils";

// ─────────────────────────────────────────────
// Previous Year Questions – static data
// ─────────────────────────────────────────────
const PYQ_DATA = {
  amazon: [
    { round: "Online Assessment", question: "Given an array of integers, find two numbers such that they add up to a specific target. Return the indices. (Two Sum)", difficulty: "basic", answer: "Use a hash map: iterate the array storing complement → index. If current element's complement exists in map, return both indices. O(n) time, O(n) space." },
    { round: "Online Assessment", question: "You are given a string of parentheses. Check if it is valid (every open bracket is closed in the correct order).", difficulty: "basic", answer: "Use a stack. Push '(' on open, pop on ')' and check it matches. Valid if stack is empty at end." },
    { round: "Technical Round 1", question: "Design a data structure that supports push, pop, top, and retrieving the minimum element in constant time (Min Stack).", difficulty: "intermediate", answer: "Maintain two stacks: one main, one auxiliary that tracks running minimums. Push to aux when new element ≤ current min." },
    { round: "Technical Round 1", question: "Given a binary tree, return the level-order traversal of its nodes' values (BFS by levels).", difficulty: "intermediate", answer: "Use a queue. At each level, process all nodes at current depth and enqueue their children. Track level sizes with a counter." },
    { round: "Technical Round 2", question: "Amazon Leadership Principle: Tell me about a time you had to make a difficult decision with incomplete information.", difficulty: "intermediate", answer: "STAR format — Situation, Task, Action, Result. Show bias for action, calculated risk-taking, and data-driven thinking per Amazon LP 'Bias for Action'." },
    { round: "Technical Round 2", question: "Design Amazon's order management system. How do you handle millions of concurrent orders with high availability?", difficulty: "advanced", answer: "Microservices: Order Service, Inventory Service, Payment Service, Notification Service. Use event-driven architecture (SQS/Kafka), CQRS, eventual consistency, DynamoDB for orders, Redis for inventory cache." },
    { round: "Bar Raiser", question: "Given a sorted rotated array, find the minimum element in O(log n).", difficulty: "intermediate", answer: "Modified binary search. The minimum is at the inflection point. If mid > right, minimum is in the right half; otherwise left half. Continue halving until lo == hi." },
    { round: "Bar Raiser", question: "Amazon LP: Describe a situation where you disagreed with your manager and how you handled it. (Disagree and Commit)", difficulty: "intermediate", answer: "Demonstrate respectful disagreement with data, clear escalation, and willingness to commit once decision is made. Show ownership and follow-through." },
    { round: "HR Round", question: "Why Amazon? How do your goals align with Amazon's Leadership Principles?", difficulty: "basic", answer: "Research Amazon's LPs (Customer Obsession, Ownership, Invent and Simplify, etc.). Connect 2-3 LPs to your personal experiences and career goals authentically." },
  ],
  google: [
    { round: "Phone Screen", question: "Implement a function to find all anagrams of a pattern in a string. Return start indices.", difficulty: "intermediate", answer: "Sliding window + character frequency map. Maintain a window of pattern length, update counts as you slide. When window freq matches pattern freq, record index. O(n)." },
    { round: "Phone Screen", question: "Given a linked list, determine if it has a cycle. If yes, return the start node of the cycle.", difficulty: "intermediate", answer: "Floyd's cycle detection: fast/slow pointers. When they meet, reset one pointer to head. Move both one step at a time — they meet at the cycle start." },
    { round: "Onsite Round 1", question: "Design Google's URL shortener (bit.ly). Handle 100M URLs/day with sub-10ms read latency.", difficulty: "advanced", answer: "Base62 encoding for short codes. Read-heavy, so use CDN + Redis cache. Write to Cassandra/DynamoDB. Consistent hashing for sharding. Pre-generate short codes to avoid collision at scale." },
    { round: "Onsite Round 1", question: "Given an m×n grid, count the number of unique paths from top-left to bottom-right (can only move right or down).", difficulty: "basic", answer: "Dynamic programming: dp[i][j] = dp[i-1][j] + dp[i][j-1]. Base case: first row and column are all 1s. Or use combinatorics: C(m+n-2, m-1)." },
    { round: "Onsite Round 2", question: "Implement LRU Cache with get(key) and put(key, value) both in O(1) time.", difficulty: "advanced", answer: "Doubly linked list + hash map. Map stores key → node. On get/put, move node to head. On overflow, remove tail. Head = most recent, tail = least recent." },
    { round: "Onsite Round 2", question: "Given a list of intervals, merge all overlapping intervals.", difficulty: "intermediate", answer: "Sort by start time. Iterate and compare each interval's start with the last merged interval's end. If overlap, extend end; else add to result list." },
    { round: "Onsite Round 3", question: "Design Google Search autocomplete system. Handle 10B queries/day with sub-100ms response.", difficulty: "advanced", answer: "Trie data structure with top-k suggestions at each node. Pre-compute and cache top suggestions. Segment trie into shards. Use Cassandra for persistence, Memcache for hot keys." },
    { round: "Onsite Round 3", question: "Find the kth largest element in an unsorted array without sorting it.", difficulty: "intermediate", answer: "Use a min-heap of size k. Iterate the array, add element to heap; if heap size exceeds k, remove minimum. Final heap top is kth largest. O(n log k) time." },
    { round: "HR Round", question: "What do you find most exciting about working on large-scale distributed systems at Google?", difficulty: "basic", answer: "Discuss impact (billions of users), technical challenges (consistency, availability, latency), learning culture, and how you'd contribute to Google's mission." },
  ],
  microsoft: [
    { round: "Online Assessment", question: "Reverse a linked list both iteratively and recursively.", difficulty: "basic", answer: "Iterative: three pointers (prev, curr, next). Recursive: reverse from head.next, then set head.next.next = head, head.next = null." },
    { round: "Online Assessment", question: "Given a binary search tree, find the lowest common ancestor of two given nodes.", difficulty: "intermediate", answer: "For BST: if both nodes are less than root, recurse left; if both greater, recurse right; otherwise root is LCA. O(h) where h is tree height." },
    { round: "Technical Round 1", question: "Implement a stack using two queues and a queue using two stacks.", difficulty: "intermediate", answer: "Stack with queues: on push, enqueue to q1; on pop, move all but last to q2, return last, swap q1/q2. Queue with stacks: s1 for enqueue, s2 for dequeue (lazy transfer)." },
    { round: "Technical Round 1", question: "Explain the SOLID principles with a practical example for each.", difficulty: "intermediate", answer: "SRP: one class, one responsibility. OCP: open for extension, closed for modification (strategy pattern). LSP: subclasses replaceable for parent. ISP: small focused interfaces. DIP: depend on abstractions." },
    { round: "Technical Round 2", question: "Design Microsoft Teams' message delivery system. How do you ensure messages are delivered in order?", difficulty: "advanced", answer: "Use Kafka with partition-per-conversation for ordering. Messages stored in CosmosDB (partitioned by conversation ID). WebSocket connections for real-time delivery, fallback to polling. Sequence numbers for ordering guarantees." },
    { round: "Technical Round 2", question: "Given a matrix of 0s and 1s, find the largest rectangle containing only 1s.", difficulty: "advanced", answer: "For each row, compute histogram of consecutive 1s. Apply 'largest rectangle in histogram' using a stack-based approach. O(m*n) overall." },
    { round: "Technical Round 3", question: "What is the difference between deep copy and shallow copy? When would you use each in C#/Java?", difficulty: "basic", answer: "Shallow copy copies references; deep copy copies entire object tree. Use shallow for immutable or independent objects. Use deep when you need full independence of the copy." },
    { round: "Technical Round 3", question: "How does garbage collection work in Java/C#? What are memory leaks and how do you prevent them?", difficulty: "intermediate", answer: "GC identifies unreachable objects (mark-and-sweep, generational). Memory leaks: static references, listeners not removed, caches without eviction. Prevent with weak references, explicit disposal (IDisposable), profiling." },
    { round: "HR Round", question: "Tell me about yourself and why you want to work at Microsoft.", difficulty: "basic", answer: "Structure: background → key experiences → skills alignment → why Microsoft (culture, growth mindset, mission to empower). Be specific about products/teams you're excited about." },
  ],
  tcs: [
    { round: "TCS National Qualifier Test", question: "A train travels from A to B at 60 km/h and returns at 40 km/h. What is the average speed for the entire journey?", difficulty: "basic", answer: "Average speed = 2×v1×v2 / (v1+v2) = 2×60×40 / (60+40) = 4800/100 = 48 km/h. Use harmonic mean for equal distances." },
    { round: "TCS National Qualifier Test", question: "Find the odd one out: BDFH, CEGI, DFHJ, EGIK, FHIJ", difficulty: "basic", answer: "FHIJ — the pattern is alternating letters skipping one. FHIJ breaks the pattern (should be FHJL). All others follow +2 spacing consistently." },
    { round: "Technical Round 1", question: "Write a Java program to check if a string is a palindrome without using any built-in reverse methods.", difficulty: "basic", answer: "Two-pointer approach: compare characters at left and right pointers, moving inward. Return false if mismatch, true if pointers cross. O(n/2) comparisons." },
    { round: "Technical Round 1", question: "What is the difference between HashMap and HashTable in Java? When should you use each?", difficulty: "basic", answer: "HashMap: unsynchronized, allows null keys/values, faster. HashTable: synchronized (thread-safe), no null keys/values. Use HashMap for single-threaded; ConcurrentHashMap for multi-threaded (preferred over HashTable)." },
    { round: "Technical Round 1", question: "Explain the concept of OOPS with a real-world example. Cover all four pillars.", difficulty: "basic", answer: "Encapsulation (car internals hidden), Abstraction (driver doesn't know engine details), Inheritance (SportsCar extends Car), Polymorphism (start() behaves differently per car type)." },
    { round: "Technical Round 2", question: "What is SQL normalization? Explain 1NF, 2NF, 3NF with examples.", difficulty: "intermediate", answer: "1NF: atomic values, no repeating groups. 2NF: 1NF + no partial dependency on composite key. 3NF: 2NF + no transitive dependency. Each higher form reduces redundancy and update anomalies." },
    { round: "Managerial Round", question: "How do you handle pressure and tight deadlines? Give a specific example.", difficulty: "basic", answer: "Show prioritization (MoSCoW method), communication (updating stakeholders), breaking tasks, staying calm. Result: delivered on time despite challenges." },
    { round: "HR Round", question: "Where do you see yourself in 5 years? How does TCS fit into your plan?", difficulty: "basic", answer: "Align with TCS's scale (IT services leader, global projects). Mention role growth, exposure to diverse technologies and clients, leadership opportunities within TCS." },
    { round: "HR Round", question: "What are your salary expectations and are you willing to relocate?", difficulty: "basic", answer: "Research TCS fresher packages (CTC bands). Express flexibility on relocation, enthusiasm for opportunity regardless of location." },
  ],
  infosys: [
    { round: "Online Test – Aptitude", question: "A shopkeeper marks up goods by 40% and gives a 20% discount. What is the net profit percentage?", difficulty: "basic", answer: "SP = 1.4 × 0.8 × CP = 1.12 CP. Profit = 12%. Formula: Net % = (1 + m/100)(1 - d/100) × 100 − 100." },
    { round: "Online Test – Reasoning", question: "If all Bloops are Razzies and all Razzies are Lazzies, which is definitely true? (A) All Bloops are Lazzies (B) All Lazzies are Bloops...", difficulty: "basic", answer: "Answer: (A) All Bloops are Lazzies. By syllogism: Bloops ⊂ Razzies ⊂ Lazzies, so Bloops ⊂ Lazzies. The reverse chain doesn't hold." },
    { round: "Technical Round 1 – Java", question: "Explain the Java Collections Framework. Compare ArrayList vs LinkedList vs Vector.", difficulty: "basic", answer: "ArrayList: dynamic array, fast random access O(1), slow insert/delete O(n). LinkedList: doubly linked, fast insert/delete O(1) at ends, slow access O(n). Vector: synchronized ArrayList, slower, legacy." },
    { round: "Technical Round 1 – Java", question: "What are Java 8 features? Explain lambdas, streams, and Optional with examples.", difficulty: "intermediate", answer: "Lambdas: anonymous functions (x -> x*2). Streams: pipeline for collection processing (filter, map, collect). Optional: null-safe container (Optional.of, .orElse, .map). Reduces boilerplate and NullPointerExceptions." },
    { round: "Technical Round 1 – Java", question: "Write a Java program to find duplicate elements in an array using only O(1) extra space.", difficulty: "intermediate", answer: "For arrays with values in range [1, n]: use index marking. For each element arr[i], negate arr[abs(arr[i])-1]. If already negative, it's a duplicate. Restore signs after. O(n) time, O(1) space." },
    { round: "Technical Round 2 – Database", question: "Write a SQL query to find the second highest salary from an Employee table without using LIMIT/TOP.", difficulty: "intermediate", answer: "SELECT MAX(salary) FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee). Or use DENSE_RANK(): SELECT salary FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) rk FROM Employee) t WHERE rk = 2." },
    { round: "Technical Round 2 – Database", question: "Explain ACID properties in database transactions with examples.", difficulty: "basic", answer: "Atomicity: all or nothing (bank transfer). Consistency: valid state before and after. Isolation: concurrent transactions don't interfere. Durability: committed data persists even after crash." },
    { round: "HR Round", question: "Tell me about a time you worked in a team with a conflict. How did you resolve it?", difficulty: "basic", answer: "STAR format. Show active listening, empathy, focus on shared goal, compromise. Result: team delivered successfully with improved communication." },
    { round: "HR Round", question: "Are you comfortable working in shifts and on client-facing projects abroad?", difficulty: "basic", answer: "Express flexibility and enthusiasm. Mention global exposure benefits, willingness to adapt, cultural awareness." },
  ],
  accenture: [
    { round: "Cognitive Assessment", question: "Choose the word most similar in meaning to 'LOQUACIOUS': (A) Quiet (B) Talkative (C) Aggressive (D) Thoughtful", difficulty: "basic", answer: "Answer: (B) Talkative. Loquacious means talking a great deal; inclined to chatter. From Latin 'loquax' (talkative)." },
    { round: "Cognitive Assessment", question: "In a class of 40 students, 24 like Mathematics and 20 like Science. 8 like both. How many like neither?", difficulty: "basic", answer: "Using inclusion-exclusion: |M ∪ S| = 24 + 20 − 8 = 36. Neither = 40 − 36 = 4 students." },
    { round: "Technical Round – Coding", question: "Write a program to find all permutations of a given string.", difficulty: "intermediate", answer: "Backtracking: fix each character at position 0, recurse for remaining. Swap element with each position, recurse, swap back. For 'abc': 6 permutations = 3! Total time: O(n × n!)." },
    { round: "Technical Round – Coding", question: "Explain the difference between == and .equals() in Java. Write a code example demonstrating the difference.", difficulty: "basic", answer: "== compares references (memory addresses). .equals() compares content/value (overridden in String, Integer etc.). new String('a') == new String('a') is false, but .equals() is true." },
    { round: "Technical Round – Coding", question: "What is the difference between checked and unchecked exceptions in Java? When do you use each?", difficulty: "basic", answer: "Checked: must be caught or declared (IOException, SQLException) — for recoverable conditions. Unchecked (RuntimeException): NullPointerException, ArrayIndexOutOfBoundsException — programming errors. Use checked for external dependencies." },
    { round: "Communication Assessment", question: "Describe a project you're proud of. Explain your role, challenges faced, and what you learned.", difficulty: "basic", answer: "Structure: What was the project → Your specific contribution → One major challenge → How you overcame it → Key learning. Keep to 2-3 minutes. Use clear, confident language." },
    { round: "Technical Round 2", question: "What is REST API? Explain HTTP methods and status codes.", difficulty: "basic", answer: "REST: stateless architecture using HTTP. Methods: GET (read), POST (create), PUT (update), DELETE (remove), PATCH (partial update). Key status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error." },
    { round: "HR Round", question: "Accenture values innovation and continuous learning. How do you stay updated with technology trends?", difficulty: "basic", answer: "Mention: online courses (Coursera, Udemy), GitHub exploration, tech blogs, hackathons, certifications. Show specific recent examples (a technology you learned in past 6 months)." },
  ],
  wipro: [
    { round: "Online Test – Quantitative", question: "A pipe fills a tank in 6 hours, another fills in 4 hours. A drain empties it in 12 hours. How long to fill the tank with all three open?", difficulty: "basic", answer: "Work per hour: 1/6 + 1/4 − 1/12 = 2/12 + 3/12 − 1/12 = 4/12 = 1/3. Time = 3 hours." },
    { round: "Online Test – Verbal", question: "Identify the grammatically correct sentence: (A) He don't know nothing. (B) Neither she nor he were present. (C) The committee has reached its decision. (D) Everyone should carry their bags.", difficulty: "basic", answer: "Answer: (C) — collective noun 'committee' takes singular verb. (A) double negative, (B) subject-verb agreement with 'neither…nor' should use 'was', (D) technically accepted but traditionalists prefer 'his or her'." },
    { round: "Technical Round 1", question: "Write a Python program to find the factorial of a number using recursion and iteration. Compare their time complexities.", difficulty: "basic", answer: "Both O(n). Recursive: def factorial(n): return 1 if n<=1 else n*factorial(n-1). Iterative: use a loop with accumulator. Recursion has O(n) stack space; iteration is O(1) space." },
    { round: "Technical Round 1", question: "Explain Python decorators. Write a decorator that logs function execution time.", difficulty: "intermediate", answer: "Decorators are higher-order functions that wrap another function. @timer wraps the function, records time.time() before and after call, prints elapsed. Use functools.wraps to preserve the wrapped function's metadata." },
    { round: "Technical Round 1", question: "What is the difference between a list, tuple, and set in Python? When would you use each?", difficulty: "basic", answer: "List: ordered, mutable, allows duplicates — for sequences that change. Tuple: ordered, immutable — for fixed data, function returns, dictionary keys. Set: unordered, unique elements — for membership testing, deduplication." },
    { round: "Technical Round 2", question: "Write SQL to find employees who earn more than the average salary in their department.", difficulty: "intermediate", answer: "SELECT e.name, e.salary, e.dept FROM Employee e WHERE e.salary > (SELECT AVG(salary) FROM Employee WHERE dept = e.dept). Correlated subquery or use window function AVG() OVER (PARTITION BY dept)." },
    { round: "Technical Round 2", question: "What is version control? Explain the Git workflow: clone, branch, commit, merge, rebase.", difficulty: "basic", answer: "Git tracks code changes. Workflow: clone (copy repo), branch (isolate features), commit (snapshot changes), merge (combine branches), rebase (rewrite commit history for cleaner log). PR/MR before merging to main." },
    { round: "HR Round", question: "Wipro works with diverse global clients. How do you handle cultural differences and diverse teams?", difficulty: "basic", answer: "Show cultural awareness, active listening, flexibility in communication styles. Example of working with diverse peers. Wipro's values: respect, integrity, collaboration." },
  ],
  meta: [
    { round: "Phone Screen", question: "Given a binary tree, find the maximum path sum (path can start and end at any node).", difficulty: "advanced", answer: "DFS each node computing max gain from left and right subtrees (ignore negatives with max(0, ...)). Update global max with node.val + leftGain + rightGain. Return node.val + max(leftGain, rightGain) to parent." },
    { round: "Phone Screen", question: "Given an integer array, move all zeroes to the end while maintaining the relative order of non-zero elements.", difficulty: "basic", answer: "Two-pointer: writePointer starts at 0. Iterate, when non-zero found write to writePointer and increment. Then fill remaining positions with zeros. O(n) time, O(1) space." },
    { round: "Onsite – DSA 1", question: "Find the median of two sorted arrays of sizes m and n in O(log(m+n)) time.", difficulty: "advanced", answer: "Binary search on the smaller array. Find partition such that all elements on left ≤ all on right. Check max of left halves ≤ min of right halves. Adjust partition based on comparison." },
    { round: "Onsite – DSA 2", question: "Design a data structure for a social graph that supports: addFriend, removeFriend, getFriends, getMutualFriends efficiently.", difficulty: "intermediate", answer: "Adjacency list: HashMap<userId, HashSet<userId>>. addFriend/removeFriend: O(1). getFriends: O(1). getMutualFriends: O(min(|friends1|, |friends2|)) using set intersection." },
    { round: "Onsite – System Design", question: "Design Facebook's News Feed. How do you handle 2.9 billion users generating and consuming content?", difficulty: "advanced", answer: "Fan-out on write (push) for normal users, fan-out on read (pull) for celebrities. Feed stored in Redis sorted sets. Rank by ML model (engagement signals). CDN for media. GraphQL for flexible queries." },
    { round: "Onsite – System Design", question: "Design Instagram's photo storage and serving system for 100M photo uploads per day.", difficulty: "advanced", answer: "Object storage (S3) for originals. Multiple resolutions generated via image processing workers. CDN edge caching globally. Cassandra for metadata (photoId, userId, timestamp). Consistent hashing for distribution." },
    { round: "Onsite – Behavioral", question: "Meta values moving fast and building things. Describe your biggest technical failure and what you learned.", difficulty: "intermediate", answer: "Show accountability, analysis of root cause, concrete changes made to prevent recurrence. Meta appreciates honesty, fast iteration, learning mindset over blame culture." },
    { round: "Onsite – Behavioral", question: "How would you approach refactoring a critical system used by millions of users with zero downtime?", difficulty: "advanced", answer: "Strangler fig pattern: incrementally replace components. Feature flags, shadow mode testing, blue-green deployment. Incremental rollout with monitoring. Define rollback criteria before starting." },
    { round: "HR Round", question: "Meta's mission is connecting people. How does your work align with this mission?", difficulty: "basic", answer: "Connect personal passion (building products for people) with Meta's mission. Reference specific Meta products you use and how you'd contribute to their technical challenges." },
  ],
  flipkart: [
    { round: "Online Assessment", question: "Given a sorted array of distinct integers and a target value, return the index if found, else the index where it would be inserted (Search Insert Position).", difficulty: "basic", answer: "Binary search. If mid == target return mid. If target < arr[mid], search left; else search right. When lo > hi, return lo (the insertion point). O(log n)." },
    { round: "Online Assessment", question: "You are given a list of product prices. Find the maximum profit you can make by buying on one day and selling on another future day.", difficulty: "basic", answer: "Track running minimum price. At each day, compute profit = price - runningMin. Update maxProfit if greater. One pass O(n), O(1) space." },
    { round: "Technical Round 1 – LLD", question: "Design a parking lot system (Low Level Design). Define classes, relationships, and key methods.", difficulty: "intermediate", answer: "Classes: ParkingLot, Floor, Slot (Small/Medium/Large), Vehicle (Car/Bike/Truck), Ticket, ParkingStrategy. Key methods: parkVehicle(), removeVehicle(), getAvailableSlots(). Use Factory pattern for vehicles, Strategy for slot allocation." },
    { round: "Technical Round 1 – LLD", question: "Design a library management system with book checkout, return, and search functionality.", difficulty: "intermediate", answer: "Classes: Library, Book, Member, Checkout, Fine. BookCatalog uses HashMap for O(1) lookup. Observer pattern for due-date notifications. Iterator for search results. FineCalculator strategy per membership type." },
    { round: "Technical Round 2 – DSA", question: "Given a stream of integers, find the median of the stream at each step.", difficulty: "advanced", answer: "Two heaps: max-heap for lower half, min-heap for upper half. Keep sizes balanced (differ by at most 1). Median = top of larger heap or average of both tops. O(log n) per insertion." },
    { round: "Technical Round 2 – DSA", question: "Word Ladder: given start and end words and a dictionary, find the shortest transformation sequence.", difficulty: "advanced", answer: "BFS from start word. At each step, try changing each character to a-z. If result is in dictionary and not visited, add to queue. Level count = number of transformations. Bidirectional BFS optimizes further." },
    { round: "Technical Round 3 – System Design", question: "Design Flipkart's flash sale system. Handle 10 million users hitting 'Buy Now' simultaneously for 100 items.", difficulty: "advanced", answer: "Pre-sale queue with token bucket rate limiting. Redis atomic DECR for inventory (prevents overselling). Kafka queue for order processing. Fairness via timestamped queue. Circuit breakers for dependent services." },
    { round: "HR Round", question: "How do you ensure code quality in a fast-paced e-commerce environment?", difficulty: "basic", answer: "Code reviews, unit + integration tests, CI/CD pipelines, feature flags for gradual rollout, monitoring and alerting, runbooks for common failures." },
  ],
  swiggy: [
    { round: "Online Assessment", question: "You are given restaurant delivery times and ratings. Find the optimal assignment of delivery partners to minimize total delivery time.", difficulty: "advanced", answer: "Model as assignment problem / bipartite matching. Hungarian algorithm O(n³) for optimal assignment. Greedy heuristic: sort by distance, assign nearest available partner. Evaluate trade-off based on scale." },
    { round: "Technical Round 1 – Backend", question: "Design Swiggy's real-time location tracking for delivery partners. Handle 100K active orders simultaneously.", difficulty: "advanced", answer: "WebSocket connections for real-time updates. Redis geospatial (GEOADD/GEORADIUS) for location storage. Kafka for location update events. TTL-based expiry for inactive partners. Push updates only when location changes significantly (Δ > 50m)." },
    { round: "Technical Round 1 – Backend", question: "Explain the difference between horizontal and vertical scaling. How would you scale Swiggy's order service during peak hours?", difficulty: "intermediate", answer: "Vertical: bigger machine (CPU/RAM). Horizontal: more machines + load balancer. For Swiggy: auto-scaling groups, stateless services, read replicas for DB, cache-heavy architecture, pre-warming during predicted peak (lunch/dinner)." },
    { round: "Technical Round 1 – DSA", question: "Given a list of restaurant locations and a user location, find the 3 nearest restaurants using efficient data structures.", difficulty: "intermediate", answer: "Use a max-heap of size k. Compute Euclidean distances. Maintain top-3 by replacing heap root when smaller distance found. O(n log k) time. For large scale: k-d tree or geospatial index." },
    { round: "Technical Round 2 – System Design", question: "Design Swiggy's surge pricing system that dynamically adjusts delivery charges based on demand and supply.", difficulty: "advanced", answer: "Demand signals: order rate, active users per zone. Supply signals: available partners, average delivery time. Pricing engine reads from Redis (low latency). ML model for price elasticity. Update prices every 30s. A/B test price changes." },
    { round: "Technical Round 2 – DSA", question: "Given multiple restaurant menus (each with items and prices), find the cheapest combination to order exactly K distinct items.", difficulty: "advanced", answer: "Dynamic programming: dp[i][j] = min cost to pick j items from first i restaurants. For each restaurant, iterate items as knapsack weights. Optimize with memoization. Alternatively greedy if items are independent." },
    { round: "Technical Round 3 – Database", question: "Design the database schema for Swiggy. Consider restaurants, menus, users, orders, delivery partners, and ratings.", difficulty: "intermediate", answer: "Users, Restaurants (with location Point type), MenuItems (restaurantId FK), Orders (userId, restaurantId, status, deliveryPartnerId), OrderItems (orderId, menuItemId, qty), Ratings. Use PostGIS for geospatial queries. Partition orders by date." },
    { round: "HR Round", question: "Swiggy moves extremely fast. How do you balance speed of delivery with code quality?", difficulty: "basic", answer: "Show examples of iterative development, MVP-first thinking, automated testing for critical paths, tech debt tracking, and measured approach to refactoring. Swiggy values 'bias for action' with calculated risks." },
  ],
};

// ─────────────────────────────────────────────
// Generic PYQ by company type
// ─────────────────────────────────────────────
const GENERIC_PRODUCT_PYQ = [
  { round: "Technical Round 1", question: "Implement a rate limiter that allows N requests per second per user.", difficulty: "advanced", answer: "Token bucket or sliding window algorithm. Store per-user token count in Redis. Atomic operations (MULTI/EXEC) for thread-safety. Reject with 429 Too Many Requests when bucket empty." },
  { round: "Technical Round 1", question: "Design a notification system that supports email, SMS, and push notifications.", difficulty: "intermediate", answer: "Observer/pub-sub pattern. NotificationService routes to EmailAdapter, SMSAdapter, PushAdapter. Use Kafka for async delivery. Retry with exponential backoff. Dead-letter queue for failed notifications." },
  { round: "Technical Round 2", question: "Find the longest substring without repeating characters.", difficulty: "intermediate", answer: "Sliding window with a set. Expand right; when char already in set, shrink from left. Track max window size. O(n) time, O(min(n, m)) space where m is charset size." },
  { round: "Technical Round 2", question: "What is the CAP theorem? How do you choose between consistency and availability in your system design?", difficulty: "intermediate", answer: "CAP: a distributed system can guarantee at most 2 of: Consistency, Availability, Partition Tolerance. Real systems choose CP (banks, Zookeeper) or AP (DNS, Cassandra). Modern view: PACELC adds latency trade-offs." },
  { round: "System Design Round", question: "Design a URL shortener service. Consider scalability, analytics, and custom aliases.", difficulty: "advanced", answer: "Base62 encoding (6 chars = 56B combinations). KV store (Redis/DynamoDB). Analytics via async event streaming. Custom alias with uniqueness check. CDN for redirect caching. 301 vs 302 redirect trade-offs." },
  { round: "Behavioral Round", question: "Tell me about the most technically challenging project you've worked on.", difficulty: "intermediate", answer: "STAR format: describe the technical challenge specifically (scale, complexity, ambiguity). Walk through your reasoning, alternatives considered, decision made, and measurable outcome." },
  { round: "Behavioral Round", question: "How do you approach learning a new technology or programming language quickly?", difficulty: "basic", answer: "Show structured learning: official docs → small project → read existing codebase → contribute. Mention specific resources (books, courses). Give a recent example." },
  { round: "HR Round", question: "Why do you want to join this company specifically?", difficulty: "basic", answer: "Research: product, mission, tech stack, engineering blog, recent news. Connect 2-3 specific things with your personal goals and values. Avoid generic answers." },
];

const GENERIC_SERVICE_PYQ = [
  { round: "Online Test – Aptitude", question: "A can complete a work in 12 days, B in 18 days. Together, how many days to complete the work?", difficulty: "basic", answer: "Work rate: A = 1/12, B = 1/18 per day. Together = 1/12 + 1/18 = 3/36 + 2/36 = 5/36. Days = 36/5 = 7.2 days." },
  { round: "Online Test – Verbal", question: "Fill in the blank: The manager was _____ with the team's performance. (A) placated (B) pleased (C) perturbed (D) perplexed", difficulty: "basic", answer: "Answer depends on context, but if performance was good: (B) pleased. Learn 'GRE word list' level vocabulary for verbal sections." },
  { round: "Technical Round – Core Java", question: "Explain exception handling in Java. What is the difference between finally and finalize()?", difficulty: "basic", answer: "finally: block that always executes after try-catch, used for cleanup (closing resources). finalize(): method called by GC before object destruction (deprecated in Java 9+). Use try-with-resources instead of finalize." },
  { round: "Technical Round – Core Java", question: "What is multithreading? Explain synchronization and the synchronized keyword in Java.", difficulty: "intermediate", answer: "Multithreading: multiple threads executing concurrently within a process. Synchronization prevents race conditions. synchronized method/block acquires object's monitor lock. Use for shared mutable state. Alternatively: AtomicInteger, ConcurrentHashMap, ReentrantLock." },
  { round: "Technical Round – Database", question: "What are indexes in a database? Explain when to use and avoid them.", difficulty: "basic", answer: "Indexes speed up SELECT queries (B-tree, Hash, Full-text). Use on: frequently queried columns, foreign keys, WHERE/JOIN/ORDER BY columns. Avoid on: small tables, frequently updated columns, columns with low cardinality (e.g., boolean)." },
  { round: "Technical Round – Database", question: "Write a SQL query to display department-wise highest salary.", difficulty: "basic", answer: "SELECT dept, MAX(salary) FROM Employee GROUP BY dept. Or with employee name: use subquery or window function MAX() OVER (PARTITION BY dept) then filter for rank = 1." },
  { round: "Managerial Round", question: "Describe your ideal work environment. How do you handle repetitive or routine tasks?", difficulty: "basic", answer: "Show adaptability, professionalism, ability to find efficiency/automation in repetitive work. Mention how consistency and reliability in routine work builds trust." },
  { round: "HR Round", question: "Are you flexible with project allocation, technology stack, and working in different domains?", difficulty: "basic", answer: "Demonstrate adaptability and eagerness to learn. Mention experience picking up new skills quickly, openness to diverse domains (banking, healthcare, retail IT)." },
];

function getPYQ(companyId, companyType) {
  if (PYQ_DATA[companyId]) return PYQ_DATA[companyId];
  return companyType === "product" ? GENERIC_PRODUCT_PYQ : GENERIC_SERVICE_PYQ;
}

// ─────────────────────────────────────────────
// Difficulty filter button group (reused)
// ─────────────────────────────────────────────
const DIFF_LEVELS = ["All", "basic", "intermediate", "advanced"];

function DifficultyFilter({ value, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {DIFF_LEVELS.map((d) => (
        <button
          key={d}
          onClick={() => onChange(d)}
          className={`px-3 py-1 rounded-lg text-xs border transition-all ${
            value === d
              ? "bg-brand-600 border-brand-600 text-white"
              : "bg-surface-3 border-border text-text-secondary hover:border-border-bright"
          }`}
        >
          {d === "All" ? "All" : d.charAt(0).toUpperCase() + d.slice(1)}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 1 – Previous Year Questions
// ─────────────────────────────────────────────
function PYQTab({ company }) {
  const [openIdx, setOpenIdx] = useState(null);
  const [diffFilter, setDiffFilter] = useState("All");
  const questions = getPYQ(company.id, company.type);
  const filtered = diffFilter === "All"
    ? questions
    : questions.filter((q) => q.difficulty === diffFilter);

  const diffBadge = (d) => {
    const map = { basic: "difficulty-basic", intermediate: "difficulty-intermediate", advanced: "difficulty-advanced" };
    return map[d] || "badge-blue";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-text-muted text-sm">{filtered.length} questions from past interviews</p>
        <DifficultyFilter value={diffFilter} onChange={setDiffFilter} />
      </div>

      <div className="space-y-3">
        {filtered.map((q, i) => {
          const isOpen = openIdx === i;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="card overflow-hidden"
            >
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="tag text-xs">{q.round}</span>
                  <span className={diffBadge(q.difficulty)}>{q.difficulty}</span>
                </div>
                <p className="text-sm text-text-primary leading-relaxed">{q.question}</p>
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="btn-ghost text-xs gap-1 px-2 py-1 text-brand-400 hover:text-brand-300"
                >
                  {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {isOpen ? "Hide Answer" : "Show Answer"}
                </button>
              </div>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-0 border-t border-border bg-surface-3">
                      <div className="mt-3 bg-surface-2 rounded-lg p-3 text-sm text-text-secondary leading-relaxed border-l-2 border-brand-600">
                        <span className="text-brand-400 font-medium text-xs block mb-1">Answer Hint</span>
                        {q.answer}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2 – Practice Questions
// ─────────────────────────────────────────────
function PracticeTab({ company }) {
  const [diffFilter, setDiffFilter] = useState("All");
  const [expandedId, setExpandedId] = useState(null);
  const skill = company.skills?.[0] || "";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["company-practice", company.id, skill],
    queryFn: () => api.get(`/questions?skill=${encodeURIComponent(skill)}&limit=15`).then((r) => r.data),
    enabled: !!skill,
    staleTime: 60000,
  });

  const questions = data?.questions || [];
  const filtered = diffFilter === "All"
    ? questions
    : questions.filter((q) => q.difficulty === diffFilter);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex gap-2 mb-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-7 w-20 skeleton rounded-lg" />
          ))}
        </div>
        {Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card p-8 text-center space-y-2">
        <XCircle className="w-8 h-8 text-red-400 mx-auto" />
        <p className="text-text-muted text-sm">Failed to load practice questions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-text-muted text-sm">
          {filtered.length} practice questions · Skill: <span className="text-text-secondary">{skill}</span>
        </p>
        <DifficultyFilter value={diffFilter} onChange={setDiffFilter} />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-8 text-center text-text-muted text-sm">
          No questions found for the selected filter.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((q, i) => {
            const isOpen = expandedId === q.id;
            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.025 }}
                className="card overflow-hidden"
              >
                <button
                  className="w-full flex items-start gap-3 p-4 text-left hover:bg-surface-3 transition-colors"
                  onClick={() => setExpandedId(isOpen ? null : q.id)}
                >
                  <span className="text-text-muted text-xs font-mono w-6 mt-0.5 shrink-0">#{i + 1}</span>
                  <div className="flex-1 space-y-1.5">
                    <p className="text-sm text-text-primary leading-relaxed">{q.question}</p>
                    <div className="flex gap-2 flex-wrap">
                      <span className={getDifficultyColor(q.difficulty)}>{q.difficulty}</span>
                      {q.skill && <span className="tag text-xs">{q.skill}</span>}
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                  )}
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-0 border-t border-border bg-surface-3">
                        {q.answer ? (
                          <div className="mt-3 bg-surface-2 rounded-lg p-3 text-sm text-text-secondary leading-relaxed border-l-2 border-accent-green">
                            <span className="text-accent-green font-medium text-xs block mb-1">Answer</span>
                            {q.answer}
                          </div>
                        ) : (
                          <p className="mt-3 text-xs text-text-muted italic">Try answering this out loud or write it down for better retention.</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 3 – Mock Test
// ─────────────────────────────────────────────
const MOCK_QUESTIONS_POOL = {
  amazon:    ["Explain the Two Sum problem and its optimal O(n) solution.", "What is Amazon's 'Working Backwards' process?", "How does a hash map handle collisions?", "Explain CAP theorem in 2 sentences.", "What is the difference between BFS and DFS?", "Describe a time you showed ownership over a project.", "How would you design Amazon's product recommendation engine?", "What is memoization and when should you use it?", "Explain the Singleton design pattern.", "What is eventual consistency?"],
  google:    ["Explain time and space complexity with examples.", "How does Google's PageRank algorithm work at a high level?", "What is the difference between TCP and UDP?", "How would you optimize a slow SQL query?", "Explain dynamic programming vs greedy algorithms.", "What is a bloom filter?", "How does consistent hashing work?", "Describe the difference between a process and a thread.", "What is the actor model in distributed systems?", "How would you detect a cycle in a graph?"],
  microsoft: ["What are the SOLID principles?", "Explain polymorphism with a real-world example.", "What is the difference between abstract class and interface?", "How does garbage collection work in Java/C#?", "What is dependency injection?", "Explain the factory design pattern.", "What is the difference between stack and heap memory?", "How do you prevent SQL injection?", "What is a REST API and what makes it RESTful?", "Explain the observer design pattern."],
  tcs:       ["What is the difference between Java and Python?", "Explain the concept of OOP with real examples.", "What is a primary key vs foreign key?", "How does the internet work? Explain DNS.", "What is normalization in databases?", "Write a program to check if a number is prime.", "What are HTTP methods and their use cases?", "Explain the difference between compiled and interpreted languages.", "What is version control and why is Git important?", "Describe your final year project."],
  infosys:   ["Explain Java 8 features in brief.", "What is the difference between HashMap and TreeMap?", "How does multithreading work in Java?", "What is a deadlock? How do you prevent it?", "Explain the MVC architecture pattern.", "What is Spring Boot and why is it used?", "How do you handle exceptions in Java?", "What is the difference between SQL JOINs?", "Explain the lifecycle of a Java object.", "What is SOLID in object-oriented design?"],
  accenture: ["What is cloud computing? Name AWS services you know.", "Explain Agile methodology and Scrum.", "What is the difference between JavaScript and TypeScript?", "How does a microservices architecture differ from monolithic?", "What is containerization and Docker?", "Explain the CI/CD pipeline.", "What is a design pattern? Name three.", "How would you optimize website performance?", "What is OAuth 2.0?", "Explain what an API gateway does."],
  wipro:     ["What are Python's key features vs Java?", "Explain list comprehension in Python.", "What is a virtual environment in Python?", "How does Django/Flask handle HTTP requests?", "What is the difference between deep copy and shallow copy?", "Explain REST vs GraphQL.", "What is Docker and Kubernetes?", "How does JWT authentication work?", "Explain the difference between SQL and NoSQL.", "What is a lambda function in Python?"],
  meta:      ["Explain the union-find data structure.", "How would you detect duplicate photos at scale?", "What is the difference between React's virtual DOM and real DOM?", "Explain how you'd design a distributed locking system.", "What is the N+1 problem in databases?", "How does Facebook's GraphQL work?", "Explain tail recursion and its benefits.", "What is a consistent hash ring?", "How would you rank a news feed?", "What is the difference between optimistic and pessimistic locking?"],
  flipkart:  ["Design a shopping cart data model.", "How would you implement product search with filters efficiently?", "What is eventual vs strong consistency?", "Explain the circuit breaker pattern.", "How do flash sales differ architecturally from normal sales?", "What is an idempotency key in payments?", "Explain the Saga pattern for distributed transactions.", "How would you handle duplicate order submissions?", "What is blue-green deployment?", "Explain rate limiting algorithms."],
  swiggy:    ["How would you optimize delivery partner routing?", "Explain geospatial indexing (GeoHash/R-Tree).", "What is WebSocket and how does it differ from HTTP?", "How would you handle surge pricing in real-time?", "Explain the event-driven architecture.", "What is a message queue and why use Kafka?", "How does Redis caching work?", "What is the two-phase commit problem?", "Explain horizontal pod autoscaling in Kubernetes.", "How would you design a real-time tracking system?"],
};

const GENERIC_MOCK_QUESTIONS = [
  "Explain the difference between synchronous and asynchronous programming.", "What is a RESTful API?", "How does HTTP caching work?", "Explain the concept of a microservice.", "What is the difference between SQL and NoSQL databases?", "How does load balancing work?", "Explain what a CDN does.", "What is a design pattern? Give an example.", "How would you improve the performance of a slow application?", "Describe your approach to debugging a complex issue.",
];

function getMockQuestions(companyId) {
  return MOCK_QUESTIONS_POOL[companyId] || GENERIC_MOCK_QUESTIONS;
}

// Circular score display
function CircularScore({ percentage }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const color = percentage >= 70 ? "#34d399" : percentage >= 40 ? "#fbbf24" : "#f87171";

  return (
    <div className="relative inline-flex items-center justify-center w-36 h-36">
      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        <motion.circle
          cx="60" cy="60" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-2xl font-bold text-text-primary">{percentage}%</span>
        <span className="text-xs text-text-muted block">Score</span>
      </div>
    </div>
  );
}

function MockTestTab({ company }) {
  const navigate = useNavigate();
  const TOTAL = 10;
  const TIME_LIMIT = 15 * 60; // 15 minutes in seconds

  const [phase, setPhase] = useState("setup"); // setup | test | results
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]); // true = know, false = review
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);

  const questions = getMockQuestions(company.id).slice(0, TOTAL);

  // Timer effect
  useEffect(() => {
    if (phase !== "test") return;
    if (timeLeft <= 0) { setPhase("results"); return; }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [phase, timeLeft]);

  const handleStart = () => {
    setCurrentQ(0);
    setAnswers([]);
    setTimeLeft(TIME_LIMIT);
    setPhase("test");
  };

  const handleAnswer = (knew) => {
    const updated = [...answers, knew];
    setAnswers(updated);
    if (currentQ + 1 >= TOTAL) {
      setPhase("results");
    } else {
      setCurrentQ((q) => q + 1);
    }
  };

  const handleRetake = () => {
    setPhase("setup");
    setCurrentQ(0);
    setAnswers([]);
    setTimeLeft(TIME_LIMIT);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const score = answers.filter(Boolean).length;
  const percentage = Math.round((score / TOTAL) * 100);

  // Setup screen
  if (phase === "setup") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto"
      >
        <div className="card p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-brand-600/15 rounded-2xl flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8 text-brand-400" />
          </div>
          <div>
            <h2 className="section-title mb-1">{company.name} Mock Test</h2>
            <p className="text-text-muted text-sm">Test your readiness for {company.name} interviews</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Questions", value: TOTAL, icon: <FileQuestion className="w-5 h-5 text-brand-400" /> },
              { label: "Time Limit", value: "15 min", icon: <Clock className="w-5 h-5 text-accent-purple" /> },
              { label: "Skills", value: company.skills?.length || 1, icon: <BookOpen className="w-5 h-5 text-accent-green" /> },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-surface-3 rounded-xl p-3 space-y-1">
                <div className="flex justify-center">{icon}</div>
                <div className="text-lg font-bold text-text-primary">{value}</div>
                <div className="text-xs text-text-muted">{label}</div>
              </div>
            ))}
          </div>
          <div className="text-left space-y-1.5">
            <p className="text-xs text-text-muted font-medium mb-2">Skills covered:</p>
            <div className="flex flex-wrap gap-1.5">
              {(company.skills || []).map((s) => (
                <span key={s} className="tag text-xs">{s}</span>
              ))}
            </div>
          </div>
          <button onClick={handleStart} className="btn-primary w-full justify-center gap-2 py-3">
            <Play className="w-4 h-4" />
            Start Test
          </button>
        </div>
      </motion.div>
    );
  }

  // Test screen
  if (phase === "test") {
    const progress = (currentQ / TOTAL) * 100;
    const isLowTime = timeLeft < 60;
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto space-y-4"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">
            Question <span className="text-text-primary font-semibold">{currentQ + 1}</span> of {TOTAL}
          </span>
          <div className={`flex items-center gap-1.5 text-sm font-mono font-medium ${isLowTime ? "text-red-400 animate-pulse" : "text-text-secondary"}`}>
            <Timer className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress bar */}
        <ProgressBar value={currentQ} max={TOTAL} />

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="card p-6 space-y-6"
          >
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 bg-brand-600/20 rounded-lg flex items-center justify-center text-brand-400 text-sm font-bold shrink-0">
                {currentQ + 1}
              </span>
              <p className="text-base text-text-primary leading-relaxed">{questions[currentQ]}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleAnswer(true)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-accent-green/30 bg-accent-green/5 hover:bg-accent-green/15 hover:border-accent-green/60 transition-all group"
              >
                <CheckCircle className="w-8 h-8 text-accent-green group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-accent-green">I know this ✓</span>
                <span className="text-xs text-text-muted">Confident in my answer</span>
              </button>
              <button
                onClick={() => handleAnswer(false)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-red-500/30 bg-red-500/5 hover:bg-red-500/15 hover:border-red-500/60 transition-all group"
              >
                <XCircle className="w-8 h-8 text-red-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-red-400">Need review ✗</span>
                <span className="text-xs text-text-muted">Needs more practice</span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    );
  }

  // Results screen
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Score card */}
      <div className="card p-6 text-center space-y-4">
        <h2 className="section-title">Test Complete!</h2>
        <CircularScore percentage={percentage} />
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Correct", value: score, color: "text-accent-green" },
            { label: "Review", value: TOTAL - score, color: "text-red-400" },
            { label: "Total", value: TOTAL, color: "text-text-primary" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-surface-3 rounded-xl p-3 text-center">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-text-muted">{label}</div>
            </div>
          ))}
        </div>
        <p className="text-sm text-text-muted">
          {percentage >= 80 ? "🎉 Excellent! You're well prepared." :
           percentage >= 60 ? "👍 Good progress! Review the flagged questions." :
           "📚 Keep practicing — focus on the questions you flagged."}
        </p>
      </div>

      {/* Question review list */}
      <div className="card p-4 space-y-2">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Question Review</h3>
        {questions.map((q, i) => (
          <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-surface-3 transition-colors">
            {answers[i] ? (
              <CheckCircle className="w-4 h-4 text-accent-green shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            )}
            <p className="text-sm text-text-secondary leading-relaxed">{q}</p>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button onClick={handleRetake} className="btn-secondary flex-1 justify-center gap-2">
          <RotateCcw className="w-4 h-4" />
          Retake Test
        </button>
        <Link to="/companies" className="btn-primary flex-1 justify-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Companies
        </Link>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Main CompanyPrep page
// ─────────────────────────────────────────────
const TABS = [
  { id: "pyq",      label: "Previous Year Questions", icon: FileQuestion },
  { id: "practice", label: "Practice Questions",       icon: BookOpen },
  { id: "mock",     label: "Mock Test",                icon: Mic },
];

const DIFFICULTY_BADGE_MAP = {
  Easy:      "badge-green",
  Medium:    "badge-yellow",
  Hard:      "badge-orange",
  "Very Hard": "badge-pink",
};

export function CompanyPrep() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const [activeTab, setActiveTab] = useState("pyq");

  // Company data from router state; fall back to a minimal stub if navigated directly
  const company = location.state?.company || { id: paramId, name: paramId, type: "product", skills: [], difficulty: "Medium" };

  return (
    <div className="space-y-6">
      {/* Back button + header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost p-2 mt-0.5 shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            {company.logo && (
              <div className="w-10 h-10 bg-surface-3 border border-border rounded-xl flex items-center justify-center text-xl shrink-0">
                {company.logo}
              </div>
            )}
            {!company.logo && (
              <div className="w-10 h-10 bg-surface-3 border border-border rounded-xl flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-text-muted" />
              </div>
            )}
            <div>
              <h1 className="page-title leading-tight">{company.name}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`badge ${company.type === "product" ? "badge-blue" : "badge-orange"} text-xs`}>
                  {company.type === "product" ? "Product" : "Service"}
                </span>
                {company.difficulty && (
                  <span className={`badge ${DIFFICULTY_BADGE_MAP[company.difficulty] || "badge-blue"} text-xs`}>
                    {company.difficulty}
                  </span>
                )}
                {(company.skills || []).slice(0, 3).map((s) => (
                  <span key={s} className="tag text-xs">{s}</span>
                ))}
                {(company.skills || []).length > 3 && (
                  <span className="tag text-xs">+{company.skills.length - 3} more</span>
                )}
              </div>
            </div>
          </div>
          {company.description && (
            <p className="text-text-muted text-sm mt-2 ml-0">{company.description}</p>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-surface-2 border border-border p-1 rounded-xl w-fit flex-wrap">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === id
                ? "bg-brand-600 text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-3"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{id === "pyq" ? "PYQ" : id === "practice" ? "Practice" : "Mock"}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === "pyq"      && <PYQTab company={company} />}
          {activeTab === "practice" && <PracticeTab company={company} />}
          {activeTab === "mock"     && <MockTestTab company={company} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
