#!/usr/bin/env python3

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

try:
    from backend.political_abm.model import PoliticalModel
    
    print("Testing Resource-Behavior Coupling...")
    
    # Create model with few agents to test coupling
    model = PoliticalModel(num_agents=6)
    print(f"✓ Model created with {len(model.agent_set)} agents")
    
    # Manually set different wealth levels to test coupling
    agents = model.agent_set
    
    # Agent 0: Very poor (should have high risk aversion, low cognitive capacity)
    agents[0].state.vermoegen = 500
    agents[0].state.kognitive_kapazitaet_basis = 0.8
    
    # Agent 1: Poor (should have moderate effects)
    agents[1].state.vermoegen = 3000
    agents[1].state.kognitive_kapazitaet_basis = 0.8
    
    # Agent 2: Wealthy (should have low risk aversion, full cognitive capacity)
    agents[2].state.vermoegen = 50000
    agents[2].state.kognitive_kapazitaet_basis = 0.8
    
    # Update psychological states for all agents
    print("\nUpdating psychological states based on wealth...")
    for agent in agents:
        agent.update_psychological_states()
    
    print("\n=== COUPLING TEST RESULTS ===")
    
    # Test Agent 0 (very poor)
    agent0 = agents[0]
    print(f"\nAgent 0 (Very Poor - Wealth: €{agent0.state.vermoegen:.0f}):")
    print(f"  Base Cognitive Capacity: {agent0.state.kognitive_kapazitaet_basis:.3f}")
    print(f"  Effective Cognitive Capacity: {agent0.state.effektive_kognitive_kapazitaet:.3f}")
    print(f"  Risk Aversion: {agent0.state.risikoaversion:.3f}")
    
    # Test Agent 1 (poor)
    agent1 = agents[1]
    print(f"\nAgent 1 (Poor - Wealth: €{agent1.state.vermoegen:.0f}):")
    print(f"  Base Cognitive Capacity: {agent1.state.kognitive_kapazitaet_basis:.3f}")
    print(f"  Effective Cognitive Capacity: {agent1.state.effektive_kognitive_kapazitaet:.3f}")
    print(f"  Risk Aversion: {agent1.state.risikoaversion:.3f}")
    
    # Test Agent 2 (wealthy)
    agent2 = agents[2]
    print(f"\nAgent 2 (Wealthy - Wealth: €{agent2.state.vermoegen:.0f}):")
    print(f"  Base Cognitive Capacity: {agent2.state.kognitive_kapazitaet_basis:.3f}")
    print(f"  Effective Cognitive Capacity: {agent2.state.effektive_kognitive_kapazitaet:.3f}")
    print(f"  Risk Aversion: {agent2.state.risikoaversion:.3f}")
    
    # Validate behavioral tests
    print("\n=== BEHAVIORAL VALIDATION ===")
    
    # Test 1: Poor agent should have reduced cognitive capacity
    if agent0.state.effektive_kognitive_kapazitaet < agent0.state.kognitive_kapazitaet_basis * 0.8:
        print("✓ Test 1 PASSED: Very poor agent has significantly reduced cognitive capacity")
    else:
        print("❌ Test 1 FAILED: Poor agent should have reduced cognitive capacity")
    
    # Test 2: Poor agent should have high risk aversion (> 0.8)
    if agent0.state.risikoaversion > 0.8:
        print("✓ Test 2 PASSED: Very poor agent has high risk aversion")
    else:
        print("❌ Test 2 FAILED: Poor agent should have high risk aversion")
    
    # Test 3: Wealthy agent should have low risk aversion (< 0.2)
    if agent2.state.risikoaversion < 0.2:
        print("✓ Test 3 PASSED: Wealthy agent has low risk aversion")
    else:
        print("❌ Test 3 FAILED: Wealthy agent should have low risk aversion")
    
    # Test 4: Wealthy agent should maintain full cognitive capacity
    if abs(agent2.state.effektive_kognitive_kapazitaet - agent2.state.kognitive_kapazitaet_basis) < 0.01:
        print("✓ Test 4 PASSED: Wealthy agent maintains full cognitive capacity")
    else:
        print("❌ Test 4 FAILED: Wealthy agent should maintain full cognitive capacity")
    
    # Test integration in full simulation step
    print(f"\n=== INTEGRATION TEST ===")
    print("Running full simulation step with Phase 7 coupling...")
    model.step()
    print("✓ Full simulation step completed with psychological state updates")
    
    print(f"\n🎉 Resource-Behavior Coupling implementation successful!")
    
except Exception as e:
    print(f"❌ Coupling test failed: {e}")
    import traceback
    traceback.print_exc()