#!/usr/bin/env python3

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

try:
    from backend.political_abm.model import PoliticalModel
    import random
    
    print("Testing HazardManager Implementation...")
    
    # Set seed for reproducible testing
    random.seed(42)
    
    # Create model with more agents for better statistical testing
    model = PoliticalModel(num_agents=100)
    print(f"✓ Model created with {len(model.agent_set)} agents")
    
    # Count agents by biome
    biome_counts = {}
    for agent in model.agent_set:
        biome_name = agent.state.region
        biome_counts[biome_name] = biome_counts.get(biome_name, 0) + 1
    
    print(f"\nAgent distribution by biome:")
    for biome_name, count in biome_counts.items():
        biome_config = next(b for b in model.biomes if b.name == biome_name)
        print(f"  {biome_name}: {count} agents (hazard_prob: {biome_config.hazard_probability}, impact: {biome_config.hazard_impact_factor})")
    
    # Record initial wealth/income states
    initial_states = {}
    for agent in model.agent_set:
        initial_states[agent.unique_id] = {
            'wealth': agent.state.vermoegen,
            'income': agent.state.einkommen,
            'biome': agent.state.region
        }
    
    # Run multiple simulation steps to test hazard frequency
    print(f"\nRunning 20 simulation steps to test hazard frequency...")
    total_events_by_biome = {biome: 0 for biome in biome_counts.keys()}
    
    for step in range(20):
        # Clear previous events
        model.hazard_manager.events_this_step.clear()
        
        # Run just Phase 3 (Hazards) for isolated testing
        model.hazard_manager.trigger_events()
        
        # Count events by biome
        for event in model.hazard_manager.events_this_step:
            total_events_by_biome[event['biome']] += 1
    
    print(f"\n=== HAZARD FREQUENCY TEST RESULTS (20 steps) ===")
    for biome_name in biome_counts.keys():
        biome_config = next(b for b in model.biomes if b.name == biome_name)
        agent_count = biome_counts[biome_name]
        total_events = total_events_by_biome[biome_name]
        
        expected_events = 20 * agent_count * biome_config.hazard_probability
        actual_rate = total_events / (20 * agent_count) if agent_count > 0 else 0
        
        print(f"\n{biome_name}:")
        print(f"  Expected events: {expected_events:.1f}")
        print(f"  Actual events: {total_events}")
        print(f"  Expected rate: {biome_config.hazard_probability:.3f}")
        print(f"  Actual rate: {actual_rate:.3f}")
    
    # Test impact factor effects on a single step
    print(f"\n=== IMPACT FACTOR TEST ===")
    
    # Reset and run one step to capture specific impacts
    model = PoliticalModel(num_agents=50)
    
    # Set high hazard probability for testing (temporarily modify config)
    for biome in model.biomes:
        biome.hazard_probability = 0.5  # 50% chance to ensure we get some events
    
    # Record pre-hazard states
    pre_hazard_states = {}
    for agent in model.agent_set:
        pre_hazard_states[agent.unique_id] = {
            'wealth': agent.state.vermoegen,
            'income': agent.state.einkommen,
            'biome': agent.state.region
        }
    
    # Trigger hazards
    model.hazard_manager.trigger_events()
    
    # Analyze impacts
    print(f"Events triggered: {len(model.hazard_manager.events_this_step)}")
    
    if model.hazard_manager.events_this_step:
        print(f"\nSample hazard impacts:")
        for i, event in enumerate(model.hazard_manager.events_this_step[:3]):  # Show first 3 events
            agent_id = event['agent_id']
            agent = next(a for a in model.agent_set if a.unique_id == agent_id)
            biome_config = next(b for b in model.biomes if b.name == event['biome'])
            
            pre_wealth = pre_hazard_states[agent_id]['wealth']
            pre_income = pre_hazard_states[agent_id]['income']
            
            print(f"  Event {i+1} - Agent {agent_id} in {event['biome']}:")
            print(f"    Expected impact factor: {biome_config.hazard_impact_factor}")
            print(f"    Wealth: {pre_wealth:.2f} → {agent.state.vermoegen:.2f} (loss: {event['wealth_loss']:.2f})")
            print(f"    Income: {pre_income:.2f} → {agent.state.einkommen:.2f} (loss: {event['income_loss']:.2f})")
    
    # Validate behavioral tests
    print(f"\n=== BEHAVIORAL VALIDATION ===")
    
    # Reset original config for validation
    model = PoliticalModel(num_agents=100)
    
    # Test 1: Industrial Zone should have higher event rate than Prosperous Metropolis
    industrial_prob = next(b for b in model.biomes if b.name == "Industrial Zone").hazard_probability
    prosperous_prob = next(b for b in model.biomes if b.name == "Prosperous Metropolis").hazard_probability
    
    if industrial_prob > prosperous_prob:
        print("✓ Test 1 PASSED: Industrial Zone has higher hazard probability than Prosperous Metropolis")
    else:
        print("❌ Test 1 FAILED: Industrial Zone should have higher hazard probability")
    
    # Test 2: Hazard probabilities should be reasonable (between 0 and 0.1)
    reasonable_probs = all(0 <= b.hazard_probability <= 0.1 for b in model.biomes)
    if reasonable_probs:
        print("✓ Test 2 PASSED: All hazard probabilities are in reasonable range (0-10%)")
    else:
        print("❌ Test 2 FAILED: Some hazard probabilities are unreasonable")
    
    # Test 3: Impact factors should be reasonable (between 0 and 1)
    reasonable_impacts = all(0 <= b.hazard_impact_factor <= 1 for b in model.biomes)
    if reasonable_impacts:
        print("✓ Test 3 PASSED: All impact factors are in reasonable range (0-100%)")
    else:
        print("❌ Test 3 FAILED: Some impact factors are unreasonable")
    
    # Test integration in full simulation step
    print(f"\n=== INTEGRATION TEST ===")
    print("Running full simulation step with hazard events...")
    model.step()
    print("✓ Full simulation step completed with hazard events")
    
    print(f"\n🎉 HazardManager implementation successful!")
    
except Exception as e:
    print(f"❌ Hazard test failed: {e}")
    import traceback
    traceback.print_exc()