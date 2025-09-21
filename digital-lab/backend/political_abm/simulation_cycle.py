import numpy as np


class SimulationCycle:
    """
    Handles the execution of the 9-phase simulation cycle.
    Encapsulates all step-by-step logic that was previously in PoliticalModel.step().
    """
    
    def __init__(self, model):
        self.model = model

    def run_step(self):
        """
        Executes one complete step of the simulation following the 9-phase cycle:
        1. Seasonal Effects
        2. Resource Update (Income, Benefits, Consumption & Saving)
        3. Hazard Events
        4. Agent Decision (decide_and_act)
        5. Media Consumption & Learning
        6. Learning & Evaluation
        7. Psychological States Update
        8. Template Classification
        9. Environment Feedback & Dynamic Milieu Classification
        """
        # Clear events from previous step
        self.model.events = []
        
        # Phase 1: Seasonal Effects
        self.model.seasonality_manager.apply_seasonal_effects()

        # Phase 2: Resource Update (Income, Benefits, Consumption & Saving)
        savings_this_step = self.model.resource_manager.update_agent_resources()

        # Phase 3: Hazard Events
        hazard_events = self.model.hazard_manager.trigger_events()
        if hazard_events:
            for event in hazard_events:
                self.model.events.append(f"HAZARD_EVENT|{event}")
        
        # Store values before Phase 4 for learning calculations
        wealth_before = {
            agent.unique_id: agent.state.vermoegen 
            for agent in self.model.agent_set
        }
        environment_before = {
            region: env['quality'] 
            for region, env in self.model.environment.items()
        }
        
        # Phase 4: Agent Decision (decide_and_act)
        self.model.investment_decisions_this_step = []
        use_batch_invest = (
            bool(getattr(self.model, 'formula_registry_enabled', False)) and
            bool(getattr(self.model, 'registry_handles', {}).get('investment_amount')) and
            bool(getattr(self.model, 'registry_handles', {}).get('investment_outcome'))
        )
        if use_batch_invest:
            try:
                from formula_registry import registry as formula_registry  # type: ignore
                # Arrays
                ersparnis_arr = np.array([savings_this_step.get(a.unique_id, 0.0) for a in self.model.agent_set], dtype=float)
                risk = np.array([a.state.risikoaversion for a in self.model.agent_set], dtype=float)
                zpref = np.array([a.state.zeitpraeferenzrate for a in self.model.agent_set], dtype=float)
                sim = self.model.simulation_parameters
                # investment_amount batch
                amt_inputs = {
                    'ersparnis': ersparnis_arr,
                    'risikoaversion': risk,
                    'zeitpraeferenzrate': zpref,
                    'max_investment_rate': float(sim['max_investment_rate'])
                }
                amounts = formula_registry.evaluate_batch_handle(self.model.registry_handles['investment_amount'], amt_inputs)
                # success indicators (RNG centralized: python random to match previous behavior order)
                import random
                p = float(sim['investment_success_probability'])
                success_ind = np.array([1 if random.random() < p else 0 for _ in self.model.agent_set], dtype=float)
                # outcome batch
                out_inputs = {
                    'investment_amount': amounts,
                    'investment_return_factor': float(sim['investment_return_factor']),
                    'success_indicator': success_ind
                }
                gains = formula_registry.evaluate_batch_handle(self.model.registry_handles['investment_outcome'], out_inputs)
                # assign and record
                for i, agent in enumerate(self.model.agent_set):
                    agent.state.vermoegen += float(gains[i])
                    self.model.investment_decisions_this_step.append({
                        'agent_id': agent.unique_id,
                        'investment_made': float(amounts[i]),
                        'investment_gain': float(gains[i])
                    })
            except Exception:
                use_batch_invest = False

        if not use_batch_invest:
            for agent in self.model.agent_set:
                ersparnis = savings_this_step.get(agent.unique_id, 0.0)
                decision_outcome = agent.decide_and_act(
                    ersparnis, 
                    self.model.simulation_parameters
                )
                self.model.investment_decisions_this_step.append({
                    "agent_id": agent.unique_id,
                    **decision_outcome
                })

        # Phase 5: Media Consumption & Learning
        influence = self.model.simulation_parameters['media_influence_factor']
        use_batch_media = bool(getattr(self.model, 'registry_handles', {}).get('media_influence_update')) and bool(getattr(self.model, 'formula_registry_enabled', False))
        if use_batch_media:
            try:
                # Select sources (RNG/selection remains external)
                chosen = [self.model.media_manager.select_source_for_agent(a.state) for a in self.model.agent_set]
                target_freedom = np.array([(s.ideological_position.social_axis + 1)/2.0 for s in chosen], dtype=float)
                current_pref = np.array([a.state.freedom_preference for a in self.model.agent_set], dtype=float)
                bildung = np.array([a.state.bildung for a in self.model.agent_set], dtype=float)
                eff_kogn = np.array([a.state.effektive_kognitive_kapazitaet for a in self.model.agent_set], dtype=float)
                params = self.model.simulation_parameters
                inputs = {
                    'current_pref': current_pref,
                    'target_pref': target_freedom,
                    'bildung': bildung,
                    'effektive_kognitive_kapazitaet': eff_kogn,
                    'influence_factor': float(influence),
                    'education_weight': float(params['cognitive_moderator_education_weight']),
                    'capacity_weight': float(params['cognitive_moderator_capacity_weight'])
                }
                from formula_registry import registry as formula_registry  # type: ignore
                new_prefs = formula_registry.evaluate_batch_handle(self.model.registry_handles['media_influence_update'], inputs)
                for i, a in enumerate(self.model.agent_set):
                    a.state.freedom_preference = float(np.clip(new_prefs[i], 0.0, 1.0))
            except Exception:
                use_batch_media = False
        if not use_batch_media:
            for agent in self.model.agent_set:
                chosen_source = self.model.media_manager.select_source_for_agent(agent.state)
                agent.learn_from_media(chosen_source, influence, self.model.simulation_parameters)

        # Phase 6: Learning & Evaluation
        use_batch = bool(getattr(self.model, 'formula_registry_enabled', False)) and bool(getattr(self.model, 'registry_handles', {}).get('altruism_update'))
        if use_batch:
            # Vectorized evaluation via registry
            try:
                from formula_registry import registry as formula_registry  # type: ignore
                handle = self.model.registry_handles.get('altruism_update')
                # Build input arrays
                prev_altruism = np.array([a.state.altruism_factor for a in self.model.agent_set], dtype=float)
                bildung = np.array([a.state.bildung for a in self.model.agent_set], dtype=float)
                delta_u_ego = np.array([a.state.vermoegen - wealth_before[a.unique_id] for a in self.model.agent_set], dtype=float)
                delta_u_sozial = np.array([
                    self.model.environment[a.state.region]['quality'] - environment_before[a.state.region]
                    for a in self.model.agent_set
                ], dtype=float)
                env_health = np.array([self.model.environment[a.state.region]['quality'] for a in self.model.agent_set], dtype=float)
                biome_capacity = np.array([
                    self.model.base_biome_parameters[a.state.region].capacity for a in self.model.agent_set
                ], dtype=float)
                params = self.model.simulation_parameters
                inputs = {
                    'prev_altruism': prev_altruism,
                    'bildung': bildung,
                    'delta_u_ego': delta_u_ego,
                    'delta_u_sozial': delta_u_sozial,
                    'env_health': env_health,
                    'biome_capacity': biome_capacity,
                    'altruism_target_crisis': float(params['altruism_target_crisis']),
                    'crisis_weighting_beta': float(params['crisis_weighting_beta']),
                    'max_learning_rate_eta_max': float(params['max_learning_rate_eta_max']),
                    'education_dampening_k': float(params['education_dampening_k']),
                }
                new_vals = formula_registry.evaluate_batch_handle(handle, inputs)
                # Assign results back
                for i, agent in enumerate(self.model.agent_set):
                    agent.state.altruism_factor = float(np.clip(new_vals[i], 0.0, 1.0))
            except Exception:
                # Fallback to per-agent path on error
                use_batch = False

        if not use_batch:
            for agent in self.model.agent_set:
                delta_u_ego = agent.state.vermoegen - wealth_before[agent.unique_id]
                delta_u_sozial = (
                    self.model.environment[agent.state.region]['quality'] - 
                    environment_before[agent.state.region]
                )
                biome_capacity = self.model.base_biome_parameters[agent.state.region].capacity
                env_health = self.model.environment[agent.state.region]['quality']
                agent.learn(
                    delta_u_ego=delta_u_ego,
                    delta_u_sozial=delta_u_sozial,
                    env_health=env_health,
                    biome_capacity=biome_capacity,
                    learning_params=self.model.simulation_parameters
                )
            
        # Phase 7: Update Psychological States (Coupling)
        use_batch_psych = bool(getattr(self.model, 'registry_handles', {}).get('risk_aversion')) and bool(getattr(self.model, 'registry_handles', {}).get('cognitive_capacity_penalty')) and bool(getattr(self.model, 'formula_registry_enabled', False))
        if use_batch_psych:
            try:
                wealth = np.array([a.state.vermoegen for a in self.model.agent_set], dtype=float)
                base_cap = np.array([a.state.kognitive_kapazitaet_basis for a in self.model.agent_set], dtype=float)
                params = self.model.simulation_parameters
                from formula_registry import registry as formula_registry  # type: ignore
                # risk_aversion
                ra_inputs = {'vermoegen': wealth, 'wealth_sensitivity_factor': float(params['wealth_sensitivity_factor'])}
                new_ra = formula_registry.evaluate_batch_handle(self.model.registry_handles['risk_aversion'], ra_inputs)
                # cognitive capacity penalty
                cap_inputs = {
                    'vermoegen': wealth,
                    'wealth_threshold': float(params['wealth_threshold_cognitive_stress']),
                    'max_penalty': float(params['max_cognitive_penalty']),
                    'base_capacity': base_cap
                }
                new_eff = formula_registry.evaluate_batch_handle(self.model.registry_handles['cognitive_capacity_penalty'], cap_inputs)
                for i, a in enumerate(self.model.agent_set):
                    a.state.risikoaversion = float(np.clip(new_ra[i], 0.0, 1.0))
                    a.state.effektive_kognitive_kapazitaet = float(np.clip(new_eff[i], 0.0, 1.0))
            except Exception:
                use_batch_psych = False
        if not use_batch_psych:
            for agent in self.model.agent_set:
                agent.update_psychological_states(self.model.simulation_parameters)
        
        # Phase 8: Template Classification
        self._classify_agents_into_templates()
        
        # Phase 9a: Environment Feedback
        self._update_environment_parameters()
        
        # Phase 9b: Generate Gini coefficient events
        self._generate_gini_events()
        
        # Phase 9c: Dynamic Milieu Classification
        self._classify_agents_into_milieus()
        
        self.model.step_count += 1

    def _classify_agents_into_templates(self):
        """Classifies all agents into output schablonen based on their political position."""
        for agent in self.model.agent_set:
            political_pos = agent.state.calculate_political_position()
            economic_axis, social_axis = political_pos
            
            # Find the best matching output schablone
            best_schablone = None
            for schablone in self.model.output_schablonen:
                if (schablone.x_min <= economic_axis <= schablone.x_max and
                    schablone.y_min <= social_axis <= schablone.y_max):
                    best_schablone = schablone.name
                    break
            
            # Assign schablone (or "Unclassified" if no match)
            agent.state.schablone = best_schablone if best_schablone else "Unclassified"

    def _update_environment_parameters(self):
        """
        Updates effective biome parameters for the NEXT step based on agent actions
        in the CURRENT step. This is the core feedback loop.
        """
        # 1. Aggregate agent data per biome
        investments_per_biome = {b.name: 0.0 for b in self.model.biomes}
        altruism_per_biome = {b.name: [] for b in self.model.biomes}

        for agent in self.model.agent_set:
            # Get investment data from the last decision
            last_decision = next(
                (d for d in self.model.investment_decisions_this_step 
                 if d['agent_id'] == agent.unique_id), 
                None
            )
            if last_decision:
                investments_per_biome[agent.state.region] += last_decision.get(
                    'investment_made', 0.0
                )
            
            altruism_per_biome[agent.state.region].append(
                agent.state.altruism_factor
            )

        # 2. Calculate and update effective parameters
        for biome in self.model.biomes:
            base_params = self.model.base_biome_parameters[biome.name]
            
            # Direct Impact (Economy -> Risk)
            total_investment = investments_per_biome[biome.name]
            
            # Formula: Hazard(t+1) = BaseHazard + (Investment(t) * Sensitivity)
            new_hazard_prob = (
                base_params.hazard_probability + 
                (total_investment * base_params.environmental_sensitivity)
            )
            self.model.effective_hazard_probabilities[biome.name] = np.clip(
                new_hazard_prob, 0, 1
            )

            # Indirect Impact (Will -> Resilience)
            mean_altruism = (
                np.mean(altruism_per_biome[biome.name]) 
                if altruism_per_biome[biome.name] 
                else self.model.simulation_parameters['default_mean_altruism']
            )
            
            # Formula: Regen(eff) = Regen(base) * (1 + (MeanAltruism - 0.5) * ResilienceFactor)
            resilience_mod = (
                (mean_altruism - 0.5) * 
                self.model.simulation_parameters['resilience_bonus_factor']
            )
            new_regen_rate = base_params.regeneration_rate * (1 + resilience_mod)
            self.model.effective_regeneration_rates[biome.name] = max(
                0, new_regen_rate
            )

    def _generate_gini_events(self):
        """Generate Gini coefficient change events if threshold is crossed."""
        all_vermoegen = [
            a.state.vermoegen for a in self.model.agent_set 
            if hasattr(a.state, 'vermoegen')
        ]
        if all_vermoegen:
            current_gini = self._calculate_gini(all_vermoegen)
            if (hasattr(self.model, 'previous_gini') and 
                abs(current_gini - self.model.previous_gini) > 
                self.model.simulation_parameters['gini_threshold_change']):
                
                direction = (
                    "INCREASE" if current_gini > self.model.previous_gini 
                    else "DECREASE"
                )
                self.model.events.append(
                    f"GINI_WEALTH_THRESHOLD_CROSSED|{direction}|{current_gini:.3f}"
                )
            self.model.previous_gini = current_gini

    def _calculate_gini(self, values):
        """Calculate Gini coefficient for a list of values."""
        if not values or len(values) == 0:
            return 0
        values = sorted(values)
        n = len(values)
        index = range(1, n + 1)
        return ((2 * sum(index[i] * values[i] for i in range(n))) / 
                (n * sum(values)) - (n + 1) / n)

    def _classify_agents_into_milieus(self):
        """
        Assigns each agent to the milieu with the closest ideological center.
        This is the dynamic "best fit" classification.
        """
        if not self.model.milieus:
            return

        milieu_centers = {
            m.name: (m.ideological_center.economic_axis, m.ideological_center.social_axis)
            for m in self.model.milieus
        }
        
        for agent in self.model.agent_set:
            agent_pos = agent.state.calculate_political_position()
            
            distances = {
                name: np.linalg.norm(np.array(agent_pos) - np.array(center))
                for name, center in milieu_centers.items()
            }
            
            # Find the milieu name with the minimum distance
            best_fit_milieu = min(distances, key=distances.get)
            agent.state.milieu = best_fit_milieu
