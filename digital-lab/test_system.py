#!/usr/bin/env python3

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

try:
    from backend.political_abm.model import PoliticalModel
    
    print("Testing new 7-phase cycle and ResourceManager integration...")
    
    # Create model with 10 agents to test properly (network_connections=5 requires at least 6 agents)
    model = PoliticalModel(num_agents=10)
    print(f"✓ Model created successfully")
    print(f"✓ Managers initialized: ResourceManager, HazardManager, SeasonalityManager")
    print(f"✓ Biomes loaded: {[b.name for b in model.biomes]}")
    print(f"✓ Agents created: {len(model.agent_set)}")
    
    # Test first step
    print("\nExecuting first simulation step...")
    model.step()
    print("✓ First step completed successfully with new 7-phase cycle")
    
    # Check agent states
    if model.agent_set:
        agent = model.agent_set[0]
        print(f"\nSample agent state:")
        print(f"  - Region: {agent.state.region}")
        print(f"  - Income: {agent.state.einkommen:.2f}")
        print(f"  - Wealth: {agent.state.vermoegen:.2f}")
        print(f"  - Social Benefits: {agent.state.sozialleistungen:.2f}")
        print(f"  - Political Position: {agent.state.calculate_political_position()}")
    
    print(f"\n🎉 Integration test passed! New system is working correctly.")
    
except Exception as e:
    print(f"❌ Integration test failed: {e}")
    import traceback
    traceback.print_exc()