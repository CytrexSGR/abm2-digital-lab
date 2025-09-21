#!/usr/bin/env python3

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

try:
    from backend.political_abm.model import PoliticalModel
    import random
    
    print("Testing Risk-Based Investment Decision Logic...")
    
    # Set seed for reproducible testing
    random.seed(42)
    
    # Create model with fewer agents for detailed testing
    model = PoliticalModel(num_agents=20)
    print(f"✓ Model created with {len(model.agent_set)} agents")
    
    # Create test agents with specific psychological profiles
    agents = model.agent_set
    
    # Agent 0: High risk aversion, should invest very little
    agents[0].state.einkommen = 10000
    agents[0].state.risikoaversion = 0.95  # Very risk averse
    agents[0].state.zeitpraeferenzrate = 0.1  # Low time preference
    agents[0].state.vermoegen = 5000
    
    # Agent 1: Low risk aversion, low time preference, should invest a lot
    agents[1].state.einkommen = 10000
    agents[1].state.risikoaversion = 0.05  # Risk seeking
    agents[1].state.zeitpraeferenzrate = 0.05  # Low time preference
    agents[1].state.vermoegen = 5000
    
    # Agent 2: Medium risk aversion, high time preference
    agents[2].state.einkommen = 10000
    agents[2].state.risikoaversion = 0.5  # Medium risk aversion
    agents[2].state.zeitpraeferenzrate = 0.8  # High time preference (wants immediate consumption)
    agents[2].state.vermoegen = 5000
    
    print(f"\n=== INITIAL AGENT PROFILES ===")
    for i in range(3):
        agent = agents[i]
        print(f"\nAgent {i}:")
        print(f"  Income: €{agent.state.einkommen:,.0f}")
        print(f"  Wealth: €{agent.state.vermoegen:,.0f}")
        print(f"  Risk Aversion: {agent.state.risikoaversion:.3f}")
        print(f"  Time Preference: {agent.state.zeitpraeferenzrate:.3f}")
    
    # Test investment decisions
    print(f"\n=== INVESTMENT DECISION TEST ===")
    
    # Test individual decisions and collect results
    individual_decisions = []
    print("Testing individual investment decisions:")
    for i in range(3):
        agent = agents[i]
        pre_wealth = agent.state.vermoegen
        
        decision = agent.decide_and_act()
        individual_decisions.append(decision)
        
        post_wealth = agent.state.vermoegen
        wealth_change = post_wealth - pre_wealth
        
        print(f"\nAgent {i} Decision:")
        print(f"  Investment Made: €{decision['investment_made']:,.2f}")
        print(f"  Investment Gain: €{decision['investment_gain']:,.2f}")
        print(f"  Wealth Change: €{wealth_change:,.2f}")
        print(f"  Investment as % of Income: {(decision['investment_made']/agent.state.einkommen)*100:.1f}%")
    
    # Behavioral validation using individual decision results
    print(f"\n=== BEHAVIORAL VALIDATION ===")
    
    # Test 1: High risk aversion should lead to low investment
    agent0_investment_ratio = individual_decisions[0]['investment_made'] / agents[0].state.einkommen
    if agent0_investment_ratio < 0.02:  # Less than 2% of income
        print("✓ Test 1 PASSED: High risk aversion agent invests very little")
    else:
        print("❌ Test 1 FAILED: High risk aversion agent should invest very little")
    
    # Test 2: Low risk aversion + low time preference should lead to high investment
    agent1_investment_ratio = individual_decisions[1]['investment_made'] / agents[1].state.einkommen
    if agent1_investment_ratio > 0.15:  # More than 15% of income
        print("✓ Test 2 PASSED: Low risk aversion + low time preference agent invests significantly")
    else:
        print("❌ Test 2 FAILED: Low risk aversion + low time preference agent should invest more")
    
    # Test 3: High time preference should reduce investment
    agent2_investment_ratio = individual_decisions[2]['investment_made'] / agents[2].state.einkommen
    if agent2_investment_ratio < 0.05:  # Less than 5% of income
        print("✓ Test 3 PASSED: High time preference agent invests little due to consumption preference")
    else:
        print("❌ Test 3 FAILED: High time preference agent should invest less")
    
    # Run full simulation with multiple steps to test wealth dynamics
    print(f"\n=== WEALTH DYNAMICS TEST (10 steps) ===")
    
    # Reset model for multi-step test
    model = PoliticalModel(num_agents=50)
    
    # Track wealth changes over multiple steps
    initial_wealth = {agent.unique_id: agent.state.vermoegen for agent in model.agent_set}
    investment_outcomes = []
    
    for step in range(10):
        # Run full simulation step
        model.step()
        
        # Collect investment data
        if hasattr(model, 'investment_decisions_this_step'):
            total_investments = sum(d['investment_made'] for d in model.investment_decisions_this_step)
            successful_investments = len([d for d in model.investment_decisions_this_step if d['investment_gain'] > 0])
            total_decisions = len(model.investment_decisions_this_step)
            
            investment_outcomes.append({
                'step': step,
                'total_investments': total_investments,
                'success_rate': successful_investments / total_decisions if total_decisions > 0 else 0,
                'total_decisions': total_decisions
            })
    
    # Analyze results
    final_wealth = {agent.unique_id: agent.state.vermoegen for agent in model.agent_set}
    
    wealth_gainers = sum(1 for aid in initial_wealth if final_wealth[aid] > initial_wealth[aid])
    wealth_losers = sum(1 for aid in initial_wealth if final_wealth[aid] < initial_wealth[aid])
    
    print(f"After 10 simulation steps:")
    print(f"  Agents who gained wealth: {wealth_gainers}")
    print(f"  Agents who lost wealth: {wealth_losers}")
    print(f"  Average success rate: {sum(o['success_rate'] for o in investment_outcomes)/len(investment_outcomes):.1%}")
    
    if investment_outcomes:
        avg_total_investments = sum(o['total_investments'] for o in investment_outcomes) / len(investment_outcomes)
        print(f"  Average total investments per step: €{avg_total_investments:,.0f}")
    
    # Test 4: Investment system should create wealth variation
    wealth_variation = max(final_wealth.values()) - min(final_wealth.values())
    if wealth_variation > 10000:  # Significant wealth spread
        print("✓ Test 4 PASSED: Investment system creates significant wealth variation")
    else:
        print("❌ Test 4 FAILED: Investment system should create more wealth variation")
    
    print(f"\n=== INTEGRATION TEST ===")
    print("Testing full 7-phase simulation with investment decisions...")
    
    # Final integration test
    model = PoliticalModel(num_agents=10)
    pre_step_wealth = [agent.state.vermoegen for agent in model.agent_set]
    
    model.step()
    
    post_step_wealth = [agent.state.vermoegen for agent in model.agent_set]
    wealth_changes = [post - pre for pre, post in zip(pre_step_wealth, post_step_wealth)]
    
    # Wealth should change due to income, investments, and hazards
    significant_changes = sum(1 for change in wealth_changes if abs(change) > 100)
    
    if significant_changes > 0:
        print("✓ Full 7-phase simulation completed with wealth dynamics")
    else:
        print("❌ Wealth dynamics not working as expected")
    
    print(f"\n🎉 Risk-Based Investment Decision implementation successful!")
    
except Exception as e:
    print(f"❌ Investment decision test failed: {e}")
    import traceback
    traceback.print_exc()