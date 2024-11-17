# What is a deadlock:

A deadlock occurs when 2 or more transactions are waiting for the other to release locks on the resources they need, causing a situation where neither transaction can proceed.

# Example:

- Transaction A acquires a shared lock on row 1.
- Transaction B acquires a shared lock on row 2.
- Transaction A request an exclusive lock on row 2, and is blocked until Transaction B releases the shared lock it has on row 2.
- Transaction B request an exclusive lock on row 1, and is blocked until Transaction A releases the shared lock it has on row 1.
- Now both transactions wait forever (until the deadlock is broken by an external process).

# Coffman conditions:

4 conditions that must be present simultaneously for a deadlock to occur:

1. **Mutual Exclusion:**
   Resources that can't be shared between transactions.

2. **Hold & Wait:**
   A transaction hold at least 1 resource and waits for additional resources held by other transactions.

3. **No Preemption:**
   Resources cannot be forcibly taken from a transaction. They must be released voluntarily.

4. **Circular Wait:**
   A set of transactions is involved in a circular chain, where each transaction is waiting for a resource held by another transaction in the cycle.

# Deadlock Recovery:

- Selecting a victim: DBMS or OS detects deadlocks and selects a transaction to be rolled back.
- The transaction is rolled back.
- Rolled-back transactions can be restarted automatically by the DBMS (or by the application).

# Deadlock Prevention:

1. Resource Ordering:
   Ensure that transactions request resources in a strict order -> eliminate the possibility of circular wait.

2. Timeout:
   Transactions should be rolled back if they hold resources for too long -> will not block other transactions indefinitely.

3. Banker's Algorithm:
   A resource-allocation and deadlock-avoidance algorithm.

# Reference:

- https://www.linkedin.com/posts/alexxubyte_systemdesign-coding-interviewtips-activity-7195811330568712192-txg7/

- https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide?view=sql-server-ver16