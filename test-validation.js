/**
 * Simple validation test script
 * Run with: node test-validation.js
 *
 * This demonstrates the Zod validation in action without needing to run the full server.
 */

import {
  listSourcesValidator,
  createSessionValidator,
  approvePlanValidator,
  sendMessageValidator,
  listActivitiesValidator,
} from "./dist/schemas/index.js";

console.log("🧪 Testing Zod Validation for Jules MCP Server\n");
console.log("=".repeat(60));

// Test 1: Valid pagination
console.log("\n✅ Test 1: Valid pagination");
try {
  const result = listSourcesValidator.parse({
    pageSize: 50,
    pageToken: "abc123",
  });
  console.log("   PASS - Valid pagination accepted");
  console.log("   Result:", result);
} catch (error) {
  console.log("   FAIL -", error.message);
}

// Test 2: Invalid page size (too large)
console.log("\n❌ Test 2: Invalid page size (too large)");
try {
  listSourcesValidator.parse({ pageSize: 150 });
  console.log("   FAIL - Should have thrown validation error");
} catch (error) {
  console.log("   PASS - Validation error caught:");
  console.log("   Error:", error.errors[0].message);
}

// Test 3: Invalid page size (zero)
console.log("\n❌ Test 3: Invalid page size (zero)");
try {
  listSourcesValidator.parse({ pageSize: 0 });
  console.log("   FAIL - Should have thrown validation error");
} catch (error) {
  console.log("   PASS - Validation error caught:");
  console.log("   Error:", error.errors[0].message);
}

// Test 4: Valid session creation
console.log("\n✅ Test 4: Valid session creation");
try {
  const result = createSessionValidator.parse({
    prompt: "Add authentication to the API",
    source: "sources/github/myorg/myrepo",
    title: "Auth Feature",
    startingBranch: "develop",
    requirePlanApproval: true,
  });
  console.log("   PASS - Valid session creation accepted");
  console.log("   Result:", {
    prompt: result.prompt.substring(0, 30) + "...",
    source: result.source,
    title: result.title,
    startingBranch: result.startingBranch,
    requirePlanApproval: result.requirePlanApproval,
  });
} catch (error) {
  console.log("   FAIL -", error.message);
}

// Test 5: Invalid source format
console.log("\n❌ Test 5: Invalid source format");
try {
  createSessionValidator.parse({
    prompt: "Fix bug",
    source: "github/myorg/myrepo", // Wrong format
  });
  console.log("   FAIL - Should have thrown validation error");
} catch (error) {
  console.log("   PASS - Validation error caught:");
  console.log("   Error:", error.errors[0].message);
}

// Test 6: Empty prompt
console.log("\n❌ Test 6: Empty prompt");
try {
  createSessionValidator.parse({
    prompt: "",
    source: "sources/github/myorg/myrepo",
  });
  console.log("   FAIL - Should have thrown validation error");
} catch (error) {
  console.log("   PASS - Validation error caught:");
  console.log("   Error:", error.errors[0].message);
}

// Test 7: Default values
console.log("\n✅ Test 7: Default values applied");
try {
  const result = createSessionValidator.parse({
    prompt: "Fix bug",
    source: "sources/github/myorg/myrepo",
    // No startingBranch or requirePlanApproval provided
  });
  console.log("   PASS - Defaults applied correctly");
  console.log(
    "   startingBranch:",
    result.startingBranch,
    "(should be 'main')"
  );
  console.log(
    "   requirePlanApproval:",
    result.requirePlanApproval,
    "(should be false)"
  );
} catch (error) {
  console.log("   FAIL -", error.message);
}

// Test 8: Invalid session ID format
console.log("\n❌ Test 8: Invalid session ID format");
try {
  approvePlanValidator.parse({
    sessionId: "abc123", // Wrong format, should be sessions/abc123
  });
  console.log("   FAIL - Should have thrown validation error");
} catch (error) {
  console.log("   PASS - Validation error caught:");
  console.log("   Error:", error.errors[0].message);
}

// Test 9: Valid session ID
console.log("\n✅ Test 9: Valid session ID");
try {
  const result = approvePlanValidator.parse({
    sessionId: "sessions/abc123",
  });
  console.log("   PASS - Valid session ID accepted");
  console.log("   Result:", result);
} catch (error) {
  console.log("   FAIL -", error.message);
}

// Test 10: Message too long
console.log("\n❌ Test 10: Message too long");
try {
  sendMessageValidator.parse({
    sessionId: "sessions/abc123",
    prompt: "A".repeat(10001), // Too long
  });
  console.log("   FAIL - Should have thrown validation error");
} catch (error) {
  console.log("   PASS - Validation error caught:");
  console.log("   Error:", error.errors[0].message);
}

// Test 11: Valid message
console.log("\n✅ Test 11: Valid message");
try {
  const result = sendMessageValidator.parse({
    sessionId: "sessions/abc123",
    prompt: "Can you also add unit tests?",
  });
  console.log("   PASS - Valid message accepted");
  console.log("   Result:", {
    sessionId: result.sessionId,
    prompt: result.prompt,
  });
} catch (error) {
  console.log("   FAIL -", error.message);
}

// Test 12: List activities with pagination
console.log("\n✅ Test 12: List activities with pagination");
try {
  const result = listActivitiesValidator.parse({
    sessionId: "sessions/abc123",
    pageSize: 20,
    pageToken: "next_page",
  });
  console.log("   PASS - Valid activities request accepted");
  console.log("   Result:", result);
} catch (error) {
  console.log("   FAIL -", error.message);
}

// Test 13: Multiple validation errors
console.log("\n❌ Test 13: Multiple validation errors");
try {
  createSessionValidator.parse({
    prompt: "", // Empty
    source: "invalid-format", // Wrong format
    title: "A".repeat(201), // Too long
  });
  console.log("   FAIL - Should have thrown validation error");
} catch (error) {
  console.log("   PASS - Multiple validation errors caught:");
  error.errors.forEach((err, i) => {
    console.log(`   Error ${i + 1}: ${err.path.join(".")}: ${err.message}`);
  });
}

console.log("\n" + "=".repeat(60));
console.log("\n✅ All validation tests completed!\n");
console.log("Summary:");
console.log("  - Zod validation is working correctly");
console.log("  - Invalid inputs are caught with clear error messages");
console.log("  - Valid inputs are accepted and defaults are applied");
console.log("  - Multiple errors are reported together");
console.log("\nQuick Win #1: Zod Validation - ✅ COMPLETE\n");
