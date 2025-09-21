import mesa
import numpy as np
import networkx as nx
import random
import csv
import datetime
import os

from .agents import PoliticalAgent
from .types import AgentState
from .managers.resource_manager import ResourceManager
from .managers.hazard_manager import HazardManager
from .managers.seasonality_manager import SeasonalityManager
from .managers.media_manager import MediaManager
from .agent_initializer import AgentInitializer
from .simulation_cycle import SimulationCycle
from .utils import generate_attribute_value
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
from backend.config.manager import manager as config_manager
from backend.config.models import DistributionConfig


def gini(x):
    """Calculate Gini coefficient for a distribution."""
    if len(x) == 0:
        return 0
    # Remove negative values and sort
    x = np.array(x)
    x = x[x >= 0]
    if len(x) == 0:
        return 0
    x = np.sort(x)
    if np.sum(x) == 0:
        return 0
    # Calculate Gini coefficient
    total = 0
    for i, xi in enumerate(x[:-1], 1):
        total += np.sum(np.abs(xi - x[i:]))
    return total / (len(x)**2 * np.mean(x))




class PoliticalModel(mesa.Model):
    """
    The main model for simulating political opinion dynamics.
    Orchestrates the 6-phase simulation cycle based on MODEL_SPECIFICATION.md v3.0.0.
    """
    
    def _calculate_biome_layouts(self):
        """Divides the 100x100 space into N vertical sectors for N biomes."""
        num_biomes = len(self.biomes)
        if num_biomes == 0:
            return []
        
        sector_width = self.simulation_parameters['grid_size'] / num_biomes
        layout = []
        for i, biome in enumerate(self.biomes):
            layout.append({
                "name": biome.name,
                "x_min": i * sector_width,
                "x_max": (i + 1) * sector_width
            })
        return layout
    

    def __init__(self, num_agents=100, network_connections=5):
        super().__init__()
        self.num_agents = num_agents
        # Mesa 3.2.0+ - use simple list for agent management
        self.agent_set = []
        self.step_count = 0
        self.events = []  # Event log for current step

        # Load the full configuration
        full_config = config_manager.get_config()
        self.media_sources = config_manager.get_media_sources()  # Medienquellen laden
        self.output_schablonen = config_manager.get_output_schablonen()  # Output-Schablonen für Klassifizierung
        self.milieus = config_manager.get_milieus()  # NEW: Use streamlined milieus für Agent-Initialisierung
        
        # --- Load Config and Instantiate Managers ---
        self.biomes = full_config.biomes
        self.agent_initialization = full_config.agent_initialization
        self.agent_params = full_config.agent_dynamics.model_dump()
        self.simulation_parameters = full_config.simulation_parameters.model_dump()
        self.global_model_parameters = self.simulation_parameters  # Store for derived attributes calculation
        self.environmental_capacity_for_norm = full_config.simulation_parameters.environmental_capacity
        
        self.resource_manager = ResourceManager(self)
        self.hazard_manager = HazardManager(self)
        self.seasonality_manager = SeasonalityManager(self)
        self.media_manager = MediaManager(self, self.media_sources)  # NEUE INSTANZ
        
        # NEU: Generiere und speichere das Layout
        self.layout = self._calculate_biome_layouts()
        
        # NEU: Speichere die Basiswerte und initialisiere die effektiven Werte
        self.base_biome_parameters = {b.name: b for b in self.biomes}
        self.effective_hazard_probabilities = {b.name: b.hazard_probability for b in self.biomes}
        self.effective_regeneration_rates = {b.name: b.regeneration_rate for b in self.biomes}
        
        # Legacy environment for compatibility (will be phased out)
        self.environment = {}
        self.regions = [biome.name for biome in self.biomes]
        
        # Initialize environment with biome data for learning phase
        for biome in self.biomes:
            self.environment[biome.name] = {
                "quality": biome.initial_quality,
                "capacity": biome.capacity
            }

        # --- Agent Creation (Delegated) ---
        initializer = AgentInitializer(self)
        agents = initializer.create_agents()
        for agent in agents:
            self.agent_set.append(agent)
        
        # --- Simulation Cycle Initialization (Delegated) ---
        self.cycle = SimulationCycle(self)
        
        # --- Recording functionality ---
        self.is_recording = False
        self.recording_filepath = None
        self.csv_writer = None
        self.csv_file = None
        # --- Registry/Pinning info ---
        try:
            from formula_registry import registry as formula_registry  # type: ignore
            self.formula_registry_enabled = getattr(formula_registry, 'enabled', False)
            self.formula_pins = formula_registry.get_pins() if self.formula_registry_enabled else {}
            self._registry_artifact_hash = None
            self.registry_handles = {}
            if self.formula_registry_enabled and self.formula_pins.get('altruism_update'):
                try:
                    self.registry_handles['altruism_update'] = formula_registry.get_handle('altruism_update')
                except Exception:
                    self.registry_handles['altruism_update'] = None
            if self.formula_registry_enabled and self.formula_pins.get('consumption_rate'):
                try:
                    self.registry_handles['consumption_rate'] = formula_registry.get_handle('consumption_rate')
                except Exception:
                    self.registry_handles['consumption_rate'] = None
            if self.formula_registry_enabled and self.formula_pins.get('investment_amount'):
                try:
                    self.registry_handles['investment_amount'] = formula_registry.get_handle('investment_amount')
                except Exception:
                    self.registry_handles['investment_amount'] = None
            if self.formula_registry_enabled and self.formula_pins.get('investment_outcome'):
                try:
                    self.registry_handles['investment_outcome'] = formula_registry.get_handle('investment_outcome')
                except Exception:
                    self.registry_handles['investment_outcome'] = None
            # Additional formulas
            for fname in ['risk_aversion','cognitive_capacity_penalty','media_influence_update','hazard_prob_next','regen_rate_next','political_position']:
                if self.formula_registry_enabled and self.formula_pins.get(fname):
                    try:
                        self.registry_handles[fname] = formula_registry.get_handle(fname)
                    except Exception:
                        self.registry_handles[fname] = None
            # Legacy off switch: require pins for all formulas when not allowed
            legacy_allowed = os.getenv('FORMULA_REGISTRY_LEGACY_ALLOWED', 'false').lower() == 'true'
            required = ['altruism_update','consumption_rate','investment_amount','investment_outcome','risk_aversion','cognitive_capacity_penalty','media_influence_update','hazard_prob_next','regen_rate_next','political_position']
            if self.formula_registry_enabled and not legacy_allowed:
                missing = [f for f in required if f not in self.formula_pins or not self.formula_pins.get(f)]
                if missing:
                    raise RuntimeError(f"Registry pins missing for required formulas: {missing}. Set FORMULA_REGISTRY_LEGACY_ALLOWED=true to bypass in DEV.")
        except Exception:
            self.formula_registry_enabled = False
            self.formula_pins = {}
            self._registry_artifact_hash = None
            self.registry_handles = {}

    def start_recording(self, preset_name: str = "run"):
        """Start recording simulation data to CSV file."""
        if self.is_recording:
            return  # Already recording
            
        # Create unique filename with timestamp
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{preset_name}_{timestamp}.csv"
        recordings_dir = os.path.join(os.path.dirname(__file__), '..', 'recordings')
        self.recording_filepath = os.path.join(recordings_dir, filename)
        
        # Open CSV file and create writer
        self.csv_file = open(self.recording_filepath, 'w', newline='', encoding='utf-8')
        
        # Define CSV headers based on model_report structure
        headers = [
            'step',
            'Mean_Freedom',
            'Mean_Altruism', 
            'Polarization',
            'Durchschnittsvermoegen',
            'Durchschnittseinkommen',
            'Durchschnittlicher_Konsum',
            'Gini_Vermoegen',
            'Gini_Einkommen',
            'Hazard_Events_Count'
        ]
        
        # Add region population headers
        for region in self.regions:
            headers.append(f'Population_{region}')
            
        # Add biome investment headers
        for biome in self.biomes:
            headers.append(f'Investment_{biome.name}')
            headers.append(f'Hazard_Prob_{biome.name}')
            headers.append(f'Regen_Rate_{biome.name}')
        
        self.csv_writer = csv.DictWriter(self.csv_file, fieldnames=headers)
        self.csv_writer.writeheader()
        
        self.is_recording = True

    def stop_recording(self):
        """Stop recording and close the CSV file."""
        if not self.is_recording:
            return
            
        if self.csv_file:
            self.csv_file.close()
            self.csv_file = None
            
        self.csv_writer = None
        self.is_recording = False
        self.recording_filepath = None

    def record_step(self):
        """Record current step data to CSV if recording is active."""
        if not self.is_recording or not self.csv_writer:
            return
            
        report = self.get_model_report()['model_report']
        
        # Prepare row data
        row_data = {
            'step': getattr(self, 'step_count', 0),
            'Mean_Freedom': report['Mean_Freedom'],
            'Mean_Altruism': report['Mean_Altruism'],
            'Polarization': report['Polarization'],
            'Durchschnittsvermoegen': report['Durchschnittsvermoegen'],
            'Durchschnittseinkommen': report['Durchschnittseinkommen'],
            'Durchschnittlicher_Konsum': report['Durchschnittlicher_Konsum'],
            'Gini_Vermoegen': report['Gini_Vermoegen'],
            'Gini_Einkommen': report['Gini_Einkommen'],
            'Hazard_Events_Count': report['Hazard_Events_Count']
        }
        
        # Add region population data
        regions_data = report.get('Regions', {})
        for region in self.regions:
            row_data[f'Population_{region}'] = regions_data.get(region, 0)
            
        # Add biome dynamic data
        biomes_data = report.get('biomes_dynamic_data', {})
        for biome in self.biomes:
            biome_name = biome.name
            biome_data = biomes_data.get(biome_name, {})
            row_data[f'Investment_{biome_name}'] = biome_data.get('total_investment', 0)
            row_data[f'Hazard_Prob_{biome_name}'] = biome_data.get('effective_hazard_probability', 0)
            row_data[f'Regen_Rate_{biome_name}'] = biome_data.get('effective_regeneration_rate', 0)
        
        self.csv_writer.writerow(row_data)
        self.csv_file.flush()  # Ensure data is written immediately

    def step(self):
        """Delegated to SimulationCycle for execution of the complete 9-phase cycle."""
        self.cycle.run_step()
        
        # Track position history for agents (limit to last 20 positions)
        for agent in self.agent_set:
            agent.state.position_history.append(agent.state.position)
            if len(agent.state.position_history) > 20:
                agent.state.position_history.pop(0)
        
        self.record_step()

    def get_model_report(self) -> dict:
        """Collects and formats data for the API endpoint."""
        agent_reports = [
            {
                "id": a.unique_id,
                "political_position": a.state.calculate_political_position(),
                "altruism": a.state.altruism_factor,
                "freedom": a.state.freedom_preference,
                "region": a.state.region,
                # Extended data for AgentInspector
                "alter": a.state.alter,
                "einkommen": a.state.einkommen,
                "vermoegen": a.state.vermoegen,
                "sozialleistungen": a.state.sozialleistungen,
                "risikoaversion": a.state.risikoaversion,
                "effektive_kognitive_kapazitaet": a.state.effektive_kognitive_kapazitaet,
                "kognitive_kapazitaet_basis": a.state.kognitive_kapazitaet_basis,
                "politische_wirksamkeit": a.state.politische_wirksamkeit,
                "sozialkapital": a.state.sozialkapital,
                "schablone": a.state.schablone
            } for a in self.agent_set
        ]

        region_counts = {region: 0 for region in self.regions}
        for agent in self.agent_set:
            region_counts[agent.state.region] += 1

        # Calculate template distribution
        schablonen_counts = {}
        for agent in self.agent_set:
            template = agent.state.schablone
            schablonen_counts[template] = schablonen_counts.get(template, 0) + 1

        # Calculate economic metrics
        all_vermoegen = [a.state.vermoegen for a in self.agent_set]
        all_einkommen = [a.state.einkommen for a in self.agent_set]
        all_konsum = [a.state.einkommen * a.state.konsumquote for a in self.agent_set]
        
        # Aggregiere Investments aus der letzten Runde
        investments_per_biome = {b.name: 0.0 for b in self.biomes}
        if hasattr(self, 'investment_decisions_this_step'):
            for decision in self.investment_decisions_this_step:
                agent = next(a for a in self.agent_set if a.unique_id == decision['agent_id'])
                investments_per_biome[agent.state.region] += decision.get('investment_made', 0.0)
        
        # Registry/telemetry info
        registry_info = {}
        try:
            from formula_registry import registry as formula_registry  # type: ignore
            registry_info = {
                "enabled": getattr(self, 'formula_registry_enabled', False),
                "pins": getattr(self, 'formula_pins', {}),
                "telemetry": getattr(formula_registry, 'telemetry', None).as_dict() if hasattr(formula_registry, 'telemetry') else {},
            }
        except Exception:
            registry_info = {"enabled": False, "pins": {}, "telemetry": {}}

        return {
            "step": getattr(self, 'step_count', 0),  # Mesa 3.2.0+ doesn't have schedule.steps
            "model_report": {
                "Mean_Freedom": np.mean([r['freedom'] for r in agent_reports]),
                "Mean_Altruism": np.mean([r['altruism'] for r in agent_reports]),
                "Polarization": 0.0,  # Placeholder
                "Gini_Resources": 0.0, # Placeholder (legacy)
                "Durchschnittsvermoegen": np.mean(all_vermoegen) if all_vermoegen else 0,
                "Durchschnittseinkommen": np.mean(all_einkommen) if all_einkommen else 0,
                "Durchschnittlicher_Konsum": np.mean(all_konsum) if all_konsum else 0,
                "Gini_Vermoegen": gini(np.array(all_vermoegen)) if all_vermoegen else 0,
                "Gini_Einkommen": gini(np.array(all_einkommen)) if all_einkommen else 0,
                "Hazard_Events_Count": len(self.hazard_manager.events_this_step) if hasattr(self.hazard_manager, 'events_this_step') else 0,
                "Regions": region_counts,
                "layout": self.layout,  # NEUES FELD: Layout-Informationen
                "events": self.events,  # NEUES FELD: Event log
                "biomes_dynamic_data": {
                    b.name: {
                        "total_investment": investments_per_biome[b.name],
                        "effective_hazard_probability": self.effective_hazard_probabilities[b.name],
                        "effective_regeneration_rate": self.effective_regeneration_rates[b.name]
                    } for b in self.biomes
                },
                "milieus_config": [m.model_dump() for m in self.milieus],  # NEW: Send milieu configuration for visualization
                "population_report": {
                    "milieu_distribution": {
                        name: len([a for a in self.agent_set if a.state.milieu == name])
                        for name in [m.name for m in self.milieus]
                    },  # Dynamic milieu distribution based on best fit classification
                    "schablonen_verteilung": schablonen_counts,  # NEW: Template distribution
                    "key_averages": {
                        "mean_wealth": np.mean(all_vermoegen) if all_vermoegen else 0,
                        "mean_income": np.mean(all_einkommen) if all_einkommen else 0,
                        "mean_altruism": np.mean([r['altruism'] for r in agent_reports]),
                        "mean_effective_cognition": np.mean([a.state.effektive_kognitive_kapazitaet for a in self.agent_set if hasattr(a.state, 'effektive_kognitive_kapazitaet')]),
                        "mean_risk_aversion": np.mean([a.state.risikoaversion for a in self.agent_set if hasattr(a.state, 'risikoaversion')])
                    }
                },
                "environment": {
                    name: {"quality": data["quality"], "capacity": data["capacity"]}
                    for name, data in self.environment.items()
                },
                "run_info": {
                    "registry": registry_info
                }
            },
            "agent_visuals": [
                {
                    "id": a.unique_id,
                    "position": list(a.state.position),  # Lese die KORREKTE Position aus dem State
                    "position_history": [list(pos) for pos in a.state.position_history],  # Include position history
                    "political_position": {"a": a.state.calculate_political_position()[0], "b": a.state.calculate_political_position()[1]},
                    "region": a.state.region,
                    "schablone": a.state.schablone,
                    "initial_milieu": a.state.initial_milieu,
                    "milieu": a.state.milieu, # Sends the dynamic assignment
                    # Extended data for AgentInspector
                    "alter": a.state.alter,
                    "einkommen": a.state.einkommen,
                    "vermoegen": a.state.vermoegen,
                    "sozialleistungen": a.state.sozialleistungen,
                    "risikoaversion": a.state.risikoaversion,
                    "effektive_kognitive_kapazitaet": a.state.effektive_kognitive_kapazitaet,
                    "kognitive_kapazitaet_basis": a.state.kognitive_kapazitaet_basis,
                    "politische_wirksamkeit": a.state.politische_wirksamkeit,
                    "sozialkapital": a.state.sozialkapital,
                    # Consumption data
                    "konsumquote": a.state.konsumquote,
                    "ersparnis": a.state.ersparnis
                } for a in self.agent_set
            ]
        }
